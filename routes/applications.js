const express = require('express');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user's applications (freelancers)
router.get('/my-applications', auth, requireRole(['freelancer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.freelancer': req.user._id
    })
    .populate('client', 'name')
    .select('title category budget applications status createdAt');

    const applications = jobs.map(job => {
      const application = job.applications.find(
        app => app.freelancer.toString() === req.user._id.toString()
      );
      return {
        jobId: job._id,
        jobTitle: job.title,
        jobCategory: job.category,
        jobBudget: job.budget,
        jobStatus: job.status,
        application: application,
        appliedAt: job.createdAt
      };
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for user's jobs (clients)
router.get('/my-jobs-applications', auth, requireRole(['client']), async (req, res) => {
  try {
    const jobs = await Job.find({
      client: req.user._id
    })
    .populate('applications.freelancer', 'name profile')
    .select('title category budget applications status createdAt');

    res.json(jobs);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application (freelancers)
router.delete('/withdraw/:jobId', auth, requireRole(['freelancer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicationIndex = job.applications.findIndex(
      app => app.freelancer.toString() === req.user._id.toString()
    );

    if (applicationIndex === -1) {
      return res.status(404).json({ message: 'Application not found' });
    }

    job.applications.splice(applicationIndex, 1);
    await job.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 