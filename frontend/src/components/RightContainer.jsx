import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import '../stylesheet/RightContainer.css';
import { ChatContext } from '../../context/chatContext';
import { AuthContext } from '../../context/AuthContext';

const RightContainer = () => {

  const {selectedUser, messages} = useContext(ChatContext)
const {logout, onlineUsers} = useContext(AuthContext)
const [msgImages, setMsgImages]= useState([])

useEffect(()=>{
  setMsgImages(
    messages.filter(msg => msg.image).map(msg=>msg.image)
  )
},[messages])

  return selectedUser && (
    <div className={`right-sidebar ${selectedUser ? "show-sidebar" : "max-md:hidden"}`}>
      
      {/* Profile Section */}
      <div className='rs-profile'>
        <div className='rs-image-container'>
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="profile" className='rs-profile-img' />
          <div className='rs-online-dot'></div>
        </div>
        <h1 className='rs-name'>
          {onlineUsers.includes(selectedUser._id) && <p></p>}
          {selectedUser.fullName}</h1>
        <p className='rs-bio'>{selectedUser.bio || "Available on SoulSync"}</p>
      </div>

      <hr className='rs-hr' />

      {/* Media Section */}
      <div className='rs-media'>
        <p className='rs-section-title'>Media</p>
        <div className='rs-media-grid'>
          {msgImages.map((url, index) => (
            <div key={index} className='rs-media-item' onClick={() => window.open(url)}>
              <img src={url} alt="media" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className='rs-footer'>
        <button onClick={()=> logout()} className='rs-logout-btn'>Logout</button>
      </div>

    </div>
  )
}

export default RightContainer;