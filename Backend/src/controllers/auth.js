import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const duplicateUser = await User.findOne({ email });
        if (duplicateUser) {
            return res.status(400).json({ message: 'this email is already taken' })
        }

        const user = await User.create(
            {
                name,
                email,
                password
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


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findOne({ email })
        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' },
            );

            res.status(200).json({
                id:user._id,
                name:user.name,
                email:user.email,
                token
            })

        }
        else {
            res.status(400).json({ message: "invalid email or password" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

