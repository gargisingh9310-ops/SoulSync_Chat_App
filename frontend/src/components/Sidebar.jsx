import React from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import '../stylesheet/Sidebar.css' // Import check karein
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { useState } from 'react'
import { useEffect } from 'react'

const Sidebar = () => {

    const {getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages} = useContext(ChatContext);

    const {logout, onlineUsers } = useContext(AuthContext);

    const [input, setInput]= useState("");

    const Navigate = useNavigate()
    
    const filteredUsers = input ?  users.filter((user)=> user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
  getUsers();
}, []);

    return (
        <div className='sidebar'>
            <div className='sidebar-top'>
                <img src={assets.logo} alt="SoulSync" className='logo-img' />
                <div className='menu-container'>
                    <img src={assets.menu_icon} alt="menu" className='menu-icon' />
                    <div className='menu-dropdown'>
                        <p onClick={() => Navigate('/profile')}>Edit profile</p>
                        <hr style={{opacity: 0.1}}/>
                        <p onClick={()=> logout()}>Logout</p>
                    </div>
                </div>
            </div>

            <div className='sidebar-search'>
                <img src={assets.search_icon} alt="search" className='search-icon' />
                <input onChange={(e)=>setInput(e.target.value)} type="text" placeholder='Search User...' />
            </div>

            <div className='user-list'>
                {filteredUsers.map((user, index) => (
                    <div 
                        key={index} 
                        className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                        onClick={() =>{setSelectedUser(user); setUnseenMessages(prev=>({...prev, [user._id]: 0}))} }
                    >
                        <img src={user?.profilePic || assets.avatar_icon} alt="" className='user-avatar' />
                        <div className='user-info'>
                            <p className='user-name'>{user.fullName}</p>
                            {onlineUsers.includes(user._id) 
                                ? <span className='status-online'>Online</span>
                                : <span className='status-offline'>Offline</span>
                            }
                        </div>
                        {unseenMessages[user._id] > 0 && <p className='unread-count'>{unseenMessages[user._id]}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar