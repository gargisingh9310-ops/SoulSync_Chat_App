import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoute.js";
import messageRouter from "./routes/messageRoute.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// =========================
// ENV
// =========================
const frontendURL = process.env.FRONTEND_URL;

// =========================
// MIDDLEWARES
// =========================
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// =========================
// SOCKET.IO
// =========================
export const io = new Server(server, {
  cors: {
    origin: frontendURL,
    credentials: true,
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
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

// =========================
// ROUTES
// =========================
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "Server is live" });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// =========================
// START SERVER
// =========================
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () =>
      console.log(`Server running on PORT: ${PORT}`)
    );
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();