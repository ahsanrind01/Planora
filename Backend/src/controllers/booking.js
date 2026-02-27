import eventBus from '../utils/eventBus.js';

import Booking from '../models/booking.js';
import Service from '../models/service.js';
import Business from '../models/business.js';
import Schedule from '../models/schedule.js';

export const createBooking = async (req, res) => {
    try {
        const { serviceId, date } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + service.duration * 60000);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const requestedDay = days[startTime.getDay()];

        const schedule = await Schedule.findOne({ businessId: service.businessId });

        if (!schedule) {
            return res.status(400).json({ message: 'This business has not set its operating hours yet.' });
        }

        const daySchedule = schedule.workingHours.find(d => d.day === requestedDay);

        if (daySchedule.isClosed) {
            return res.status(400).json({ message: `Sorry, this business is closed on ${requestedDay}s.` });
        }

        const requestedTimeStr = startTime.toTimeString().substring(0, 5);
        const requestedEndTimeStr = endTime.toTimeString().substring(0, 5);

        if (requestedTimeStr < daySchedule.startTime || requestedEndTimeStr > daySchedule.endTime) {
            return res.status(400).json({
                message: `Please book within operating hours: ${daySchedule.startTime} to ${daySchedule.endTime} on ${requestedDay}s.`
            });
        }
        
        const existingBooking = await Booking.findOne({
            businessId: service.businessId,
            date: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Time slot is already booked' });
        }
        const booking = await Booking.create({
            userId: req.user._id,
            businessId: service.businessId,
            serviceId: service._id,
            date: startTime,
            endTime: endTime,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            data: booking
        });

        eventBus.emit('bookingCreated', booking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('businessId', 'name address')
            .populate('serviceId', 'name price duration');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBusinessBookings = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const bookings = await Booking.find({ businessId: business._id })
            .populate('userId', 'name email')
            .populate('serviceId', 'name duration');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

