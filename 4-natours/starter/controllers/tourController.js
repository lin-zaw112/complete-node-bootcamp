const Tour = require('../models/tourModel');

exports.getAll = async (req, res) => {
  try {
    console.log(req.query);

    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));

    // CREATE QUERY
    let query = Tour.find(JSON.parse(queryStr), { createdAt: 1 });
    //  Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.replaceAll(',', ' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    // Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.replaceAll(',', ' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    // EXECUTE QUERY
    const tours = await query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      massage: 'Not Found !',
      errors: err,
    });
  }
};
exports.get = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      massage: 'Not Found !',
      error,
    });
  }
};
exports.create = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      massage: 'Invaild data sent !',
      error,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      massage: 'Invaild data sent !',
      error,
    });
  }
};
exports.delete = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      massage: 'Invaild data sent !',
      error,
    });
  }
};
