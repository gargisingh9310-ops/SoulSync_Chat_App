import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = "http://localhost:5000";

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // CHECK AUTH
    const checkAuth = async () => {
        try {

            const { data } = await axios.get("/api/auth/check", {
                headers: {
                    token,
                },
            });

            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }

        } catch (error) {
            console.log(error);
        }
    };

    // LOGIN / SIGNUP
    const login = async (state, credentials) => {
        try {

            const { data } = await axios.post(
                `/api/auth/${state}`,
                credentials
            );

            if (data.success) {

                setAuthUser(data.user);

                axios.defaults.headers.common["token"] = data.token;

                setToken(data.token);

                localStorage.setItem("token", data.token);

                connectSocket(data.user);

                toast.success(data.message);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    // LOGOUT
    const logout = () => {

        localStorage.removeItem("token");

        setToken(null);

        setAuthUser(null);

        setOnlineUsers([]);

        delete axios.defaults.headers.common["token"];

        socket?.disconnect();

        toast.success("Logged out successfully");
    };

    // UPDATE PROFILE
    const updateProfile = async (body) => {
        try {

            const { data } = await axios.put(
                "/api/auth/update-profile",
                body
            );

            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    // SOCKET CONNECT
    const connectSocket = (userData) => {

        if (!userData?._id) return;

        if (socket?.connected) return;

        const newSocket = io("http://localhost:5000", {
            query: {
                userId: userData._id,
            },
        });

        newSocket.connect();

        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect(() => {

        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }

    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};