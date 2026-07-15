require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@yourapp.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  await User.create({
    name: 'Super Admin',
    email: 'admin@yourapp.com',
    password: 'ChangeThisPassword123',
    role: 'admin',
  });

  console.log('Admin created successfully');
  process.exit();
};

seedAdmin();