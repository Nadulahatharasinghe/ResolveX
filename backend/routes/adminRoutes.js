const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
