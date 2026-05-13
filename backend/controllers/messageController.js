import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/User.js";
import { userSocketMap, io } from "../server.js";


// GET USERS FOR SIDEBAR
export const getUsersForSidebar = async (req, res) => {
    try {

        const userId = req.user._id;

        // Logged-in user ko exclude karna
        const filteredUsers = await User.find({
            _id: { $ne: userId }
        }).select("-password");

        // Unseen messages count
        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {

            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });

            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);

        res.json({
            success: true,
            users: filteredUsers,
            unseenMessages
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL MESSAGES
export const getMessages = async (req, res) => {
    try {

        const { id: selectedUserId } = req.params;

        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        });

        // Seen update
        await Message.updateMany(
            {
                senderId: selectedUserId,
                receiverId: myId,
                seen: false
            },
            {
                seen: true
            }
        );

        res.json({
            success: true,
            messages
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// MARK MESSAGE AS SEEN
export const markMessagesAsSeen = async (req, res) => {
    try {

        const { id } = req.params;

        await Message.findByIdAndUpdate(id, {
            seen: true
        });

        res.json({
            success: true
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {

        const { text, image } = req.body;

        const receiverId = req.params.id;

        const senderId = req.user._id;

        let imageUrl;

        // Upload image if exists
        if (image) {

            const uploadResponse = await cloudinary.uploader.upload(image);

            imageUrl = uploadResponse.secure_url;
        }

        // Create new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Send real-time socket message
        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({
            success: true,
            message: newMessage
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};

export const deleteMessage = async (req, res) => {
  try {

    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.json({
        success: false,
        message: "Message not found"
      });
    }

    // ✅ only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.json({
        success: false,
        message: "Not allowed"
      });
    }

    // 🗑️ delete message
    await Message.findByIdAndDelete(messageId);

    // ⚡ real-time update (optional but powerful)
    const receiverSocketId = userSocketMap[message.receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", messageId);
    }

    res.json({
      success: true,
      message: "Message deleted"
    });

  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message
    });
  }
};