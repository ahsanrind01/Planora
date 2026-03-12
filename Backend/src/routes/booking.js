import express from 'express';
import { 
    createBooking, 
    getBookings, 
    getBusinessBookings ,
    cancelBooking
} from '../controllers/booking.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create',protect,createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/me',protect,getBookings);
router.get('/business',protect,getBusinessBookings)

export default router;