const express = require('express');
const userController = require('../controller/userController');
const { protect, authorize } = require('../middleware/auth');
const apiFeature = require('../middleware/apiFeature');
const User = require('../models/UserModel');

const router = express.Router();

//
// ─── FOR ADMIN ──────────────────────────────────────────────────────────────────
//
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(apiFeature(User), userController.getUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
