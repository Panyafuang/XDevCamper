const express = require('express');
const bootcampController = require('../controller/bootcampController');
const courseRoute = require('./courseRoutes');
const reviewRoute = require('./reviewRoutes');
const Bootcamp = require('../models/BootcampModel');
const apiFeature = require('../middleware/apiFeature');
const {protect, authorize} = require('../middleware/auth');


const router = express.Router();

//
// ─── GET SPECIFIC COURSES FOR BOOTCAMP ──────────────────────────────────────────
//
    // api/v1/bootcamps/:bootcampId/courses
    router.use('/:bootcampId/courses', courseRoute)

//
// ─── GET SPECIFIC REVIEWS FOR BOOTCAMP ──────────────────────────────────────────
//

    // api/v1/bootcams/:bootcampId/reviews
    router.use('/:bootcampId/reviews', reviewRoute)
    
//
// ─── UPLOAD PHOTO ───────────────────────────────────────────────────────────────
//
    // api/v1/bootcamps/:id/photo
    router.route('/:id/photo')
        .put(protect, authorize('publisher', 'admin'), bootcampController.bootcampPhotoUpload)



//
// ─── GET BOOTCAMPS IN RADIUS WITH ZIPCODE ───────────────────────────────────────
//
    router.get('/radius/:zipcode/:distance', bootcampController.getBootcampsInRadius);


// Populate option
// populateOpt = {
//     path: 'courses'
// }


router.route('/')
    .get(apiFeature(Bootcamp, 'courses'), bootcampController.getBootcamps)
    .post(protect, authorize('publisher', 'admin'), bootcampController.createBootcamp)

router.route('/:id')
    .get(bootcampController.getBootcamp)
    .put(protect, authorize('publisher', 'admin'), bootcampController.updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), bootcampController.deleteBootcamp)



module.exports = router;