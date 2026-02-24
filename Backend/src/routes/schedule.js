import express from 'express';
import { upsertSchedule, getSchedule } from '../controllers/schedule.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upsertSchedule);

router.get('/:businessId', getSchedule);

export default router;