import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightContainer from '../components/RightContainer'
import '../stylesheet/HomePage.css'
import { ChatContext } from '../context/ChatContext'

const HomePage = () => {
    const {selectedUser} = useContext(ChatContext)
    return (
        <div className="home-container">
            <div className="chat-window">
                <div className="sidebar-col">
                    <Sidebar  />
                </div>
                
                <div className="chat-container-col">
                    <ChatContainer/>
                </div>

                <div className="right-container-col">
                    <RightContainer />
                </div>
            </div>
        </div>
    )
}

export default HomePage