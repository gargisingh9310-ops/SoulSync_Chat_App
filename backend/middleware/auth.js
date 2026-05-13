import User from "../models/User.js";
import jwt from "jsonwebtoken";

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {

        const token = req.headers.token;

        // check token exists
        if (!token) {
            return res.json({
                success: false,
                message: "No token provided"
            });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Protect Route Error:", error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};