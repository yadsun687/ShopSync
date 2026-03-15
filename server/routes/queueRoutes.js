import express from 'express';
import { addTasks, processTasks, getTasks, resetTasks } from '../utils/taskQueue.js';

const router = express.Router();

// POST /api/queue/start — add 10 tasks and begin processing
router.post('/start', (req, res, next) => {
  resetTasks();
  addTasks(10);
  processTasks();
  res.status(200).json({ status: 'success', message: 'Queue started with 10 tasks', tasks: getTasks() });
});

// GET /api/queue/status — return current task list
router.get('/status', (req, res, next) => {
  res.status(200).json({ status: 'success', tasks: getTasks() });
});

export default router;
