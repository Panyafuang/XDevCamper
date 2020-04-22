const path = require('path');
const dotenv = require('dotenv');
// Load env vars
dotenv.config({ path: './config/config.env'});

const bootcampRoutes = require('./routes/bootcampRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// SECURITY //
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Enable CORS //
const cors = require('cors');



//
// ─── CONNECT DB ─────────────────────────────────────────────────────────────────
//
    connectDB();


//
// ─── CREATE SERVER ──────────────────────────────────────────────────────────────
//
    const app = express();




//
// ─── MIDDLE WARE ────────────────────────────────────────────────────────────────
//
    // Logs 
    if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))

    // Body parser
    app.use(express.json());
    
    // File uploading
    app.use(fileUpload());

    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Cookie parser
    app.use(cookieParser());

    // Express-mongo-sanitize
    app.use(mongoSanitize());

    // Add security headers
    app.use(helmet());

    // Prevent XSS attack
    app.use(xss());

    // Rate limit
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    });
    app.use(limiter);

    // Prevent http params pollution
    app.use(hpp());

    // CORS 
    app.use(cors());

//
// ─── MOUNT ROUTER ───────────────────────────────────────────────────────────────
//
    app.use('/api/v1/bootcamps', bootcampRoutes);
    app.use('/api/v1/courses', courseRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/reviews', reviewRoutes);

    // ERROR HANDLER
    app.use(errorHandler);





const PORT = process.env.PORT || 3000
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`.magenta.bold));



//
// ─── HANDLE UNHANDLE PROMISE REJECTION ──────────────────────────────────────────
//    
process.on('unhandledRejection', (err, promise) =>{
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});