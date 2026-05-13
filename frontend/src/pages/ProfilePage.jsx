import React, { useState, useContext } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import '../stylesheet/ProfilePage.css'
import { AuthContext } from '../context/AuthContext'

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext)

  const [selectedImg, setSelectedImg] = useState(null)
  const [name, setName] = useState(authUser?.fullName || "")
  const [bio, setBio] = useState(authUser?.bio || "")

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedImg) {
      await updateProfile({ fullName: name, bio })
      navigate('/')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImg)

    reader.onload = async () => {
      const base64Image = reader.result

      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio
      })

      navigate('/')
    }
  }

  return (
    <div className='profile-container'>

      <div className='profile-card'>

        {/* LEFT FORM */}
        <form onSubmit={handleSubmit} className='profile-form'>

          <h2 className='profile-title'>Profile Details</h2>

          {/* AVATAR UPLOAD */}
          <label htmlFor="avatar" className='avatar-label'>

            <input
              type="file"
              id='avatar'
              accept='.png,.jpg,.jpeg'
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />

            <div className='avatar-wrapper'>
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : authUser?.profilePic || assets.avatar_icon
                }
                alt="profile"
                className='profile-pic'
              />
              <div className='upload-overlay'>Upload</div>
            </div>

            <p className='upload-text'>Change profile image</p>

          </label>

          {/* INPUTS */}
          <div className='profile-inputs'>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Your Name'
              className='profile-input'
              required
            />

            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder='Write your bio...'
              className='profile-input profile-textarea'
            />

          </div>

          <button type='submit' className='save-btn'>
            Save Profile
          </button>

        </form>

        {/* RIGHT SIDE */}
        <div className='profile-right'>

          <img
            src={authUser?.profilePic || assets.logo_icon}
            alt="logo"
            className='profile-logo-icon'
          />

          <p className='brand-text'>SoulSync</p>

        </div>

      </div>
    </div>
  )
}

export default ProfilePage