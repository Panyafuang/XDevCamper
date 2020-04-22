const mongoose = require('mongoose');
const Bootcamp = require('./BootcampModel');

const reviewSchema = new mongoose.Schema({
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100
    },
    text: {
      type: String,
      required: [true, 'Please add a some text']
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please add a rating between 1 - 10']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: [true, 'Course must belong to a bootcamp']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
});

//
// ─── INDEX ──────────────────────────────────────────────────────────────────────
//

  // Prevent user from submitting more than one review per bootcamp
  reviewSchema.index({ bootcamp: 1, user: 1}, { unique: true });


//
// ─── STATIC METHOD ──────────────────────────────────────────────────────────────
//

reviewSchema.statics.getAverageRatings = async function(bootcampId){
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId }},
    { $group: {
      _id: '$bootcamp',
      avgRating: { $avg: '$rating' }
    }}
  ]);
  
  try{
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].avgRating
    });
  }catch(err){
    console.log(err)
  }
}


//
// ─── MONGOOSE MIDDLEWARE ─────────────────────────────────────────────────────────────
//

  // ─── DOC MIDDLEWARE ─────────────────────────────────────────────────────────────
  // Call getAverageRatings after 'save'
  reviewSchema.post('save', async function(){
    await this.constructor.getAverageRatings(this.bootcamp);
  });

  // Call getAverageRatings before 'remove'
  reviewSchema.post('remove', async function(){
    await this.constructor.getAverageRatings(this.bootcamp);
  });



  // ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────
  // Call getAverageRatings for 'update'
  reviewSchema.post(/^findOneAnd/, async function(doc, next){
    await doc.constructor.getAverageRatings(doc.bootcamp);
    next();
  });


  

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;