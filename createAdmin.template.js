const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Admin user data (CHANGE THESE CREDENTIALS!)
const adminData = {
  name: 'Parivash Shaikh',           
  email: 'theoghouze@gmail.com',   
  password: 'admin123', 
  role: 'admin'
};

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    // Create admin user
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
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the function
createAdmin();
