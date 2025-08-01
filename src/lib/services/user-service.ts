// Backend API service for user management
// This service handles communication between your Next.js frontend and the MongoDB backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

console.log("🔧 UserService Configuration:", {
  API_BASE_URL,
  env: process.env.NEXT_PUBLIC_BACKEND_URL,
  nodeEnv: process.env.NODE_ENV,
});

export interface UserProfile {
  firebaseUID: string;
  name: string;
  username: string;
  email: string;
  dateOfBirth?: string;
  language?: string;
  nativeLanguage?: string;
  profilePicture?: string;
  isProfileComplete?: boolean;
  totalSessions?: number;
  totalMinutesSpent?: number;
  currentStreak?: number;
  longestStreak?: number;
  completedExercises?: Array<{
    exerciseType: string;
    completedAt: Date;
    score: number;
    feedback: string;
  }>;
  phonemeProgress?: Map<
    string,
    {
      level: number;
      accuracy: number;
      lastPracticed: Date;
    }
  >;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  // Local storage management fields
  _localTimestamp?: number;
  _locallyModified?: boolean;
}

class UserService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 API Request:", {
      url,
      method: options.method || "GET",
      endpoint,
    });

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      console.log("📡 API Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
        });
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ API Success:", { endpoint, dataKeys: Object.keys(data) });
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("🌐 Network Error - Backend may be down:", {
          url,
          backendUrl: API_BASE_URL,
          error: error.message,
        });
        throw new Error(
          "Failed to connect to backend server. Please ensure the backend is running on port 5000."
        );
      }

      console.error(`❌ API request failed for ${endpoint}:`, error);
      console.error("Network details:", {
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  // Create a new user in MongoDB when they sign up with Firebase
  async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    return this.makeRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Get user profile by Firebase UID
  async getUserProfile(firebaseUID: string): Promise<UserProfile> {
    return this.makeRequest(`/users/${firebaseUID}`);
  }

  // Update user profile
  async updateUserProfile(
    firebaseUID: string,
    updateData: Partial<UserProfile>
  ): Promise<UserProfile> {
    return this.makeRequest(`/users/${firebaseUID}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Delete user account
  async deleteUser(firebaseUID: string): Promise<{ message: string }> {
    return this.makeRequest(`/users/${firebaseUID}`, {
      method: "DELETE",
    });
  }

  // Update session statistics
  async updateSession(
    firebaseUID: string,
    sessionMinutes: number
  ): Promise<{
    totalSessions: number;
    totalMinutesSpent: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    return this.makeRequest(`/users/${firebaseUID}/session`, {
      method: "POST",
      body: JSON.stringify({ sessionMinutes }),
    });
  }

  // Add completed exercise
  async addCompletedExercise(
    firebaseUID: string,
    exerciseData: {
      exerciseType: string;
      score: number;
      feedback: string;
    }
  ): Promise<{ message: string; exerciseCount: number }> {
    return this.makeRequest(`/users/${firebaseUID}/exercises`, {
      method: "POST",
      body: JSON.stringify(exerciseData),
    });
  }

  // Update phoneme progress
  async updatePhonemeProgress(
    firebaseUID: string,
    phoneme: string,
    progressData: {
      level: number;
      accuracy: number;
    }
  ): Promise<{ message: string; phonemeProgress: any }> {
    return this.makeRequest(`/users/${firebaseUID}/phonemes/${phoneme}`, {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
  }

  // Check username availability
  async checkUsernameAvailability(
    username: string
  ): Promise<{ available: boolean; username: string }> {
    return this.makeRequest(`/users/check-username/${username}`);
  }

  // Sync Firebase user with MongoDB user
  async syncFirebaseUser(firebaseUser: any): Promise<UserProfile> {
    try {
      // Try to get existing user first
      const existingUser = await this.getUserProfile(firebaseUser.uid);
      return existingUser;
    } catch (error: any) {
      // If user doesn't exist, create a new one
      if (
        error.message?.includes("User not found") ||
        error.message?.includes("404")
      ) {
        const newUser = await this.createUser({
          firebaseUID: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          username: firebaseUser.email?.split("@")[0] || "", // Default username from email
        });
        return newUser;
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Helper method to check if backend is healthy
  async checkHealth(): Promise<{ status: string; database: string }> {
    const url = `${API_BASE_URL.replace("/api", "")}/health`;
    const response = await fetch(url);
    return response.json();
  }
}

export const userService = new UserService();
export default userService;
