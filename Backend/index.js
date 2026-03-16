import dotenv from 'dotenv'
dotenv.config();

import { fileURLToPath } from 'url';
import path from 'path';

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

// Subscribers & Events
import './src/subscribers/bookingSubscriber.js';
import eventBus from './src/utils/eventBus.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectToMongoDB();
console.log("connected to the database");

const app = express();
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


app.listen(3000, () => {
    console.log('Server running on port 3000');
});