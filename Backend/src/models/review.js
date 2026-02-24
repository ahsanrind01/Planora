import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: false,
        maxlength: 500
    }
}, { timestamps: true });

reviewSchema.index({ businessId: 1, userId: 1 }, { unique: true });

reviewSchema.statics.getAverageRating = async function (businessId) {
    const obj = await this.aggregate([
        {
            $match: { businessId: businessId }
        },
        {
            $group: {
                _id: '$businessId',
                averageRating: { $avg: '$rating' } 
            }
        }
    ]);

    try {
        await this.model('Business').findByIdAndUpdate(businessId, {
            averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0
        });
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};

reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.businessId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.getAverageRating(doc.businessId);
    }
});

export default mongoose.model('Review', reviewSchema);