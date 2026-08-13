const Issue = require('../models/Issue');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    const { title, description, issueType, priority, status, assignee, dueDate } = req.body;

    // 1. Input Validation
    if (!title || !description || !issueType || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, issue type, and priority'
      });
    }

    // Validate enums
    if (!['Bug', 'Task'].includes(issueType)) {
      return res.status(400).json({
        success: false,
        message: 'Issue type must be Bug or Task'
      });
    }

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be Low, Medium, or High'
      });
    }

    if (status && !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Open, In Progress, Resolved, or Closed'
      });
    }

    // 2. Validate Assignee User if provided
    let assigneeId = null;
    if (assignee && assignee.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignee user ID'
        });
      }
      const existingAssignee = await User.findById(assignee);
      if (!existingAssignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee user not found'
        });
      }
      assigneeId = assignee;
    }

    // 3. Create Issue (createdBy automatically set from req.user)
    const issue = await Issue.create({
      title,
      description,
      issueType,
      priority,
      status: status || 'Open',
      assignee: assigneeId,
      dueDate: dueDate || null,
      createdBy: req.user._id
    });

    // Populate user references before returning
    const populatedIssue = await Issue.findById(issue._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populatedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating issue'
    });
  }
};

// @desc    Get all issues with optional search & filters
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res) => {
  try {
    const { search, status, priority, issueType } = req.query;
    const filter = {};

    // 1. Filter by status, priority, issueType
    if (status && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      filter.status = status;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      filter.priority = priority;
    }

    if (issueType && ['Bug', 'Task'].includes(issueType)) {
      filter.issueType = issueType;
    }

    // 2. Search title & description (case-insensitive regex)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // 3. Fetch from MongoDB, sorted by newest first
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving issues'
    });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving issue'
    });
  }
};

// @desc    Update an issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    let issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const { title, description, issueType, priority, status, assignee, dueDate } = req.body;

    // Validate fields if provided
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      issue.title = title;
    }

    if (description !== undefined) {
      if (!description || description.trim() === '') {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      }
      issue.description = description;
    }

    if (issueType !== undefined) {
      if (!['Bug', 'Task'].includes(issueType)) {
        return res.status(400).json({ success: false, message: 'Issue type must be Bug or Task' });
      }
      issue.issueType = issueType;
    }

    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ success: false, message: 'Priority must be Low, Medium, or High' });
      }
      issue.priority = priority;
    }

    if (status !== undefined) {
      if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be Open, In Progress, Resolved, or Closed' });
      }
      issue.status = status;
    }

    if (assignee !== undefined) {
      if (assignee && assignee !== '' && assignee !== null) {
        if (!mongoose.Types.ObjectId.isValid(assignee)) {
          return res.status(400).json({ success: false, message: 'Invalid assignee ID' });
        }
        const existingUser = await User.findById(assignee);
        if (!existingUser) {
          return res.status(400).json({ success: false, message: 'Assignee user not found' });
        }
        issue.assignee = assignee;
      } else {
        issue.assignee = null;
      }
    }

    if (dueDate !== undefined) {
      issue.dueDate = dueDate || null;
    }

    await issue.save();

    const updatedIssue = await Issue.findById(id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating issue'
    });
  }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private (Creator only)
exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Creator authorization check
    if (issue.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue. Only the issue creator can delete it.'
      });
    }

    await issue.deleteOne();

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting issue'
    });
  }
};
