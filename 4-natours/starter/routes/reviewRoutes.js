const express = require('express');
const review = require('../controllers/reviewController');
const auth = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth.protect,
    auth.restrictTo('user'),
    review.setUserTourID,
    review.create
  )
  .get(review.getAll);

router.route('/:id').delete(review.delete).patch(review.update).get(review.get);

module.exports = router;
