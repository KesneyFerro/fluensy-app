import { DeepSeekService } from "./deepseek";

interface SpeechAceWord {
  word: string;
  accuracy_score: number;
  error_type?: string;
  phonemes?: Array<{
    phoneme: string;
    accuracy_score: number;
  }>;
}

interface SpeechAceResponse {
  overall_score: number;
  words: SpeechAceWord[];
}

interface GradingResult {
  overallScore: number;
  lowestScoredWord: SpeechAceWord | null;
  feedback: string;
  improvementTip: string;
}

export class GradingSystem {
  private deepSeekService: DeepSeekService;

  constructor() {
    this.deepSeekService = new DeepSeekService();
  }

  /**
   * Process SpeechAce response and generate feedback for the lowest scored word
   */
  async processGrading(
    speechAceResponse: SpeechAceResponse,
    originalText: string,
    language: "en" | "es" = "en"
  ): Promise<GradingResult> {
    try {
      // Find the lowest scored word
      const lowestScoredWord = this.findLowestScoredWord(
        speechAceResponse.words
      );

      if (!lowestScoredWord) {
        return {
          overallScore: speechAceResponse.overall_score,
          lowestScoredWord: null,
          feedback:
            language === "es"
              ? "Gran trabajo con tu pronunciación!"
              : "Great job with your pronunciation!",
          improvementTip:
            language === "es"
              ? "Sigue practicando para mantener este nivel."
              : "Keep practicing to maintain this level.",
        };
      }

      // Generate improvement feedback using DeepSeek
      const feedback = await this.generateImprovementFeedback(
        lowestScoredWord,
        originalText,
        language
      );

      return {
        overallScore: speechAceResponse.overall_score,
        lowestScoredWord,
        feedback: feedback.mainFeedback,
        improvementTip: feedback.improvementTip,
      };
    } catch (error) {
      console.error("Error processing grading:", error);

      return {
        overallScore: speechAceResponse.overall_score,
        lowestScoredWord: null,
        feedback:
          language === "es"
            ? "Hubo un problema al analizar tu pronunciación."
            : "There was an issue analyzing your pronunciation.",
        improvementTip:
          language === "es"
            ? "Intenta hablar más claramente y repite."
            : "Try speaking more clearly and repeat.",
      };
    }
  }

  /**
   * Find the word with the lowest accuracy score
   */
  private findLowestScoredWord(words: SpeechAceWord[]): SpeechAceWord | null {
    if (!words || words.length === 0) return null;

    return words.reduce((lowest, current) => {
      return current.accuracy_score < lowest.accuracy_score ? current : lowest;
    });
  }

  /**
   * Generate improvement feedback for a specific word using DeepSeek
   */
  private async generateImprovementFeedback(
    word: SpeechAceWord,
    originalText: string,
    language: "en" | "es"
  ): Promise<{ mainFeedback: string; improvementTip: string }> {
    const userMessage = `Word: "${word.word}"
Accuracy Score: ${word.accuracy_score}
Error Type: ${word.error_type || "unknown"}
Full Sentence: "${originalText}"
Phoneme Issues: ${
      word.phonemes
        ?.filter((p) => p.accuracy_score < 80)
        .map((p) => p.phoneme)
        .join(", ") || "none"
    }`;

    try {
      const response = await this.deepSeekService.correctTranscription({
        transcription: userMessage,
        language,
      });

      // Parse the response to extract feedback and tip
      const lines = response.split("\n").filter((line) => line.trim());
      const mainFeedback =
        lines
          .find((line) => line.includes("FEEDBACK:"))
          ?.replace("FEEDBACK:", "")
          .trim() ||
        lines[0] ||
        "Keep practicing this word.";
      const improvementTip =
        lines
          .find((line) => line.includes("TIP:"))
          ?.replace("TIP:", "")
          .trim() ||
        lines[1] ||
        "Focus on clear pronunciation.";

      return {
        mainFeedback,
        improvementTip,
      };
    } catch (error) {
      console.error("Error generating feedback:", error);

      const fallbackFeedback =
        language === "es"
          ? `La palabra "${word.word}" necesita práctica. Puntuación: ${word.accuracy_score}%`
          : `The word "${word.word}" needs practice. Score: ${word.accuracy_score}%`;

      const fallbackTip =
        language === "es"
          ? "Practica pronunciando esta palabra lentamente."
          : "Practice pronouncing this word slowly.";

      return {
        mainFeedback: fallbackFeedback,
        improvementTip: fallbackTip,
      };
    }
  }

