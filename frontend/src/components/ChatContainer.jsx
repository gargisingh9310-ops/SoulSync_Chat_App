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
    getMessages
  } = useContext(ChatContext)

  const {
    authUser,
    onlineUsers
  } = useContext(AuthContext)

  const scrollEnd = useRef()

  const [input, setInput] = useState('')

  // ✅ SUPER SAFE LOCK (NO RE-RENDER ISSUE)
  const isSendingRef = useRef(false)

  // ================= SEND TEXT =================
  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (isSendingRef.current) return
    if (input.trim() === "") return

    isSendingRef.current = true

    try {
      await sendMessage({
        text: input.trim()
      })

      setInput("")
    } catch (err) {
      toast.error("Message failed")
    } finally {
      isSendingRef.current = false
    }
  }

  // ================= SEND IMAGE =================
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

      await sendMessage({
        image: reader.result
      })

      isSendingRef.current = false
      e.target.value = ""
    }

    reader.readAsDataURL(file)
  }

  // ================= GET MESSAGES =================
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  // ================= AUTO SCROLL =================
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({
        behavior: "smooth"
      })
    }
  }, [messages])

  return selectedUser ? (

    <div className="chat-container">

      {/* HEADER */}
      <div className="chat-header">

        <div className="header-left">

          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="header-avatar"
          />

          <div className="header-user-info">

            <p>{selectedUser.fullName}</p>

            <span className="status-text">
              {
                onlineUsers.includes(selectedUser._id)
                  ? "Online"
                  : "Offline"
              }
            </span>

          </div>

        </div>

        <div className="header-icons">

          <img src={assets.help_icon} alt="help" />

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

        {messages.map((message, index) => {

          const isSender =
            message.senderId?.toString() === authUser?._id?.toString()

          return (

            <div
              key={index}
              className={`message-row ${isSender ? 'sender' : 'receiver'}`}
            >

              <div className="bubble-wrapper">

                {
                  message.image ? (

                    <img
                      src={message.image}
                      alt="sent-file"
                      className="msg-img"
                    />

                  ) : (

                    <p className="msg-text">
                      {message.text}
                    </p>

                  )
                }

                <div className="msg-footer">

                  <img
                    src={
                      isSender
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt=""
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

      {/* INPUT AREA */}
      <div className="chat-input-area">

        <div className="input-group">

          <input
            type="text"
            placeholder='Type a message...'
            value={input}
            onChange={(e) => setInput(e.target.value)}

            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              e.preventDefault();

              if (isSendingRef.current) return;

              handleSendMessage(e);
            }}
          />

          <input
            type="file"
            id='image'
            accept='image/png, image/jpeg'
            hidden
            onChange={handleSendImage}
          />

          <label htmlFor="image" className="attachment-label">
            <img src={assets.gallery_icon} alt="attach" />
          </label>

        </div>

        <button
          className="send-button"
          onClick={(e) => {
            e.preventDefault();
            if (!isSendingRef.current) handleSendMessage(e);
          }}
        >
          <img src={assets.send_button} alt="send" />
        </button>

      </div>

    </div>

  ) : (

    <div className="welcome-screen">

      <img
        src={assets.logo_icon}
        alt=""
        className="welcome-logo"
      />

      <p>SoulSync: Connect Beyond Words</p>

    </div>
  )
}

export default ChatContainer