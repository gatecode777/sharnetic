import connectDB from './_db.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/server/models/Admin.js';

connectDB();

(async () => {
  const exists = await Admin.findOne({ email: "admin@gmail.com" });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await Admin.create({
    fullName: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "super_admin",
  });

  console.log("Admin created successfully");
  process.exit();
})();
