import mongoose from "mongoose";

export const connectDB = async () => {
    try {

        mongoose.connection.on("connected", () => {
            console.log("✅ Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.log("❌ Mongoose connection error:", err);
        });

        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            `🚀 MongoDB Connected! Host: ${connectionInstance.connection.host}`
        );

    } catch (error) {

        console.log("⚠️ MongoDB Connection Failed:", error.message);

        process.exit(1);
    }
};