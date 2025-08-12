const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('👨‍💼 Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminData = {
      name: 'Parivash Shaikh',
      email: 'Theoghouze@gmail.com',
      password: 'admin123',
      role: 'admin'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👑 Role:', adminData.role);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdmin();
