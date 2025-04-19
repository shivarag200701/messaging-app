import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const API = process.env.REACT_APP_BACKEND_URL;

const socket = io(API, { autoConnect: false });

function Chat() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      socket.connect();
      socket.emit("join", username);
    }
    return () => socket.off();
  }, []);

  useEffect(() => {
    socket.emit("join", username);
  }, [username]);

  useEffect(() => {
    socket.on("online_users", (list) => setOnlineUsers(list));
    return () => socket.off("online_users");
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!username || !toUser) return;
      try {
        const res = await axios.get(`${API}/api/messages/${username}/${toUser}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages between users");
      }
    };
    fetchMessages();
  }, [username, toUser]);

  useEffect(() => {
    if (toUser) {
      socket.emit("mark_seen", { from: username, to: toUser });
    }
  }, [toUser, username]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const { sender, receiver } = data;
      if ((sender === username && receiver === toUser) || (sender === toUser && receiver === username)) {
        setMessages((prev) => [...prev, data]);
      }
      socket.emit("message_delivered", { messageId: data._id });
      if (data.sender === toUser) {
        socket.emit("mark_seen", { from: username, to: toUser });
      }
    });
    return () => socket.off("receive_message");
  }, [username, toUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/api/users`);
        const filtered = res.data.filter((u) => u.username !== username);
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to load user list", err);
      }
    };
    fetchUsers();
  }, [username]);

  useEffect(() => {
    socket.on("messages_seen", ({ seenBy }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.sender === username && msg.receiver === seenBy && msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });
    return () => socket.off("messages_seen");
  }, [username]);

  useEffect(() => {
    socket.on("message_status_updated", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    });
    return () => socket.off("message_status_updated");
  }, []);

  useEffect(() => {
    socket.on("user_typing", (data) => {
      if (data.from !== username && data.from === toUser) {
        setTypingUser(data.from);
        setIsTyping(true);
      }
    });
    socket.on("user_stop_typing", (data) => {
      if (data.from !== username && data.from === toUser) {
        setIsTyping(false);
        setTypingUser("");
      }
    });
    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [username, toUser]);

  const sendMessage = () => {
    if (message.trim() !== "" && toUser.trim() !== "") {
      const newMsg = { sender: username, receiver: toUser, content: message };
      socket.emit("send_message", newMsg);
      setMessage("");
    }
  };

  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 text-sm">
          <span>Are you sure you want to logout?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                socket.disconnect();
                localStorage.clear();
                navigate("/", { replace: true });
                toast.success("Logged out successfully!");
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
        {users.map((u, i) => (
          <div
            key={i}
            onClick={() => setToUser(u.username)}
            className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer mb-2 ${
              toUser === u.username ? "bg-blue-500 text-white" : "bg-white hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            }`}
          >
            <span>{u.username}</span>
            {onlineUsers.includes(u.username) && (
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            )}
          </div>
        ))}
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-blue-600 text-white px-6 py-3">
          <h3 className="text-lg font-semibold">Hi, {username}</h3>
          <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>

        {/* Chat header */}
        {toUser && (
          <div className="px-6 py-2 border-b text-sm text-gray-600 dark:text-gray-300">
            Chatting with <span className="font-medium text-blue-600 dark:text-blue-400">{toUser}</span>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words text-sm shadow-md ${
                  msg.sender === username ? "bg-blue-100 dark:bg-blue-900 text-right" : "bg-white dark:bg-gray-700"
                }`}
              >
                <div className="mb-1">
                  <strong>{msg.sender === username ? "You" : msg.sender}</strong>
                </div>
                <div>{msg.content}</div>
                {msg.sender === username && (
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {msg.status === "seen" ? "✓✓ Seen" : msg.status === "delivered" ? "✓✓" : "✓"}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator styled like message */}
          {isTyping && typingUser && (
            <div className={`flex ${lastMsg?.sender === username ? "justify-start" : "justify-end"}`}>
              <div
                className={`${
                  typingUser === username ? "bg-blue-100" : "bg-gray-300 dark:bg-gray-600"
                } rounded-xl px-4 py-2 inline-flex items-center space-x-1 animate-pulse max-w-xs text-sm shadow`}
              >
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          <div className="h-6" ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t bg-white dark:bg-gray-800 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (toUser) {
                socket.emit("typing", { from: username, to: toUser });
                clearTimeout(window.typingTimeout);
                window.typingTimeout = setTimeout(() => {
                  socket.emit("stop_typing", { from: username, to: toUser });
                }, 1000);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={toUser ? "Type a message..." : "Select a user to start chatting"}
            disabled={!toUser}
            className="flex-1 px-4 py-2 border rounded focus:outline-none dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={sendMessage}
            disabled={!toUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
