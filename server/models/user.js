const mongoose = require("mongoose");
const schema = mongoose.Schema;


const userSchema = new schema({
//   username: { type: String, required: true },
    name:{type:String,required: true},
    email:{type:String,required: true},
    password:{type:String,required: true},
    role:{type:String,required: true},
    isVerified:{type:Boolean },
    langUser:{type:String}
});

const User = mongoose.model("User", userSchema);
module.exports = User;