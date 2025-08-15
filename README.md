# Fluensy - AI-Powered Language Learning Platform

Fluensy is an interactive language learning application that uses advanced AI to help users improve their pronunciation through conversation with a friendly penguin companion. The app features real-time speech analysis, pronunciation feedback, and interactive phoneme training.

## 📋 Table of Contents

1. [🎯 Overview](#-overview)
2. [🚀 Getting Started](#-getting-started)
3. [🏗️ Architecture](#️-architecture)
4. [🎮 Features](#-features)
5. [🔧 Installation & Setup](#-installation--setup)
6. [📁 Project Structure](#-project-structure)
7. [🤖 AI Services Integration](#-ai-services-integration)
8. [🎵 Audio Processing System](#-audio-processing-system)
9. [🌍 Multi-Language Support](#-multi-language-support)
10. [💻 Implementation Details](#-implementation-details)
11. [🎪 Interaction Flow](#-interaction-flow)
12. [🎨 UI Components](#-ui-components)
13. [⚙️ Environment Configuration](#️-environment-configuration)
14. [🧪 API Routes](#-api-routes)
15. [📱 Pages & Navigation](#-pages--navigation)
16. [🛠️ Development](#️-development)
17. [🚢 Deployment](#-deployment)
18. [🔍 Troubleshooting](#-troubleshooting)
19. [🔒 Security Considerations](#-security-considerations)
20. [📊 Analytics & Monitoring](#-analytics--monitoring)
21. [🧩 Extending Fluensy](#-extending-fluensy)
22. [📝 Contributing](#-contributing)
23. [📜 License](#-license)
24. [🗣️ Phoneme Evaluation System](#️-phoneme-evaluation-system)
25. [🌐 Internationalization](#-internationalization)
26. [💾 MongoDB Integration](#-mongodb-integration)

---

## 🎯 Overview

Fluensy combines multiple AI services to create an immersive language learning experience:

- **Conversational AI**: Interactive conversations with a penguin companion using DeepSeek AI
- **Speech Recognition**: Real-time transcription via AssemblyAI
- **Pronunciation Analysis**: Detailed feedback through SpeechAce API
- **Text-to-Speech**: Natural voice synthesis using Google Cloud TTS
- **Adaptive Learning**: Personalized phoneme training based on pronunciation analysis

### Key Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Authentication
- **AI Services**: AssemblyAI, DeepSeek (via Together AI), SpeechAce, Google TTS
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Database**: Firebase (Authentication & User Management)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser with MediaRecorder support
- API keys for: AssemblyAI, Together AI, SpeechAce, Google Cloud TTS, Firebase

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/fluensy-app.git
cd fluensy-app

# Install dependencies
npm install

# Set up environment variables (see Environment Configuration section)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    A[User Interface] --> B[Interaction Flow Manager]
    B --> C[Audio Processing Pipeline]
    C --> D[AssemblyAI Transcription]
    C --> E[DeepSeek Validation]
    C --> F[SpeechAce Analysis]
    B --> G[Google TTS Synthesis]
    B --> H[Phoneme Training Module]
    A --> I[Firebase Authentication]
```

### Core Components

1. **Interaction Flow Manager**: Orchestrates the entire conversation flow
2. **Audio Processor**: Handles recording, segmentation, and AI processing
3. **Service Layer**: Integrates with external AI APIs
4. **UI Components**: React components for user interaction
5. **State Management**: React Context for language and authentication

---

## 🎮 Features

### ✅ Complete Features

#### **Interactive Conversation Flow**

- **Initial Greeting**: 20 predefined greetings in English/Spanish with random selection
- **User Input Processing**: Voice → Transcription → Validation → Analysis pipeline
- **Follow-up Responses**: Contextual AI-generated responses with mood-based TTS
- **Decision Logic**: Random phoneme training opportunities or conversation continuation

#### **Phoneme Training Module**

- **Targeted Practice**: Identifies pronunciation difficulties from SpeechAce data
- **Interactive Choices**: User can choose phoneme training or continue conversation
- **Practice Phrases**: AI-generated examples with target phoneme emphasis
- **Feedback System**: Comparative analysis with improvement suggestions

#### **Advanced Audio Processing**

- **Smart Segmentation**: Automatic audio splitting at natural speech pauses
- **Real-time Processing**: Concurrent segment processing for optimal performance
- **Silence Detection**: Web Audio API-based pause detection
- **Background Analysis**: SpeechAce runs silently without blocking UI

#### **Multi-Language Support**

- **Bilingual**: English (en-US) and Spanish (es-ES) support
- **Automatic Configuration**: All AI services adapt to selected language
- **Dialect-Aware**: Region-specific pronunciation analysis
- **User Preferences**: Persistent language selection via localStorage

#### **User Management**

- **Firebase Authentication**: Email/password and Google sign-in
- **Profile Completion**: Required name and birthdate collection
- **Route Protection**: Authenticated and non-authenticated route guards
- **User Profiles**: Progress tracking and settings management

### 🎨 User Experience Features

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Animated Feedback**: Visual indicators for recording, processing, and playback
- **Speech Bubbles**: Dynamic conversation display with TTS synchronization
- **Progress Tracking**: User level, phoneme mastery, and exercise completion
- **Settings Management**: Language preferences, profile editing, theme options

---

## 🔧 Installation & Setup

### 1. Dependencies Installation

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create `.env.local` file with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services API Keys
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_key
NEXT_PUBLIC_TOGETHER_API_KEY=your_together_ai_key
NEXT_PUBLIC_SPEECHACE_API_KEY=your_speechace_key
NEXT_PUBLIC_SPEECHACE_USER_ID=your_speechace_user_id
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_google_tts_key

# Language Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,es
NEXT_PUBLIC_SPEECHACE_API_URL=https://api.speechace.co/api/scoring/text/v9/json

# Audio Processing Configuration
NEXT_PUBLIC_SILENCE_THRESHOLD=0.01
NEXT_PUBLIC_SILENCE_DELAY=1000
NEXT_PUBLIC_MAX_SEGMENT_DURATION=12000
NEXT_PUBLIC_MAX_TOTAL_DURATION=60000
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Copy your Firebase configuration to `.env.local`

### 4. API Keys Setup

#### AssemblyAI

- Sign up at [AssemblyAI](https://www.assemblyai.com/)
- Copy your API key from the dashboard

#### Together AI (for DeepSeek)

- Sign up at [Together AI](https://together.ai/)
- Generate an API key for DeepSeek model access

#### SpeechAce

- Sign up at [SpeechAce](https://www.speechace.co/)
- Get your API key and user ID from the dashboard

#### Google Cloud TTS

- Set up a Google Cloud project
- Enable the Text-to-Speech API
- Create a service account and download credentials
- Use the API key in your environment variables

---

## 📁 Project Structure

```
fluensy-app/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── page.tsx                  # Main conversation page
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── globals.css               # Global styles
│   │   ├── login/page.tsx            # Authentication pages
│   │   ├── signup/page.tsx
│   │   ├── complete-profile/page.tsx
│   │   ├── profile/page.tsx          # User profile management
│   │   ├── exercise/page.tsx         # Pronunciation exercises
│   │   └── api/                      # API routes
│   │       ├── assemblyai/route.ts
│   │       ├── google-tts/route.ts
│   │       └── speechace/route.ts
│   ├── components/                   # Reusable React components
│   │   ├── ui/                       # Base UI components
│   │   ├── MicrophoneButton.tsx      # Audio recording component
│   │   ├── PhonemeTraining.tsx       # Phoneme practice interface
│   │   ├── InteractionDecision.tsx   # Training choice component
│   │   ├── TranscriptionDisplay.tsx  # Results display
│   │   ├── BottomNavigation.tsx      # Mobile navigation
│   │   ├── client-layout.tsx         # Client-side layout wrapper
│   │   ├── route-protection.tsx      # Authentication guards
│   │   ├── login-form.tsx            # Authentication forms
│   │   ├── signup-form.tsx
│   │   ├── settings-menu.tsx         # User settings interface
│   │   ├── edit-profile-menu.tsx
│   │   └── language-settings.tsx     # Language selection
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.tsx           # Authentication state
│   │   └── LanguageContext.tsx       # Language preferences
│   ├── lib/                          # Utility libraries
│   │   ├── services/                 # AI service integrations
│   │   │   ├── interaction-flow-manager.ts  # Main orchestrator
│   │   │   ├── audio-processor.ts    # Audio processing pipeline
│   │   │   ├── assemblyai.ts         # Speech transcription
│   │   │   ├── deepseek.ts           # AI conversation & validation
│   │   │   ├── speechace.ts          # Pronunciation analysis
│   │   │   ├── google-tts.ts         # Text-to-speech synthesis
│   │   │   ├── silence-detector.ts   # Audio silence detection
│   │   │   ├── conversation-manager.ts # Conversation state
│   │   │   ├── grading-system.ts     # Pronunciation scoring
│   │   │   └── browser-tts.ts        # Browser TTS fallback
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useDebounce.ts
│   │   └── utils.ts                  # Utility functions
│   ├── firebase.ts                   # Firebase configuration
│   └── middleware.ts                 # Next.js middleware for auth
├── public/                           # Static assets
│   ├── penguin.svg                   # Mascot illustration
│   └── *.svg                         # UI icons
├── components.json                   # Shadcn/ui configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
└── package.json                      # Dependencies and scripts
```

---

## 🤖 AI Services Integration

### 1. AssemblyAI - Speech Recognition

**Purpose**: Converts audio to text with high accuracy
**Features**:

- Real-time transcription
- Language-specific models (English/Spanish)
- Automatic punctuation and formatting
- Speaker diarization support

**Configuration**:

```typescript
const config = {
  speech_model: "best",
  language_code: "en" | "es",
  punctuate: true,
  format_text: true,
};
```

### 2. DeepSeek AI - Conversation & Validation

**Purpose**: Provides conversational AI and transcription validation
**Features**:

- Context-aware responses with emotional understanding
- Transcription error correction
- Mood detection for appropriate TTS voice selection
- Bilingual conversation support

**Models Used**:

- `deepseek-chat` for conversation generation
- Language-specific prompts for validation

### 3. SpeechAce - Pronunciation Analysis

**Purpose**: Professional pronunciation scoring and phoneme analysis
**Features**:

- Word-level and phoneme-level scoring
- Proficiency level assessment (CEFR, IELTS, TOEIC)
- Detailed feedback with improvement suggestions
- Dialect-aware analysis (en-us, es-es)

**Scoring Metrics**:

- Overall pronunciation score (0-100)
- Individual phoneme accuracy
- Fluency and rhythm analysis
- Stress pattern detection

### 4. Google Cloud Text-to-Speech

**Purpose**: High-quality voice synthesis for AI responses
**Features**:

- Natural-sounding voices with emotion
- Language and dialect selection
- Mood-based voice selection
- SSML support for enhanced expression

**Voice Configuration**:

```typescript
{
  languageCode: "en-US" | "es-ES",
  name: voiceMapping[mood][language],
  ssmlGender: "FEMALE" | "MALE"
}
```

---

## 🎵 Audio Processing System

### Processing Pipeline

1. **Recording**: MediaRecorder captures audio in WebM format
2. **Segmentation**: SilenceDetector splits audio at natural pauses
3. **Transcription**: Each segment sent to AssemblyAI
4. **Validation**: DeepSeek corrects transcription errors
5. **Analysis**: SpeechAce provides pronunciation feedback
6. **Combination**: Results merged into final output

### Smart Segmentation Features

- **Silence Detection**: Web Audio API monitors volume levels
- **Automatic Splitting**: Audio divided at natural speech breaks
- **Fallback Timeouts**: 12-second segment limit, 60-second total
- **Concurrent Processing**: Segments processed immediately after recording

### Configuration Options

```typescript
interface AudioConfig {
  silenceThreshold: number; // Volume threshold for silence (0.01)
  silenceDelay: number; // Delay before considering silence (1000ms)
  maxSegmentDuration: number; // Maximum segment length (12000ms)
  maxTotalDuration: number; // Total recording limit (60000ms)
  language: "en" | "es"; // Processing language
}
```

### Performance Optimizations

- **Background Processing**: SpeechAce analysis runs silently
- **Memory Management**: Automatic audio blob cleanup
- **Error Recovery**: Graceful fallbacks for API failures
- **Resource Monitoring**: Browser compatibility checking

---

## 🌍 Multi-Language Support

### Supported Languages

| Language | Code | Dialect | TTS Voices | Status    |
| -------- | ---- | ------- | ---------- | --------- |
| English  | en   | en-us   | Multiple   | ✅ Active |
| Spanish  | es   | es-es   | Multiple   | ✅ Active |

### Language Context Implementation

```typescript
interface LanguageConfig {
  language: "en" | "es";
  displayName: string;
  assemblyAICode: string;
  speechAceDialect: string;
  ttsLanguageCode: string;
}
```

### Automatic Service Configuration

All AI services automatically adapt to the selected language:

- **AssemblyAI**: Uses language-specific transcription models
- **DeepSeek**: Applies language-appropriate prompts and responses
- **SpeechAce**: Configures dialect-specific pronunciation analysis
- **Google TTS**: Selects appropriate voices and language codes

### User Language Selection

Users can switch languages through:

1. Profile → Settings → Language Settings
2. Automatic detection based on browser locale
3. Persistent storage in localStorage
4. Context propagation throughout the application

---

## 💻 Implementation Details

### Interaction Flow Architecture

The application follows a structured 4-step interaction flow:

#### 1. Initial Greeting Sequence ✅

- **20 predefined greetings** per language with random selection
- **Google TTS integration** for audio generation
- **2-second delay** before playback as specified
- **Speech bubble synchronization** with TTS audio

#### 2. User Input Processing ✅

- **Complete pipeline**: Voice → AssemblyAI → DeepSeek → SpeechAce
- **Audio segment aggregation** into full transcription
- **SpeechAce data aggregation** into combined JSON
- **Real-time processing** with visual feedback

#### 3. Follow-up Agent Response ✅

- **Full transcription sent to DeepSeek** for context awareness
- **Contextual response generation** with emotional understanding
- **Mood-based TTS conversion** with appropriate voice selection
- **Automatic audio playback** with speech bubble display

#### 4. Post-Response Interaction Logic ✅

- **Random decision generation (1-3)** for interaction variety
- **Value 1**: Triggers phoneme training opportunity
- **Values 2-3**: Continue conversation with follow-up questions
- **Pronunciation analysis integration** for training recommendations

### State Management

```typescript
type AppState =
  | "waiting_for_penguin_click"
  | "initializing"
  | "greeting"
  | "waiting_for_user"
  | "processing_input"
  | "agent_responding"
  | "interaction_decision"
  | "phoneme_training"
  | "phoneme_feedback";
```

### Error Handling Strategy

- **Graceful Degradation**: Features continue working if individual services fail
- **User-Friendly Messages**: Clear error communication without technical jargon
- **Retry Mechanisms**: Automatic retry for transient failures
- **Fallback Options**: Browser TTS when Google TTS unavailable

---

## 🎪 Interaction Flow

### Complete Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Fluensy
    participant A as AudioProcessor
    participant AI as AI Services

    F->>U: Initial Greeting (Random from 20)
    U->>A: Voice Input
    A->>AI: Transcribe + Validate + Analyze
    AI->>F: Processed Results
    F->>U: Contextual Response
    F->>F: Random Decision (1-3)
    alt Value = 1
        F->>U: Offer Phoneme Training
        U->>F: Accept/Decline
        opt Accept
            F->>U: Practice Phrase
            U->>A: Practice Audio
            A->>AI: Comparative Analysis
            AI->>F: Feedback Results
            F->>U: Improvement Suggestions
        end
    else Value = 2-3
        F->>U: Continue Conversation
    end
```

### Phoneme Training Module

**Trigger Conditions**:

- Random value = 1 (33% chance)
- User has pronunciation data available
- Lowest-scoring word identified from SpeechAce results

**Training Process**:

1. **Identification**: Extract word/phoneme with poor performance
2. **Prompt**: "I noticed you had trouble with [word]. Would you like to practice?"
3. **Choice**: User selects "Yes, practice" or "No, continue"
4. **Practice**: AI provides example phrase with target phoneme
5. **Recording**: User attempts pronunciation
6. **Analysis**: Comparative scoring against AI example
7. **Feedback**: Specific improvement suggestions

### Decision Tree Logic

```typescript
const determineNextInteraction = async (): Promise<InteractionDecision> => {
  const randomValue = Math.floor(Math.random() * 3) + 1;

  if (randomValue === 1 && hasPronunciationData) {
    return {
      shouldOfferPhonemeTraining: true,
      phonemeSession: await generatePhonemeSession(),
    };
  }

  return {
    shouldOfferPhonemeTraining: false,
    followUpQuestions: await generateFollowUpQuestions(),
  };
};
```

---

## 🎨 UI Components

### Core Components

#### **MicrophoneButton**

- **Features**: Recording state management, visual feedback, timer display
- **Modes**: Free speech (transcription) and exercise (fixed ground truth)
- **Integration**: AudioProcessor for advanced processing pipeline

```tsx
<MicrophoneButton
  onTranscriptionStart={handleStart}
  onTranscriptionComplete={handleComplete}
  groundTruthMode="fixed" // or "transcription"
  fixedGroundTruth="Practice phrase"
  isWaitingForUser={true}
  isExternallyProcessing={false}
/>
```

#### **PhonemeTraining**

- **Features**: Interactive pronunciation practice with TTS examples
- **Feedback**: Real-time scoring and improvement suggestions
- **Progress**: Visual indicators for practice completion

#### **InteractionDecision**

- **Purpose**: Present choice between phoneme training and conversation
- **Design**: Clear buttons with explanatory text
- **Integration**: Seamless flow transition

#### **TranscriptionDisplay**

- **Features**: Results display with loading states and audio playback
- **Modes**: Configurable visibility for user transcription
- **Polish**: Professional appearance with processing indicators

### UI/UX Features

- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **Animated Feedback**: Smooth transitions and visual state indicators
- **Accessibility**: Screen reader support and keyboard navigation
- **Loading States**: Clear progress indicators during processing
- **Error States**: User-friendly error messages with recovery options

---

## ⚙️ Environment Configuration

### Required API Keys

```bash
# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=
NEXT_PUBLIC_TOGETHER_API_KEY=
NEXT_PUBLIC_SPEECHACE_API_KEY=
NEXT_PUBLIC_SPEECHACE_USER_ID=
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=

# Application Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,es
NEXT_PUBLIC_SPEECHACE_API_URL=https://api.speechace.co/api/scoring/text/v9/json

# Audio Processing Tuning
NEXT_PUBLIC_SILENCE_THRESHOLD=0.01
NEXT_PUBLIC_SILENCE_DELAY=1000
NEXT_PUBLIC_MAX_SEGMENT_DURATION=12000
NEXT_PUBLIC_MAX_TOTAL_DURATION=60000
```

### Service URLs and Endpoints

- **AssemblyAI**: `https://api.assemblyai.com/v2/`
- **Together AI**: `https://api.together.xyz/v1/`
- **SpeechAce**: `https://api.speechace.co/api/scoring/text/v9/json`
- **Google TTS**: `https://texttospeech.googleapis.com/v1/text:synthesize`

---

## 🧪 API Routes

### `/api/assemblyai`

**Purpose**: Transcription service proxy
**Methods**: POST
**Input**: Audio blob, language configuration
**Output**: Transcribed text with timestamps

### `/api/google-tts`

**Purpose**: Text-to-speech synthesis
**Methods**: POST
**Input**: Text, language, voice name
**Output**: Base64-encoded MP3 audio

### `/api/speechace`

**Purpose**: Pronunciation analysis
**Methods**: POST
**Input**: Audio file, reference text, dialect
**Output**: Detailed pronunciation scores and feedback

### Error Handling

All API routes implement:

- **Input validation** with detailed error messages
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Comprehensive logging** for debugging

---

## 📱 Pages & Navigation

### Page Structure

#### **Homepage (`/`)**

- **Purpose**: Main conversation interface with Fluensy
- **Features**: Interactive chat, phoneme training, audio playback
- **Authentication**: Required

#### **Login (`/login`)**

- **Purpose**: User authentication
- **Features**: Email/password and Google sign-in
- **Authentication**: Redirects if already logged in

#### **Signup (`/signup`)**

- **Purpose**: User registration
- **Features**: Account creation with validation
- **Flow**: Redirects to profile completion

#### **Complete Profile (`/complete-profile`)**

- **Purpose**: Required profile information collection
- **Features**: Name and birthdate input with validation
- **Authentication**: Required, one-time completion

#### **Profile (`/profile`)**

- **Purpose**: User profile management and progress tracking
- **Features**: Settings access, progress display, achievements
- **Authentication**: Required

#### **Exercise (`/exercise`)**

- **Purpose**: Structured pronunciation practice
- **Features**: Fixed-phrase exercises with detailed feedback
- **Authentication**: Required

### Navigation System

#### **Bottom Navigation**

- **Exercise**: Pronunciation practice page
- **Home**: Main conversation interface
- **Profile**: User management and settings

#### **Route Protection**

- **Authenticated Routes**: Redirect to login if not signed in
- **Public Routes**: Login and signup pages
- **Conditional Navigation**: Hide bottom nav on auth pages

---

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Development Workflow

1. **Feature Development**:

   - Create feature branch from `main`
   - Implement feature with TypeScript
   - Add appropriate error handling
   - Test with all AI services

2. **Testing Strategy**:

   - **Unit Tests**: Individual service functions
   - **Integration Tests**: API route functionality
   - **User Testing**: Complete interaction flows
   - **Cross-browser**: MediaRecorder compatibility

3. **Code Standards**:
   - **TypeScript**: Strict type checking enabled
   - **ESLint**: Automated code quality checks
   - **Prettier**: Consistent code formatting
   - **Conventional Commits**: Standardized commit messages

### Debugging Features

- **Console Logging**: Structured logging for development
- **Error Boundaries**: React error catching and reporting
- **Service Validation**: API connectivity testing utilities
- **Audio Debugging**: Visual feedback for audio processing states

---

## 🚢 Deployment

### Production Deployment

#### **Environment Setup**

1. Set up production Firebase project
2. Configure all API keys in production environment
3. Update CORS settings for production domain
4. Enable analytics and monitoring

#### **Vercel Deployment** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... (repeat for all environment variables)
```

#### **Manual Deployment**

```bash
# Build for production
npm run build

# Export static files (if needed)
npm run export

# Deploy build folder to hosting service
```

### Performance Optimization

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **API Route Caching**: Appropriate cache headers
- **CDN Integration**: Static asset delivery optimization

### Monitoring & Analytics

- **Error Tracking**: Console error logging and reporting
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Firebase Analytics integration
- **API Usage**: Monitor service usage and costs

---

## 🔍 Troubleshooting

### Common Issues

#### **Audio Recording Problems**

- **Issue**: Microphone not working
- **Solution**: Check browser permissions, HTTPS requirement
- **Debug**: Test with `navigator.mediaDevices.getUserMedia()`

#### **API Service Errors**

- **Issue**: Transcription or TTS failing
- **Solution**: Verify API keys, check network connectivity
- **Debug**: Monitor browser network tab for failed requests

#### **Authentication Issues**

- **Issue**: Login not working
- **Solution**: Check Firebase configuration, clear browser cache
- **Debug**: Verify Firebase project settings

#### **Performance Issues**

- **Issue**: Slow processing or audio delays
- **Solution**: Check audio configuration, reduce segment duration
- **Debug**: Monitor console for processing times

### Debug Tools

#### **Console Commands**

```javascript
// Check audio support
navigator.mediaDevices.enumerateDevices();

// Test API connectivity
fetch("/api/google-tts", {
  method: "POST",
  body: JSON.stringify({ text: "test" }),
});

// Clear user data
localStorage.clear();
```

#### **Environment Validation**

```bash
# Check environment variables
npm run env:check

# Validate API keys
npm run validate:apis

# Test audio processing
npm run test:audio
```

### Support Resources

- **Documentation**: Complete API documentation in `/docs`
- **Examples**: Code examples in `/examples`
- **Community**: GitHub Discussions for community support
- **Issues**: GitHub Issues for bug reports and feature requests

---

## 📈 Performance Metrics

### System Performance

- **Audio Processing**: 2-3 second segments with < 500ms latency
- **API Response Times**:
  - AssemblyAI: 1-3 seconds for transcription
  - DeepSeek: 2-5 seconds for response generation
  - SpeechAce: 3-7 seconds for analysis
  - Google TTS: 1-2 seconds for synthesis

### User Experience Metrics

- **Time to First Interaction**: < 3 seconds
- **Recording Start Latency**: < 200ms
- **Audio Playback Delay**: < 100ms
- **Page Load Speed**: < 2 seconds

### Optimization Strategies

- **Concurrent Processing**: Multiple segments processed simultaneously
- **Caching**: TTS audio cached for repeated phrases
- **Progressive Loading**: Critical features load first
- **Background Processing**: Non-blocking pronunciation analysis

---

**Built with ❤️ by the Fluensy Team**

For support, feature requests, or contributions, please visit our [GitHub repository](https://github.com/yourusername/fluensy-app).

## 🔒 Security Considerations

Fluensy prioritizes user data security and system integrity through comprehensive security measures.

### Authentication & Authorization

- **Firebase Authentication**: Secure user authentication with email/password and social login options
- **JWT Token Handling**: Secure token storage and validation
- **Role-Based Access Control**: Different permission levels for users and administrators
- **Session Management**: Secure session handling with appropriate timeout settings
- **Account Recovery**: Secure password reset mechanism

### Data Security

- **Data Encryption**: All sensitive data is encrypted in transit (HTTPS/TLS) and at rest
- **Secure Storage**: User data and recordings are stored with appropriate access controls
- **Audio Data Handling**: Temporary storage of voice recordings with automatic purging
- **Privacy Controls**: Users can delete their data and voice recordings at any time
- **Data Minimization**: Only collecting data necessary for the application's functionality

### API Security

- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Input Validation**: All user inputs are validated and sanitized
- **CORS Configuration**: Proper Cross-Origin Resource Sharing settings
- **API Keys Management**: Secure handling of third-party API credentials
- **Request Authentication**: All API requests are authenticated and authorized

### Third-Party Services

- **Service Provider Security**: Evaluation of security practices of integrated services
- **Data Processing Agreements**: Compliance with data protection regulations
- **Limited Permissions**: Minimal access permissions for third-party integrations
- **Regular Audits**: Periodic review of third-party service security posture

### Compliance

- **GDPR Compliance**: Data protection measures aligned with European regulations
- **COPPA Considerations**: Special protections for users under 13 years of age
- **Accessibility Standards**: WCAG 2.1 compliance for accessibility
- **Privacy Policy**: Clear and transparent privacy policy
- **Terms of Service**: Comprehensive terms of service agreement

### Development Practices

- **Secure Coding Guidelines**: Following OWASP top 10 recommendations
- **Code Reviews**: Security-focused code review process
- **Dependency Scanning**: Regular vulnerability scanning of dependencies
- **Security Testing**: Penetration testing and security assessments
- **Secret Management**: Secure handling of credentials and secrets

### Reporting Security Issues

If you discover a security vulnerability within Fluensy, please send an email to security@fluensy.com. All security vulnerabilities will be promptly addressed.

## 📊 Analytics & Monitoring

Fluensy implements comprehensive analytics and monitoring to track application performance, user engagement, and system health.

### User Analytics

#### Session Metrics
- **Active Users**: Daily, weekly, and monthly active user tracking
- **Session Duration**: Average time spent in learning sessions
- **Feature Usage**: Tracking which features are most utilized
- **User Pathways**: Common navigation patterns through the application
- **Conversion Rates**: User progression from signup to active learning

#### Learning Analytics
- **Exercise Completion**: Tracking completed exercises and lessons
- **Pronunciation Improvement**: Measuring progress in pronunciation accuracy over time
- **Phoneme Mastery**: Individual phoneme proficiency tracking
- **Learning Efficiency**: Time spent vs. improvement metrics
- **Exercise Difficulty Analysis**: Success rates at different difficulty levels

### Performance Monitoring

#### Application Performance
- **Page Load Times**: Tracking initial load and navigation speeds
- **API Response Times**: Monitoring backend API performance
- **Resource Utilization**: CPU, memory, and network usage
- **Error Rates**: Tracking application errors and exceptions
- **Browser Compatibility**: Performance across different browsers and devices

#### AI Service Performance
- **Speech Recognition Accuracy**: AssemblyAI transcription quality metrics
- **Speech Analysis Latency**: SpeechAce response time tracking
- **TTS Generation Speed**: Google TTS performance metrics
- **AI Response Quality**: User satisfaction with Gemini AI responses
- **AI Service Availability**: Uptime monitoring for third-party AI services

### Implementation

- **Application Monitoring**: Vercel Analytics for Next.js performance
- **Error Tracking**: Sentry for real-time error monitoring
- **User Analytics**: Google Analytics 4 for user behavior tracking
- **Custom Events**: Custom event tracking for learning-specific metrics
- **Performance Testing**: Lighthouse CI for automated performance assessments

## 🧩 Extending Fluensy

Fluensy is designed with extensibility in mind, following a modular architecture that allows for easy expansion of its capabilities.

### Extension Points

#### 1. Adding New Languages

To add support for a new language:

1. Create a new translation file in `messages/[lang].json`
2. Update the language selector component in `src/components/language-settings.tsx`
3. Add language-specific phoneme mappings in the phoneme evaluation system
4. Extend the TTS configuration to support the new language in `src/lib/services/google-tts.ts`
5. Test the language with SpeechAce to ensure pronunciation analysis support

#### 2. Integrating New AI Services

To integrate an alternative or additional AI service:

1. Create a new service file in `src/lib/services/`
2. Implement the required interfaces to maintain compatibility
3. Update the service factory in the relevant manager class
4. Add appropriate configuration in environment variables
5. Update the API routes if necessary to support the new service

#### 3. Creating Custom Exercise Types

To add a new exercise type:

1. Define the exercise type interface in `src/lib/types/`
2. Create exercise generation logic in `src/lib/services/exercise-generator.ts`
3. Implement a new exercise component in `src/components/exercises/`
4. Add the exercise type to the exercise selection UI
5. Update the progress tracking to support the new exercise type

#### 4. Enhancing the Phoneme Evaluation System

To extend the phoneme evaluation capabilities:

1. Add new phoneme statistics metrics in the User model
2. Extend the evaluation algorithm in `src/lib/services/phoneme-evaluation.ts`
3. Create additional visualization components for the new metrics
4. Update the user profile page to display the new phoneme insights
5. Add API endpoints to support the extended functionality

#### 5. Customizing the UI

To customize the user interface:

1. Modify the theme configuration in `tailwind.config.js`
2. Create or update components in `src/components/ui/`
3. Customize the layout components for specific pages
4. Update animation and transition effects in the relevant components
5. Ensure responsive design across different device sizes

### Best Practices for Extensions

- Keep extensions modular and well-documented
- Follow the existing naming conventions and file structure
- Create clear interfaces for your extension points
- Use dependency injection to maintain loose coupling
- Ensure all UI extensions meet WCAG 2.1 AA standards
- Test with screen readers and keyboard navigation
- Create unit tests for new service implementations

## 📝 Contributing

Thank you for your interest in contributing to Fluensy! We welcome contributions from everyone.

### How to Contribute

There are many ways to contribute to Fluensy:

- Reporting bugs
- Suggesting enhancements
- Writing or improving documentation
- Fixing bugs
- Implementing features
- Helping with code reviews
- Answering questions in issues

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Create a new branch** for your contribution
4. **Make your changes** following our coding standards
5. **Write or update tests** as necessary
6. **Run tests** to make sure everything passes
7. **Commit your changes** with clear, descriptive commit messages
8. **Push to your fork** and submit a pull request

### Development Environment Setup

```bash
# Clone your fork
git clone https://github.com/your-username/fluensy-app.git
cd fluensy-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

For full contribution guidelines, please see our [detailed contribution guide](./CONTRIBUTING.md).

## 📜 License

Fluensy is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Fluensy Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🗣️ Phoneme Evaluation System

Fluensy features a sophisticated phoneme evaluation system that tracks user progress on individual speech sounds and provides personalized feedback.

### Overview

The phoneme evaluation system analyzes user pronunciation at the phoneme level, tracking progress for each sound and providing detailed insights for improvement. The system uses the CMU Pronouncing Dictionary to map words to their constituent phonemes using the ARPAbet notation system.

### Core Features Implemented

#### **Enhanced User Model** (`backend/models/User.js`)

- Added `phonemeStats` field to track detailed phoneme performance
- Each phoneme tracks:
  - **Points**: Dynamic scoring based on performance
  - **Count**: Number of practice attempts
  - **Streak**: Consecutive good/bad performance tracking
  - **Flexibility**: Age-adjusted multiplier (10x for new accounts, decreasing over time)
  - **Learning Rate**: Calculated from streak, flexibility, and performance
  - **Average Score**: Running average of all attempts
  - **Last Updated**: Timestamp tracking

#### **Phoneme Evaluation Service** (`src/lib/services/phoneme-evaluation.ts`)

- **CMU Dictionary Integration**: Extracts all unique phonemes from the dictionary
- **IPA to ARPAbet Mapping**: Converts SpeechAce phonemes to CMU Dictionary format
- **Performance Analysis**: Processes SpeechAce results and calculates phoneme scores
- **Word Difficulty Analysis**: Categorizes words as easy/medium/hard based on phoneme complexity

#### **Backend API Routes** (`backend/routes/users.js`)

- `POST /phonemes/initialize`: Initialize all phonemes for a new user
- `POST /phonemes/evaluate`: Update phoneme scores after speech analysis
- `GET /users/:id/phonemes/performance`: Get user's phoneme performance summary

#### **Frontend Integration**

- **Automatic Phoneme Initialization**: New users get all phonemes initialized
- **Real-time Evaluation**: After each SpeechAce analysis, phoneme scores are updated
- **Phoneme Progress Dashboard**: Shows all phonemes with detailed statistics
- **Performance Categories**: Filter by All/Strong/Weak phonemes
- **Visual Progress Tracking**: Color-coded points, streaks, and scores

### Key Features

- **Personalized Phoneme Tracking**: Each user has a unique phoneme statistics profile that evolves as they practice
- **Performance Analytics**: Visual reports showing strong and weak phonemes with progress metrics
- **Adaptive Learning Algorithm**: Points and streaks system with learning rate adjustment based on user performance
- **ARPAbet/IPA Mapping**: Seamless conversion between different phonetic notation systems
- **Word Difficulty Analysis**: Classification of words based on phoneme complexity

### Usage

```javascript
// Initialize user phoneme stats
const uniquePhonemes = PhonemeEvaluationService.getUniquePhonemes();
await PhonemeEvaluationService.initializeUserPhonemes(userId, uniquePhonemes);

// Update phoneme stats after speech analysis
const phonemeScores = PhonemeEvaluationService.extractPhonemeScores(speechAceResult, "word");
await PhonemeEvaluationService.updateUserPhonemeEvaluation(userId, phonemeScores);

// Get performance summary
const summary = await PhonemeEvaluationService.getUserPhonemePerformance(userId);
```

## 🌐 Internationalization

Fluensy supports multiple languages through a comprehensive internationalization (i18n) strategy.

### Next.js Built-in i18n (Recommended)

#### Why This Approach:

- Built into Next.js 13+
- SEO-friendly with proper URL routing (`/en/`, `/es/`, `/fr/`)
- Server-side rendering support
- Automatic locale detection

#### Implementation Steps:

1. **Install Dependencies**

```bash
npm install next-intl
```

2. **Update next.config.js**

```javascript
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
```

3. **Create Translation Files**

```
messages/
├── en.json
├── es.json
└── fr.json
```

4. **Set up i18n Middleware**

Create a middleware file to handle locale detection and routing.

5. **Create Localized Routes**

Structure your pages to support dynamic locale routing.

### Translation Management

- **Translation Keys**: Use hierarchical structure for better organization
- **Variables**: Support for dynamic content within translations
- **Formatting**: Date, number, and currency formatting based on locale
- **Fallbacks**: Default language fallback for missing translations

## 💾 MongoDB Integration

Fluensy integrates with MongoDB Atlas for data persistence, providing a robust database solution for user data storage.

### Testing the Complete Integration

#### Current Status

- ✅ **Backend Running**: http://localhost:5000
- ✅ **Frontend Running**: http://localhost:3001
- ✅ **MongoDB Connected**: fluensy.t3hyga1.mongodb.net
- ✅ **API Endpoints Working**: All user management endpoints tested

#### Test Scenarios

1. **New User Signup**
   - User created in Firebase Authentication
   - User profile automatically created in MongoDB
   - Both systems are synced

2. **Existing User Login**
   - Firebase authenticates the user
   - MongoDB profile is automatically loaded
   - User data is synced between both systems

3. **Profile Editing**
   - Changes saved to Firebase (display name, email, password)
   - Changes saved to MongoDB (all profile data)
   - Both systems stay in sync

4. **Account Deletion**
   - User deleted from MongoDB first
   - Then deleted from Firebase
   - All data is completely removed

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

### Data Flow

```
User Action → Firebase Auth → AuthContext → UserService → MongoDB Atlas
                     ↓                          ↓
              Frontend State ←  Sync Data  ←  Backend API
```
