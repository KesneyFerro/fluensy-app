import axios from "axios";

export interface SpeechAceConfig {
  apiKey: string;
  userId: string;
  dialect?: string;
  apiUrl?: string;
  timeout?: number;
}

export interface SpeechAceResult {
  speechace_score: {
    pronunciation: number;
    fluency?: number;
    phone_score?: number;
    stress_score?: number;
    cefr_level?: string;
    ielts_level?: string;
    toeic_level?: string;
    pte_level?: string;
  };
  word_score_list: Array<{
    word: string;
    quality_score: number;
    phone_score_list: Array<{
      phone: string;
      quality_score: number;
    }>;
  }>;
  syllable_score_list?: Array<{
    syllable: string;
    quality_score: number;
  }>;
  phone_score_list?: Array<{
    phone: string;
    quality_score: number;
  }>;
  text_score?: {
    quality_score: number;
    fluency_score: number;
    phone_score: number;
    stress_score: number;
    text?: string; // For multiple choice responses
  };
}

// Supported dialects
export const SPEECHACE_DIALECTS = {
  EN_US: "en-us",
  EN_GB: "en-gb",
  ES_ES: "es-es",
  FR_FR: "fr-fr",
} as const;

export type SpeechAceDialect =
  (typeof SPEECHACE_DIALECTS)[keyof typeof SPEECHACE_DIALECTS];

export class SpeechAceService {
  private config: SpeechAceConfig;

  constructor(config: SpeechAceConfig) {
    this.config = {
      dialect: SPEECHACE_DIALECTS.EN_US,
      // Use our proxy endpoint instead of direct API call
      apiUrl: "/api/speechace",
      timeout: parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || "30000"),
      ...config,
    };
  }

  /**
   * Score speech audio against reference text (main method based on Python implementation)
   */
  async scoreText(
    audioBlob: Blob,
    referenceText: string,
    customDialect?: SpeechAceDialect,
    questionInfo?: string
  ): Promise<SpeechAceResult> {
    try {
      console.log("Sending audio to SpeechAce for text scoring...", {
        audioSize: audioBlob.size,
        referenceText: referenceText.substring(0, 50) + "...",
        dialect: customDialect || this.config.dialect,
      });

      const dialect = customDialect || this.config.dialect;

      const formData = new FormData();

      // Required parameters (API key will be added by proxy)
      formData.append("text", referenceText);
      formData.append("user_audio_file", audioBlob, "audio.webm");
      formData.append("dialect", dialect || SPEECHACE_DIALECTS.EN_US);

      // Optional parameters (only official ones)
      if (questionInfo) {
        formData.append("question_info", questionInfo);
      }

      // Note: user_id and user_age are not official SpeechAce parameters - removed

      const response = await axios.post(this.config.apiUrl!, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: this.config.timeout,
      });

      console.log("SpeechAce text scoring completed successfully");
      return response.data;
    } catch (error) {
      console.error("SpeechAce text scoring error:", error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use scoreText() instead
   */
  async analyzePronunciation(
    audioBlob: Blob,
    groundTruth: string
  ): Promise<SpeechAceResult> {
    console.warn(
      "analyzePronunciation() is deprecated. Use scoreText() instead."
    );
    return this.scoreText(audioBlob, groundTruth);
  }

  /**
   * Extract overall pronunciation score from API response
   */
  extractPronunciationScore(apiResponse: SpeechAceResult): number | null {
    return apiResponse.speechace_score?.pronunciation || null;
  }

  /**
   * Extract word-level scores from API response
   */
  extractWordScores(
    apiResponse: SpeechAceResult
  ): Array<{ word: string; quality_score: number }> {
    return apiResponse.word_score_list || [];
  }

  /**
   * Extract phoneme-level scores from API response
   */
  extractPhonemeScores(
    apiResponse: SpeechAceResult
  ): Array<{ phone: string; quality_score: number }> {
    return apiResponse.phone_score_list || [];
  }

  /**
   * Get proficiency levels from API response
   */
  getProficiencyLevels(apiResponse: SpeechAceResult): Record<string, string> {
    const levels: Record<string, string> = {};
    const speechaceScore = apiResponse.speechace_score;

    if (speechaceScore?.cefr_level) levels.cefr = speechaceScore.cefr_level;
    if (speechaceScore?.ielts_level) levels.ielts = speechaceScore.ielts_level;
    if (speechaceScore?.toeic_level) levels.toeic = speechaceScore.toeic_level;
    if (speechaceScore?.pte_level) levels.pte = speechaceScore.pte_level;

    return levels;
  }

  /**
   * Create a summary analysis of the API response
   */
  analyzeResponseSummary(apiResponse: SpeechAceResult): Record<string, any> {
    const wordScores = this.extractWordScores(apiResponse);
    const phonemeScores = this.extractPhonemeScores(apiResponse);

    const summary: Record<string, any> = {
      overall_score: this.extractPronunciationScore(apiResponse),
      word_count: wordScores.length,
      phoneme_count: phonemeScores.length,
      proficiency_levels: this.getProficiencyLevels(apiResponse),
    };

    // Calculate average word score
    if (wordScores.length > 0) {
      const wordScoreValues = wordScores
        .map((w) => w.quality_score)
        .filter((score) => score !== undefined);
      if (wordScoreValues.length > 0) {
        summary.average_word_score =
          wordScoreValues.reduce((a, b) => a + b, 0) / wordScoreValues.length;
      }
    }

    // Calculate phoneme accuracy rate
    if (phonemeScores.length > 0) {
      const accuratePhonemes = phonemeScores.filter(
        (p) => p.quality_score >= 70
      ).length;
      summary.phoneme_accuracy_rate =
        (accuratePhonemes / phonemeScores.length) * 100;
    }

    return summary;
  }

  /**
   * Validate audio file format (client-side check)
   */
  private validateAudioBlob(audioBlob: Blob): void {
    const supportedFormats = (
      process.env.NEXT_PUBLIC_SUPPORTED_AUDIO_FORMATS || ".wav,.mp3,.webm,.m4a"
    )
      .split(",")
      .map((format) => format.trim());

    // Basic MIME type check
    const isSupported =
      audioBlob.type.includes("audio/") ||
      supportedFormats.some((format) =>
        audioBlob.type.includes(format.replace(".", ""))
      );

    if (!isSupported) {
      throw new Error(
        `Unsupported audio format: ${audioBlob.type}. ` +
          `Supported formats: ${supportedFormats.join(", ")}`
      );
    }

    console.log(
      `Audio validation passed: ${audioBlob.type}, size: ${audioBlob.size} bytes`
    );
  }

  /**
   * Get list of supported dialects
   */
  static getSupportedDialects(): SpeechAceDialect[] {
    return Object.values(SPEECHACE_DIALECTS);
  }
}
