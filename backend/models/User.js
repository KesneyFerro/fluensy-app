const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Firebase UID for linking with Firebase authentication
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User profile information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    dateOfBirth: {
      type: Date,
      required: false,
    },

    birthDate: {
      type: Date,
      required: false,
    },

    // User preferences and settings
    language: {
      type: String,
      default: "en",
      enum: ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"],
    },

    nativeLanguage: {
      type: String,
      default: "en",
      enum: ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"],
    },

    // Learning progress and statistics
    totalSessions: {
      type: Number,
      default: 0,
    },

    totalMinutesSpent: {
      type: Number,
      default: 0,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    // Exercise progress
    completedExercises: [
      {
        exerciseType: String,
        completedAt: Date,
        score: Number,
        feedback: String,
      },
    ],

    // Phoneme training progress
    phonemeProgress: {
      type: Map,
      of: {
        level: Number,
        accuracy: Number,
        lastPracticed: Date,
      },
      default: new Map(),
    },

    // Account settings
    profilePicture: {
      type: String,
      default: null,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function () {
  this.isProfileComplete = !!(
    this.name &&
    this.username &&
    this.email &&
    this.dateOfBirth
  );
  return this.isProfileComplete;
};

// Method to update user statistics
userSchema.methods.updateStats = function (sessionMinutes) {
  this.totalSessions += 1;
  this.totalMinutesSpent += sessionMinutes;
  this.lastLoginAt = new Date();
};

// Method to update streak
userSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastLogin = new Date(this.lastLoginAt);
  const daysDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.currentStreak = 1;
  }
  // If daysDiff === 0, it's the same day, so don't change streak
};

module.exports = mongoose.model("User", userSchema);
