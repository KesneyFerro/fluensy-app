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

    // Enhanced phoneme evaluation system
    phonemeStats: {
      type: Map,
      of: {
        points: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        streak: { type: Number, default: 0 }, // positive for good performance, 0 for bad
        flexibility: { type: Number, default: 10 }, // initial 10x multiplier
        learningRate: { type: Number, default: 1 }, // base learning rate
        averageScore: { type: Number, default: 0 }, // running average
        totalScore: { type: Number, default: 0 }, // sum of all scores for average calculation
        lastUpdated: { type: Date, default: Date.now },
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

// Method to initialize phonemes for a new user
userSchema.methods.initializePhonemes = function (phonemeList) {
  if (!this.phonemeStats) {
    this.phonemeStats = new Map();
  }

  // Check if phonemes are already initialized
  if (this.phonemeStats.size > 0) {
    console.log(
      `User ${this.firebaseUID} already has ${this.phonemeStats.size} phonemes initialized`
    );
    return;
  }

  phonemeList.forEach((phoneme) => {
    if (!this.phonemeStats.has(phoneme)) {
      this.phonemeStats.set(phoneme, {
        points: 0,
        count: 0,
        streak: 0,
        flexibility: 10, // initial 10x multiplier for newer accounts
        learningRate: 1,
        averageScore: 0,
        totalScore: 0,
        lastUpdated: new Date(),
      });
    }
  });

  console.log(
    `Initialized ${phonemeList.length} phonemes for user ${this.firebaseUID}`
  );
};

// Method to update phoneme evaluation
userSchema.methods.updatePhonemeEvaluation = function (phonemeScores) {
  if (!this.phonemeStats) {
    this.phonemeStats = new Map();
  }

  // Calculate account age factor for flexibility adjustment
  const accountAge = Math.floor(
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)
  ); // days
  const ageFactor = Math.max(0.1, 1 - accountAge * 0.01); // Decreases flexibility over time

  Object.entries(phonemeScores).forEach(([phoneme, score]) => {
    let stats = this.phonemeStats.get(phoneme);

    if (!stats) {
      // Initialize if phoneme doesn't exist
      stats = {
        points: 0,
        count: 0,
        streak: 0,
        flexibility: 10 * ageFactor, // Age-adjusted flexibility
        learningRate: 1,
        averageScore: 0,
        totalScore: 0,
        lastUpdated: new Date(),
      };
    }

    // Update count and total score
    stats.count += 1;
    stats.totalScore += score;
    stats.averageScore = stats.totalScore / stats.count;

    // Update streak based on performance
    const performanceThreshold = 80; // 80% threshold
    if (score >= performanceThreshold) {
      // Good performance
      if (stats.streak < 0) {
        stats.streak = 1; // Reset from negative streak
      } else {
        stats.streak += 1; // Continue positive streak
      }
    } else {
      // Poor performance
      stats.streak = 0; // Reset streak to 0 for bad performance
    }

    // Calculate learning rate based on streak and flexibility
    const streakBonus = Math.max(0, stats.streak * 0.1); // Bonus for positive streaks
    stats.learningRate = 1 + stats.flexibility * 0.1 + streakBonus;

    // Update flexibility based on streak (higher streak = more stable, less flexible)
    if (stats.streak > 5) {
      stats.flexibility = Math.max(1, stats.flexibility * 0.95); // Reduce flexibility for consistent performers
    } else if (stats.streak === 0) {
      stats.flexibility = Math.min(15, stats.flexibility * 1.05); // Increase flexibility for poor performers
    }

    // Calculate performance change and update points
    // Update points based on performance
    if (stats.averageScore < performanceThreshold) {
      // Decrease points for poor performance
      const decreaseRate =
        ((performanceThreshold - stats.averageScore) / 100) * stats.flexibility;
      stats.points = Math.max(0, stats.points - decreaseRate);
    } else {
      // Increase points for good performance
      const increaseRate =
        ((stats.averageScore - performanceThreshold) / 100) *
        stats.learningRate;
      stats.points += increaseRate;
    }

    stats.lastUpdated = new Date();
    this.phonemeStats.set(phoneme, stats);
  });

  return this.phonemeStats;
};

// Method to get phoneme performance summary
userSchema.methods.getPhonemePerformanceSummary = function () {
  if (!this.phonemeStats || this.phonemeStats.size === 0) {
    return {
      totalPhonemes: 0,
      averagePoints: 0,
      strongPhonemes: [],
      weakPhonemes: [],
      totalPracticeCount: 0,
    };
  }

  const phonemeArray = Array.from(this.phonemeStats.entries()).map(
    ([phoneme, stats]) => ({
      phoneme,
      ...stats,
    })
  );

  const totalPracticeCount = phonemeArray.reduce((sum, p) => sum + p.count, 0);
  const averagePoints =
    phonemeArray.reduce((sum, p) => sum + p.points, 0) / phonemeArray.length;

  // Sort by points to identify strong and weak phonemes
  phonemeArray.sort((a, b) => b.points - a.points);

  const strongPhonemes = phonemeArray.slice(0, 5).map((p) => ({
    phoneme: p.phoneme,
    points: p.points,
    averageScore: p.averageScore,
    streak: p.streak,
  }));

  const weakPhonemes = phonemeArray
    .slice(-5)
    .reverse()
    .map((p) => ({
      phoneme: p.phoneme,
      points: p.points,
      averageScore: p.averageScore,
      streak: p.streak,
    }));

  return {
    totalPhonemes: phonemeArray.length,
    averagePoints,
    strongPhonemes,
    weakPhonemes,
    totalPracticeCount,
  };
};

module.exports = mongoose.model("User", userSchema);
