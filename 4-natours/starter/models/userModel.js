const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A user must have a name.'],
    trim: true,
    unique: true,
    maxlength: [20, 'A Username must have less or equal then 20 characters'],
    minlength: [5, 'A Username must have more or equal then 5 characters'],
  },
  email: {
    type: String,
    require: [true, 'A user must have a name.'],
    trim: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Email is not valid : ({VALUE}). Please provide a valid email and try again .',
    ],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'A user must set a secure password'],
    minlength: 8,
    select: false,
  },
  passwordComfirm: {
    type: String,
    require: [true, 'A user must set a secure password '],
    minlength: 8,
    validate: {
      // This only works on CREATE AND SAVE !!
      validator: function (pass) {
        return pass === this.password;
      },
      message: 'Password must be the same',
    },
  },
  photo: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  __v: {
    type: Number,
    select: false,
  },
});
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordComfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassord
) {
  return await bcrypt.compare(candidatePassword, userPassord);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 10000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
