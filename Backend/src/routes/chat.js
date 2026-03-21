import express from 'express';
import { getConversations, getMessages, sendMessage, initiateChat , markAsRead } from '../controllers/chat.js';import { protect } from '../middlewares/authMiddleware.js'; // Ensure users are logged in

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/send', protect, sendMessage);

router.post('/initiate', protect, initiateChat);
router.put('/:conversationId/read', protect, markAsRead);

export default router;