const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  changeStatus
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

// Protect all issue routes
router.use(protect);

router.route('/')
  .post(createIssue)
  .get(getIssues);

router.route('/:id')
  .get(getIssueById)
  .put(updateIssue)
  .delete(deleteIssue);

// Status change — any authenticated user, comment required
router.patch('/:id/status', changeStatus);

module.exports = router;
