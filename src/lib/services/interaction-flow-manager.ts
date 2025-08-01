import { GeminiService } from "./gemini";
import GoogleTTSService from "./google-tts";
import { SpeechAceService, SpeechAceResult } from "./speechace";
import { GradingSystem } from "./grading-system";

type SupportedLanguage = "en" | "es" | "fr";

export interface GreetingSequence {
  text: string;
  audioContent?: string;
}

export interface UserInputResult {
  fullTranscription: string;
  aggregatedSpeechAceData: SpeechAceResult[];
  audioSegments: Blob[];
}

export interface AgentResponse {
  text: string;
  audioContent?: string;
  mood: string;
}

export interface PhonemeTrainingSession {
  targetWord: string;
  targetPhoneme: string;
  practicePhrase: string;
  audioContent?: string;
}

export interface InteractionDecision {
  shouldOfferPhonemeTraining: boolean;
  phonemeSession?: PhonemeTrainingSession;
  shouldContinueChat: boolean;
  mode: "question" | "phoneme_training" | "chat_continue";
}

export class InteractionFlowManager {
  private readonly geminiService: GeminiService;
  private readonly ttsService: GoogleTTSService;
  private readonly speechAceService: SpeechAceService;
  private readonly gradingSystem: GradingSystem;
  private language: SupportedLanguage = "en";

  // 20 predefined greetings for each language
  private readonly greetings = {
    en: [
      "Hey there! How's your day going so far?",
      "Hi! What've you been up to today?",
      "Good to see you! Feeling good today?",
      "Hey! Did anything fun happen today?",
      "Hiya! Been having a chill day or a busy one?",
      "Hey! How are you feeling right now?",
      "Hi! Got anything exciting going on today?",
      "Hello! How's your morning (or afternoon) treating you?",
      "Hey! Start your day with anything tasty?",
      "Hi there! What's the vibe today — relaxed or full speed?",
      "Hey! Feeling more sleepy or energetic today?",
      "Hello! Has anything made you smile so far today?",
      "Hi! What's the mood today — cozy, creative, curious?",
      "Hey! Did you get outside at all today?",
      "Hi there! What's one nice thing that happened today?",
      "Hey! Feeling more like talking or just chilling?",
      "Hello! Has it been a calm or crazy kind of day?",
      "Hey! Are you in a snacky mood or just cruising along?",
      "Hi! Did anything small or silly make you laugh today?",
      "Hey! Is today one of those days you'd bottle up if you could?",
    ],
    es: [
      "¡Hola! ¿Cómo va tu día hasta ahora?",
      "¡Hola! ¿Qué has estado haciendo hoy?",
      "¡Qué bueno verte! ¿Te sientes bien hoy?",
      "¡Oye! ¿Pasó algo divertido hoy?",
      "¡Hola! ¿Has tenido un día tranquilo o ocupado?",
      "¡Oye! ¿Cómo te sientes en este momento?",
      "¡Hola! ¿Tienes algo emocionante pasando hoy?",
      "¡Hola! ¿Cómo te está tratando la mañana (o la tarde)?",
      "¡Oye! ¿Empezaste el día con algo rico?",
      "¡Hola! ¿Cuál es la vibra hoy — relajado o a toda velocidad?",
      "¡Oye! ¿Te sientes más dormido o con energía hoy?",
      "¡Hola! ¿Algo te ha hecho sonreír hasta ahora hoy?",
      "¡Hola! ¿Cuál es el ánimo hoy — acogedor, creativo, curioso?",
      "¡Oye! ¿Saliste afuera en algún momento hoy?",
      "¡Hola! ¿Cuál es una cosa bonita que pasó hoy?",
      "¡Oye! ¿Te sientes más como hablar o solo relajarte?",
      "¡Hola! ¿Ha sido un día tranquilo o loco?",
      "¡Oye! ¿Estás de humor para algo rico o solo pasándola bien?",
      "¡Hola! ¿Algo pequeño o tonto te hizo reír hoy?",
      "¡Oye! ¿Es hoy uno de esos días que guardarías en una botella si pudieras?",
    ],
    fr: [
      "Salut ! Comment se passe ta journée jusqu'à présent ?",
      "Bonjour ! Qu'est-ce que tu as fait aujourd'hui ?",
      "Content de te voir ! Tu te sens bien aujourd'hui ?",
      "Salut ! Il s'est passé quelque chose d'amusant aujourd'hui ?",
      "Salut ! Tu as eu une journée tranquille ou chargée ?",
      "Hey ! Comment tu te sens en ce moment ?",
      "Bonjour ! Tu as quelque chose d'excitant qui se passe aujourd'hui ?",
      "Bonjour ! Comment ta matinée (ou ton après-midi) se passe-t-elle ?",
      "Salut ! Tu as commencé la journée avec quelque chose de délicieux ?",
      "Salut ! C'est quoi l'ambiance aujourd'hui — détendu ou à fond ?",
      "Hey ! Tu te sens plus endormi ou énergique aujourd'hui ?",
      "Bonjour ! Quelque chose t'a fait sourire jusqu'à présent aujourd'hui ?",
      "Salut ! C'est quoi l'humeur aujourd'hui — cosy, créatif, curieux ?",
      "Hey ! Tu es sorti dehors à un moment aujourd'hui ?",
      "Salut ! Quelle est une belle chose qui s'est passée aujourd'hui ?",
      "Hey ! Tu as plus envie de parler ou juste de te détendre ?",
      "Bonjour ! Ça a été une journée calme ou folle ?",
      "Salut ! Tu es d'humeur à grignoter ou tu fais juste tranquille ?",
      "Bonjour ! Quelque chose de petit ou de stupide t'a fait rire aujourd'hui ?",
      "Hey ! C'est aujourd'hui un de ces jours que tu mettrais en bouteille si tu pouvais ?",
    ],
  };

