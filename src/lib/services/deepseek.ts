import Together from "together-ai";

export interface DeepSeekConfig {
  apiKey: string;
  model?: string;
}

interface DeepSeekTask1Params {
  transcription: string;
  language: "en" | "es";
}

interface DeepSeekTask2Params {
  msg1: string;
  msg2: string;
  hasQuestion: boolean;
  language: "en" | "es";
}

interface DeepSeekTask2Response {
  response: string;
  mood: string;
}

export class DeepSeekService {
  private together: Together;
  private model: string;

  constructor(config?: DeepSeekConfig) {
    const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error("Together AI API key is not configured");
    }
    this.together = new Together({ apiKey });
    this.model = config?.model || "deepseek-ai/DeepSeek-R1-0528";
  }

  /**
   * Task 1: Correct transcription from AssemblyAI
   */
  async correctTranscription({
    transcription,
    language,
  }: DeepSeekTask1Params): Promise<string> {
    const systemPrompt = this.getTask1SystemPrompt(language);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const response = await this.together.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: transcription,
            },
          ],
          model: this.model,
          temperature: 0,
          stream: false,
        });

        let correctedText =
          response.choices[0]?.message?.content || transcription;

        // Remove anything between <think> and </think>
        correctedText = this.removeThinkingTags(correctedText);

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
   * Task 2: Generate conversational response with mood
   */
  async generateConversationalResponse({
    msg1,
    msg2,
    hasQuestion,
    language,
  }: DeepSeekTask2Params): Promise<DeepSeekTask2Response> {
    const callId = Math.random().toString(36).substring(2, 8);
    console.log(
      `🤖 [${callId}] DeepSeek.generateConversationalResponse called`,
      { msg1, msg2, hasQuestion, language }
    );

    const systemPrompt = this.getTask2SystemPrompt(language);
    const questionStatus = hasQuestion ? "QUESTION" : "NO QUESTION";

    const userMessage = `MSG1: ${msg1}
MSG2: ${msg2}
${questionStatus}`;

    console.log(`🤖 [${callId}] Making request to Together AI...`);

    // Retry logic for incomplete responses
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🤖 [${callId}] Attempt ${attempts}/${maxAttempts}`);

      try {
        const response = await this.together.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          model: this.model,
          max_tokens: 3000,
          stream: false,
          temperature: 0.7, // Add slight randomness to help with incomplete responses
        });

        let fullResponse = response.choices[0]?.message?.content || "";
        console.log(`🤖 [${callId}] Raw response:`, fullResponse);

        // Remove anything between <think> and </think>
        const cleanedResponse = this.removeThinkingTags(fullResponse);
        console.log(`🤖 [${callId}] Cleaned response:`, cleanedResponse);

        // Validate that we have a meaningful response
        if (!this.isValidResponse(cleanedResponse)) {
          console.log(`🤖 [${callId}] Invalid response detected, retrying...`);
          if (attempts === maxAttempts) {
            // Use fallback for final attempt
            break;
          }
          continue;
        }

        // Extract mood from response
        const moodRegex = /MOOD:\s*([^\n\r]+)/;
        const moodMatch = moodRegex.exec(cleanedResponse);
        const mood = moodMatch ? moodMatch[1].trim() : "friendly";

        // Get response text (everything before MOOD:)
        const responseText = cleanedResponse.split("MOOD:")[0].trim();

        console.log(`🤖 [${callId}] DeepSeek response:`, {
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
    const fallbackResponse =
      language === "es"
        ? "¡Hola! ¿Cómo estás hoy?"
        : "Hi there! How are you doing today?";

    return {
      response: fallbackResponse,
      mood: "friendly",
    };
  }

  /**
   * Stream-based version of Task 2 for real-time responses
   */
  async *generateConversationalResponseStream({
    msg1,
    msg2,
    hasQuestion,
    language,
  }: DeepSeekTask2Params): AsyncGenerator<
    string,
    DeepSeekTask2Response,
    unknown
  > {
    const systemPrompt = this.getTask2SystemPrompt(language);
    const questionStatus = hasQuestion ? "QUESTION" : "NO QUESTION";

    const userMessage = `MSG1: ${msg1}
MSG2: ${msg2}
${questionStatus}`;

    const response = await this.together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: this.model,
      max_tokens: 3000,
      stream: true,
    });

    let fullResponse = "";
    let isInThinkingBlock = false;

    for await (const token of response) {
      const content = token.choices[0]?.delta?.content || "";

      // Handle thinking blocks
      if (content.includes("<think>")) {
        isInThinkingBlock = true;
      }
      if (content.includes("</think>")) {
        isInThinkingBlock = false;
        continue;
      }

      if (
        !isInThinkingBlock &&
        !content.includes("<think>") &&
        !content.includes("</think>")
      ) {
        fullResponse += content;
        yield content;
      }
    }

    // Extract mood from final response - clean first
    const cleanedFullResponse = this.removeThinkingTags(fullResponse);
    const moodRegex = /MOOD:\s*([^\n\r]+)/;
    const moodMatch = moodRegex.exec(cleanedFullResponse);
    const mood = moodMatch ? moodMatch[1].trim() : "friendly";

    // Get response text (everything before MOOD:)
    const responseText = cleanedFullResponse.split("MOOD:")[0].trim();

    return {
      response: responseText,
      mood: mood,
    };
  }

  /**
   * Remove thinking tags and their content
   */
  private removeThinkingTags(text: string): string {
    // More robust regex that handles multiple thinking blocks and nested content
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }

  /**
   * Static utility method to clean thinking tags from any text
   * Use this for any DeepSeek response that might contain thinking tags
   */
  static cleanThinkingTags(text: string): string {
    // More robust regex that handles multiple thinking blocks, case insensitive
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }

  /**
   * Validate that a DeepSeek response is complete and meaningful
   */
  private isValidResponse(response: string): boolean {
    if (!response || response.trim().length === 0) {
      return false;
    }

    // Check if response is just thinking tags or empty after cleaning
    const cleaned = response.trim();
    if (cleaned.length < 5) {
      // Too short to be meaningful
      return false;
    }

    // Check if it contains only fragments like just "<think>" without content
    const thinkingTagRegex = /<think>[\s\S]*?<\/think>/gi;
    if (
      thinkingTagRegex.test(cleaned) &&
      cleaned.replace(thinkingTagRegex, "").trim().length === 0
    ) {
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
   * Get system prompt for Task 1 (Transcription Correction)
   */
  private getTask1SystemPrompt(language: "en" | "es"): string {
    return TASK1_SYSTEM_PROMPTS[language];
  }

  /**
   * Get system prompt for Task 2 (Conversational Response)
   */
  private getTask2SystemPrompt(language: "en" | "es"): string {
    return TASK2_SYSTEM_PROMPTS[language];
  }
}

// Task 1 System Prompts - Transcription Correction
export const TASK1_SYSTEM_PROMPTS = {
  en: `You are an expert transcription corrector. Your task is to analyze audio transcriptions from AssemblyAI and correct any words that don't make sense in context.

Rules:
1. Only correct words that are clearly wrong or don't make sense in the sentence
2. Maintain the original meaning and intent as much as possible
3. Don't add or remove words unless absolutely necessary
4. Focus on common transcription errors like homophones, similar-sounding words, or technical misinterpretations
5. Keep the same speaking style and tone
6. Return only the corrected transcription without explanations

Examples:
- "I went to the store to buy some bred" → "I went to the store to buy some bread"
- "The whether is nice today" → "The weather is nice today"
- "I have a meeting at to o'clock" → "I have a meeting at two o'clock"

Please correct the following transcription:`,

  es: `Eres un experto corrector de transcripciones. Tu tarea es analizar transcripciones de audio de AssemblyAI y corregir cualquier palabra que no tenga sentido en el contexto.

Reglas:
1. Solo corrige palabras que estén claramente mal o no tengan sentido en la oración
2. Mantén el significado e intención original tanto como sea posible
3. No agregues o quites palabras a menos que sea absolutamente necesario
4. Enfócate en errores comunes de transcripción como homófonos, palabras que suenan similar, o interpretaciones técnicas incorrectas
5. Mantén el mismo estilo de habla y tono
6. Devuelve solo la transcripción corregida sin explicaciones

Ejemplos:
- "Fui al mercado a comprar pan duro" → "Fui al mercado a comprar panduro" (si se refiere a un tipo de pan)
- "El clima está ermoso hoy" → "El clima está hermoso hoy"
- "Tengo una cita a las dos oras" → "Tengo una cita a las dos horas"

Por favor corrige la siguiente transcripción:`,
};

// Task 2 System Prompts - Conversational Response
export const TASK2_SYSTEM_PROMPTS = {
  en: `You're Pip a friendly penguin speech therapist assistant for kids aged 5–10. You'll get up to three lines:

- MSG1: earlier message (optional)
- MSG2: most recent message (optional)
- QUESTION: if present, end your reply with a related, simple question

Always focus on MSG2 if it exists; otherwise, use MSG1. Respond in a kind, simple, and curious tone. Avoid politics, religion, or anything not kid-safe. Don't mention MSG1, MSG2, or QUESTION directly.

End every message with:
MOOD: [how the message should be read aloud, e.g., excited, gentle, curious]

NEVER use emojis or emoticons in your replies. Keep your replies cheerful, and easy to understand.`,

  es: `Eres Pip, un penguino asistente amigable de terapia del habla para niños de 5 a 10 años. Recibirás hasta tres líneas:

- MSG1: mensaje anterior (opcional)
- MSG2: mensaje más reciente (opcional)
- QUESTION: si está presente, termina tu respuesta con una pregunta relacionada y simple

Siempre enfócate en MSG2 si existe; de lo contrario, usa MSG1. Responde con un tono amable, simple y curioso. Evita política, religión, o cualquier cosa que no sea segura para niños. No menciones MSG1, MSG2, o QUESTION directamente.

Termina cada mensaje con:
MOOD: [cómo debe leerse el mensaje en voz alta, ej., excited, gentle, curious]

NUNCA uses emojis o emoticones en tus respuestas. Mantén tus respuestas alegres y fáciles de entender.`,
};
