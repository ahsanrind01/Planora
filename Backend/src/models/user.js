import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
        {
            name: {
                type: String,
                required: [true,'please enter your name']
            },
            email: {
                type: String,
                required: [true,'please enter your email'],
                unique: true
            },
            password: {
                type: String,
                required: [true,'please enter your password']
            },
            role: {
                type: String,
                enum: ['user','manager', 'employee', 'admin'],
                default: 'user'
            },
            businessId: {
                type : mongoose.Schema.Types.ObjectId,
                ref: 'Business',
                default: null,
            }
        }, {
        timestamps: true
    }
    )

userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return ;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User',userSchema)
export default User;

