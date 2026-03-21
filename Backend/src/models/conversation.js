import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    businessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business', 
        required: true 
    },
    lastMessage: { 
        type: String,
        default: ""
    },
    lastMessageAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema)