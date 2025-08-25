OG House - Culinary Food Ordering Platform
A complete food ordering platform built with modern web technologies, featuring a responsive frontend and robust backend API.
✨ Features
🍽️ Food Ordering System - Complete menu management and order processing
��‍💼 Admin Dashboard - Intuitive interface for managing menus, orders, and business metrics
📧 Email Notifications - Automated order updates and customer communications
💳 Payment Integration - Secure payment processing with Razorpay
📱 Responsive Design - Works perfectly on all devices
🚀 Real-time Updates - Live order tracking and status updates
🛠️ Tech Stack
Frontend
React.js - Modern UI framework
Tailwind CSS - Utility-first CSS framework
shadcn/ui - Beautiful, accessible components
Vite - Fast build tool
Backend
Node.js - Server runtime
Express.js - Web framework
MongoDB - Database
JWT - Authentication
Services
Cloudinary - Image uploads and management
Razorpay - Payment gateway
Email Service - Automated notifications
Vercel - Frontend deployment
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)
MongoDB
Cloudinary account
Razorpay account
Installation
git clone https://github.com/yourusername/og-house.git
cd og-house
Clone the repository
Install dependencies
# Backend
cd backend
npm install

# Frontend
cd ../frontend/oghouse-culinary-landing
npm install
Environment Setup
# Backend - Create .env file
cp env.template .env
# Fill in your environment variables

# Frontend - Update API endpoints in src/lib/api.js
Run the application
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend/oghouse-culinary-landing
npm run dev
📁 Project Structure
og-house/
├── backend/                 # Node.js API server
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── services/          # Business logic services
├── frontend/              # React.js application
│   └── oghouse-culinary-landing/
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── pages/      # Page components
│       │   ├── hooks/      # Custom hooks
│       │   └── lib/        # Utilities and API
│       └── public/         # Static assets
└── README.md
🔧 Development
This project was built using modern development practices and tools, enabling rapid prototyping and MVP development.
�� Screenshots
<img width="800" height="383" alt="image" src="https://github.com/user-attachments/assets/e34dcdef-4458-4004-b6ca-e50c5f1c2749" />

📄 License
This project is proprietary software. All rights reserved.
Built with modern web technologies
