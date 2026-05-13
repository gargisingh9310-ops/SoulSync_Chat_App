import React, { useEffect, useRef, useContext, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import '../stylesheet/ChatContainer.css'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {

  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage
  } = useContext(ChatContext)

  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef()
  const isSendingRef = useRef(false)

  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ================= SEND =================
  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (isSendingRef.current) return
    if (input.trim() === "") return

    isSendingRef.current = true

    try {

      if (editingId) {

        await editMessage(editingId, input.trim())
        setEditingId(null)

      } else {

        await sendMessage({ text: input.trim() })
      }

      setInput("")

    } catch (err) {
      toast.error("Message failed")
    } finally {
      isSendingRef.current = false
    }
  }

  // ================= CANCEL EDIT =================
  const cancelEdit = () => {
    setEditingId(null)
    setInput("")
  }

  // ================= IMAGE =================
  const handleSendImage = async (e) => {
    const file = e.target.files[0]

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file")
      return
    }

    const reader = new FileReader()

    reader.onloadend = async () => {
      if (isSendingRef.current) return

      isSendingRef.current = true

      await sendMessage({ image: reader.result })

      isSendingRef.current = false
      e.target.value = ""
    }

    reader.readAsDataURL(file)
  }

  // ================= LOAD MESSAGES =================
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id)
  }, [selectedUser])

  // ================= AUTO SCROLL =================
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return selectedUser ? (

    <div className="chat-container">

      {/* HEADER */}
      <div className="chat-header">

        <div className="header-left">

          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            className="header-avatar"
          />

          <div className="header-user-info">
            <p>{selectedUser.fullName}</p>
            <span className="status-text">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </span>
          </div>

        </div>

        <div className="header-icons">

          <img src={assets.help_icon} alt="" />

          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="back"
            className="back-icon"
          />

        </div>

      </div>

      {/* MESSAGES */}
      <div className="chat-messages">

        {messages.map((message) => {

          const isSender =
            message.senderId?.toString() === authUser?._id?.toString()

          return (

            <div
              key={message._id}
              className={`message-row ${isSender ? 'sender' : 'receiver'}`}
            >

              <div className="bubble-wrapper">

                {/* CONTENT */}
                {message.image ? (
                  <img src={message.image} className="msg-img" />
                ) : (
                  <p className="msg-text">{message.text}</p>
                )}

                {/* ACTIONS */}
                {isSender && (
                  <div className="msg-actions">

                    <button
                      onClick={() => {
                        setInput(message.text)
                        setEditingId(message._id)
                      }}
                    >
                      ✏️
                    </button>

                    <button onClick={() => deleteMessage(message._id)}>
                      🗑
                    </button>

                  </div>
                )}

                <div className="msg-footer">

                  <img
                    src={
                      isSender
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    className="msg-profile"
                  />

                  <p className="msg-time">
                    {formatMessageTime(message.createdAt)}
                  </p>

                </div>

              </div>

            </div>
          )
        })}

        <div ref={scrollEnd}></div>

      </div>

      {/* INPUT */}
      <div className="chat-input-area">

        <div className="input-group">

          <input
            type="text"
            placeholder={editingId ? "Edit message..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(e)
              if (e.key === "Escape") cancelEdit()
            }}
          />

          {/* cancel edit button */}
          {editingId && (
            <button className="cancel-edit" onClick={cancelEdit}>
              ✖
            </button>
          )}

          <input
            type="file"
            id="image"
            hidden
            onChange={handleSendImage}
          />

          <label htmlFor="image">
            <img src={assets.gallery_icon} />
          </label>

        </div>

        <button onClick={handleSendMessage}>
          <img src={assets.send_button} />
        </button>

      </div>

    </div>

  ) : (

    <div className="welcome-screen">
      <img src={assets.logo_icon} />
      <p>SoulSync: Connect Beyond Words</p>
    </div>

  )
}

export default ChatContainer;