const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const bootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Bootcamp must have a name'],
        maxlenght: [50, 'A bootcamp name must have less than or equal 50 characters'],
        unique: true,
        trim: true
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Bootcamp must have description'],
        maxlength: [500, 'Description must have less than or equal 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 
            'Please use a valid URL with HTTP or HTTPS']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            defaul: 'Point',
            emun: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        emun: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other']
    },
    averageRating: {
        type: [Number],
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
},{

    // VIRTURAL PROPERTIES
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false // ป้องกันไม่ให้แสดง id field เพิ่ม
});


//
// ─── MONGOOSE MINDDLEWARE ───────────────────────────────────────────────────────
//

    // ─── DOC MIDDLEWARE ─────────────────────────────────────────────────────────────
    bootcampSchema.pre('save', function(next){
        this.slug = slugify(this.name, { lower: true })
        next();
    });


    // ─── GEOCODE  CREATE LOCATION FIELD ─────────────────────────────────────────────
    // Geocode & create location field
    bootcampSchema.pre('save', async function(next) {
        const loc = await geocoder.geocode(this.address);
        this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
        };
    
        // Do not save address in DB
        this.address = undefined;
        next();
    });


    // Cascade delete (ลบ courses ที่อยู่ใน bootcamp นั้นๆ ออกด้วยหากมีการลบ bootcamp)
    bootcampSchema.pre('remove', async function(next){
        await this.model('Course').deleteMany({ bootcamp: this._id}); // this.model('Course').deleteMayny ก็เหมือน Course.deleteMany()
        next();
    });




//
// ─── VIRTUAL POPULATE ───────────────────────────────────────────────────────────
//
    // Add virtual courses field in bootcamp coll.
    bootcampSchema.virtual('courses', {
        ref: 'Course',
        foreignField: 'bootcamp',
        localField: '_id'
    });


    


    


//
// ─── INDEX ──────────────────────────────────────────────────────────────────────
//

    bootcampSchema.index({ location: "2dsphere" });



module.exports = mongoose.model('Bootcamp', bootcampSchema);