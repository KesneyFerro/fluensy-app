import { GoogleGenerativeAI } from "@google/generative-ai";

type SupportedLanguage = "en" | "es" | "fr";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

interface GeminiTask1Params {
  transcription: string;
  language: SupportedLanguage;
}

interface GeminiTask2Params {
  msg1: string;
  msg2: string;
  hasQuestion: boolean;
  language: SupportedLanguage;
}

interface GeminiTask2Response {
  response: string;
  mood: string;
}

interface GeminiTranscriptionConfig {
  language: SupportedLanguage;
  apiKey: string;
}

interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  audio_duration: number;
  status: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private transcriptionModel: string;
  private conversationModel: string;

  constructor(config?: GeminiConfig) {
    const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.transcriptionModel = "gemini-2.0-flash-exp"; // For transcription (replacing AssemblyAI)
    this.conversationModel = "gemini-1.5-flash"; // For conversation (replacing DeepSeek)
  }

  /**
   * Task 1: Transcribe audio using Gemini 2.0 Flash (replacing AssemblyAI)
   */
  async transcribeAudio(
    audioBlob: Blob,
    config: GeminiTranscriptionConfig
  ): Promise<TranscriptionResult> {
    try {
      console.log("Starting Gemini audio transcription...");

      const model = this.genAI.getGenerativeModel({
        model: this.transcriptionModel,
      });

      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");

      const prompt = this.getTranscriptionPrompt(config.language);

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Audio,
            mimeType: audioBlob.type || "audio/webm",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text().trim();

      // Generate a unique ID for this transcription
      const id = `gemini_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      console.log("Gemini transcription completed:", { text, id });

      return {
        id,
        text,
        confidence: 0.95, // Gemini doesn't provide confidence, use default high value
        audio_duration: 0, // Not provided by Gemini
        status: "completed",
      };
    } catch (error) {
      console.error("Gemini transcription error:", error);
      throw new Error(
        `Transcription failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Task 2: Correct transcription using Gemini 1.5 Flash (replacing DeepSeek Task 1)
   */
  async correctTranscription({
    transcription,
    language,
  }: GeminiTask1Params): Promise<string> {
    const systemPrompt = this.getTask1SystemPrompt(language);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const model = this.genAI.getGenerativeModel({
          model: this.conversationModel,
        });

        const result = await model.generateContent([
          systemPrompt,
          `Transcription to correct: ${transcription}`,
        ]);

        const response = await result.response;
        let correctedText = response.text().trim();

        // Validate response
        if (!correctedText.trim() || correctedText.trim().length < 1) {
          console.log(
            `Task 1 attempt ${attempts}: Invalid response, retrying...`
          );
          if (attempts === maxAttempts) {
            return transcription; // Return original if all attempts fail
          }
          continue;
        }

        return correctedText.trim();
      } catch (error) {
        console.error(`Task 1 attempt ${attempts} failed:`, error);
        if (attempts === maxAttempts) {
          return transcription; // Return original on final failure
        }
      }
    }

    return transcription;
  }

  /**
   * Task 3: Generate conversational response with mood using Gemini 1.5 Flash (replacing DeepSeek Task 2)
   */
  async generateConversationalResponse({
    msg1,
    msg2,
    hasQuestion,
    language,
  }: GeminiTask2Params): Promise<GeminiTask2Response> {
    const callId = Math.random().toString(36).substring(2, 8);
    console.log(`🤖 [${callId}] Gemini.generateConversationalResponse called`, {
      msg1,
      msg2,
      hasQuestion,
      language,
    });

    const systemPrompt = this.getTask2SystemPrompt(language);
    const questionStatus = hasQuestion ? "QUESTION" : "NO QUESTION";

    const userMessage = `MSG1: ${msg1}
MSG2: ${msg2}
${questionStatus}`;

    console.log(`🤖 [${callId}] Making request to Gemini...`);

    // Retry logic for incomplete responses
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🤖 [${callId}] Attempt ${attempts}/${maxAttempts}`);

      try {
        const model = this.genAI.getGenerativeModel({
          model: this.conversationModel,
          generationConfig: {
            maxOutputTokens: 3000,
            temperature: 0.7,
          },
        });

        const result = await model.generateContent([systemPrompt, userMessage]);

        const response = await result.response;
        let fullResponse = response.text().trim();
        console.log(`🤖 [${callId}] Raw response:`, fullResponse);

        // Validate that we have a meaningful response
        if (!this.isValidResponse(fullResponse)) {
          console.log(`🤖 [${callId}] Invalid response detected, retrying...`);
          if (attempts === maxAttempts) {
            // Use fallback for final attempt
            break;
          }
          continue;
        }

        // Extract mood from response
        const moodRegex = /MOOD:\s*([^\n\r]+)/;
        const moodMatch = moodRegex.exec(fullResponse);
        const mood = moodMatch ? moodMatch[1].trim() : "friendly";

        // Get response text (everything before MOOD:)
        const responseText = fullResponse.split("MOOD:")[0].trim();

        console.log(`🤖 [${callId}] Gemini response:`, {
          responseText,
          mood,
        });

        return {
          response: responseText,
          mood: mood,
        };
      } catch (error) {
        console.error(`🤖 [${callId}] Attempt ${attempts} failed:`, error);
        if (attempts === maxAttempts) {
          throw error;
        }
      }
    }

    // Fallback response if all attempts failed
    console.log(`🤖 [${callId}] All attempts failed, using fallback`);

    let fallbackResponse: string;
    if (language === "es") {
      fallbackResponse = "¡Hola! ¿Cómo estás hoy?";
    } else if (language === "fr") {
      fallbackResponse = "Bonjour ! Comment allez-vous aujourd'hui ?";
    } else {
      fallbackResponse = "Hi there! How are you doing today?";
    }

    return {
      response: fallbackResponse,
      mood: "friendly",
    };
  }

  /**
   * Stream-based version of Task 3 for real-time responses
   */
  async *generateConversationalResponseStream({
    msg1,
    msg2,
    hasQuestion,
    language,
  }: GeminiTask2Params): AsyncGenerator<string, GeminiTask2Response, unknown> {
    const systemPrompt = this.getTask2SystemPrompt(language);
    const questionStatus = hasQuestion ? "QUESTION" : "NO QUESTION";

    const userMessage = `MSG1: ${msg1}
MSG2: ${msg2}
${questionStatus}`;

    const model = this.genAI.getGenerativeModel({
      model: this.conversationModel,
      generationConfig: {
        maxOutputTokens: 3000,
        temperature: 0.7,
      },
    });

    const result = await model.generateContentStream([
      systemPrompt,
      userMessage,
    ]);

    let fullResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        yield chunkText;
      }
    }

    // Extract mood from final response
    const moodRegex = /MOOD:\s*([^\n\r]+)/;
    const moodMatch = moodRegex.exec(fullResponse);
    const mood = moodMatch ? moodMatch[1].trim() : "friendly";

    // Get response text (everything before MOOD:)
    const responseText = fullResponse.split("MOOD:")[0].trim();

    return {
      response: responseText,
      mood: mood,
    };
  }

  /**
   * Validate that a Gemini response is complete and meaningful
   */
  private isValidResponse(response: string): boolean {
    if (!response || response.trim().length === 0) {
      return false;
    }

    const cleaned = response.trim();
    if (cleaned.length < 5) {
      // Too short to be meaningful
      return false;
    }

    // For Task 2 responses, should contain some actual content before MOOD
    if (cleaned.includes("MOOD:")) {
      const beforeMood = cleaned.split("MOOD:")[0].trim();
      if (beforeMood.length < 3) {
        // Should have actual response content
        return false;
      }
    }

    return true;
  }

  /**
   * Get transcription prompt for audio processing
   */
  private getTranscriptionPrompt(language: SupportedLanguage): string {
    const prompts = {
      en: `You are an expert audio transcriber. Listen to this audio and provide a clean, accurate transcription. 

Rules:
1. Transcribe exactly what you hear
2. Use proper punctuation and capitalization
3. Do not add words that weren't spoken
4. If unsure about a word, use your best judgment based on context
5. Return only the transcription text, no additional commentary

Language: English`,

      es: `Eres un experto transcriptor de audio. Escucha este audio y proporciona una transcripción limpia y precisa.

Reglas:
1. Transcribe exactamente lo que escuchas
2. Usa puntuación y mayúsculas apropiadas
3. No agregues palabras que no fueron habladas
4. Si no estás seguro de una palabra, usa tu mejor juicio basado en el contexto
5. Devuelve solo el texto de la transcripción, sin comentarios adicionales

Idioma: Español`,

      fr: `Vous êtes un expert transcripteur audio. Écoutez cet audio et fournissez une transcription propre et précise.

Règles :
1. Transcrivez exactement ce que vous entendez
2. Utilisez la ponctuation et les majuscules appropriées
3. N'ajoutez pas de mots qui n'ont pas été prononcés
4. Si vous n'êtes pas sûr d'un mot, utilisez votre meilleur jugement basé sur le contexte
5. Retournez uniquement le texte de transcription, sans commentaire supplémentaire

Langue : Français`,
    };

    return prompts[language];
  }

  /**
   * Get system prompt for Task 1 (Transcription Correction)
   */
  private getTask1SystemPrompt(language: SupportedLanguage): string {
    return TASK1_SYSTEM_PROMPTS[language];
  }

  /**
   * Get system prompt for Task 2 (Conversational Response)
   */
  private getTask2SystemPrompt(language: SupportedLanguage): string {
    return TASK2_SYSTEM_PROMPTS[language];
  }
}

// Task 1 System Prompts - Transcription Correction
export const TASK1_SYSTEM_PROMPTS = {
  en: `You are an expert transcription corrector. Your task is to analyze audio transcriptions and correct any words that don't make sense in context.

Rules:
1. Only correct words that are clearly wrong or don't make sense in the sentence
2. Maintain the original meaning and intent as much as possible
3. Don't add or remove words unless absolutely necessary
4. Focus on common transcription errors like homophones, similar-sounding words, or technical misinterpretations
5. Keep the same speaking style and tone
6. Return only the corrected transcription without explanations

Examples:
Input: "I went to the store to buy some male"
Output: "I went to the store to buy some mail"

Input: "The whether is nice today"
Output: "The weather is nice today"

Input: "Can you here me now"  
Output: "Can you hear me now"`,

  es: `Eres un experto corrector de transcripciones. Tu tarea es analizar transcripciones de audio y corregir cualquier palabra que no tenga sentido en el contexto.

Reglas:
1. Solo corrige palabras que estén claramente mal o no tengan sentido en la oración
2. Mantén el significado e intención original tanto como sea posible
3. No agregues o elimines palabras a menos que sea absolutamente necesario
4. Enfócate en errores comunes de transcripción como homófonos, palabras similares, o interpretaciones técnicas incorrectas
5. Mantén el mismo estilo y tono de habla
6. Devuelve solo la transcripción corregida sin explicaciones

Ejemplos:
Entrada: "Fui a la tienda a comprar un oso"
Salida: "Fui a la tienda a comprar un hueso"

Entrada: "El clima está muy bueno hoy día"
Salida: "El clima está muy bueno hoy día"`,

  fr: `Vous êtes un expert correcteur de transcriptions. Votre tâche est d'analyser les transcriptions audio et de corriger tout mot qui n'a pas de sens dans le contexte.

Règles :
1. Ne corrigez que les mots qui sont clairement faux ou n'ont pas de sens dans la phrase
2. Maintenez le sens et l'intention originaux autant que possible
3. N'ajoutez ou ne supprimez des mots que si c'est absolument nécessaire
4. Concentrez-vous sur les erreurs de transcription courantes comme les homophones, les mots similaires, ou les interprétations techniques incorrectes
5. Gardez le même style et ton de parole
6. Retournez uniquement la transcription corrigée sans explications

Exemples :
Entrée : "Je suis allé au magasin pour acheter du pain de mie"
Sortie : "Je suis allé au magasin pour acheter du pain de mie"

Entrée : "Le temps est très beau aujourd'hui"
Sortie : "Le temps est très beau aujourd'hui"`,
};

// Task 2 System Prompts - Conversational Response
export const TASK2_SYSTEM_PROMPTS = {
  en: `You are a friendly language learning conversation partner. You help users practice English through natural conversations.

Your conversation style:
- Be encouraging and supportive
- Ask follow-up questions to keep the conversation flowing
- Show genuine interest in what the user says
- Use natural, conversational language appropriate for language learners
- Vary your responses to avoid repetition
- Be patient and understanding

You will receive two message segments (MSG1 and MSG2) that represent a complete user statement, plus information about whether the user asked a question.

Your response format should ALWAYS end with:
MOOD: [one word describing the emotional tone: friendly, encouraging, curious, supportive, enthusiastic, thoughtful]

Examples:
Input: MSG1: "I went to the park today" MSG2: "and saw some beautiful flowers" NO QUESTION
Output: "That sounds lovely! Parks are wonderful places to relax. What kind of flowers did you see? Were they your favorite colors?
MOOD: curious"

Input: MSG1: "I'm feeling a bit tired" MSG2: "from work today" NO QUESTION  
Output: "I understand how work can be exhausting sometimes. It's important to take care of yourself. Do you have any plans to relax this evening?
MOOD: supportive"

Always respond in English and end with the MOOD line.`,

  es: `Eres un compañero de conversación amigable para el aprendizaje de idiomas. Ayudas a los usuarios a practicar español a través de conversaciones naturales.

Tu estilo de conversación:
- Sé alentador y comprensivo
- Haz preguntas de seguimiento para mantener la conversación fluida
- Muestra interés genuino en lo que dice el usuario
- Usa lenguaje natural y conversacional apropiado para estudiantes de idiomas
- Varía tus respuestas para evitar repetición
- Sé paciente y comprensivo

Recibirás dos segmentos de mensaje (MSG1 y MSG2) que representan una declaración completa del usuario, más información sobre si el usuario hizo una pregunta.

Tu formato de respuesta debe SIEMPRE terminar con:
MOOD: [una palabra describiendo el tono emocional: friendly, encouraging, curious, supportive, enthusiastic, thoughtful]

Ejemplos:
Entrada: MSG1: "Fui al parque hoy" MSG2: "y vi flores muy hermosas" NO QUESTION
Salida: "¡Eso suena encantador! Los parques son lugares maravillosos para relajarse. ¿Qué tipo de flores viste? ¿Eran de tus colores favoritos?
MOOD: curious"

Entrada: MSG1: "Me siento un poco cansado" MSG2: "del trabajo hoy" NO QUESTION
Salida: "Entiendo cómo el trabajo puede ser agotador a veces. Es importante cuidarse. ¿Tienes planes para relajarte esta noche?
MOOD: supportive"

Siempre responde en español y termina con la línea MOOD.`,

  fr: `Vous êtes un partenaire de conversation amical pour l'apprentissage des langues. Vous aidez les utilisateurs à pratiquer le français à travers des conversations naturelles.

Votre style de conversation :
- Soyez encourageant et compréhensif
- Posez des questions de suivi pour maintenir la conversation fluide
- Montrez un intérêt sincère pour ce que dit l'utilisateur
- Utilisez un langage naturel et conversationnel approprié pour les apprenants de langues
- Variez vos réponses pour éviter la répétition
- Soyez patient et compréhensif

Vous recevrez deux segments de message (MSG1 et MSG2) qui représentent une déclaration complète de l'utilisateur, plus des informations sur si l'utilisateur a posé une question.

Votre format de réponse doit TOUJOURS se terminer par :
MOOD: [un mot décrivant le ton émotionnel : friendly, encouraging, curious, supportive, enthusiastic, thoughtful]

Exemples :
Entrée : MSG1: "Je suis allé au parc aujourd'hui" MSG2: "et j'ai vu de belles fleurs" NO QUESTION
Sortie : "Cela semble charmant ! Les parcs sont des endroits merveilleux pour se détendre. Quel type de fleurs avez-vous vues ? Étaient-elles de vos couleurs préférées ?
MOOD: curious"

Entrée : MSG1: "Je me sens un peu fatigué" MSG2: "du travail aujourd'hui" NO QUESTION
Sortie : "Je comprends comment le travail peut être épuisant parfois. Il est important de prendre soin de soi. Avez-vous des projets pour vous détendre ce soir ?
MOOD: supportive"

Répondez toujours en français et terminez par la ligne MOOD.`,
};

export default GeminiService;
