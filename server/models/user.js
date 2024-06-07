const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isVerified: { type: Boolean },
    langUser: { type: String },
    img: { type: String },
    imgPublicId: { type: String },
    orders: [{ type: schema.Types.ObjectId, ref: 'Order' }],
    referralCode: { type: String, unique: true },
    referredBy: { type: String },
    referralCount: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
