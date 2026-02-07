import express from 'express'
import {getMe ,updateProfile,updatePassword}from '../controllers/user.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/me',protect,getMe)
router.put('/profile',protect, updateProfile)
router.put('/password',protect,updatePassword)

export default router;