const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['tenant', 'staff', 'admin'],
      default: 'tenant',
    },
    apartmentUnit: { type: String, trim: true },
    phone: { type: String, trim: true },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: function () {
        return this.role === 'tenant' ? 'pending' : 'verified';
      },
    },
    verificationDocument: {
      url: { type: String },
      publicId: { type: String },
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);