import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import '../stylesheet/LoginPage.css'
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login}= useContext(AuthContext);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    // Agar Sign Up hai aur details fill ho gayi hain, toh Bio dikhao
    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    } 
    login(currState === "Sign Up" ? "signup" : "login", {fullName, email, password, bio});
  }

  return (
    <div className='login-container'>
      {/* Left Side - Logo Section */}
      <div className='login-left'>
        <img src={assets.logo_big} alt="SoulSync Logo" className='login-logo-big' />
      </div>

      {/* Right Side - Form Section */}
      <form onSubmit={handleSubmit} className='login-form'>
        <h2 className='login-title'>
          {/* Back Arrow: Sirf tab dikhega jab Bio wala screen (isDataSubmitted) active ho */}
          {currState === "Sign Up" && isDataSubmitted && (
            <img 
              onClick={() => setIsDataSubmitted(false)} 
              src={assets.arrow_icon} 
              className='back-arrow' 
              alt="back" 
            />
          )}

          {currState}

          {/* Decorative Arrow: Sirf Login state mein dikhega, Sign Up mein nahi */}
          {currState === "Login" && (
            <img src={assets.arrow_icon} alt="" className='title-arrow' />
          )}
        </h2>

        <div className='input-fields'>
          {/* Step 1: Full Name (Only for Sign Up before Bio) */}
          {currState === "Sign Up" && !isDataSubmitted && (
            <input 
              onChange={(e) => setFullName(e.target.value)} 
              value={fullName} 
              type="text" 
              placeholder='Full Name' 
              className='login-input' 
              required 
            />
          )}

          {/* Step 1: Email & Password (Visible in Login OR Sign Up before Bio) */}
          {!isDataSubmitted && (
            <>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                placeholder='Email Address' 
                className='login-input' 
                required 
              />
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                type="password" 
                placeholder='Password' 
                className='login-input' 
                required 
              />
            </>
          )}

          {/* Step 2: Bio (Only for Sign Up after details are submitted) */}
          {currState === "Sign Up" && isDataSubmitted && (
            <textarea 
              rows={4} 
              placeholder='Provide a short bio...' 
              className='login-input login-textarea' 
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              required
            ></textarea>
          )}
        </div>

        <button type='submit' className='login-btn'>
          {currState === "Sign Up" ? (isDataSubmitted ? "Finish Registration" : "Create Account") : "Login Now"}
        </button>

        <div className='login-term'>
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='login-forgot'>
          {currState === "Sign Up" ? (
            <p className='login-toggle'>Already have an account? <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }}>Login here</span></p>
          ) : (
            <p className='login-toggle'>Create an account <span onClick={() => { setCurrState("Sign Up"); setIsDataSubmitted(false) }}>Click here</span></p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage;