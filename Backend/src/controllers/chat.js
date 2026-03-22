import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import Business from '../models/business.js'; 
import eventBus from '../utils/eventBus.js';

import User from '../models/user.js';
import { sendPushNotification } from '../utils/pushNotifications.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const userBusinessId = req.user.businessId; 

        const myBusiness = await Business.findOne({ owner: userId });

        const searchConditions = [
            { customerId: userId } 
        ]; 

        if (userBusinessId) {
            searchConditions.push({ businessId: userBusinessId });
        }

        if (myBusiness) {
            searchConditions.push({ businessId: myBusiness._id });
        }

        const conversations = await Conversation.find({
            $or: searchConditions
        })
        .populate('customerId', 'name profilePicture')
        .populate('businessId', 'name profilePicture')
        .sort({ lastMessageAt: -1 }); 

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }); 

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text, receiverId } = req.body;
        const senderId = req.user._id;

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            lastMessageAt: Date.now()
        });

        res.status(201).json({ success: true, data: newMessage });

        eventBus.emit('newMessage', { message: newMessage, receiverId });

        const conversation = await Conversation.findById(conversationId).populate('businessId');
        
        let targetUserId;
        
        if (String(req.user._id) === String(conversation.customerId)) {
            targetUserId = conversation.businessId.owner;
        } else {
            targetUserId = conversation.customerId;
        }

        const receiver = await User.findById(targetUserId);

        if (!receiver) {
        } else if (!receiver.expoPushToken) {
        } else {
            const senderName = req.user.name || "Someone"; 
            
            await sendPushNotification(
                receiver.expoPushToken, 
                `New message from ${senderName}`, 
                text,                             
                { conversationId }                
            );
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const initiateChat = async (req, res) => {
    try {
        const { businessId } = req.body;
        const customerId = req.user._id; 

        let conversation = await Conversation.findOne({
            customerId,
            businessId
        });

        if (!conversation) {
            conversation = await Conversation.create({
                customerId,
                businessId
            });
        }

        res.status(200).json({ 
            success: true, 
            data: conversation 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id; 

        await Message.updateMany(
            { conversationId, senderId: { $ne: userId }, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true });

        eventBus.emit('messagesRead', { conversationId, readerId: userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};