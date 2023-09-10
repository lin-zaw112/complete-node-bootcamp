const express = require('express');
const tours = require('../controllers/tourController');

const router = express.Router();

// router.param('id', tours.checkID);

router.route('/').get(tours.getAll).post(tours.create);

router.route('/:id').get(tours.get).patch(tours.update).delete(tours.delete);

module.exports = router;
