import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function Chat() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [toUser, setToUser] = useState(""); // ✅ NEW: receiver username
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Tell server who this user is
  useEffect(() => {
    socket.emit("join", username);
  }, [username]);

  // ✅ Load messages (will filter by user pair in next step)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!username || !toUser) return;
  
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${username}/${toUser}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages between users");
      }
    };
  
    fetchMessages();
  }, [username, toUser]);

  // ✅ Receive live messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const { sender, receiver } = data;

      // Show only if current chat is with the sender or receiver
      if (
        (sender === username && receiver === toUser) ||
        (sender === toUser && receiver === username)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [toUser, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() !== "" && toUser.trim() !== "") {
      const newMsg = {
        sender: username,
        receiver: toUser,
        content: message,
      };
      socket.emit("send_message", newMsg);
      setMessage("");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Nav bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          borderRadius: "5px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>Hi, {username}</h3>
        <button
          onClick={handleLogout}
          style={{
            background: "white",
            color: "#007BFF",
            padding: "6px 12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Receiver input */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Receiver username"
          value={toUser}
          onChange={(e) => setToUser(e.target.value)}
          style={{ padding: "6px", width: "100%" }}
        />
      </div>

      {/* Chat area */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.sender === username ? "flex-end" : "flex-start",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                backgroundColor: msg.sender === username ? "#DCF8C6" : "#E0E0E0",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "70%",
              }}
            >
              <strong>{msg.sender === username ? "You" : msg.sender}:</strong>
              <br />
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;