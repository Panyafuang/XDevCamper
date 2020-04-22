const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ],
        lowercase: true
      },
      role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      createdAt: {
        type: Date,
        default: Date.now
      }
});


//
// ─── MONGOOSE MIDDLEWARE ────────────────────────────────────────────────────────
//

    // ─── DOC MIDDLEWARE ─────────────────────────────────────────────────────────────
    userSchema.pre('save', async function(next){
      if(!this.isModified('password') ){
        next();
      }

        // Create salt
        const salt = await bcrypt.genSalt(10);
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);

        next();
    });



//
// ─── INSTANCE METHOD ────────────────────────────────────────────────────────────
//
    // Singed token
    userSchema.methods.singedJwtWebToken = function(){
        return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
    }

    // Check password match
    userSchema.methods.matchPassword = async function(passwordEntered){
        return await bcrypt.compare(passwordEntered, this.password);
    }

    // Generate and hash password token
    userSchema.methods.getResetPasswordToken = function(){
      // Generate token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and set resetPasswordToken field
      this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set resetPasswordExpire
      this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

      return resetToken;
    }




        

const User = mongoose.model('User', userSchema);
module.exports = User;