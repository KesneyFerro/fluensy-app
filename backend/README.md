# Fluensy Backend - MongoDB Atlas Integration

This backend provides user management and data persistence for the Fluensy language learning application using MongoDB Atlas.

## Features

- **User Profile Management**: Complete CRUD operations for user profiles
- **Firebase Integration**: Seamless integration with Firebase Authentication
- **Progress Tracking**: Exercise completion, session statistics, and streaks
- **Phoneme Progress**: Individual phoneme training progress tracking
- **Real-time Statistics**: Live updates of learning progress and achievements

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase project (for authentication)

### Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`:
   ```
   MONGO_URI=mongodb+srv://pip:f03NA3PKREgvnQUa@fluensy.t3hyga1.mongodb.net/fluensy
   PORT=5000
   ```

### Running the Server

**Development mode** (with auto-restart):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

- `GET /health` - Check server and database status

### User Management

- `POST /api/users` - Create a new user
- `GET /api/users/:firebaseUID` - Get user profile
- `PUT /api/users/:firebaseUID` - Update user profile
- `DELETE /api/users/:firebaseUID` - Delete user account

### Session Management

- `POST /api/users/:firebaseUID/session` - Update session statistics

### Exercise Tracking

- `POST /api/users/:firebaseUID/exercises` - Add completed exercise

### Phoneme Progress

- `PUT /api/users/:firebaseUID/phonemes/:phoneme` - Update phoneme progress

### Utilities

- `GET /api/users/check-username/:username` - Check username availability

## User Data Structure

The MongoDB user collection stores:

### Basic Profile

- `firebaseUID` - Links with Firebase Authentication
- `name` - User's display name
- `username` - Unique username
- `email` - User's email address
- `dateOfBirth` - User's date of birth

### Learning Progress

- `totalSessions` - Number of completed sessions
- `totalMinutesSpent` - Total learning time
- `currentStreak` - Current daily streak
- `longestStreak` - Longest daily streak ever achieved

### Exercise History

- `completedExercises` - Array of completed exercises with scores and feedback

### Phoneme Training

- `phonemeProgress` - Map of individual phoneme training progress

### Settings & Preferences

- `language` - Target language being learned
- `nativeLanguage` - User's native language
- `profilePicture` - Profile picture URL

## Frontend Integration

The backend integrates with your Next.js frontend through the `user-service.ts` file located in `src/lib/services/`. This service provides:

- Automatic user synchronization with Firebase
- Profile management methods
- Progress tracking functions
- Error handling and type safety

### Usage in Frontend

```typescript
import { userService } from "@/lib/services/user-service";

// Sync Firebase user with MongoDB
const user = await userService.syncFirebaseUser(firebaseUser);

// Update user profile
await userService.updateUserProfile(firebaseUID, {
  name: "New Name",
  dateOfBirth: "1990-01-01",
});

// Track session
await userService.updateSession(firebaseUID, 30); // 30 minutes

// Add completed exercise
await userService.addCompletedExercise(firebaseUID, {
  exerciseType: "pronunciation",
  score: 85,
  feedback: "Great improvement!",
});
```

## Database Schema

### User Model

```javascript
{
  firebaseUID: String, // Required, unique
  name: String, // Required
  username: String, // Required, unique
  email: String, // Required, unique
  dateOfBirth: Date,
  language: String, // Default: 'en'
  nativeLanguage: String, // Default: 'en'
  totalSessions: Number, // Default: 0
  totalMinutesSpent: Number, // Default: 0
  currentStreak: Number, // Default: 0
  longestStreak: Number, // Default: 0
  completedExercises: [{
    exerciseType: String,
    completedAt: Date,
    score: Number,
    feedback: String
  }],
  phonemeProgress: Map, // Phoneme -> {level, accuracy, lastPracticed}
  profilePicture: String,
  isProfileComplete: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

## Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors, duplicate data)
- **404**: Not Found (user doesn't exist)
- **500**: Internal Server Error (database or server issues)

All errors return a JSON response with an `error` field and optional `details`.

## Security Features

- Input validation and sanitization
- Unique constraints on email and username
- Firebase UID verification
- CORS configuration for frontend integration

## Development Notes

- The server automatically restarts when files change (using nodemon in dev mode)
- MongoDB connection includes automatic reconnection handling
- All timestamps are automatically managed
- Profile completion status is automatically calculated

## Production Deployment

When deploying to production:

1. Update the `MONGO_URI` if needed
2. Set appropriate `CORS` origins
3. Configure proper environment variables
4. Use process managers like PM2 for production deployment

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Verify the connection string and network access
2. **CORS Issues**: Check the frontend URL in CORS configuration
3. **Port Already in Use**: Change the PORT environment variable
4. **Environment Variables**: Ensure `.env` file is in the backend directory

### Debugging

Enable debug mode by checking the console logs. The server provides detailed logging for:

- Database connections
- API requests
- Error details
- Environment variable status
