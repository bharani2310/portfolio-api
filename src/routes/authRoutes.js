import { Router } from 'express';
import { login, me, changePassword } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/me', requireAdmin, asyncHandler(me));
router.put('/change-password', requireAdmin, asyncHandler(changePassword));

export default router;
