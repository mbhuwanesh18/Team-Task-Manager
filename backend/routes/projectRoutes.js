import express from 'express';
import { createProject, getProjects } from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, createProject)
  .get(protect, getProjects);

export default router;