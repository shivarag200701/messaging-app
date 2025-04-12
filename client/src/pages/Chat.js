import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_BACKEND_URL;


const socket = io(API, { autoConnect: false });

function Chat() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [toUser, setToUser] = useState(""); // ✅ NEW: receiver username
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
  
    if (username) {
      socket.connect(); // 🔁 reconnect manually
      socket.emit("join", username); // 🟢 notify server
    }
  
    return () => {
      socket.off(); // Clean up all listeners on unmount
    };
  }, []);

  // ✅ Tell server who this user is
  useEffect(() => {
    socket.emit("join", username);
  }, [username]);

  //tell the online users
  useEffect(() => {
    socket.on("online_users", (list) => {
      console.log("🟢 Online users list:", list); // <== Add this
      setOnlineUsers(list);
    });
  
    return () => {
      socket.off("online_users");
    };
  }, []);

  // ✅ Load messages (will filter by user pair in next step)
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
      // Emit delivery acknowledgment
  socket.emit("message_delivered", { messageId: data._id });

  if (data.sender === toUser) {
    socket.emit("mark_seen", { from: username, to: toUser });
  }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [username,toUser]);

  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/api/users`);
        const filtered = res.data.filter(u => u.username !== username); // remove self
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to load user list", err);
      }
    };
  
    fetchUsers();
  }, [username]);

  useEffect(() => {
    socket.on("messages_seen", ({ seenBy }) => {
      // Update message statuses to 'seen' for messages you sent to the user
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.sender === username && msg.receiver === seenBy && msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });
  
    return () => {
      socket.off("messages_seen");
    };
  }, [username]);

  useEffect(() => {
    socket.on("message_status_updated", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });
  
    return () => {
      socket.off("message_status_updated");
    };
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
  }, [username,toUser]);
  
  // useEffect(() => {
  //   setMessages([]); // clear old messages quickly
  // }, [toUser]);


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
      socket.disconnect(); // 🔴 Manually close socket connection
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/");
    }
  };

 

  return (
    <div style={{ display: "flex", height: "100vh" }}>
  {/* Sidebar - User List */}
  <div
    style={{
      width: "200px",
      borderRight: "1px solid #ccc",
      padding: "10px",
      backgroundColor: "#f1f1f1",
      overflowY: "auto",
    }}
  >
    <h4>Users</h4>

    {users.map((u, i) => (
      <div
        key={i}
        onClick={() => setToUser(u.username)}
        style={{
          position: "relative", // ✅ Required for absolute dot positioning
          padding: "8px 30px 8px 10px", // room for the dot
          marginBottom: "5px",
          backgroundColor: toUser === u.username ? "#007BFF" : "#e0e0e0",
          color: toUser === u.username ? "white" : "black",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {u.username}

        {/* ✅ Green dot for online status */}
        {onlineUsers.includes(u.username) && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              height: "10px",
              width: "10px",
              backgroundColor: "green",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
    ))}
  </div>
  
      {/* Main Chat Section */}
      <div style={{ flex: 1, padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
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
  
        {/* Chat Header */}
        {toUser && (
          <h4 style={{ marginBottom: "10px" }}>
            Chatting with <span style={{ color: "#007BFF" }}>{toUser}</span>
          </h4>
        )}

        {isTyping && (
          <div style={{ marginBottom: "10px", color: "#007BFF" }}>
            {typingUser} is typing...
          </div>
        )}
  
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
                {msg.sender === username && (
                  <div style={{ fontSize: "12px", marginTop: "4px", textAlign: "right" }}>
                    {msg.status === "seen" ? (
                      <span style={{ color: "blue" }}>✓✓</span>
                    ) : msg.status === "delivered" ? (
                      <span>✓✓</span>
                    ) : (
                      <span>✓</span>
                    )}
                  </div>
                )}
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
          placeholder={toUser ? "Type a message..." : "Select a user to start chatting"}
          onChange={(e) => {
            setMessage(e.target.value);

            // Emit typing event
            if (toUser) {
              socket.emit("typing", { from: username, to: toUser });

              // Stop typing after 1s of no input
              clearTimeout(window.typingTimeout);
              window.typingTimeout = setTimeout(() => {
                socket.emit("stop_typing", { from: username, to: toUser });
              }, 1000);
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: "8px" }}
          disabled={!toUser}
          />
          <button onClick={sendMessage} disabled={!toUser}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;