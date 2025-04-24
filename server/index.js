const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Message = require("./models/Message");



dotenv.config();
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const users = {}; // username → socket.id
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL;
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/mental-health", require("./routes/mentalHealthRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ⬇️ Setup Socket.IO
const io = new Server(http, {
  cors: {
    origin: allowedOrigin, // Allow frontend
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  console.log("🟢 New socket connected:", socket.id);

  // 👤 Register the user with their username
  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
    // ✅ Broadcast online users to everyone
    console.log("📤 Emitting online users:", Object.keys(users));
    io.emit("online_users", Object.keys(users));
  });

  // 💬 Handle 1-to-1 message sending
  socket.on("send_message", async (data) => {
    const { sender, receiver, content } = data;

    // Save to MongoDB
    try {
      const message = new Message({
         sender, 
         receiver, 
         content,
         status: "sent"  });
      await message.save();
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }

    // Send message to the receiver only
    const receiverSocketId = users[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", data);
    }

    // Also send back to sender so they see their message
    socket.emit("receive_message", data);
  });

  socket.on("typing", ({ from, to }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", { from });
    }
  });
  
  socket.on("stop_typing", ({ from, to }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stop_typing", { from });
    }
  });

  //to update message to delivered
  socket.on("message_delivered", async ({ messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });

      const message = await Message.findById(messageId); // fetch full message
    const sender = message.sender;
    const senderSocketId = users[sender];

    if (senderSocketId) {
      io.to(senderSocketId).emit("message_status_updated", {
        messageId,
        status: "delivered"
      });
    }
    } catch (err) {
      console.error("❌ Failed to mark message as delivered:", err);
    }
  });

  //mark seen when chat window open
  socket.on("mark_seen", async ({ from, to }) => {
    try {
      await Message.updateMany(
        { sender: to, receiver: from, status: { $ne: "seen" } },
        { status: "seen" }
      );
  
      // OPTIONAL: Let the sender know their messages were seen
      const senderSocketId = users[to];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_seen", {
          seenBy: from,
        });
      }
  
    } catch (err) {
      console.error("❌ Failed to mark messages as seen:", err);
    }
  });
  

  // 🔴 Handle user disconnect
  socket.on("disconnect", () => {
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        console.log(`🔴 ${username} disconnected`);

        // ✅ Broadcast updated list again
        io.emit("online_users", Object.keys(users));
        break;
      }
    }
  });
});





// ⬇️ Start the HTTP server (not app.listen)
http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});