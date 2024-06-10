const mongoose = require("mongoose");
const schema = mongoose.Schema;

const logSchema = new schema({
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

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
    referredBy: { type: schema.Types.ObjectId, ref: 'User' },
    hasUsedReferral: { type: Boolean, default: false },
    logHistory: [logSchema],  // Add log history
});

const User = mongoose.model("User", userSchema);
module.exports = User;
