import User from '../models/user.js'
import jwt from 'jsonwebtoken';

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
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Missing required field' });
        }

        const user= await User.findById(req.user._id)

        if(!user){
            res.status(404).json({message: 'user not found'})
        }

        user.password= password;

        await user.save();


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


