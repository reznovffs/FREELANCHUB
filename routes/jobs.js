const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      experience,
      budgetMin,
      budgetMax,
      search,
      status = 'open',
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isActive: true, status };

    if (category) filter.category = category;
    if (experience) filter.experience = experience;
    if (budgetMin || budgetMax) {
      filter['budget.amount'] = {};
      if (budgetMin) filter['budget.amount'].$gte = Number(budgetMin);
      if (budgetMax) filter['budget.amount'].$lte = Number(budgetMax);
    }

    let query = Job.find(filter).populate('client', 'name');

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    const skip = (page - 1) * limit;
    const jobs = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email')
      .populate('applications.freelancer', 'name profile');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job (clients only)
router.post('/', auth, requireRole(['client', 'admin']), [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('category').isIn(['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Data Science', 'Other']),
  body('budget.type').isIn(['fixed', 'hourly']),
  body('budget.amount').isNumeric().withMessage('Budget amount must be a number'),
  body('experience').isIn(['entry', 'intermediate', 'expert'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      client: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id).populate('client', 'name');

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (owner only)
router.put('/:id', auth, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job or is admin
    if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name');

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (owner only)
router.delete('/:id', auth, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for job (freelancers only)
router.post('/:id/apply', auth, requireRole(['freelancer']), [
  body('proposal').trim().isLength({ min: 50 }).withMessage('Proposal must be at least 50 characters'),
  body('bidAmount').isNumeric().withMessage('Bid amount must be a number'),
  body('estimatedDuration').notEmpty().withMessage('Estimated duration is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      app => app.freelancer.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = {
      freelancer: req.user._id,
      proposal: req.body.proposal,
      bidAmount: req.body.bidAmount,
      estimatedDuration: req.body.estimatedDuration
    };

    job.applications.push(application);
    await job.save();

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept/reject application (job owner only)
router.put('/:id/applications/:applicationId', auth, requireRole(['client', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;

    if (status === 'accepted') {
      job.status = 'in-progress';
      job.hiredFreelancer = application.freelancer;
    }

    await job.save();
    res.json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 