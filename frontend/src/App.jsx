import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Context & Assets
import { AuthContext } from '../context/AuthContext';
import assets from './assets/assets';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {

  const { authUser } = useContext(AuthContext);

  return (
    <div
      style={{
        backgroundImage: `url(${assets.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>

        {/* Home Route */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />

      </Routes>
    </div>
  );
};

export default App;