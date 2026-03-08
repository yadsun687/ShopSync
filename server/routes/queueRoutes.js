const express = require('express');
const router = express.Router();
const { addTasks, processTasks, getTasks, resetTasks } = require('../utils/taskQueue');
const { protect } = require('../middleware/authMiddleware');

// POST /api/queue/start — add 10 tasks and begin processing
router.post('/start', protect, (req, res, next) => {
  resetTasks();
  addTasks(10);
  processTasks();
  res.status(200).json({ status: 'success', message: 'Queue started with 10 tasks', tasks: getTasks() });
});

// GET /api/queue/status — return current task list
router.get('/status', protect, (req, res, next) => {
  res.status(200).json({ status: 'success', tasks: getTasks() });
});

module.exports = router;
