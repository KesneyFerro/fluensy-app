# MongoDB Integration Test Guide

## Testing the Complete Integration

Your Fluensy app now has full MongoDB Atlas integration! Here's how to test it:

### 🚀 Current Status

- ✅ **Backend Running**: http://localhost:5000
- ✅ **Frontend Running**: http://localhost:3001
- ✅ **MongoDB Connected**: fluensy.t3hyga1.mongodb.net
- ✅ **API Endpoints Working**: All user management endpoints tested

### 🧪 Test Scenarios

#### 1. **New User Signup**

1. Go to http://localhost:3001/signup
2. Create an account with email/password
3. Complete the profile with name, username, and birthdate
4. **What happens behind the scenes:**
   - User created in Firebase Authentication
   - User profile automatically created in MongoDB
   - Both systems are synced

#### 2. **Existing User Login**

1. Go to http://localhost:3001/login
2. Login with existing credentials
3. **What happens behind the scenes:**
   - Firebase authenticates the user
   - MongoDB profile is automatically loaded
   - User data is synced between both systems

#### 3. **Profile Editing**

1. Login and go to the profile/settings
2. Edit your profile information
3. **What happens behind the scenes:**
   - Changes saved to Firebase (display name, email, password)
   - Changes saved to MongoDB (all profile data)
   - Both systems stay in sync

#### 4. **Account Deletion**

1. In profile settings, delete your account
2. **What happens behind the scenes:**
   - User deleted from MongoDB first
   - Then deleted from Firebase
   - All data is completely removed

### 🔍 Verifying Data Storage

#### Check MongoDB Data

You can verify data is being stored by checking the API endpoints:

```bash
# Get user profile (replace with actual Firebase UID)
curl http://localhost:5000/api/users/[FIREBASE_UID]

# Check API health
curl http://localhost:5000/health

# Check username availability
curl http://localhost:5000/api/users/check-username/testuser
```

#### What's Stored in MongoDB

- **Basic Profile**: Name, username, email, date of birth
- **Learning Progress**: Session count, time spent, streaks
- **Exercise Data**: Completed exercises with scores
- **Phoneme Progress**: Individual sound training progress
- **User Preferences**: Language settings, profile picture

#### What's Still in Firebase

- **Authentication**: Email/password, login sessions
- **Security**: ID tokens, authentication state
- **Google Sign-in**: OAuth tokens and social login data

### 🐛 Troubleshooting

#### Backend Issues

```bash
# Check if backend is running
curl http://localhost:5000

# Check MongoDB connection
curl http://localhost:5000/health
```

#### Frontend Issues

1. Make sure `.env.local` has: `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api`
2. Check browser console for API errors
3. Verify Firebase configuration is correct

#### Common Errors

- **CORS errors**: Backend CORS is configured for localhost:3000/3001
- **Connection refused**: Make sure backend is running on port 5000
- **MongoDB errors**: Check your internet connection and Atlas access

### 📊 Data Flow

```
User Action → Firebase Auth → AuthContext → UserService → MongoDB Atlas
                     ↓                          ↓
              Frontend State ←  Sync Data  ←  Backend API
```

### 🔧 Development Workflow

1. **Backend**: Always start with `npm start` in `/backend` directory
2. **Frontend**: Run `npm run dev` in root directory
3. **Database**: MongoDB Atlas handles all data persistence
4. **Testing**: Use the API endpoints or browser to verify data

### 🎯 Next Steps

Your integration is complete! You can now:

- Build additional features that store user data
- Add learning analytics and progress tracking
- Implement user preferences and settings
- Create social features like sharing progress

The system automatically handles data synchronization, so you can focus on building great learning experiences!
