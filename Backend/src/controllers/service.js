import Service from '../models/service.js';
import Business from '../models/business.js';

export const createService = async (req, res) => {
    try {
        const { name, description, price, duration } = req.body;

        const business = await Business.findOne({ owner: req.user._id });

        if (!business) {
            return res.status(404).json({ message: 'You must create a business first.' });
        }

        const service = await Service.create({
            name,
            description,
            price,
            duration,
            businessId: business._id
        });

        res.status(201).json({
            success: true,
            data: service
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ businessId: req.params.businessId });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const business = await Business.findById(service.businessId);
        
        if (business.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this service' });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: service });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const business = await Business.findById(service.businessId);
        if (business.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await service.deleteOne();

        res.status(200).json({ success: true, data: {} });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
