# EventSphere - Event Management System

A full-stack MERN (MongoDB, Express, React, Node.js) event management and booking platform with role-based access control, real-time updates via Socket.IO, and online payments.

---

## 🚀 Features

- **Authentication & RBAC**: Role-based access control for Admins, Organizers, and Attendees using JWT.
- **Event Discovery & Filtering**: Search, category filters, and detailed event views.
- **Booking & Tickets**: Real-time seat updates with Socket.IO, ticket booking, and QR codes.
- **Organizer Dashboard**: Create, update, manage events, and view attendee lists.
- **Admin Panel**: Manage users, approve/reject submitted events, and platform statistics.
- **Modern UI**: Built with React 18, Vite, Tailwind CSS, and Toast notifications.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6, Socket.io-client
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Multer
- **Integrations**: Cloudinary (image uploads), Razorpay (payments), Nodemailer (email notifications)

---

## 📂 Project Structure

```text
eventsphere-event-management-system/
├── client/              # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth and state management
│   │   ├── pages/       # Route pages & dashboards
│   │   └── services/    # API calls & Axios setup
│   └── .env.example
├── server/              # Express backend API
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth & role verification
│   ├── models/          # Mongoose database models
│   ├── routes/          # API endpoints
│   ├── seed.js          # Sample database seeder
│   └── .env.example
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas URI)

### 2. Environment Setup

#### Server Configuration
Create a `.env` file in the `server/` directory (you can copy `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventmanagement
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### Client Configuration
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Running the Project

#### Start Backend
```bash
cd server
npm install
node seed.js    # Seed sample users and events
npm run dev     # Starts on http://localhost:5000
```

#### Start Frontend
```bash
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

---

## 🔑 Demo Credentials (from `seed.js`)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@eventms.com` | `Admin@123` |
| **Organizer** | `organizer@eventms.com` | `Organizer@123` |
| **User (Attendee)** | `user@eventms.com` | `User@123` |

---

## 📄 License
ISC

