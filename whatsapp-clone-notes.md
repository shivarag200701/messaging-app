# 💬 WhatsApp Clone – Full Project Notes with Diagrams

This is a complete breakdown of the WhatsApp-style messaging application I built using the MERN stack (MongoDB, Express, React, Node.js) + Socket.IO.

---

## 🔷 Overview

A real-time messaging web app where:
- Users can **register** and **log in**
- Messages are exchanged in **real-time** using WebSockets
- Supports **1-to-1 private messaging**
- Messages are stored and loaded from **MongoDB**
- User auth handled with **JWT**
- UI built using **React**

---

## 🔵 Phase 1: Project Setup

### ✔️ Tools Installed
- Node.js + npm
- MongoDB Atlas (database)
- VS Code (editor)
- Git (version control)

### ✔️ Project Folder Structure

```
Messaging-app/
├── client/       ← React frontend
├── server/       ← Node + Express backend
```

### ✔️ Backend Setup (Node.js + Express)
- Created `/server`
- Ran `npm init -y`
- Installed:
  npm install express cors dotenv mongoose
- Created `index.js` with express boilerplate
- Connected to MongoDB via `config/db.js`
- Tested with GET `/ping` route → “pong”

### ✔️ Frontend Setup (React)
- Created using:
  npx create-react-app client
- Runs on `localhost:3000`
- Proxy added to `client/package.json` for backend calls:
  "proxy": "http://localhost:5000"

---

## 🟡 Phase 2: User Authentication

### 🔐 User Model (MongoDB)
```js
{
  username: String,
  password: String (hashed)
}
```

### 🔓 Register & Login Flow Diagram

```
React Form
  ↓
POST /api/auth/login or /register
  ↓
authController.js (registerUser or loginUser)
  ↓
MongoDB check + bcrypt + jwt
  ↓
Return token + username
  ↓
Frontend stores token in localStorage
  ↓
Redirect to /chat
```

### ✔️ Token Handling
Saved in localStorage:
```js
localStorage.setItem("token", token);
localStorage.setItem("username", username);
```

### ✔️ Route Protection
Custom `ProtectedRoute` component checks for token  
If not found, redirects to `/login`

### ✔️ Logout Feature
Clears `localStorage`, redirects to login

---

## 🟠 Phase 3: Real-Time Messaging (Group Chat ➝ Personal)

### 🧠 How WebSockets Work (Diagram)

```
User A                Server                 User B
------               -------                ------
connect()     →     socket.on('join')  ←   connect()
send_message  →     socket.on('send') →    io.to(B).emit('receive')
                                          (real-time)
```

- Socket.IO set up on both frontend and backend
- `send_message` triggers `receive_message`

---

## 🟣 Phase 4: Private (1-to-1) Messaging

### ✔️ Message Model Updated

```js
{
  sender: String,
  receiver: String,
  content: String,
  createdAt: Date
}
```

### ✔️ Server: Track Users by Socket ID

```js
users = {
  "shiva": "socket123",
  "minal": "socket456"
}
```

### ✔️ Flow: Sending Private Messages

```
Sender enters receiver name
  ↓
socket.emit("send_message", {sender, receiver, content})
  ↓
Server saves to DB
  ↓
Sends only to receiver’s socket ID
  ↓
Receiver gets it live
```

---

## 🟣 Phase 5: Load Private Chat History

### ✔️ API Created

```
GET /api/messages/:user1/:user2
```

Returns all messages between two users using `$or` query.

### ✔️ Frontend

Fetches history like:
```js
axios.get(`/api/messages/${username}/${toUser}`)
```

---

## 🟤 UI Features

- Styled chat bubbles (left/right)
- Auto-scroll to latest message
- Input + send button
- Logout button
- Receiver input box for testing

---

## 🛑 Current Pause Point

✅ Fully working 1-to-1 real-time chat  
✅ Messages stored in MongoDB  
✅ Auth flow complete  
✅ Chat UI working with live updates  
🛑 Stopped here to resume later

---

## 🔜 When Resuming

Next features to build:
- User list to select chat (replace manual receiver input)
- Show timestamps
- Online/offline indicators
- Deploy to Render + Vercel

---

## 💡 Extras

### 📦 How Axios Works

Axios helps React talk to backend like:

```js
axios.post("/api/auth/login", {
  username,
  password
});
```

Sends data, waits for backend response, and returns result to the frontend.

---

### ✅ Helpful Commands

```bash
# Start backend
cd server
node index.js

# Start frontend
cd client
npm start
```

---

### ✅ .env Files

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

✅ You’re ready to resume development from here at any time.