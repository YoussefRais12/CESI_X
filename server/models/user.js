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
    referredBy: { type: schema.Types.ObjectId, ref: 'User' },  // User who referred this user
    hasUsedReferral: { type: Boolean, default: false }  // Whether the user has used the referral discount
});

const User = mongoose.model("User", userSchema);
module.exports = User;
