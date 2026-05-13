import { useState, useContext, createContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // GET USERS
    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/messages/users");

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios]);

    // GET MESSAGES
    const getMessages = useCallback(async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios]);

    // SEND MESSAGE
    const sendMessage = async (messageData) => {
        try {
            if (!selectedUser) return;

            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ✏️ EDIT MESSAGE
    const editMessage = async (messageId, newText) => {
        try {
            const { data } = await axios.put(
                `/api/messages/edit/${messageId}`,
                { text: newText }
            );

            if (data.success) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId ? data.updatedMessage : msg
                    )
                );
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // 🗑 DELETE MESSAGE
    const deleteMessage = async (messageId) => {
        try {
            const { data } = await axios.delete(
                `/api/messages/${messageId}`
            );

            if (data.success) {
                setMessages((prev) =>
                    prev.filter((msg) => msg._id !== messageId)
                );
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // MARK AS SEEN
    const markAsSeen = useCallback(async (messageId) => {
        try {
            await axios.put(`/api/messages/mark/${messageId}`);
        } catch (error) {
            console.log(error.message);
        }
    }, [axios]);

    // SOCKET LISTENER
    const subscribeToMessages = useCallback(() => {
        if (!socket) return;

        socket.off("newMessage"); // 👈 important fix (avoid duplicates)

        socket.on("newMessage", async (newMessage) => {

            if (selectedUser && newMessage.senderId === selectedUser._id) {

                const updatedMessage = {
                    ...newMessage,
                    seen: true
                };

                setMessages((prev) => [...prev, updatedMessage]);

                await markAsSeen(newMessage._id);

            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]:
                        (prev[newMessage.senderId] || 0) + 1
                }));
            }
        });

    }, [socket, selectedUser, markAsSeen]);

    // CLEANUP
    useEffect(() => {
        subscribeToMessages();
        return () => {
            if (socket) socket.off("newMessage");
        };
    }, [subscribeToMessages, socket]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,

        // 🔥 new features
        editMessage,
        deleteMessage
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};