import Review from '../models/review.js';
import Business from '../models/business.js';


export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ businessId: req.params.businessId })
            .populate({
                path: 'userId',
                select: 'name' 
            });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching reviews', error: error.message });
    }
};


export const addReview = async (req, res) => {
    try {
        req.body.businessId = req.params.businessId;
        req.body.userId = req.user._id;

        const business = await Business.findById(req.params.businessId);
        if (!business) {
            return res.status(404).json({ message: 'No business found with this ID' });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted a review for this business.' });
        }
        res.status(500).json({ message: error.message });
    }
};


export const updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        if (req.body.rating) 
            review.rating = req.body.rating;
        if (req.body.comment) 
            review.comment = req.body.comment;

        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};