  /**
   * Calculate improvement suggestions based on error patterns
   */
  static getErrorTypeAdvice(
    errorType: string,
    language: "en" | "es" = "en"
  ): string {
    const adviceMap: Record<string, Record<string, string>> = {
      substitution: {
        en: "Focus on the correct sound placement. Listen carefully to native speakers.",
        es: "Concéntrate en la colocación correcta del sonido. Escucha atentamente a hablantes nativos.",
      },
      insertion: {
        en: "You added an extra sound. Try to be more precise with your pronunciation.",
        es: "Agregaste un sonido extra. Trata de ser más preciso con tu pronunciación.",
      },
      deletion: {
        en: "You missed a sound. Make sure to pronounce all parts of the word.",
        es: "Te faltó un sonido. Asegúrate de pronunciar todas las partes de la palabra.",
      },
      unknown: {
        en: "Keep practicing and focus on clear articulation.",
        es: "Sigue practicando y concéntrate en una articulación clara.",
      },
    };

    return adviceMap[errorType]?.[language] || adviceMap["unknown"][language];
  }

  /**
   * Get color coding for score ranges
   */
  static getScoreColor(score: number): string {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  }

  /**
   * Get score category
   */
  static getScoreCategory(score: number, language: "en" | "es" = "en"): string {
    const categories = {
      en: {
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        needsWork: "Needs Work",
      },
      es: {
        excellent: "Excelente",
        good: "Bueno",
        fair: "Regular",
        needsWork: "Necesita Trabajo",
      },
    };

    const lang = categories[language];

    if (score >= 90) return lang.excellent;
    if (score >= 80) return lang.good;
    if (score >= 70) return lang.fair;
    return lang.needsWork;
  }
}

// Pronunciation feedback system prompts
const PRONUNCIATION_FEEDBACK_PROMPTS = {
  en: `You are a pronunciation coach helping language learners improve their speech. You will receive information about a word that was mispronounced, including its accuracy score and error details.

Your task:
1. Provide encouraging but specific feedback about the pronunciation issue
2. Give a practical tip for improvement
3. Keep feedback concise and actionable

Format your response as:
FEEDBACK: [specific feedback about the pronunciation]
TIP: [one practical improvement tip]

Guidelines:
- Be encouraging and supportive
- Focus on specific sounds or techniques
- Provide actionable advice
- Keep it brief (1-2 sentences each)
- Use simple language appropriate for language learners`,

  es: `Eres un entrenador de pronunciación que ayuda a estudiantes de idiomas a mejorar su habla. Recibirás información sobre una palabra que fue mal pronunciada, incluyendo su puntuación de precisión y detalles del error.

Tu tarea:
1. Proporcionar retroalimentación alentadora pero específica sobre el problema de pronunciación
2. Dar un consejo práctico para mejorar
3. Mantener la retroalimentación concisa y accionable

Formatea tu respuesta como:
FEEDBACK: [retroalimentación específica sobre la pronunciación]
TIP: [un consejo práctico de mejora]

Directrices:
- Sé alentador y comprensivo
- Enfócate en sonidos o técnicas específicas
- Proporciona consejos accionables
- Manténlo breve (1-2 oraciones cada uno)
- Usa lenguaje simple apropiado para estudiantes de idiomas`,
};

export default GradingSystem;
