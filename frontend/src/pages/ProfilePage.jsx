import React, { useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import '../stylesheet/ProfilePage.css' // CSS file link karein
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {

  const {authUser , updateProfile} = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName);
  const [bio, setBio] = useState(authUser?.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();
   if (!selectedImg) {
    await updateProfile({fullName: name, bio});
      navigate('/chat');
      return;
   }
   const reader = new FileReader();
   reader.readAsDataURL(selectedImg);
   reader.onload = async () => {
    const base64Image = reader.result;
    await updateProfile({profilePic: base64Image, fullName: name, bio});
    navigate('/chat');
   }
  }

  return (
    <div className='profile-container'>
      <div className='profile-card'>
        <form onSubmit={handleSubmit} className='profile-form'>
          <h3 className='profile-title'>Profile Details</h3>

          {/* Avatar Upload Section */}
          <label htmlFor="avatar" className='avatar-label'>
            <input 
              onChange={(e) => setSelectedImg(e.target.files[0])} 
              type="file" 
              id='avatar' 
              accept='.png, .jpg, .jpeg' 
              hidden 
            />
            <div className='avatar-wrapper'>
              <img 
                src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} 
                className='profile-pic' 
                alt="Avatar" 
              />
              <div className='upload-overlay'>Upload</div>
            </div>
            <p className='upload-text'>Change profile image</p>
          </label>

          {/* Input Fields */}
          <div className='profile-inputs'>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              type="text" 
              required 
              placeholder='Your Name' 
              className='profile-input'
            />
            <textarea 
              onChange={(e) => setBio(e.target.value)} 
              value={bio} 
              placeholder='Write profile bio' 
              rows={4} 
              className='profile-input profile-textarea'
            ></textarea>
          </div>

          <button type='submit' className='save-btn'>Save Profile</button>
        </form>

        {/* Right Side Branding */}
        <div className='profile-right'>
           <img className={`${selectedImg && 'rounded-full'}`} src={authUser?.profilePic || assets.logo_icon} alt="SoulSync Logo" className='profile-logo-icon' />
           <p>SoulSync</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage