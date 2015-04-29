/**
 * Created by pin on 4/22/15.
 */
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt')
    , SALT_WORK_FACTOR = 10;

// User Schema
var userSchema = mongoose.Schema({
    name: { type: String, unique: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
});

// Bcrypt middleware
userSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

module.exports = User;