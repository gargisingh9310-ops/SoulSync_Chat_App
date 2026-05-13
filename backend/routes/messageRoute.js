import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessagesAsSeen,
  sendMessage,
  deleteMessage
} from "../controllers/messageController.js";

const messageRouter = express.Router();

// USERS SIDEBAR
messageRouter.get("/users", protectRoute, getUsersForSidebar);

// GET MESSAGES
messageRouter.get("/:id", protectRoute, getMessages);

// MARK AS SEEN
messageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);

// SEND MESSAGE
messageRouter.post("/send/:id", protectRoute, sendMessage);

// 🗑️ DELETE MESSAGE (NEW)
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);

export default messageRouter;