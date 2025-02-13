const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // remove the password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide valid email and password ! ', 400)
    );
  }
  // 2) check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  }
  if (!token)
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3 Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The use belonging to this token no longer exist!', 401)
    );
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password ! Please log in again.', 401)
    );
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with provided email address.', 404)
    );
  }

  const resetToken = user.createPasswordResetToken();

  // 3 Send it to user's email
  const restURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a PATCH request with your new Password and passwordComfirm to: ${restURL}.\nIf you didn't forget your password, Please ignore this email !`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (vaild for 10 mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to Your email !',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
  } finally {
    await user.save({ validateBeforeSave: false });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  // 2 if token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token in invalid or has expired ', 400));
  user.password = req.body.password;
  if (!req.body.passwordComfirm)
    return next(new AppError('passwordComfirm field is missing'));
  user.passwordComfirm = req.body.passwordComfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // 3 Update changedPasswordAt property for the user

  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 Get user from  collection
  const user = await User.findById(req.user.id).select('+password');

  // 2 Check if POSTed current password is correct

  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(
      new AppError(
        'Incorrect email or password or passwordCurrent field is missing',
        401
      )
    );
  }

  // 3 If so, update password
  user.password = req.body.password;
  if (!req.body.passwordComfirm)
    return next(new AppError('passwordComfirm field is missing'));
  user.passwordComfirm = req.body.passwordComfirm;
  await user.save();
  createSendToken(user, 200, res);
});
