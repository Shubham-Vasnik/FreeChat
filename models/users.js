const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    groups:[
             {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Group"
             },
    ],
    online:Boolean,
    
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);