import { Router } from 'express';
import {
  getSkills,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
} from '../controllers/skillsController.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getSkills));
router.post('/', requireAdmin, asyncHandler(createSkillCategory));
router.put('/:id', requireAdmin, asyncHandler(updateSkillCategory));
router.delete('/:id', requireAdmin, asyncHandler(deleteSkillCategory));

export default router;
