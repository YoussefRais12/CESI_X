const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Data = require("../models/data");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { loginRules, registerRules, Validation } = require("../middleware/auth-validator");
const isAuth = require("../middleware/passport");
const fs = require("fs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
require("dotenv").config();
const UserRole = require("../../client/src/type.tsx");
const cloudinary = require('../config/cloudinary'); // Import your cloudinary configuration
const crypto = require('crypto');

// Middleware to check user roles
const checkRole = (UserRole) => (req, res, next) => {
    if (UserRole.includes(req.user.UserRole)) {
        next();
    } else {
        res.status(403).json({ message: "Access denied: You do not have sufficient permissions to access this resource." });
    }
};

// Function to generate referral codes
const generateReferralCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

// Register new user
userRouter.post("/register", registerRules(), Validation, async (req, res) => {
    const { name, email, password, role, isVerified, lang, referralCode } = req.body;
    try {
        const newUser = new User(req.body);

        // Check if email exists
        const searchedUser = await User.findOne({ email });
        if (searchedUser) {
            return res.status(400).send({ msg: "Email already exists" });
        }

        // Hash password
        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashedPassword = await bcrypt.hash(password, genSalt);
        newUser.password = hashedPassword;

        // Generate a referral code for the new user
        newUser.referralCode = generateReferralCode();

        // If a referral code is provided, update the referrer's referral count and set the referredBy field
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referrer.referralCount += 1;
                await referrer.save();
                newUser.referredBy = referrer.referralCode;
            }
        }

        // Save user
        const result = await newUser.save();

        // Generate a token
        const payload = { _id: result._id, name: result.name };
        const token = await jwt.sign(payload, process.env.SecretOrKey, { expiresIn: 1000 * 60 * 60 * 24 });

        res.send({ user: result, msg: "User is saved", token: `Bearer ${token}` });
    } catch (error) {
        res.send("Cannot save the user");
        console.error("An error occurred:", error.message);
        console.log(error);
    }
});

// Validate referral code
userRouter.post("/validate-referral", async (req, res) => {
    const { referralCode } = req.body;

    try {
        const user = await User.findOne({ referralCode });

        if (!user) {
            return res.status(400).send({ msg: "Invalid referral code" });
        }

        res.status(200).send({ msg: "Referral code is valid" });
    } catch (error) {
        console.error("An error occurred:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Login user
userRouter.post("/login", loginRules(), Validation, async (req, res) => {
    const { email, password } = req.body;
    try {
        const searchedUser = await User.findOne({ email });

        // If the email does not exist
        if (!searchedUser) {
            return res.status(400).send({ msg: "Bad credential" });
        }

        // Check password
        const match = await bcrypt.compare(password, searchedUser.password);
        if (!match) {
            return res.status(400).send({ msg: "Bad credential" });
        }

        // Create a token
        const payload = { _id: searchedUser.id, name: searchedUser.name };
        const token = await jwt.sign(payload, process.env.SecretOrKey, { expiresIn: 1000 * 3600 * 24 });

        res.status(200).send({ user: searchedUser, msg: "Success", token: `Bearer ${token}` });
    } catch (error) {
        console.error("An error occurred:", error.message);
        res.send({ msg: "Cannot get the user" });
    }
});

// Add new user (requires role check)
userRouter.post("/add", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        let newUser = new User(req.body);
        const result = await newUser.save();
        res.send({ result: result, msg: "User added" });
    } catch (error) {
        console.log(error);
    }
});

// Get all users (requires role check)
userRouter.get("/all", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        let result = await User.find();
        res.send({ users: result, msg: "All users" });
    } catch (error) {
        console.log(error);
    }
});

// Get user by ID (requires role check)
userRouter.get("/find/:id", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        let result = await User.findById(req.params.id);
        res.send({ users: result, msg: "This is the user by ID" });
    } catch (error) {
        console.log(error);
    }
});

// Update user by ID (requires role check)
userRouter.put("/update/:id", isAuth(), async (req, res) => {
    try {
        const { oldPassword, password, ...otherUpdates } = req.body;

        let updateUser = { ...otherUpdates };

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // If the password is being updated, verify the old password first
        if (password) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Old password is incorrect" });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateUser.password = hashedPassword;
        }

        let result = await User.findByIdAndUpdate({ _id: req.params.id }, { $set: updateUser }, { new: true });
        res.send({ newUser: result, msg: "User updated" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Delete user by ID (requires role check)
userRouter.delete("/delete/:id", isAuth(), checkRole([UserRole.admin]), async (req, res) => {
    try {
        let result = await User.findByIdAndDelete(req.params.id);
        res.send({ msg: "User deleted" });
    } catch (error) {
        console.log(error);
    }
});

// Get current user
userRouter.get("/current", isAuth(), (req, res) => {
    res.status(200).send({ user: req.user });
});

// Upload user image
userRouter.post("/upload-image", isAuth(), upload.single("img"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const user = await User.findById(req.user._id);
        if (user.imgPublicId) {
            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(user.imgPublicId);
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });

        // Update user with image URL and public ID
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { img: uploadResult.secure_url, imgPublicId: uploadResult.public_id },
            { new: true }
        );

        res.send({ user: updatedUser, msg: "Image uploaded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = userRouter;
