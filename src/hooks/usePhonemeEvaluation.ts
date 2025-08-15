import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PhonemeEvaluationService } from "@/lib/services/phoneme-evaluation";

/**
 * Hook to initialize phonemes for new users
 */
export function usePhonemeInitialization() {
  const { user } = useAuth();

  useEffect(() => {
    const initializeUserPhonemes = async () => {
      if (!user) return;

      try {
        // Get unique phonemes from the CMU Dictionary
        const uniquePhonemes = PhonemeEvaluationService.getUniquePhonemes();

        // Initialize phonemes for the user
        await PhonemeEvaluationService.initializeUserPhonemes(
          user.uid,
          uniquePhonemes
        );

        console.log(`Initialized ${uniquePhonemes.length} phonemes for user`);
      } catch (error) {
        // Check if error is because phonemes are already initialized or another reason
        if (error instanceof Error) {
          if (error.message.includes("already")) {
            console.log("Phonemes already initialized for user");
          } else {
            console.error("Error initializing user phonemes:", error);
          }
        }
      }
    };

    initializeUserPhonemes();
  }, [user]);
}

/**
 * Hook to get user's phoneme performance
 */
export function usePhonemePerformance() {
  const { user } = useAuth();

  const getPerformance = async () => {
    if (!user) return null;

    try {
      return await PhonemeEvaluationService.getUserPhonemePerformance(user.uid);
    } catch (error) {
      console.error("Error fetching phoneme performance:", error);
      return null;
    }
  };

  return { getPerformance };
}
