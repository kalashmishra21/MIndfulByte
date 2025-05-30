# DailyByte Backend API

## 📋 Overview
DailyByte Backend is a Node.js/Express REST API that serves daily coding knowledge bytes, manages user authentication, tracks learning streaks, and handles bookmarks. Built with MongoDB for data persistence and JWT for authentication.

## 🚀 Features

### Core Features
- **Daily Bytes**: Curated daily coding knowledge with examples and quizzes
- **User Authentication**: JWT-based auth with Google OAuth integration
- **Learning Streaks**: Track consecutive days of learning with badge system
- **Bookmarks**: Save favorite bytes for later reference
- **User Profiles**: Customizable user profiles with profile pictures
- **Admin Features**: Byte management and user analytics

### Technical Features
- RESTful API design
- MongoDB with Mongoose ODM
- JWT authentication & authorization
- Google OAuth 2.0 integration
- File upload handling (profile pictures)
- Input validation & sanitization
- Error handling middleware
- CORS configuration
- Rate limiting (planned)

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth
- **File Upload**: Multer
- **Environment**: dotenv
- **Security**: bcryptjs, CORS
- **Logging**: Morgan

## 📁 Project Structure

```
backend/server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── byteController.js  # Byte CRUD operations
│   ├── userController.js  # User management
│   └── streakController.js # Streak tracking
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── errorHandler.js   # Global error handling
│   └── notFound.js       # 404 handler
├── models/
│   ├── Byte.js           # Byte schema
│   ├── User.js           # User schema
│   ├── Bookmark.js       # Bookmark schema
│   └── Streak.js         # Streak schema
├── routes/
│   ├── byteRoutes.js     # Byte endpoints
│   ├── userRoutes.js     # User endpoints
│   ├── bookmarkRoutes.js # Bookmark endpoints
│   └── streakRoutes.js   # Streak endpoints
├── uploads/              # File uploads directory
├── .env                  # Environment variables
├── server.js             # Main application file
├── package.json          # Dependencies & scripts
└── vercel.json          # Vercel deployment config
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials

### Local Development

1. **Clone the repository**
   ```bash
git clone <repository-url>
   cd backend/server
   ```

2. **Install dependencies**
   ```bash
npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/dailybyte
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dailybyte

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # URLs
   CLIENT_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5001

   # Environment
NODE_ENV=development
   PORT=5001
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
npm run dev

# Production mode
npm start
   ```

5. **Verify installation**
   Visit `http://localhost:5001` - you should see a welcome message.

## 📚 API Endpoints

### Authentication Routes (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users` | Register new user | No |
| POST | `/api/users/login` | User login | No |
| POST | `/api/users/google` | Google OAuth login | No |
| PUT | `/api/users/profile` | Update user profile | Yes |
| POST | `/api/users/upload-profile-picture` | Upload profile picture | Yes |
| DELETE | `/api/users/remove-profile-picture` | Remove profile picture | Yes |

### Byte Routes (`/api/byte`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/byte/today` | Get today's byte | No |
| GET | `/api/byte` | Get all bytes (paginated) | No |
| GET | `/api/byte/:id` | Get specific byte | No |
| POST | `/api/byte` | Create new byte | Yes (Admin) |
| PUT | `/api/byte/:id` | Update byte | Yes (Admin) |
| DELETE | `/api/byte/:id` | Delete byte | Yes (Admin) |

### Bookmark Routes (`/api/bookmarks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookmarks` | Get user bookmarks | Yes |
| POST | `/api/bookmarks` | Add bookmark | Yes |
| DELETE | `/api/bookmarks/:byteId` | Remove bookmark | Yes |
| GET | `/api/bookmarks/:byteId/check` | Check bookmark status | Yes |

### Streak Routes (`/api/streaks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/streaks` | Get user streak data | Yes |
| PUT | `/api/streaks/update` | Update streak | Yes |

## 📊 Data Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  profilePicture: String,
  role: String (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Byte Model
```javascript
{
  title: String,
  summary: String,
  example: String,
  category: String,
  tags: [String],
  quiz: {
    question: String,
    options: [String],
    correctAnswer: String
  },
  datePublished: Date,
  difficulty: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Streak Model
```javascript
{
  userId: ObjectId,
  currentStreak: Number,
  maxStreak: Number,
  lastActive: Date,
  badges: [{
    type: String,
    earnedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Google OAuth Flow
1. Frontend redirects to Google OAuth
2. Google returns authorization code
3. Backend exchanges code for user info
4. Backend creates/updates user and returns JWT

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from server directory**
   ```bash
   cd backend/server
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV=production`

### MongoDB Atlas Setup
1. Create cluster on MongoDB Atlas
2. Create database user
3. Add IP address to whitelist (0.0.0.0/0 for Vercel)
4. Get connection string and add to `MONGODB_URI`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `BACKEND_URL` | Backend URL for OAuth callbacks | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 5001) | No |

### CORS Configuration
The server is configured to accept requests from:
- `http://localhost:5173` (development)
- Your production frontend URL

## 🐛 Error Handling

The API uses standardized error responses:

```javascript
// Success Response
{
  success: true,
  data: {...}
}

// Error Response
{
  success: false,
  error: "Error message",
  stack: "..." // Only in development
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 📝 Development

### Adding New Endpoints
1. Create route in appropriate route file
2. Implement controller function
3. Add middleware if needed
4. Update this README

### Database Seeding
```bash
# Add sample bytes (implement as needed)
npm run seed
```

### Testing
```bash
# Run tests (implement as needed)
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoints above

## 📄 License

This project is licensed under the ISC License.
