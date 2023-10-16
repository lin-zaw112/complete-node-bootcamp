const express = require('express');

// * ROUTE HANDLER
const user = require('../controllers/userController');
const auth = require('../controllers/authController');

const router = express.Router();

router.post('/forgotPassword', auth.forgotPassword);
router.patch('/resetPassword/:token', auth.resetPassword);
router.patch('/updateMyPassword', auth.protect, auth.updatePassword);

router.patch('/updateMe', auth.protect, user.updateMe);
router.delete('/deleteMe', auth.protect, user.deleteMe);

router.post('/signup', auth.signup);
router.post('/login', auth.login);

router.route('/').get(user.getAll).post(user.create);

router.route('/:id').get(user.get).patch(user.update).delete(user.delete);

module.exports = router;
