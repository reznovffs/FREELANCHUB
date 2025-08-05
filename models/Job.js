const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'Data Science', 'Other']
  },
  skills: [{
    type: String,
    trim: true
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    minAmount: Number,
    maxAmount: Number
  },
  duration: {
    type: String,
    enum: ['less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', 'more than 6 months']
  },
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [{
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposal: String,
    bidAmount: Number,
    estimatedDuration: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  hiredFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for better search performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema); 