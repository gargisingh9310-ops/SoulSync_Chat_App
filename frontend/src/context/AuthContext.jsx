import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  "https://soulsync-chat-app-backend.onrender.com";

axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // SET HEADER
  const setAuthHeader = (tok) => {
    if (tok) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // CHECK AUTH
  const checkAuth = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.log("Auth check failed:", err.response?.data);
      logout(); // 🔥 important fix
    }
  };

  // LOGIN
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        setAuthHeader(data.token);

        setAuthUser(data.user);
        connectSocket(data.user);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // LOGOUT
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
  };

  // SOCKET
  const connectSocket = (userData) => {
    if (!userData?._id) return;
    if (socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    newSocket.on("getOnlineUsers", setOnlineUsers);

    setSocket(newSocket);
  };

  useEffect(() => {
    setAuthHeader(token);
    if (token) checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ axios, authUser, onlineUsers, socket, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};