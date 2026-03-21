import dotenv from 'dotenv'
dotenv.config();

import http from 'http';
import { initSocket } from './src/utils/socket.js'; 

import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors'; 

import express from 'express'
import connectToMongoDB from './src/config/database.js'

// Routes
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/user.js'
import businessRoutes from './src/routes/business.js';
import serviceRoutes from './src/routes/service.js'
import bookingRoutes from './src/routes/booking.js';
import scheduleRoutes from './src/routes/schedule.js';
import reviewRoutes from './src/routes/review.js';
import paymentRoutes from './src/routes/payment.js';
import chatRoutes from './src/routes/chat.js';

// Subscribers & Events
import './src/subscribers/bookingSubscriber.js';
import eventBus from './src/utils/eventBus.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to the database
connectToMongoDB(); 

const app = express();

const server = http.createServer(app); 
initSocket(server);

app.use(cors()); 
app.use(express.json())

// Setup normal routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/business', businessRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});