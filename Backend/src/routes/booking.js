import express from 'express';
import { 
    createBooking, 
    getBookings, 
    getBusinessBookings 
} from '../controllers/booking.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create',protect,createBooking);
router.get('/bookings',protect,getBookings);
router.get('/business',protect,getBusinessBookings)

export default router;