const express = require('express');

// * ROUTE HANDLER
const user = require('../controllers/userController');

const router = express.Router();

router.route('/').get(user.getAll).post(user.create);

router.route('/:id').get(user.get).patch(user.update).delete(user.delete);

module.exports = router;
