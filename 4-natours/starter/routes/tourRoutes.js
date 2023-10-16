const express = require('express');
const tours = require('../controllers/tourController');
const auth = require('../controllers/authController');

const router = express.Router();

// router.param('id', tours.checkID);
router.route('/top-5-cheap').get(tours.aliasTopTours, tours.getAll);
router.route('/monthly-plan/:year').get(tours.getMonthlyPlan);
router.route('/tour-starts').get(tours.getTourStarts);
router.route('/').get(auth.protect, tours.getAll).post(tours.create);

router
  .route('/:id')
  .get(tours.get)
  .patch(tours.update)
  .delete(auth.protect, auth.restrictTo('admin', 'lead-guide'), tours.delete);

module.exports = router;
