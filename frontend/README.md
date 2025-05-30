# DailyByte Frontend

## 📋 Overview
DailyByte Frontend is a modern React application built with Vite that provides an interactive platform for daily coding knowledge. Users can learn from daily bytes, track their progress with streaks, save bookmarks, and manage their profiles.

## 🚀 Features

### Core Features
- **Daily Learning**: Access curated daily coding knowledge bytes
- **Interactive Quizzes**: Test knowledge with integrated quizzes
- **Streak Tracking**: Visual streak counters with fire animations
- **Badge System**: Earn badges for consistent learning (7, 15, 30 day streaks)
- **Bookmarking**: Save favorite bytes for future reference
- **User Profiles**: Customizable profiles with photo uploads
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Technical Features
- **Modern React**: Built with React 18 and hooks
- **Fast Build Tool**: Vite for lightning-fast development
- **Client-side Routing**: React Router DOM for SPA navigation
- **State Management**: Context API for global state
- **Authentication**: JWT-based auth with Google OAuth integration
- **API Integration**: Axios for HTTP requests with dynamic API endpoints
- **Icons**: React Icons for consistent iconography
- **Responsive UI**: CSS Grid and Flexbox layouts

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Authentication**: JWT + Google OAuth (@react-oauth/google)
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: CSS3 with CSS Custom Properties
- **State Management**: React Context API
- **Development**: ESLint for code quality

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html         # Main HTML template
│   └── vite.svg          # Vite logo
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.jsx     # Navigation header
│   │   ├── Hero.jsx       # Landing page hero
│   │   ├── Bytes.jsx      # Today's byte display
│   │   ├── BytesBrowser.jsx # All bytes with filters
│   │   ├── ByteDetail.jsx # Individual byte page
│   │   ├── Profile.jsx    # User profile management
│   │   ├── Badges.jsx     # Badge showcase
│   │   ├── BookmarkedBytes.jsx # Saved bytes
│   │   └── Footer.jsx     # Site footer
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx # User authentication
│   │   ├── BookmarkContext.jsx # Bookmark management
│   │   ├── StreakContext.jsx # Learning streaks
│   │   └── ThemeContext.jsx # Dark/light theme
│   ├── pages/             # Page components
│   │   ├── LoginPage.jsx  # Login interface
│   │   └── SignupPage.jsx # Registration interface
│   ├── utils/             # Utility functions
│   │   ├── config.js      # API configuration
│   │   └── constants.js   # App constants
│   ├── assets/            # Static assets
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── vercel.json           # Vercel deployment config
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the frontend directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5001
   
   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit `http://localhost:5173`

## 🎨 Component Architecture

### Context Providers
The app uses React Context for state management:

- **AuthContext**: User authentication and profile data
- **BookmarkContext**: Bookmark CRUD operations
- **StreakContext**: Learning streak tracking and badges
- **ThemeContext**: Dark/light theme toggle

### Key Components

#### Header Component
- Navigation with responsive design
- User profile dropdown with avatar
- Streak counter with fire animation
- Theme toggle button
- Badge notifications

#### Bytes Component
- Displays today's featured byte
- Interactive quiz with real-time feedback
- Bookmark toggle functionality
- Streak updates on correct answers

#### BytesBrowser Component
- Paginated grid of all bytes
- Category and tag filtering
- Search functionality
- Responsive card layout

#### Profile Component
- Editable user information
- Profile picture upload/removal
- Form validation
- Success/error messaging

### Routing Structure
```
/ - Home (Hero + Today's Byte)
/all-bytes - Browse all bytes
/byte/:id - Individual byte detail
/bookmarks - User's saved bytes
/badges - Streak badges showcase
/profile - User profile management
/login - Authentication
/signup - User registration
```

## 🔌 API Integration

### Dynamic API Configuration
The app uses a centralized configuration system for API endpoints:

```javascript
// utils/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
           (import.meta.env.PROD ? 'https://your-backend.vercel.app' : 'http://localhost:5001'),
  GOOGLE_CLIENT_ID: 'your-google-client-id'
};
```

