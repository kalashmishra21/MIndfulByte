# 🧠 Mindful Byte - Daily Programming Challenges Platform

## 📖 Project Overview

**Mindful Byte** is a modern, full-stack web application designed to help developers enhance their programming skills through daily coding challenges. The platform combines interactive learning with gamification elements to create an engaging learning experience.

### 🌟 Key Features

- **📝 Daily Programming Challenges** - Fresh coding problems every day
- **🔥 Streak Tracking** - Maintain your coding momentum 
- **🏆 Achievement System** - Unlock badges for milestones
- **📚 Comprehensive Library** - Browse 1000+ coding problems
- **🔖 Bookmark System** - Save interesting challenges
- **👤 User Profiles** - Track your progress and stats
- **🌓 Dark/Light Mode** - Customizable theme preference
- **📱 Mobile Responsive** - Seamless experience across devices

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18 with modern hooks
- **Routing**: React Router v6
- **State Management**: Context API
- **Authentication**: JWT with Google OAuth
- **Styling**: Custom CSS with modern design patterns
- **Icons**: React Icons library

### Backend (Node.js/Express)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **OAuth**: Google OAuth 2.0
- **API Design**: RESTful architecture

## 🚀 Tech Stack

| Frontend | Backend | Database | Authentication |
|----------|---------|----------|----------------|
| React.js | Node.js | MongoDB | JWT Tokens |
| CSS3 | Express.js | Mongoose | Google OAuth |
| React Router | bcryptjs | | bcrypt |
| Context API | CORS | | |

## 📂 Project Structure

```
Mindful_Byte/
├── 📁 frontend/           # React application
│   ├── 📁 src/
│   │   ├── 📁 components/ # Reusable UI components
│   │   ├── 📁 context/    # React Context providers
│   │   ├── 📁 pages/      # Page components
│   │   └── 📄 App.jsx     # Main application component
│   └── 📄 package.json    # Frontend dependencies
│
├── 📁 backend/            # Node.js server
│   ├── 📁 server/
│   │   ├── 📁 controllers/# API route handlers
│   │   ├── 📁 models/     # Database schemas
│   │   ├── 📁 routes/     # API routes
│   │   └── 📄 server.js   # Server entry point
│   └── 📄 package.json    # Backend dependencies
│
└── 📄 README.md           # Project documentation
```

## 🎯 Core Functionality

### 🔐 Authentication System
- **Email/Password Registration & Login**
- **Google OAuth Integration**
- **JWT Token Management**
- **Protected Routes**
- **User Session Handling**

### 📊 Progress Tracking
- **Daily Streak Counter**
- **Solution History**
- **Performance Analytics**
- **Badge Collection**
- **Personal Statistics**

### 🎮 Gamification
- **Streak Challenges** (7-day, 15-day, 30-day)
- **Achievement Badges**
- **Progress Milestones**
- **Leaderboard System**
- **Celebration Animations**

### 💾 Data Management
- **User Profiles**
- **Solution Storage**
- **Bookmark System**
- **Progress Persistence**
- **Real-time Updates**

## 🌈 UI/UX Features

### 🎨 Modern Design
- **Glass Morphism Effects**
- **Gradient Backgrounds**
- **Smooth Animations**
- **Interactive Hover Effects**
- **Professional Typography**

### 📱 Responsive Design
- **Mobile-First Approach**
- **Tablet Optimization**
- **Desktop Enhancement**
- **Cross-Browser Compatibility**
- **Touch-Friendly Interface**

### 🌙 Theme System
- **Dynamic Dark/Light Mode**
- **Theme Persistence**
- **Smooth Transitions**
- **Accessible Colors**
- **User Preference Storage**

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/itz-rajshekhar18/DailyBytes.git
cd Dailybytes
```

2. **Setup Backend**
```bash
# Switch to backend branch
git checkout backend

# Install dependencies
cd backend/server
npm install

# Setup environment variables
cp .env.example .env
# Configure your MongoDB URI, JWT secret, and Google OAuth credentials

# Start the server
npm run dev
```

3. **Setup Frontend**
```bash
# Switch to frontend branch  
git checkout frontend

# Install dependencies
cd frontend
npm install

# Start the development server
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/DailyByteData
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5001/api/users/google/callback
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:5001
```

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/google` - Google OAuth
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Bytes (Challenges)
- `GET /api/bytes` - Get all bytes
- `GET /api/bytes/:id` - Get specific byte
- `POST /api/bytes/:id/submit` - Submit solution

### Streaks & Progress
- `GET /api/streaks` - Get user streak info
- `PUT /api/streaks` - Update streak
- `GET /api/badges` - Get user badges

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:id` - Remove bookmark

## 🎖️ Achievements System

| Badge | Requirement | Description |
|-------|-------------|-------------|
| 🔥 Week Warrior | 7-day streak | Complete 7 consecutive days |
| 🚀 Biweek Champion | 15-day streak | Complete 15 consecutive days |
| 👑 Month Master | 30-day streak | Complete 30 consecutive days |

## 🌟 Key Components

### Frontend Components
- **Header** - Navigation with user profile
- **Hero** - Landing section with features
- **Bytes** - Daily challenge display
- **BytesBrowser** - Challenge library
- **Profile** - User dashboard
- **Badges** - Achievement showcase

### Backend Models
- **User** - User data and authentication
- **Byte** - Programming challenges
- **Streak** - Progress tracking
- **Bookmark** - Saved challenges

## 🔄 Branching Strategy

- **`main`** - Production ready code with documentation
- **`frontend`** - Frontend React application
- **`backend`** - Backend Node.js server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Kalash Mishra**
- GitHub: [@kalashmishra21](https://github.com/kalashmishra21)
- LinkedIn: [Kalash Mishra](https://www.linkedin.com/in/kalashmishra21)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Google for OAuth integration
- Open source community for inspiration

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Kalash Mishra](https://github.com/kalashmishra21)

</div> 