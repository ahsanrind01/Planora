import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a business name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: [
                'Cleaning',
                'Beauty',
                'Repair',
                'Health',
                'Automotive',
                'Education',
                'Other'
            ]
        },

        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
            maxlength: [20, 'Phone number can not be longer than 20 characters']
        },
        coverImage: {
            type: String,
        },

        images: {
            type: [String],
            validate: [arrayLimit, '{PATH} exceeds the limit of 5 photos']
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        averageRating: {
            type: Number,
            min: [0, 'Rating must be at least 1'],
            max: [5, 'Rating must can not be more than 5'],
            default: 0
        }
    },
    {
        timestamps: true,
    }
);
function arrayLimit(val) {
    return val.length <= 5;
}

businessSchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'businessId',
    justOne: false
});


export default mongoose.model('Business', businessSchema);