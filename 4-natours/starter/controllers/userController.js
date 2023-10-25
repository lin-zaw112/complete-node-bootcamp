const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 create error if user POSTs password data
  if (req.body.password || req.body.passwordComfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMypassword',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.create = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ! Please use /signup instead',
  });
};
exports.getAll = factory.getAll(User);
exports.get = factory.getOne(User);
exports.update = factory.updateOne(User);
exports.delete = factory.deleteOne(User);
