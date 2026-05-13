import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { axios, socket } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // USERS
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }, [axios]);

  // MESSAGES
  const getMessages = useCallback(
    async (userId) => {
      try {
        const { data } = await axios.get(`/api/messages/${userId}`);

        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    },
    [axios]
  );

  // SEND
  const sendMessage = async (messageData) => {
    try {
      if (!selectedUser) return;

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  

  // DELETE
  const deleteMessage = async (id) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${id}`);

      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    const handler = async (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handler);

    return () => socket.off("newMessage", handler);
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        editMessage,
        deleteMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};