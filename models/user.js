// USER MODEL SETUP
// ===========================================
var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    bcrypt         = require('bcrypt-nodejs');


// User schema
var UserSchema = new Schema({
        name: String,
    username: { type: String, required: true, index: { unique: true}},
    password: { type: String, required: true, select: false }
});

// hash the password before the user is saved...
UserSchema.pre('save', function(next){
    var user = this;

    if (!user.isModified('password')){
        return next();
    }

    bcrypt.hash(user.password, null, null, function(err, hash){

        if (err){
            return next(err);
        }

        user.password = hash;
        next();
    });
});

// method to compare given password with the database hash
UserSchema.methods.comparePassword = function(password){
    var user = this;

    return bcrypt.compareSync(password, user.password);
};

// return the model
module.exports = mongoose.model('User', UserSchema);