  constructor() {
    this.geminiService = new GeminiService();
    this.ttsService = new GoogleTTSService();
    this.speechAceService = new SpeechAceService({
      apiKey: process.env.NEXT_PUBLIC_SPEECHACE_API_KEY || "",
      userId: process.env.NEXT_PUBLIC_SPEECHACE_USER_ID || "",
    });
    this.gradingSystem = new GradingSystem();
  }

  setLanguage(language: SupportedLanguage) {
    this.language = language;
  }

  /**
   * Expose SpeechAceService for external use (e.g., in page.tsx)
   */
  public getSpeechAceService(): SpeechAceService {
    return this.speechAceService;
  }

  /**
   * 1. Initial Greeting Sequence
   * Load predefined array of 20 greetings, randomly select one,
   * send to TTS API, and prepare for display with speech bubble
   */
  async generateGreetingSequence(): Promise<GreetingSequence> {
    // Randomly select one greeting from 20 predefined greetings
    const greetings = this.greetings[this.language];
    const selectedGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];

    // Generate TTS audio for the greeting
    let audioContent: string | undefined;
    try {
      let languageCode: string;
      if (this.language === "es") {
        languageCode = "es-ES";
      } else if (this.language === "fr") {
        languageCode = "fr-FR";
      } else {
        languageCode = "en-US";
      }

      const voiceConfig = GoogleTTSService.getVoiceForMood(
        "friendly",
        languageCode
      );

      audioContent = await this.ttsService.synthesizeSpeech({
        text: selectedGreeting,
        languageCode: languageCode,
        voiceName: voiceConfig.voiceName,
        speakingRate: voiceConfig.speakingRate,
        pitch: voiceConfig.pitch,
      });
    } catch (error) {
      console.error("Failed to generate TTS for greeting:", error);
      audioContent = undefined;
    }

