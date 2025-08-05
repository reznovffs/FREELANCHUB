const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-board', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@freelancehub.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        
        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@freelancehub.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        });
        
        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@freelancehub.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdminUser(); 