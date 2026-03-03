const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS    
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
    try {
        const { name, email, mobileNumber, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (userExists) {
            if (userExists.email === email) return res.status(400).json({ message: 'Email already registered.' });
            if (userExists.mobileNumber === mobileNumber) return res.status(400).json({ message: 'Mobile number already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000);

        const user = await User.create({
            name, email, mobileNumber, password: hashedPassword,
            isVerified: false, otp, otpExpiry
        });

        console.log(`\n🚨 OTP FOR ${email} IS: ${otp} 🚨\n`);

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'YOUR ONE TIME PASSWORD FOR REGISTRATION',
                html: `<h2>Welcome to IELTS PREPARATION PLATFORM, ${name}!</h2><p>Your verification OTP is: <strong style="font-size: 24px;">${otp}</strong></p>`
            });
            res.status(201).json({ message: 'OTP sent to your email.', email: user.email });
        } catch (mailError) {
            console.error("Mail Sending Failed:", mailError);
            res.status(500).json({ message: 'Failed to send email. Check EMAIL_USER and EMAIL_PASS in backend .env file.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired' });

        user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined;
        await user.save();

        res.json({ user: { _id: user.id, name: user.name, email: user.email, role: user.role }, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        if (!user.isVerified) return res.status(401).json({ message: 'Please verify your account first.' });

        if (await bcrypt.compare(password, user.password)) {
            res.json({ user: { _id: user.id, name: user.name, email: user.email, role: user.role }, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ... Keep your existing forgot-password and reset-password routes below ...
module.exports = router;