    return {
      text: selectedGreeting,
      audioContent,
    };
  }

  /**
   * 2. User Input Flow
   * Process user's voice input - this will be called with processed results
   * from the existing AudioProcessor system
   */
  async processUserInputResults(
    transcriptions: string[],
    speechAceResults: SpeechAceResult[],
    audioSegments: Blob[]
  ): Promise<UserInputResult> {
    // Aggregate all transcriptions into one combined string
    const fullTranscription = transcriptions.join(" ").trim();

    return {
      fullTranscription,
      aggregatedSpeechAceData: speechAceResults,
      audioSegments,
    };
  }

  /**
   * 3. Follow-up Agent Response
   * Send ONLY the full transcription to Gemini for response generation,
   * then convert to TTS audio
   */
  async generateFollowUpResponse(
    fullTranscription: string
  ): Promise<AgentResponse> {
    console.log(
      "🔄 InteractionFlowManager.generateFollowUpResponse called with:",
      fullTranscription
    );

    try {
      // Send only the full transcription to Gemini for follow-up response
      console.log("📤 Calling Gemini for conversational response...");
      const { response, mood } =
        await this.geminiService.generateConversationalResponse({
          msg1: "", // Previous message can be empty for initial context
          msg2: fullTranscription,
          hasQuestion: this.containsQuestion(fullTranscription),
          language: this.language,
        });

      console.log("📥 Gemini response received:", { response, mood });

      // Generate TTS audio for the response
      let audioContent: string | undefined;
      try {
        console.log("🔊 Generating TTS for response...");
        let languageCode: string;
        if (this.language === "es") {
          languageCode = "es-ES";
        } else if (this.language === "fr") {
          languageCode = "fr-FR";
        } else {
          languageCode = "en-US";
        }

        const voiceConfig = GoogleTTSService.getVoiceForMood(
          mood,
          languageCode
        );

        audioContent = await this.ttsService.synthesizeSpeech({
          text: response,
          languageCode,
          voiceName: voiceConfig.voiceName,
          speakingRate: voiceConfig.speakingRate,
          pitch: voiceConfig.pitch,
        });
        console.log("✅ TTS generated successfully");
      } catch (error) {
        console.error("Failed to generate TTS for response:", error);
        audioContent = undefined;
      }

      return {
        text: response,
        audioContent,
        mood,
      };
    } catch (error) {
      console.error("Error generating follow-up response:", error);

      // Fallback response
      let fallbackText: string;
      if (this.language === "es") {
        fallbackText =
          "Lo siento, hubo un problema. ¿Puedes intentar de nuevo?";
      } else if (this.language === "fr") {
        fallbackText = "Désolé, il y a eu un problème. Pouvez-vous réessayer ?";
      } else {
        fallbackText = "Sorry, there was an issue. Can you try again?";
      }

      return {
        text: fallbackText,
        audioContent: undefined,
        mood: "calm",
      };
    }
  }

  /**
   * 4. Post-Response Interaction Logic
   * Generate random integer 1-3 and decide on next action:
   * 1 = phoneme training, 2-3 = continue conversation
   */
  async determineNextInteraction(
    speechAceResults: SpeechAceResult[]
  ): Promise<InteractionDecision> {
    const randomChoice = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

    if (randomChoice === 1) {
      // Offer phoneme training opportunity
      const phonemeSession = await this.extractPhonemeTrainingOpportunity(
        speechAceResults
      );

      return {
        shouldOfferPhonemeTraining: true,
        phonemeSession,
        shouldContinueChat: false,
        mode: "phoneme_training",
      };
    } else {
      // Continue dialogue with follow-up questions
      return {
        shouldOfferPhonemeTraining: false,
        shouldContinueChat: true,
        mode: "question",
      };
    }
  }

  /**
   * Extract phoneme training opportunity from SpeechAce data
   * Find word/phoneme with lowest performance
   */
  private async extractPhonemeTrainingOpportunity(
    speechAceResults: SpeechAceResult[]
  ): Promise<PhonemeTrainingSession | undefined> {
    if (!speechAceResults || speechAceResults.length === 0) {
      return undefined;
    }

    const lowestWord = this.findLowestScoredWord(speechAceResults);
    if (!lowestWord) {
      return undefined;
    }

    return this.createPhonemeTrainingSession(lowestWord);
  }

  /**
   * Find the word with lowest score across all SpeechAce results
   */
  private findLowestScoredWord(speechAceResults: SpeechAceResult[]): {
    word: string;
    score: number;
    phoneme?: string;
  } | null {
    let lowestWord: { word: string; score: number; phoneme?: string } | null =
      null;

    for (const result of speechAceResults) {
      if (!result.word_score_list) continue;

      for (const wordScore of result.word_score_list) {
        if (!lowestWord || wordScore.quality_score < lowestWord.score) {
          const worstPhoneme = this.findWorstPhoneme(
            wordScore.phone_score_list
          );

          lowestWord = {
            word: wordScore.word,
            score: wordScore.quality_score,
            phoneme: worstPhoneme,
          };
        }
      }
    }

    return lowestWord;
  }

  /**
   * Find the worst phoneme in a word's phone score list
   */
  private findWorstPhoneme(
    phoneScoreList?: Array<{ phone: string; quality_score: number }>
  ): string | undefined {
    if (!phoneScoreList || phoneScoreList.length === 0) {
      return undefined;
    }

    const worstPhone = phoneScoreList.reduce(
      (worst, current) =>
        current.quality_score < worst.quality_score ? current : worst,
      phoneScoreList[0] // Initial value
    );

    return worstPhone.phone;
  }

  /**
   * Create a phoneme training session for the given word
   */
  private async createPhonemeTrainingSession(lowestWord: {
    word: string;
    score: number;
    phoneme?: string;
  }): Promise<PhonemeTrainingSession | undefined> {
    const practicePhrase = this.generatePracticePhrase(
      lowestWord.word,
      this.language
    );

    // Generate TTS for the practice phrase
    let audioContent: string | undefined;
    try {
      let languageCode: string;
      if (this.language === "es") {
        languageCode = "es-ES";
      } else if (this.language === "fr") {
        languageCode = "fr-FR";
      } else {
        languageCode = "en-US";
      }

      const voiceConfig = GoogleTTSService.getVoiceForMood(
        "encouraging",
        languageCode
      );

      audioContent = await this.ttsService.synthesizeSpeech({
        text: practicePhrase,
        languageCode: languageCode,
        voiceName: voiceConfig.voiceName,
        speakingRate: 0.8, // Slower for practice
        pitch: voiceConfig.pitch,
      });
    } catch (error) {
      console.error("Failed to generate TTS for practice phrase:", error);
      audioContent = undefined;
    }

    return {
      targetWord: lowestWord.word,
      targetPhoneme: lowestWord.phoneme || "unknown",
      practicePhrase,
      audioContent,
    };
  }

  /**
   * Generate a practice phrase containing the target word
   */
  private generatePracticePhrase(
    word: string,
    language: SupportedLanguage
  ): string {
    const templates = {
      en: [
        `Let's practice the word "${word}". Say it clearly: ${word}.`,
        `Focus on pronouncing "${word}" correctly. Try saying: ${word}.`,
        `Let's work on "${word}". Repeat after me: ${word}.`,
        `Practice time! Say the word "${word}" slowly and clearly.`,
        `Let's improve your pronunciation of "${word}". Say: ${word}.`,
      ],
      es: [
        `Practiquemos la palabra "${word}". Dila claramente: ${word}.`,
        `Enfócate en pronunciar "${word}" correctamente. Intenta decir: ${word}.`,
        `Trabajemos en "${word}". Repite después de mí: ${word}.`,
        `¡Hora de practicar! Di la palabra "${word}" lenta y claramente.`,
        `Mejoremos tu pronunciación de "${word}". Di: ${word}.`,
      ],
      fr: [
        `Pratiquons le mot "${word}". Dis-le clairement : ${word}.`,
        `Concentre-toi sur la prononciation de "${word}" correctement. Essaie de dire : ${word}.`,
        `Travaillons sur "${word}". Répète après moi : ${word}.`,
        `C'est l'heure de pratiquer ! Dis le mot "${word}" lentement et clairement.`,
        `Améliorons ta prononciation de "${word}". Dis : ${word}.`,
      ],
    };

    const phrases = templates[language];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Check if transcription contains a question
   */
  private containsQuestion(text: string): boolean {
    const questionWords = {
      en: [
        "what",
        "where",
        "when",
        "why",
        "how",
        "who",
        "which",
        "whose",
        "whom",
      ],
      es: [
        "qué",
        "dónde",
        "cuándo",
        "por qué",
        "cómo",
        "quién",
        "cuál",
        "cuáles",
        "quiénes",
      ],
      fr: [
        "que",
        "qu'est-ce que",
        "où",
        "quand",
        "pourquoi",
        "comment",
        "qui",
        "quel",
        "quelle",
        "quels",
        "quelles",
      ],
    };

    const words = questionWords[this.language];
    const lowerText = text.toLowerCase();

    return (
      words.some((word: string) => lowerText.includes(word)) ||
      text.includes("?") ||
      lowerText.includes("?")
    );
  }

  /**
   * Process phoneme training feedback
   */
  async processPhonemeTrainingFeedback(
    originalPhrase: string,
    userAudio: Blob,
    targetWord: string
  ): Promise<{
    feedback: string;
    audioContent?: string;
    shouldContinue: boolean;
  }> {
    try {
      // Send user's audio to SpeechAce for targeted feedback
      // Note: SpeechAce only supports English and Spanish, so we fall back to English for French
      let speechAceLanguage: "en-us" | "es-es";
      if (this.language === "es") {
        speechAceLanguage = "es-es";
      } else {
        speechAceLanguage = "en-us"; // Default for both English and French (fallback)
      }

      const speechAceResult = await this.speechAceService.scoreText(
        userAudio,
        originalPhrase,
        speechAceLanguage
      );

      // Generate feedback using grading system
      const gradingResult = await this.gradingSystem.processGrading(
        {
          overall_score: speechAceResult?.speechace_score?.pronunciation || 0,
          words:
            speechAceResult?.word_score_list?.map((word) => ({
              word: word.word,
              accuracy_score: word.quality_score,
              phonemes: word.phone_score_list?.map((phone) => ({
                phoneme: phone.phone,
                accuracy_score: phone.quality_score,
              })),
            })) || [],
        },
        originalPhrase,
        this.language // Now supports "en" | "es" | "fr"
      );

      // Determine if training should continue based on score improvement
      const shouldContinue = gradingResult.overallScore < 70; // Continue if score is below 70%

      // Generate TTS for feedback
      let audioContent: string | undefined;
      try {
        let languageCode: string;
        if (this.language === "es") {
          languageCode = "es-ES";
        } else if (this.language === "fr") {
          languageCode = "fr-FR";
        } else {
          languageCode = "en-US";
        }

        const voiceConfig = GoogleTTSService.getVoiceForMood(
          "encouraging",
          languageCode
        );

        audioContent = await this.ttsService.synthesizeSpeech({
          text: gradingResult.feedback,
          languageCode,
          voiceName: voiceConfig.voiceName,
          speakingRate: voiceConfig.speakingRate,
          pitch: voiceConfig.pitch,
        });
      } catch (error) {
        console.error("Failed to generate TTS for feedback:", error);
        audioContent = undefined;
      }

      const fullFeedback = gradingResult.improvementTip
        ? `${gradingResult.feedback} ${gradingResult.improvementTip}`
        : gradingResult.feedback;

      return {
        feedback: fullFeedback,
        audioContent,
        shouldContinue,
      };
    } catch (error) {
      console.error("Error processing phoneme training feedback:", error);

      let fallbackFeedback: string;
      if (this.language === "es") {
        fallbackFeedback = "Buen intento. Sigamos practicando.";
      } else if (this.language === "fr") {
        fallbackFeedback = "Bon essai. Continuons à pratiquer.";
      } else {
        fallbackFeedback = "Good try. Let's keep practicing.";
      }

      return {
        feedback: fallbackFeedback,
        audioContent: undefined,
        shouldContinue: false,
      };
    }
  }
}

export default InteractionFlowManager;
