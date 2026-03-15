import express from 'express'
import { 
    createBusiness , 
    getBusinesses , 
    getBusiness , 
    updateBusiness ,
    deleteBusiness,
    verifyBusiness,
    getPendingBusinesses
}
    from '../controllers/business.js'
import { protect , authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router()

router.get('/', getBusinesses)
router.get('/admin/pending', protect, authorize('admin'), getPendingBusinesses);

router.get('/:id', getBusiness)
router.post('/', protect, upload.fields([
    {name : 'coverImage' , maxCount: 1,},
    {name : 'images' , maxCount: 5,}

]),createBusiness)
router.patch('/:id', protect, updateBusiness)
router.delete('/:id', protect , deleteBusiness)
router.patch('/:id/verify', protect, authorize('admin'), verifyBusiness);


export default router;