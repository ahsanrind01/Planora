import User from '../models/user.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const getMe = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
        if (user) {
            res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            })
        } else {
            res.status(404).json({ message: 'user not found' })
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const duplicateUser = await User.findOne({ 
            email: email,
            _id: {$ne: req.user._id}
        });
        if (duplicateUser) {
            return res.status(400).json({ message: 'this email is already taken' })
        }

        const user = await User.findByIdAndUpdate(req.user._id,
            {
                name,
                email,
            },
            {
                new : true,
                runValidators: true 
            }
        )

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        if (user) {
            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email,
                token
            })
        } else {
            res.status(400).json({ message: "invalid user data" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'The current password you entered is incorrect.' });
        }

        user.password = newPassword;
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


