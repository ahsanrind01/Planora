import express from 'express';
import { 
    getReviews, 
    addReview, 
    updateReview, 
    deleteReview 
} from '../controllers/review.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.route('/business/:businessId')
    .get(getReviews)              
    .post(protect, addReview);    

router.route('/:id')
    .patch(protect, updateReview)   
    .delete(protect, deleteReview);

export default router;