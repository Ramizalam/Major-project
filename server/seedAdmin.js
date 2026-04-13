require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep');
    console.log('Connected to DB');

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@ielts.com' });

    if (admin) {
        console.log('Admin user already exists! Email: admin@ielts.com | Password: adminpassword');
        process.exit();
    }

    // Create the admin
    admin = new User({
        name: 'System Admin',
        email: 'admin@ielts.com',
        password: 'adminpassword',
        role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created! Email: admin@ielts.com | Password: adminpassword');
    process.exit();

  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();