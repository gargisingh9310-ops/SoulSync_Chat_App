import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoute.js';
import messageRouter from './routes/messageRoute.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// --- 1. MIDDLEWARES (Routes se pehle hone chahiye) ---
app.use(cors({
    origin: ["http://localhost:5173",
        "http://localhost:5174"
    ], // Apne frontend ka URL yahan likhein
    credentials: true
}));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

// --- 2. SOCKET.IO SETUP ---
export const io = new Server(server, {
    cors: { origin: "*" }
});

export const userSocketMap = {}; 

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    // Agar userId 'undefined' string ke roop mein aa rahi hai toh use handle karein
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        console.log("User Connected:", userId);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// --- 3. ROUTES ---
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
 
// --- 4. DATABASE & SERVER START ---
const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

startServer();