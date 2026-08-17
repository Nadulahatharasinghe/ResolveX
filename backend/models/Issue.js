const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed']
    },
    comment: {
      type: String,
      required: [true, 'A description is required when changing status'],
      trim: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      default: 0
    },
    dataUrl: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      trim: true
    },
    issueType: {
      type: String,
      required: [true, 'Please specify issue type'],
      enum: {
        values: ['Bug', 'Task'],
        message: 'Issue type must be Bug or Task'
      }
    },
    priority: {
      type: String,
      required: [true, 'Please specify priority'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High'
      }
    },
    status: {
      type: String,
      required: [true, 'Please specify status'],
      enum: {
        values: ['Open', 'In Progress', 'Resolved', 'Closed'],
        message: 'Status must be Open, In Progress, Resolved, or Closed'
      },
      default: 'Open'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issue must have a creator']
    },
    // History of every status change with mandatory comment
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Issue', issueSchema);
