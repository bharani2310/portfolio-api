import { Router } from 'express';
import {
  createContact,
  getContacts,
  deleteContact,
  deleteConversation,
  markConversationRead,
} from '../controllers/contactController.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(createContact));
router.get('/', requireAdmin, asyncHandler(getContacts));

// More specific routes first so Express doesn't treat "conversation" as an :id.
router.delete('/conversation/:email', requireAdmin, asyncHandler(deleteConversation));
router.patch('/conversation/:email/read', requireAdmin, asyncHandler(markConversationRead));

router.delete('/:id', requireAdmin, asyncHandler(deleteContact));

export default router;
