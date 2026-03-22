import express from 'express'
import {getMe ,updateProfile,updatePassword,savePushToken}from '../controllers/user.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/me',protect,getMe)
router.put('/profile',protect, updateProfile)
router.put('/password',protect,updatePassword)
router.post('/push-token', protect, savePushToken);

export default router;