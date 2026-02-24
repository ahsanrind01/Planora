import Schedule from '../models/schedule.js';
import Business from '../models/business.js';

export const upsertSchedule = async (req, res) => {
    try {
        const { workingHours } = req.body;

        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.status(404).json({ message: 'Business not found. Create a business first.' });
        }

        const schedule = await Schedule.findOneAndUpdate(
            { businessId: business._id }, 
            { businessId: business._id, workingHours },
            { 
                new: true,         
                upsert: true,      
                runValidators: true 
            }
        );
        res.status(200).json({ 
            success: true, 
            data: schedule 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOne({ businessId: req.params.businessId });

        if (!schedule) {
            return res.status(404).json({ message: 'No schedule found for this business' });
        }

        res.status(200).json({ 
            success: true, 
            data: schedule 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};