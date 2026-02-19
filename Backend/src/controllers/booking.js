import Booking from '../models/booking.js';
import Service from '../models/service.js';
import Business from '../models/business.js';

export const createBooking = async (req, res) => {
    try {
        const { serviceId , date } = req.body; 

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + service.duration * 60000);

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
            status: 'pending'
        });

        res.status(201).json({
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

