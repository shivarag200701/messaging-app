# 📱 Mini WhatsApp Clone – Real-Time Fullstack Messaging App

A feature-rich, real-time 1-on-1 chat app inspired by WhatsApp. Built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**, it supports messaging, smart replies, mental health nudges, and test-mode payments using **Stripe**.

---

## 🚀 Features

- 🔐 Secure Login & JWT Auth
- 💬 Real-time 1-on-1 Messaging (Socket.IO)
- 🗂 Chat History (MongoDB)
- 🟢 Online Status & Typing Indicator
- 🌘 Dark Mode Toggle
- 🤖 Smart Reply Suggestions (OpenAI)
- 🧘 Mental Health Detection Prompts
- 💸 Stripe Payment Integration (Test Mode)

---

## 🛠 Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React + Tailwind CSS          |
| Backend    | Node.js + Express             |
| Real-Time  | WebSockets via Socket.IO      |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT + bcrypt                  |
| AI         | OpenAI API                    |
| Payments   | Stripe (Test Mode)            |
| Deploy     | Vercel (Frontend) + Render (Backend) |

---

## 📦 Local Setup

### 1. Clone Repo

```bash
git clone https://github.com/yourusername/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Then run:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
cp .env.example .env
```

Fill in `.env`:

```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Then run:

```bash
npm start
```

---

## 💳 Stripe Test Cards

Use these during test payments:

| Card Type     | Number             | Exp   | CVC |
|---------------|--------------------|-------|-----|
| ✅ Success     | 4242 4242 4242 4242 | 12/34 | 123 |
| ❌ Declined    | 4000 0000 0000 0002 | 12/34 | 123 |

> 📘 Full list: [Stripe Test Cards](https://stripe.com/docs/testing)

---

## 📃 API Routes

### Auth
- `POST /api/register` – Create user
- `POST /api/login` – Login + get token

### Messages
- `POST /api/messages` – Send message
- `GET /api/messages/:from/:to` – Get conversation history

### AI & Analysis
- `POST /api/ai/suggest` – Get smart reply suggestions
- `POST /api/mental-health/analyze` – Analyze tone of conversation

### Payments
- `POST /api/payments/send` – Create Stripe PaymentIntent

---

## 🧠 Architecture Notes

- Messages stored in MongoDB with status (`sent`, `delivered`, `seen`)
- WebSocket room-based user sessions
- AI Smart Replies powered by OpenAI GPT
- Stripe Elements modal integration
- Environment variables used for API keys and secrets

---

## 🌟 Roadmap (Coming Soon)

- [ ] Media (Images/Files) Sharing
- [ ] Group Chats
- [ ] Mobile App (React Native)
- [ ] Push Notifications (Firebase)
- [ ] End-to-End Encryption
- [ ] Video/Voice Calling (WebRTC)

---

## 📚 License & Credits

- MIT License  
- Inspired by WhatsApp UI  
- Built with 💙 by [Shiva Raghav](https://github.com/shivarag200701)

---

## 🙋‍♂️ Questions?

If you liked the project, consider giving it a ⭐  
Have suggestions or issues? Feel free to open one!
