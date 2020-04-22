const express = require('express');
const reviewController = require('../controller/reviewController');
const apiFeature = require('../middleware/apiFeature');
const Reviews = require('../models/ReviewModel');
const {protect, authorize } = require('../middleware/auth');


// Merg params
const router = express.Router({ mergeParams:true })

router.route('/')
    .get(
        apiFeature(Reviews, { path: 'bootcamp', select: 'name description'}),
        reviewController.getReviews)
        .post(protect, authorize('user', 'admin'), reviewController.createReview)

router.route('/:id')
        .get(reviewController.getReview)
        .put(protect, authorize('user', 'admin'), reviewController.updateReviews)
        .delete(protect, authorize('user', 'admin'), reviewController.deleteReviews);

module.exports = router