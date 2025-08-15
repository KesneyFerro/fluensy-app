import { SpeechAceResult } from "./speechace";
import cmuDict from "@/data/cmu_dict.json";

export interface PhonemeScore {
  phoneme: string;
  score: number;
  word: string;
}

export interface PhonemeEvaluationResult {
  phonemeScores: Record<string, number>;
  overallPerformance: number;
  phonemeBreakdown: PhonemeScore[];
}

export class PhonemeEvaluationService {
  /**
   * Extract phoneme scores from SpeechAce results
   */
  extractPhonemeScores(
    speechAceResults: SpeechAceResult[]
  ): PhonemeEvaluationResult {
    const phonemeScores: Record<string, number[]> = {};
    const phonemeBreakdown: PhonemeScore[] = [];
    let totalScore = 0;
    let totalCount = 0;

    // Process each SpeechAce result
    speechAceResults.forEach((result) => {
      if (!result.word_score_list) return;

      result.word_score_list.forEach((wordScore) => {
        if (!wordScore.phone_score_list) return;

        wordScore.phone_score_list.forEach((phoneScore) => {
          const speechAcePhoneme = phoneScore.phone;
          const score = phoneScore.quality_score;

          // Map SpeechAce phoneme to ARPAbet for consistency
          const arpabetPhoneme =
            PhonemeEvaluationService.mapSpeechAceToArpabet(speechAcePhoneme);

          // Initialize phoneme array if it doesn't exist
          if (!phonemeScores[arpabetPhoneme]) {
            phonemeScores[arpabetPhoneme] = [];
          }

          phonemeScores[arpabetPhoneme].push(score);
          phonemeBreakdown.push({
            phoneme: arpabetPhoneme,
            score,
            word: wordScore.word,
          });

          totalScore += score;
          totalCount++;
        });
      });
    });

    // Calculate average scores for each phoneme
    const averagedPhonemeScores: Record<string, number> = {};
    Object.entries(phonemeScores).forEach(([phoneme, scores]) => {
      averagedPhonemeScores[phoneme] =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const overallPerformance = totalCount > 0 ? totalScore / totalCount : 0;

    return {
      phonemeScores: averagedPhonemeScores,
      overallPerformance,
      phonemeBreakdown,
    };
  }

  /**
   * Get phonemes for a specific word using CMU Dictionary
   */
  static getWordPhonemes(word: string): string[] {
    const upperWord = word.toUpperCase();
    const phoneSeq = cmuDict[upperWord as keyof typeof cmuDict];

    if (!phoneSeq) {
      console.warn(`Word "${word}" not found in CMU Dictionary`);
      return [];
    }

    // Remove stress markers and return base phonemes
    return phoneSeq.map((phone: string) => phone.replace(/[012]$/, ""));
  }

  /**
   * Analyze word difficulty based on phoneme complexity
   */
  static analyzeWordDifficulty(word: string): {
    phonemes: string[];
    difficulty: "easy" | "medium" | "hard";
    complexPhonemes: string[];
  } {
    const phonemes = this.getWordPhonemes(word);

    // Define complex phonemes that are typically harder to pronounce
    const complexPhonemes = ["TH", "DH", "ZH", "NG", "CH", "JH", "AXR", "ER"];
    const foundComplexPhonemes = phonemes.filter((p) =>
      complexPhonemes.includes(p)
    );

    let difficulty: "easy" | "medium" | "hard" = "easy";

    if (phonemes.length > 6 || foundComplexPhonemes.length > 2) {
      difficulty = "hard";
    } else if (phonemes.length > 3 || foundComplexPhonemes.length > 0) {
      difficulty = "medium";
    }

    return {
      phonemes,
      difficulty,
      complexPhonemes: foundComplexPhonemes,
    };
  }

  /**
   * Get unique phonemes from the CMU Dictionary
   */
  static getUniquePhonemes(customPhonemeData?: any[]): string[] {
    // If custom phoneme data is provided, use it
    if (customPhonemeData && Array.isArray(customPhonemeData)) {
      const uniquePhonemes = new Set<string>();

      customPhonemeData.forEach((item) => {
        // Handle different possible structures
        if (typeof item === "string") {
          uniquePhonemes.add(item);
        } else if (item.phoneme) {
          uniquePhonemes.add(item.phoneme);
        } else if (item.phonemes && Array.isArray(item.phonemes)) {
          item.phonemes.forEach((phoneme: string) => {
            uniquePhonemes.add(phoneme);
          });
        }
      });

      return Array.from(uniquePhonemes);
    }

    // Extract unique phonemes from CMU Dictionary
    const uniquePhonemes = new Set<string>();

    Object.values(cmuDict).forEach((phoneSeq: string[]) => {
      phoneSeq.forEach((phone: string) => {
        // Remove stress markers (0, 1, 2) from vowels to get base phoneme
        const basePhoneme = phone.replace(/[012]$/, "");
        uniquePhonemes.add(basePhoneme);
      });
    });

    return Array.from(uniquePhonemes).sort();
  }

  /**
   * Map SpeechAce phonemes to CMU Dictionary phonemes
   * SpeechAce uses IPA notation, CMU uses ARPAbet
   */
  static mapSpeechAceToArpabet(ipaPhonemeName: string): string {
    // Common IPA to ARPAbet mappings
    const ipaToArpabet: Record<string, string> = {
      // Vowels
      i: "IY",
      ɪ: "IH",
      e: "EY",
      ɛ: "EH",
      æ: "AE",
      ɑ: "AA",
      ɔ: "AO",
      o: "OW",
      ʊ: "UH",
      u: "UW",
      ʌ: "AH",
      ə: "AH",
      ɚ: "AXR",
      ɝ: "ER",

      // Consonants
      p: "P",
      b: "B",
      t: "T",
      d: "D",
      k: "K",
      g: "G",
      f: "F",
      v: "V",
      θ: "TH",
      ð: "DH",
      s: "S",
      z: "Z",
      ʃ: "SH",
      ʒ: "ZH",
      h: "HH",
      tʃ: "CH",
      dʒ: "JH",
      m: "M",
      n: "N",
      ŋ: "NG",
      l: "L",
      r: "R",
      j: "Y",
      w: "W",

      // Diphthongs
      aɪ: "AY",
      aʊ: "AW",
      ɔɪ: "OY",
      eɪ: "EY",
      oʊ: "OW",
    };

    // Clean the input phoneme (remove slashes and extra characters)
    const cleanPhoneme = ipaPhonemeName.replace(/[\/\[\]]/g, "");

    return ipaToArpabet[cleanPhoneme] || cleanPhoneme.toUpperCase();
  }

  /**
   * Initialize a user's phoneme stats with all available phonemes
   */
  static async initializeUserPhonemes(
    userId: string,
    phonemeList: string[]
  ): Promise<void> {
    try {
      const response = await fetch("/api/phonemes/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          phonemes: phonemeList,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to initialize user phonemes`
        );
      }
    } catch (error) {
      console.error("Error initializing user phonemes:", error);
      throw error;
    }
  }

  /**
   * Update user's phoneme evaluation based on SpeechAce results
   */
  static async updateUserPhonemeEvaluation(
    userId: string,
    phonemeScores: Record<string, number>
  ): Promise<void> {
    try {
      const response = await fetch("/api/phonemes/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          phonemeScores,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to update phoneme evaluation`
        );
      }
    } catch (error) {
      console.error("Error updating phoneme evaluation:", error);
      throw error;
    }
  }

  /**
   * Get user phoneme performance summary
   */
  static async getUserPhonemePerformance(userId: string): Promise<any> {
    try {
      const response = await fetch(`/api/phonemes/summary/${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to fetch phoneme performance`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching phoneme performance:", error);
      throw error;
    }
  }
}
