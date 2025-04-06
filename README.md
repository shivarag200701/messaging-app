# 📱 Mini WhatsApp Clone – Fullstack Messaging App

A beginner-friendly project to build a real-time 1-on-1 chat application similar to WhatsApp using **React**, **Node.js**, **Socket.IO**, and **MongoDB**.

---

## 📌 Project Overview

This app allows users to:
- Register and login securely
- Send and receive messages in real-time
- View chat history
- See online/offline status (optional)
- Build a mobile-responsive chat UI

---

## 🗂 Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React.js                      |
| Backend    | Node.js + Express             |
| Database   | MongoDB (via Mongoose)        |
| Real-time  | WebSockets using Socket.IO    |
| Auth       | JWT + bcrypt                  |
| Deployment | Vercel (Frontend), Render/Railway (Backend) |

---

## ✅ Project Checklist

### 🟢 Phase 0: Prerequisites  
- [ ] Learn HTML, CSS, and JavaScript basics  
- [ ] Learn Git & GitHub  
- [ ] Learn basic terminal commands  
- [ ] Understand what frontend/backend means  
- [ ] Choose tech stack (React, Node.js, MongoDB, Socket.IO)

---

### 🔵 Phase 1: Project Setup  
- [ ] Install Node.js and npm  
- [ ] Install VS Code and Git  
- [ ] Initialize backend project (`npm init`)  
- [ ] Set up Express server  
- [ ] Connect to MongoDB using Mongoose  
- [ ] Test basic REST API (e.g., `/ping`)  
- [ ] Initialize frontend with `create-react-app`  
- [ ] Create folders: `/client`, `/server`

---

### 🟡 Phase 2: User Authentication  
- [ ] Create User model in MongoDB  
- [ ] Create `POST /register` API  
- [ ] Create `POST /login` API  
- [ ] Hash passwords using bcrypt  
- [ ] Generate JWT on login  
- [ ] Middleware to verify JWT on protected routes  
- [ ] Create login and registration pages (React)  
- [ ] Save token in `localStorage`  
- [ ] Redirect to chat on successful login

---

### 🟠 Phase 3: Real-Time Messaging  
- [ ] Set up Socket.IO on server  
- [ ] Create WebSocket client in React  
- [ ] Handle `send_message` event  
- [ ] Handle `receive_message` event  
- [ ] Save messages to MongoDB  
- [ ] Load messages into chat screen in real-time  
- [ ] Style messages as chat bubbles (you vs. friend)

---

### 🟣 Phase 4: Message History & Chat List  
- [ ] Create `GET /messages/:userId` API  
- [ ] Load chat history on login  
- [ ] Display messages in scrollable window  
- [ ] Create a simple chat list UI  
- [ ] Show last message in chat preview

---

### 🔴 Phase 5: Online Status (Optional)  
- [ ] Track connected users with Socket.IO  
- [ ] Broadcast `user_online` and `user_offline` events  
- [ ] Display green dot for online users  
- [ ] Implement "typing..." indicator (bonus)

---

### 🎁 Phase 6: Polish & Deploy  
- [ ] Add loading and error states  
- [ ] Style UI (basic responsive layout)  
- [ ] Hide/show password toggle  
- [ ] Deploy backend (Render / Railway)  
- [ ] Deploy frontend (Vercel)  
- [ ] Use `.env` files for secrets  
- [ ] Test full app on production

---

### 🌟 Bonus Features (Stretch Goals)  
- [ ] Group chat support  
- [ ] Media (image) messaging  
- [ ] Push notifications  
- [ ] Dark mode toggle  
- [ ] End-to-End encryption (advanced)  
- [ ] Voice/video calling (WebRTC)

---

## 📆 Estimated Timeline

| Phase               | Time Estimate |
|--------------------|---------------|
| Phase 0: Prep       | 1 week        |
| Phase 1: Setup      | 1 week        |
| Phase 2: Auth       | 1 week        |
| Phase 3: Messaging  | 2–3 weeks     |
| Phase 4: History    | 1 week        |
| Phase 5: Status     | 1 week (opt)  |
| Phase 6: Deploy     | 1 week        |

---

## 🚀 Let’s Build It!

Happy coding! 💻✨