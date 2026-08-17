const User = require('../models/User');
const Issue = require('../models/Issue');
const mongoose = require('mongoose');

// @desc    Get platform stats (users + issue counts by status)
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues
    ] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Open' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.countDocuments({ status: 'Closed' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues
      }
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users (admin view with role)
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "user" or "admin"'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent removing the last admin
    if (targetUser.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last administrator.'
        });
      }
    }

    // Prevent admin from changing their own role (safety guard)
    if (targetUser._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself from admin.'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role updated to "${role}"`,
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
