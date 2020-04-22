const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const Bootcamps = require('./models/BootcampModel');
const Course = require('./models/CourseModel');
const User = require('./models/UserModel');
const Review = require('./models/ReviewModel');



// Connect DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})


// Read JSON file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

const importData = async() => {
    try{
        await Bootcamps.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log('Imported Data...'.green.inverse);
        process.exit();
    }catch(err){
        console.log(err);
    }
}


const deleteData = async() => {
    try{
        await Bootcamps.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Deleted Data...'.red.inverse);
        process.exit();
    }catch(err){
        console.log(err);
    }
}


if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}