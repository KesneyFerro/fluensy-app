import axios from "axios";

interface SynthesizeSpeechParams {
  text: string;
  languageCode?: string;
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  audioEncoding?: "MP3" | "LINEAR16" | "OGG_OPUS" | "MULAW" | "ALAW";
  mood?: string;
}

interface TTSResponse {
  success: boolean;
  audioContent?: string;
  error?: string;
  details?: string;
}

export class GoogleTTSService {
  private readonly baseUrl = "/api/google-tts";
  private readonly ttsCache = new Map<string, Promise<string>>();

  async synthesizeSpeech({
    text,
    languageCode = "en-US",
    voiceName,
    mood = "friendly",
  }: SynthesizeSpeechParams): Promise<string> {
    // Create cache key from request parameters
    const cacheKey = `${text}_${languageCode}_${voiceName}_${mood}`;

    // Check if request is already in progress or completed
    if (this.ttsCache.has(cacheKey)) {
      console.log(
        "📦 Using cached TTS request for:",
        text.substring(0, 50) + "..."
      );
      return this.ttsCache.get(cacheKey)!;
    }

    // Create and cache the promise
    const ttsPromise = this.performTTSRequest(
      text,
      languageCode,
      voiceName,
      mood
    );
    this.ttsCache.set(cacheKey, ttsPromise);

    // Clean up cache after completion (successful or failed)
    ttsPromise.finally(() => {
      setTimeout(() => {
        this.ttsCache.delete(cacheKey);
      }, 5000); // Keep cache for 5 seconds to handle immediate duplicates
    });

    return ttsPromise;
  }

  private async performTTSRequest(
    text: string,
    languageCode: string,
    voiceName: string | undefined,
    mood: string
  ): Promise<string> {
    try {
      console.log("Making TTS request to server API:", {
        text,
        languageCode,
        voiceName,
        mood,
      });

      const response = await axios.post<TTSResponse>(
        this.baseUrl,
        {
          text,
          languageCode,
          voiceName,
          mood,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout for server processing
        }
      );

      if (response.data.success && response.data.audioContent) {
        return response.data.audioContent;
      } else {
        console.error("TTS API returned no audio content:", response.data);
        return "";
      }
    } catch (error) {
      console.error("TTS request failed:", error);

      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        // Log more detailed error information
        if (error.response?.data) {
          console.error(
            "Detailed error:",
            JSON.stringify(error.response.data, null, 2)
          );
        }
      }

      // Return empty string instead of throwing to allow the app to continue
      console.warn("TTS synthesis failed, continuing without audio");
      return "";
    }
  }

  /**
   * Converts base64 audio content to a Blob for playback
   */
  base64ToBlob(base64Audio: string, mimeType: string = "audio/mp3"): Blob {
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Plays audio from base64 content
   */
  async playAudio(base64Audio: string): Promise<void> {
    // Handle empty audio content gracefully
    if (!base64Audio || base64Audio.trim() === "") {
      console.warn("No audio content to play");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const blob = this.base64ToBlob(base64Audio);
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          console.error("Audio playback error:", error);
          reject(new Error("Failed to play audio"));
        };

        audio.play().catch((playError) => {
          URL.revokeObjectURL(audioUrl);
          console.error("Audio play error:", playError);
          reject(
            playError instanceof Error
              ? playError
              : new Error("Failed to play audio")
          );
        });
      } catch (error) {
        console.error("Error setting up audio playback:", error);
        reject(
          error instanceof Error ? error : new Error("Audio setup failed")
        );
      }
    });
  }

  /**
   * Gets available voices for a language code
   */
  static getVoicesForLanguage(languageCode: string): string[] {
    const voiceMap: Record<string, string[]> = {
      "en-US": [
        "en-US-Wavenet-A",
        "en-US-Wavenet-B",
        "en-US-Wavenet-C",
        "en-US-Wavenet-D",
        "en-US-Wavenet-E",
        "en-US-Wavenet-F",
        "en-US-Wavenet-G",
        "en-US-Wavenet-H",
        "en-US-Wavenet-I",
        "en-US-Wavenet-J",
      ],
      "es-ES": [
        "es-ES-Wavenet-A",
        "es-ES-Wavenet-B",
        "es-ES-Wavenet-C",
        "es-ES-Wavenet-D",
      ],
      "es-US": ["es-US-Wavenet-A", "es-US-Wavenet-B", "es-US-Wavenet-C"],
    };

    return voiceMap[languageCode] || voiceMap["en-US"];
  }

  /**
   * Gets mood-based voice configuration
   */
  static getVoiceForMood(
    mood: string,
    languageCode: string = "en-US"
  ): { voiceName: string; speakingRate: number; pitch: number } {
    const moodConfigs: Record<string, { speakingRate: number; pitch: number }> =
      {
        excited: { speakingRate: 1.2, pitch: 2.0 },
        calm: { speakingRate: 0.9, pitch: -1.0 },
        happy: { speakingRate: 1.1, pitch: 1.0 },
        sad: { speakingRate: 0.8, pitch: -2.0 },
        serious: { speakingRate: 0.9, pitch: 0.0 },
        friendly: { speakingRate: 1.0, pitch: 0.5 },
        encouraging: { speakingRate: 1.0, pitch: 1.5 },
        default: { speakingRate: 1.0, pitch: 0.0 },
      };

    const config = moodConfigs[mood.toLowerCase()] || moodConfigs["default"];

    // Use specific voices as requested
    let voiceName: string;
    if (languageCode.startsWith("es")) {
      voiceName = "es-ES-Standard-G"; // Spanish voice
    } else {
      voiceName = "en-US-Standard-I"; // English voice
    }

    return {
      voiceName,
      ...config,
    };
  }
}

export default GoogleTTSService;
