const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Create a new user (called when Firebase user is created)
router.post("/users", async (req, res) => {
  try {
    const { firebaseUID, name, username, email, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUID });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
        user: existingUser,
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({
      username: username?.toLowerCase(),
    });
    if (existingUsername) {
      return res.status(400).json({
        error: "Username already taken",
      });
    }

    // Create new user
    const user = new User({
      firebaseUID,
      name: name || "User", // Provide default name if empty
      username: username?.toLowerCase() || `user_${Date.now()}`, // Generate username if empty
      email: email?.toLowerCase(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    // Check if profile is complete
    user.checkProfileCompletion();

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
});

// Get user by Firebase UID
router.get("/users/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
});

// Update user profile
router.put("/users/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const updateData = req.body;

    console.log("🔄 Updating user:", {
      firebaseUID,
      updateData: JSON.stringify(updateData, null, 2),
    });

    // Remove fields that shouldn't be updated directly
    delete updateData.firebaseUID;
    delete updateData.createdAt;
    delete updateData._id;

    // Ensure we don't update with empty required fields
    if (updateData.name === "") {
      delete updateData.name;
    }
    if (updateData.username === "") {
      delete updateData.username;
    }

    // Handle username change
    if (updateData.username) {
      updateData.username = updateData.username.toLowerCase();

      // Check if new username is already taken (by someone else)
      const existingUsername = await User.findOne({
        username: updateData.username,
        firebaseUID: { $ne: firebaseUID },
      });

      if (existingUsername) {
        return res.status(400).json({
          error: "Username already taken",
        });
      }
    }

    // Handle email change
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    // Handle date of birth
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const user = await User.findOneAndUpdate({ firebaseUID }, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("📝 Update result:", {
      userFound: !!user,
      firebaseUID,
      updatedFields: user ? Object.keys(updateData) : "no user found",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if profile is complete after update
    user.checkProfileCompletion();
    await user.save();

    res.json({
      message: "User updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Failed to update user",
      details: error.message,
    });
  }
});

// Delete user
router.delete("/users/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    const user = await User.findOneAndDelete({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUser: user,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: "Failed to delete user",
      details: error.message,
    });
  }
});

// Update user session statistics
router.post("/users/:firebaseUID/session", async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const { sessionMinutes } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update session stats and streak
    user.updateStats(sessionMinutes || 0);
    user.updateStreak();

    await user.save();

    res.json({
      message: "Session updated successfully",
      stats: {
        totalSessions: user.totalSessions,
        totalMinutesSpent: user.totalMinutesSpent,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      error: "Failed to update session",
      details: error.message,
    });
  }
});

// Add completed exercise
router.post("/users/:firebaseUID/exercises", async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const { exerciseType, score, feedback } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.completedExercises.push({
      exerciseType,
      completedAt: new Date(),
      score,
      feedback,
    });

    await user.save();

    res.json({
      message: "Exercise added successfully",
      exerciseCount: user.completedExercises.length,
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    res.status(500).json({
      error: "Failed to add exercise",
      details: error.message,
    });
  }
});

// Update phoneme progress
router.put("/users/:firebaseUID/phonemes/:phoneme", async (req, res) => {
  try {
    const { firebaseUID, phoneme } = req.params;
    const { level, accuracy } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.phonemeProgress.set(phoneme, {
      level: level || 1,
      accuracy: accuracy || 0,
      lastPracticed: new Date(),
    });

    await user.save();

    res.json({
      message: "Phoneme progress updated successfully",
      phonemeProgress: user.phonemeProgress.get(phoneme),
    });
  } catch (error) {
    console.error("Error updating phoneme progress:", error);
    res.status(500).json({
      error: "Failed to update phoneme progress",
      details: error.message,
    });
  }
});

// Check username availability
router.get("/users/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    res.json({
      available: !existingUser,
      username: username.toLowerCase(),
    });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({
      error: "Failed to check username",
      details: error.message,
    });
  }
});

module.exports = router;
