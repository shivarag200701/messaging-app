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
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ⬇️ Setup Socket.IO
const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 New socket connected:", socket.id);

  // 👤 Register the user with their username
  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  // 💬 Handle 1-to-1 message sending
  socket.on("send_message", async (data) => {
    const { sender, receiver, content } = data;

    // Save to MongoDB
    try {
      const message = new Message({ sender, receiver, content });
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

  // 🔴 Handle user disconnect
  socket.on("disconnect", () => {
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        console.log(`🔴 ${username} disconnected`);
        break;
      }
    }
  });
});

// ⬇️ Start the HTTP server (not app.listen)
http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});