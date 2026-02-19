import express from 'express';
import { 
    createService, 
    getServices, 
    getService, 
    updateService, 
    deleteService 
} from '../controllers/service.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/business/:businessId', getServices);
router.get('/:id', getService);

router.post('/', protect, createService);
router.patch('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

export default router;