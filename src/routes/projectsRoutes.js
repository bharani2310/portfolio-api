import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  getProjectImage,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectsController.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getProjects));
router.get('/:id', asyncHandler(getProjectById));
router.get('/:id/image', asyncHandler(getProjectImage));
router.post('/', requireAdmin, uploadImage, asyncHandler(createProject));
router.put('/:id', requireAdmin, uploadImage, asyncHandler(updateProject));
router.delete('/:id', requireAdmin, asyncHandler(deleteProject));

export default router;
