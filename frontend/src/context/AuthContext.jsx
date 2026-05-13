import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  "https://soulsync-chat-app-backend.onrender.com";

// ================= AXIOS BASE URL =================
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [authUser, setAuthUser] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [socket, setSocket] = useState(null);

  // ================= AUTH HEADER =================
  const setAuthHeader = (tok) => {

    if (tok) {

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tok}`;

    } else {

      delete axios.defaults.headers.common[
        "Authorization"
      ];

    }

  };

  // ================= LOGOUT =================
  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    setAuthHeader(null);

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out");

  };

  // ================= CHECK AUTH =================
  const checkAuth = async () => {

    try {

      if (!token) return;

      setAuthHeader(token);

      const { data } = await axios.get(
        "/api/auth/check"
      );

      if (data.success) {

        setAuthUser(data.user);

        connectSocket(data.user);

      } else {

        logout();

      }

    } catch (err) {

      console.log(
        "Auth check failed:",
        err.response?.data || err.message
      );

      logout();

    }

  };

  // ================= LOGIN / SIGNUP =================
  const login = async (state, credentials) => {

    try {

      const { data } = await axios.post(
        `/api/auth/${state}`,
        credentials
      );

      if (data.success) {

        // save token
        localStorage.setItem(
          "token",
          data.token
        );

        setToken(data.token);

        // set axios auth
        setAuthHeader(data.token);

        // save user
        setAuthUser(data.user);

        // connect socket
        connectSocket(data.user);

        toast.success(data.message);

      } else {

        toast.error(data.message);

      }

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        err.message
      );

    }

  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (body) => {

    try {

      const { data } = await axios.put(
        "/api/auth/update-profile",
        body
      );

      if (data.success) {

        setAuthUser(data.user);

        toast.success("Profile updated");

      } else {

        toast.error(data.message);

      }

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        err.message
      );

    }

  };

  // ================= SOCKET =================
  const connectSocket = (userData) => {

    if (!userData?._id) return;

    // already connected
    if (socket?.connected) return;

    const newSocket = io(backendUrl, {

      query: {
        userId: userData._id,
      },

      transports: ["websocket"],

    });

    newSocket.on("connect", () => {

      console.log(
        "Socket connected:",
        newSocket.id
      );

    });

    newSocket.on(
      "getOnlineUsers",
      (users) => {

        setOnlineUsers(users);

      }
    );

    newSocket.on("disconnect", () => {

      console.log("Socket disconnected");

    });

    setSocket(newSocket);

  };

  // ================= INIT =================
  useEffect(() => {

    if (token) {

      setAuthHeader(token);

      checkAuth();

    }

  }, []);

  return (

    <AuthContext.Provider
      value={{

        axios,

        authUser,

        onlineUsers,

        socket,

        login,

        logout,

        updateProfile,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

};