### API Endpoints Used
- `GET /api/byte/today` - Today's byte
- `GET /api/byte` - All bytes with pagination
- `GET /api/byte/:id` - Specific byte details
- `POST /api/users/login` - User authentication
- `GET /api/bookmarks` - User bookmarks
- `GET /api/streaks` - User streak data
- `PUT /api/users/profile` - Profile updates

## 🎯 Key Features Explained

### Streak System
- **Visual Indicators**: Fire icon that glows when active
- **Daily Tracking**: Updates when quiz answered correctly
- **Badge Rewards**: Earned at 7, 15, and 30-day milestones
- **Persistence**: Survives page refreshes and browser sessions

### Bookmark System
- **Quick Toggle**: Heart icon on byte cards
- **Persistent Storage**: Saved to user account
- **Visual Feedback**: Immediate UI updates
- **Dedicated Page**: View all bookmarked bytes

### Theme System
- **Toggle Button**: Sun/moon icon in header
- **CSS Variables**: Consistent color theming
- **Local Storage**: Remembers user preference
- **Smooth Transitions**: Animated theme changes

### Authentication Flow
1. **Login Options**: Email/password or Google OAuth
2. **JWT Storage**: Secure token management
3. **Protected Routes**: Automatic redirects for unauthorized access
4. **Profile Management**: Update user information and photos

## 🔒 Security Features

- **JWT Authentication**: Secure API communication
- **Protected Routes**: Prevent unauthorized access
- **Input Validation**: Form validation and sanitization
- **CORS Handling**: Proper cross-origin request setup
- **Token Expiry**: Automatic logout on token expiration

## 🎨 Styling Approach

### CSS Architecture
- **Global Styles**: Base styles and CSS reset
- **Component Styles**: Co-located CSS files
- **CSS Custom Properties**: Theme variables
- **Responsive Design**: Mobile-first approach
- **Modern CSS**: Grid, Flexbox, animations

### Design System
- **Color Palette**: Consistent brand colors with dark/light variants
- **Typography**: Hierarchical text sizing
- **Spacing**: Consistent margin/padding scale
- **Animation**: Smooth transitions and micro-interactions
- **Icons**: React Icons for consistency

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev        # Start dev server
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Production Build
```bash
npm run build      # Create production build
```

### Deployment to Vercel

1. **Build configuration** (already configured in `vercel.json`)
2. **Environment variables** in Vercel dashboard:
   - `VITE_API_BASE_URL`
   - `VITE_GOOGLE_CLIENT_ID`
3. **Deploy command**:
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

### ESLint Configuration (`eslint.config.js`)
- React-specific rules
- ES6+ syntax support
- Code quality enforcement

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly**: Large tap targets
- **Responsive Navigation**: Collapsible menu
- **Optimized Layout**: Stack cards vertically
- **Touch Gestures**: Swipe-friendly interactions

## 🐛 Error Handling

### User-Friendly Errors
- **Network Errors**: Graceful fallbacks
- **Loading States**: Skeleton screens
- **Error Boundaries**: Prevent app crashes
- **Form Validation**: Real-time feedback

### Development Tools
- **Console Logging**: Detailed error information
- **React DevTools**: Component debugging
- **Network Tab**: API request monitoring

## 🔄 State Management Patterns

### Context Usage
```javascript
// Example: Using BookmarkContext
const { addBookmark, removeBookmark, bookmarks } = useContext(BookmarkContext);
```

### Local Storage
- **Theme Preference**: Persisted theme choice
- **Auth Token**: Secure token storage
- **Quiz Responses**: Prevent re-answering
- **Streak Data**: Local caching

## 📈 Performance Optimizations

- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Responsive images
- **Caching**: API response caching
- **Bundle Splitting**: Vendor chunk separation
- **Tree Shaking**: Remove unused code

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code style
4. Add/update tests if applicable
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📞 Support

For issues and questions:
- Check the browser console for errors
- Verify API endpoints are accessible
- Review environment variable configuration
- Create an issue in the repository

## 📄 License

This project is licensed under the ISC License.
