import { Router } from 'express';
import {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getExperience));
router.post('/', requireAdmin, asyncHandler(createExperience));
router.put('/:id', requireAdmin, asyncHandler(updateExperience));
router.delete('/:id', requireAdmin, asyncHandler(deleteExperience));

export default router;
