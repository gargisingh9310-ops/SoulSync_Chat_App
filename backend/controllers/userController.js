import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";

// --- SIGNUP CONTROLLER ---
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        // Token generation
        const token = generateToken(newUser._id);

        // Sending response (key 'user' matches your AuthContext)
        res.json({ 
            success: true, 
            user: newUser, 
            token, 
            message: "Account created successfully" 
        });

} catch (error) {
    console.log("FULL ERROR:");
    console.log(error);

    res.json({
        success: false,
        message: error.message
    });
}};

// --- LOGIN CONTROLLER ---
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        // Correct logic: Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.json({ 
            success: true, 
            user: user, 
            token, 
            message: "Login successful" 
        });

    } catch (error) {
        console.log("Login Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// --- CHECK AUTH CONTROLLER ---
export const checkAuth = async (req, res) => {
    try {
        // req.user usually comes from your authMiddleware
        res.json({ success: true, user: req.user });
    } catch (error) {
        console.log("CheckAuth Error:", error.message);
        res.json({ success: false, message: "Not authenticated" });
    }
}

// --- UPDATE PROFILE CONTROLLER ---
export const updateProfile = async (req, res) => {
    const { profilePic, fullName, bio } = req.body;
    const userId = req.user._id;

    try {
        let updatedUser;

        if (!profilePic) {
            // Update only text fields
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { bio, fullName }, 
                { new: true }
            );
        } else {
            // Upload to Cloudinary if image exists
            const upload = await cloudinary.uploader.upload(profilePic); // Ensure .uploader is used

            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { profilePic: upload.secure_url, bio, fullName }, 
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log("Update Profile Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}