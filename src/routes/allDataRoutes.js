import { Router } from 'express';
import { getAllData } from '../controllers/allDataController.js';
import { asyncHandler } from '../services/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getAllData));

export default router;
