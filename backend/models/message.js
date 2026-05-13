import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  text: {
    type: String
  },

  image: {
    type: String
  },

  // ✅ already good (seen system)
  seen: {
    type: Boolean,
    default: false
  },

  // 🆕 NEW: soft delete support
  deleted: {
    type: Boolean,
    default: false
  },

  // 🆕 OPTIONAL (future use: edit message feature)
  edited: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;