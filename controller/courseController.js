const Course = require('../models/CourseModel');
const Bootcamp = require('../models/BootcampModel');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');


/**
 * @desc    Get all courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcampId/courses
 * @access  Public
 */
exports.getCourses = asyncHandler(async(req, res,next) => {

    // /api/v1/bootcamps/:bootcampId/courses
    if(req.params.bootcampId){
        const courses = await Course.find({ bootcamp: req.params.bootcampId});

        res.status(200).json({
            status: 'success',
            result: courses.length,
            data: courses
        });
    }else{
    // /api/v1/courses
        res.status(200).json(res.apiFeature);
    }

});




/**
 * @desc    Get single course
 * @route   GET /api/v1/course/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course){
        return next (new ErrorResponse(`Course not found with id that ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: course
    });

});


/**
 * @desc    Create single course
 * @route   POST /api/v1/bootcamps/:bootcampId/courses
 * @access  Private
 */
exports.createCourse = asyncHandler( async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // หา bootcamp ที่ id ตรงกับ req.params.bootcampId
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next( new ErrorResponse(`Bootcamp not found with that id ${req.params.bootcampId}`, 404));
    }

    // Check user is owner bootcamp
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp.name}`));
    }

    // Create course belong to that bootcamp
    const course = await Course.create(req.body);

    res.status(201).json({
        status: 'success',
        data: course
    });
});




/**
 * @desc    Update single course
 * @route   PUT /api/v1/courses/:id
 * @access  Private
 */
exports.updateCourse = asyncHandler( async (req, res, next) => {

    // Find course with id for update
    let course = await Course.findById(req.params.id);
    if(!course){
        return next( new ErrorResponse(`Course not found with that id ${req.params.bootcampId}`, 404));
    }

    // Check user is owner course
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course ${course.title}`));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: course
    });
});


/**
 * @desc    Delete single course
 * @route   PUT /api/v1/courses/:id
 * @access  Private
 */
exports.deleteCourse = asyncHandler( async (req, res, next) => {

    // Find course with id for delete
    let course = await Course.findById(req.params.id);
    if(!course){
        return next( new ErrorResponse(`Course not found with that id ${req.params.bootcampId}`, 404));
    }

    // Check user is owner course
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete ${course.title}`));
    }

    await course.remove();

    res.status(204).json({
        status: 'success',
        data: null
    });
});