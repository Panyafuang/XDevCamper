const Bootcamp = require('../models/BootcampModel');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/ReviewModel');
const apiFeature = require('../middleware/apiFeature');



/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/bootcamps/:bootcampId/reviews
 * @access  Public
 */
exports.getReviews = asyncHandler(async(req, res, next) => {
    console.log(req.params.bootcampId)
    if(req.params.bootcampId){
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            status: 'success',
            result: reviews.length,
            data: reviews
        });
    }else{
        // /api/v1/reviews
        res.status(200).json(res.apiFeature);
    }

});


/**
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReview = asyncHandler(async(req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamps',
        select: 'name description'
    });
    if(!review) return next(new ErrorResponse(`No review found with the id ${req.params.id}`, 404));

    res.status(200).json({
        status: 'success',
        data: review
    });

});


/**
 * @desc    Create single review
 * @route   POST /api/v1/bootcamps/:bootcampId/reviews
 * @access  Private
 */
exports.createReview = asyncHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp) return next(new ErrorResponse(`No bootcamps found with the id ${req.params.bootcampId}`, 404));

    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;

    const review = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: review
    });

});




/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
exports.updateReviews = asyncHandler(async(req, res, next) => {
    let review = await Review.findById(req.params.id);
    if(!review) return next(new ErrorResponse(`No review found with the id ${req.params.id}`, 404));

    // Make sure review belong to user or user is admin
    if(!review.user === req.user.id && req.user.role === 'admin'){
        return next(new ErrorResponse(`Not authorize to update review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: review
    });
    
});





/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
exports.deleteReviews = asyncHandler(async(req, res, next) => {
    let review = await Review.findById(req.params.id);
    if(!review) return next(new ErrorResponse(`No review found with the id ${req.params.id}`, 404));

    // Make sure review belong to user or user is admin
    if(!review.user === req.user.id && req.user.role === 'admin'){
        return next(new ErrorResponse(`Not authorize to update review`, 401));
    }

    await review.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });

});