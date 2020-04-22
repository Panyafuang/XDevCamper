const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const apiFeature = require('../middleware/apiFeature');
const User = require('../models/UserModel');


/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private
 */
exports.getUsers = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.apiFeature);
});



/**
 * @desc    Get single user
 * @route   GET /api/v1/user/:id
 * @access  Private
 */
exports.getUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) return next(new ErrorResponse(`User not found with that id ${req.params.id}`));

    res.status(200).json({
        status: 'success',
        data: user
    });
});




/**
 * @desc    Create users
 * @route   POST /api/v1/users
 * @access  Private
 */
exports.createUser = asyncHandler(async(req, res, next) => {
    const fieldOption = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    }

    const user = await User.create(fieldOption);

    res.status(201).json({
        status: 'success',
        data: user
    });

});

/**
 * @desc    Update user
 * @route   PUT /api/v1/user/:id
 * @access  Private
 */
exports.updateUser = asyncHandler(async(req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!user) return next(new ErrorResponse(`User not found with that id ${req.params.id}`));


    res.status(200).json({
        status: 'success',
        data: user
    });
    
});




/**
 * @desc    Delete user
 * @route   DELETE /api/v1/user/:id
 * @access  Private
 */
exports.deleteUser = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user) return next(new ErrorResponse(`User not found with that id ${req.params.id}`));

    res.status(204).json({
        status: 'success',
        data: null
    });

});