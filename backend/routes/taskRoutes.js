import express from 'express';
import { createTask, updateTaskStatus, getProjectTasks } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const router = express.Router();

// Existing routes bound to controllers
router.post('/', protect, createTask);
router.put('/:id', protect, updateTaskStatus);
router.get('/project/:projectId', protect, getProjectTasks);

// -------------------------------------------------------------------------
// NEW GLOBAL METRICS ENDPOINT FOR DASHBOARD COUNTERS
// -------------------------------------------------------------------------
router.get('/global-metrics', protect, async (req, res) => {
  try {
    let projectIds = [];

    if (req.user.role === 'Admin') {
      // Admin ke banaye hue saare projects nikalo
      const projects = await Project.find({ admin: req.user._id });
      projectIds = projects.map(p => p._id);
    } else {
      // Member jis jiske andar assigned hai wo projects nikalo
      const projects = await Project.find({ members: req.user._id });
      projectIds = projects.map(p => p._id);
    }

    // Un saare projects ke andar ke tasks count karo based on status
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: 'Done' });
    const pendingTasks = totalTasks - completedTasks;

    res.json({ completedTasks, pendingTasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compile dashboard global metrics', error: err.message });
  }
});

export default router;