const path = require('path');
const Bootcamp = require('../models/BootcampModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const geocoder = require('../utils/geocoder');


/**
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        res.status(200).json(res.apiFeature);
});


/**
 * @desc    Create single bootcamp
 * @route   POST /api/v1/bootcamps
 * @access  Private
 */
exports.createBootcamp = asyncHandler( async (req, res, next) => {
        // Add user to req.body
        req.body.user = req.user.id;

        // check bootcamps ที่เคย created แล้วโดย publisher คนเดิม
        const publishedBootcamps = await Bootcamp.findOne({user: req.user.id });

        // ถ้า user ไม่ใช่ admin จะสามารถ create bootcamp ได้แค่อันเดียวต่อ หนึ่งคน
        if(publishedBootcamps && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
        }

        const bootcamp = await Bootcamp.create(req.body);
    
        res.status(201).json({
            status: 'success',
            data: bootcamp
        });
});


/**
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');

        // format id ถูกแต่ใส่ id ผิด
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'succes',
            data: bootcamp
        });
    
});


/**
 * @desc    Update single bootcamp
 * @route   PUT /api/v1/bootcamps/:id
 * @access  Private
 */
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return res.status(400).json({ status: 'fail'});
        }

        // Check user is owner bootcamp
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: bootcamp
        });
    
});



/**
 * @desc    Delete single bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Private
 */
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Check user is owner bootcamp
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`));
        }

        bootcamp.remove();

        res.status(204).json({
            data: null
        });
        
});



/**
 * @desc    Get bootcamps within a radius
 * @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Private
 */
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // KM
    const radius = distance / 6378.1;

    // Find result
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        result: bootcamps.length,
        data:  bootcamps
    });
    
});




/**
 * @desc    Upload photo for bootcamp
 * @route   PUT /api/v1/bootcamps/:id/photo
 * @access  Private
 */
exports.bootcampPhotoUpload = asyncHandler( async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next (new ErrorResponse(`Bootcamp not found with that id ${$req.params.id}`, 404));
    }

    // Check user is owner bootcamp
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`));
    }

    // Check photo
    if(!req.files){
        return next (new ErrorResponse(`Please upload a file`, 400));
    }

    const bootcampImg = req.files.img;

    // req.files
    // {
    //     bootcampImg: {
    //       name: 'new-tour-4.jpg',
    //       data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 ... 2927337 more bytes>,
    //       size: 2927387,
    //       encoding: '7bit',
    //       tempFilePath: '',
    //       truncated: false,
    //       mimetype: 'image/jpeg',
    //       md5: '9c0680f33e7ec1a49dd9096762c0939b',
    //       mv: [Function: mv]
    //     }
    //   }

    // Make sure the image is a photo
    if(!bootcampImg.mimetype.startsWith('image')){
        return next (new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check file size
    if(bootcampImg.size > process.env.MAX_FILE_UPLOAD){
        return next (new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    bootcampImg.name = `photo-${bootcamp._id}${path.parse(bootcampImg.name).ext}`;
    console.log(bootcampImg.name)

    // Upload file
    bootcampImg.mv(`${process.env.FILE_UPLOAD_PATH}/${bootcampImg.name}`, async (err) => {
        if(err){
            console.log(err);
            return next (new ErrorResponse(`Problem with file upload`, 500));
        }

        // No error
        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: bootcampImg.name
        });

        res.status(200).json({
            status: 'success',
            data: bootcampImg.name
        });
    });


});