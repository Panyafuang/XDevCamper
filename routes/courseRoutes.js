const courseController = require('../controller/courseController');
const express = require('express');
const Course = require('../models/CourseModel');
const apiFeature = require('../middleware/apiFeature');
const { protect, authorize } = require('../middleware/auth');

// Mergeparams
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(apiFeature(Course, {
        path: 'bootcamp', // came from bootcamp field of courseSchema
        select: 'name description'
    }), courseController.getCourses)
    .post(protect, authorize('publisher', 'admin'), courseController.createCourse)


router.route('/:id')
    .get(courseController.getCourse)
    .put(protect, authorize('publisher', 'admin'), courseController.updateCourse)
    .delete(protect, authorize('publisher', 'admin'), courseController.deleteCourse)
    


module.exports = router;