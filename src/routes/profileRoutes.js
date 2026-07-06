import { Router } from 'express';
import { getProfile, getProfileImage, getProfileResume, updateProfile } from '../controllers/profileController.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadProfileFiles } from '../middleware/upload.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getProfile));
router.get('/image', asyncHandler(getProfileImage));
router.get('/resume', asyncHandler(getProfileResume));
router.put('/', requireAdmin, uploadProfileFiles, asyncHandler(updateProfile));

export default router;
