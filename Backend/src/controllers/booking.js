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


        const dateOnly = date.split('T')[0]; 
        const timeOnly = date.split('T')[1].substring(0, 5); 

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const requestedDay = days[new Date(`${dateOnly}T00:00:00Z`).getUTCDay()];

        const schedule = await Schedule.findOne({ businessId: service.businessId });

        if (!schedule) {
            return res.status(400).json({ message: 'This business has not set its operating hours yet.' });
        }

        const daySchedule = schedule.workingHours.find(d => d.day === requestedDay);

        if (!daySchedule || daySchedule.isClosed) {
            return res.status(400).json({ message: `Sorry, this business is closed on ${requestedDay}s.` });
        }


        const reqStartMins = parseInt(timeOnly.split(':')[0]) * 60 + parseInt(timeOnly.split(':')[1]);
        const duration = Number(service.duration) || 30; 
        const reqEndMins = reqStartMins + duration;

        const bizStartMins = parseInt(daySchedule.startTime.split(':')[0]) * 60 + parseInt(daySchedule.startTime.split(':')[1]);
        const bizEndMins = parseInt(daySchedule.endTime.split(':')[0]) * 60 + parseInt(daySchedule.endTime.split(':')[1]);

        if (reqStartMins < bizStartMins || reqEndMins > bizEndMins) {
            return res.status(400).json({
                message: `Please book within operating hours: ${daySchedule.startTime} to ${daySchedule.endTime} on ${requestedDay}s.`
            });
        }
        
        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + duration * 60000);

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

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            data: booking
        });
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
            .populate('serviceId', 'name duration price'); 

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const business = await Business.findOne({ owner: req.user._id });
        if (booking.businessId.toString() !== business._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};