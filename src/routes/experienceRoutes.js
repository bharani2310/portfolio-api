import { Router } from 'express';
import {
  getExperience,
  getExperienceImage,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getExperience));
router.get('/:id/image', asyncHandler(getExperienceImage));
router.post('/', requireAdmin, uploadImage, asyncHandler(createExperience));
router.put('/:id', requireAdmin, uploadImage, asyncHandler(updateExperience));
router.delete('/:id', requireAdmin, asyncHandler(deleteExperience));

export default router;
