import { Router } from 'express';
import { getProfile, getProfileImage, updateProfile } from '../controllers/profileController.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getProfile));
router.get('/image', asyncHandler(getProfileImage));
router.put('/', requireAdmin, uploadImage, asyncHandler(updateProfile));

export default router;
