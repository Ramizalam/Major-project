require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'ielts_prep' });
        console.log('MongoDB connected');

        const adminEmail = 'admin@admin.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            const adminUser = await User.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });

            console.log('Admin user created successfully:', adminUser.email);
            console.log('Password: password123');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
