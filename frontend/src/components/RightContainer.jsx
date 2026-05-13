import React, { useContext, useMemo } from "react";
import assets from "../assets/assets";
import "../stylesheet/RightContainer.css";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightContainer = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  // ✅ optimize: no useEffect needed
  const msgImages = useMemo(() => {
    return messages
      ?.filter((msg) => msg?.image)
      .map((msg) => msg.image);
  }, [messages]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers?.includes(selectedUser?._id);

  return (
    <div className={`right-sidebar ${selectedUser ? "show-sidebar" : ""}`}>

      {/* ================= PROFILE ================= */}
      <div className="rs-profile">
        <div className="rs-image-container">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="profile"
            className="rs-profile-img"
          />

          {/* Online Indicator */}
          {isOnline && <div className="rs-online-dot"></div>}
        </div>

        <h1 className="rs-name">
          {selectedUser.fullName}
        </h1>

        <p className="rs-bio">
          {selectedUser.bio || "Available on SoulSync"}
        </p>

        {/* status text */}
        <p className={isOnline ? "status-online" : "status-offline"}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      <hr className="rs-hr" />

      {/* ================= MEDIA ================= */}
      <div className="rs-media">
        <p className="rs-section-title">Media</p>

        {msgImages?.length > 0 ? (
          <div className="rs-media-grid">
            {msgImages.map((url, index) => (
              <div
                key={index}
                className="rs-media-item"
                onClick={() => window.open(url, "_blank")}
              >
                <img src={url} alt="media" />
              </div>
            ))}
          </div>
        ) : (
          <p className="rs-bio">No media shared yet</p>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="rs-footer">
        <button onClick={logout} className="rs-logout-btn">
          Logout
        </button>
      </div>

    </div>
  );
};

export default RightContainer;