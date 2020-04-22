const ErrorResponse = require('../utils/errorResponse');



//
// ─── ERROR HANDLER MIDDLEWARE ───────────────────────────────────────────────────
//

const errorHandler = (err, req, res, next) => {

    /** // ERR //
     *  
     message: 'Cast to ObjectId failed for value "5e94720549d554166d91db2eee" at path "_id" for model "Bootcamp"',
     name: 'CastError',
     messageFormat: undefined,
     stringValue: '"5e94720549d554166d91db2eee"',
     kind: undefined,
     value: '5e94720549d554166d91db2eee',
     path: '_id',
     */

    // Log to console for dev
    console.log(err.stack.red);
    
    let error = {...err};
    error.message = err.message;


    // Mongoose bad error
    if(err.name === 'CastError'){
        const message = `Resourse not found`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if(err.code === 11000){
        const message = `Duplicate field value entered`;
        error = new ErrorResponse(message, 400);    
    }

    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400)
    }


    res.status(error.statusCode || 500).json({
        status: 'fail',
        error: error.message || 'Server Error'
    });
}


module.exports = errorHandler;