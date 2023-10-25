const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setUserTourID = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user;
  next();
};
exports.getAll = factory.getAll(Review);

exports.get = factory.getOne(Review);

exports.create = factory.createOne(Review);

exports.delete = factory.deleteOne(Review);

exports.update = factory.updateOne(Review);
