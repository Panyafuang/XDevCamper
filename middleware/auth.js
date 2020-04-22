const User = require('../models/UserModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');


//
// ─── PROTECT ROUTES ─────────────────────────────────────────────────────────────
//

exports.protect = asyncHandler(async(req, res, next) => {
    let token;
    // User token in headers
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    // User token in cookies
    // else if(req.cookies.token){
    //     token = req.cookies.token;
    // }

    // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }


    // verify token
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        // Send user data to next middleware
        req.user = await User.findById(decode.id);

    }catch(err){
        return next(new ErrorResponse(`Not authorized to access this route`, 401));
    }
    next();

});


//
// ─── GRANT ACCESS TO SPECIFIC ROLES ─────────────────────────────────────────────
//
    exports.authorize = (...role) => {
        return (req, res, next) => {
            if(!role.includes(req.user.role)){
                return next(new ErrorResponse(`User role ${req.user.role} is not authorized to perform this action`, 403));
            }
    
            next();
        }
    }