/**
 * createAdmin.js
 * 
 * Seed script to create or promote an admin account.
 * 
 * Usage:
 *   node backend/scripts/createAdmin.js
 * 
 * Required environment variables (set in backend/.env):
 *   ADMIN_NAME     — display name for the admin account
 *   ADMIN_EMAIL    — email address for the admin account
 *   ADMIN_PASSWORD — password (min 6 chars)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  // Validate env vars
  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    console.error('ERROR: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set in .env');
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 6) {
    console.error('ERROR: ADMIN_PASSWORD must be at least 6 characters');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const email = ADMIN_EMAIL.toLowerCase().trim();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User already exists — promote to admin if not already
      if (existingUser.role === 'admin') {
        console.log(`User ${email} is already an admin. No changes made.`);
      } else {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Existing user ${email} has been promoted to admin.`);
      }
    } else {
      // Create new admin account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await User.create({
        name: ADMIN_NAME.trim(),
        email,
        password: hashedPassword,
        role: 'admin'
      });

      console.log(`Admin account created for ${email}.`);
    }
  } catch (err) {
    console.error('Script error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

run();
