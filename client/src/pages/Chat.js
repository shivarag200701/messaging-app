import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SendPaymentModal from "../components/SendPaymentModal";
import PaymentPromptModal from "../components/PaymentPromptModal"
const API = process.env.REACT_APP_BACKEND_URL;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);




const socket = io(API, { autoConnect: false });

// console.log(process.env.REACT_APP_STRIPE_PUBLIC_KEY)

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
  const [smartReplies, setSmartReplies] = useState([]);
  const [paymentClientSecret, setPaymentClientSecret] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  

  const stripeOptions = {
    appearance: {
      theme: isDarkMode ? "night" : "flat",  // Or 'night' for dark mode Stripe
      variables: {
        colorPrimary: "#3B82F6", // Tailwind blue-500
        colorBackground: "#ffffff", // Light background
        colorText: "#1f2937", // Tailwind gray-800
        fontFamily: "Inter, sans-serif",
        borderRadius: "8px",
        spacingUnit: "6px",
      },
      rules: {
        '.Label': {
          color: '#6b7280', // Tailwind gray-500
          fontSize: '14px',
        },
      },
    },
  };
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

      
        // setTimeout(() => {
        //   analyzeRecentConversation();
        // }, 1000);
      
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

  const fetchSmartReplies = async () => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.sender === username) return;

    try {
      const res = await axios.post(`${API}/api/ai/suggest`, {
        conversation: lastMsg.content,
      });
      setSmartReplies(res.data.suggestions || []);
    } catch (err) {
      console.error("AI Suggest Error:", err);
    }
  };

  const analyzeRecentConversation = async () => {
    const recentMessages = messages.slice(-2) // Last 6 messages instead of just 2
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join("\n");
  
    if (!recentMessages) return;
  
    try {
      const res = await axios.post(`${API}/api/mental-health/analyze`, { message: recentMessages });
  
      if (res.data.sentiment === "negative" && res.data.confidence >= 70) {
        toast(
          (t) => (
            <div className="flex flex-col gap-2 text-sm">
              <span>That conversation seems intense. 🧘 Take a deep breath!</span>
              <em className="text-xs text-gray-500">"You are doing your best. It’s okay."</em>
            </div>
          ),
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Conversation analysis failed", err);
    }
  };

  const sendPayment = async (amount, receiver) => {
    try {
      const res = await axios.post(`${API}/api/payments/send`, { amount, receiver });
  
      if (res.data.clientSecret) {
        setPaymentClientSecret(res.data.clientSecret);
        setShowPaymentModal(true);
      }
    } catch (err) {
      console.error("Payment Error:", err.message);
      toast.error("Payment failed. Try again.");
    }
  };

 

  useEffect(() => {
    scrollToBottom();
    fetchSmartReplies();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() !== "" && toUser.trim() !== "") {
      const newMsg = { sender: username, 
        receiver: toUser, 
        content: message,
        createdAt: new Date().toISOString() };
      socket.emit("send_message", newMsg);
      setMessage("");

      setTimeout(() => {
        analyzeRecentConversation();
      }, 1000);
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
  // if (!stripePromise) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-lg">Stripe initialization failed. Please check your keys.</p>
  //     </div>
  //   );
  // }
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
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
              toUser === u.username
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${u.username}`}
                alt="avatar"
                className="w-6 h-6 rounded-full"
              />
              {u.username}
            </span>
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
          <div className="px-6 py-2 border-b text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center">
            <div>
              Chatting with <span className="font-medium text-blue-600 dark:text-blue-400">{toUser}</span>
            </div>
            <button
              onClick={() => setShowPaymentPrompt(true)}
              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">
              Send Money
            </button>
          </div>
        )}

        {/* Smart Replies */}
        {smartReplies.length > 0 && (
          <div className="px-6 pt-2 pb-1 flex gap-2 flex-wrap">
            {smartReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => setMessage(reply)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                {reply}
              </button>
            ))}
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
                className={`group px-4 py-2 rounded-lg max-w-xs break-words text-sm shadow-md relative ${
                  msg.sender === username ? "bg-blue-100 dark:bg-blue-900 text-right" : "bg-white dark:bg-gray-700"
                }`}
              >
                <div className="mb-1">
                  <strong>{msg.sender === username ? "You" : msg.sender}</strong>
                </div>
                <div>{msg.content}</div>
                <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-1">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                {msg.sender === username && (
                  <span>
                    {msg.status === "seen" ? "✓✓ Seen" : msg.status === "delivered" ? "✓✓" : "✓"}
                  </span>
                  )}
                </div>
                
                {/* Hover Actions */}
                <div className="absolute top-0 right-0 hidden group-hover:flex gap-2 bg-white dark:bg-gray-800 border p-1 rounded shadow text-xs">
                  <button>💬</button>
                  <button onClick={() => navigator.clipboard.writeText(msg.content)}>📋</button>
                  <button>🗑️</button>
                  <button>📌</button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
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
    {showPaymentPrompt && (
      <PaymentPromptModal
        onSend={(amount) => {
          setShowPaymentPrompt(false);
          sendPayment(amount, toUser);
        }}
        onClose={() => setShowPaymentPrompt(false)}
      />
    )}
    {showPaymentModal && (
      <SendPaymentModal
        clientSecret={paymentClientSecret}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentClientSecret("");
        }}
      />
    )}
    </Elements>
  );
}

export default Chat;
