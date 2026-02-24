import mongoose from 'mongoose';

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String, 
    default: "09:00",
    trim: true
  },
  endTime: {
    type: String, 
    default: "17:00",
    trim: true 
  },
  isClosed: {
    type: Boolean,
    default: false 
  }
}, { _id: false });


const scheduleSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true 
  },
  workingHours: {
    type: [dayScheduleSchema],
    required: true,
    validate: [arrayLimit, 'Working hours must contain exactly 7 days']
  }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 7;
}

export default mongoose.model('Schedule', scheduleSchema);