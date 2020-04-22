const mongoose = require('mongoose');
const Bootcamp = require('./BootcampModel');

const courseSchema = new mongoose.Schema({
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    weeks: {
      type: String,
      required: [true, 'Please add number of weeks']
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
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
// ─── STATIC METHOD ──────────────────────────────────────────────────────────────
//

  courseSchema.statics.getAverageCost = async function(bootcampId){
    const obj = await this.aggregate([
      { $match: { bootcamp: bootcampId }},
      { $group: {
        _id: '$bootcamp',
        avgCost: { $avg: '$tuition' }
      }}
    ]);

    try{
      await Bootcamp.findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].avgCost)
      });
    }catch(err){
      console.log(err)
    }
  }


//
// ─── MONGOOSE MIDDLEWARE ─────────────────────────────────────────────────────────────
//

  // ─── DOC MIDDLEWARE ─────────────────────────────────────────────────────────────
  // Call getAverageCost after 'save'
  courseSchema.post('save', async function(){
    await this.constructor.getAverageCost(this.bootcamp);
  });

  // Call getAverageCost before 'remove'
  courseSchema.post('remove', async function(){
    await this.constructor.getAverageCost(this.bootcamp);
  });



const Course = mongoose.model('Course', courseSchema);
module.exports = Course;