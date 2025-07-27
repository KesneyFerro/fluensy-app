import axios from "axios";

export interface AssemblyAIConfig {
  language: "en" | "es";
  apiKey: string;
}

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  audio_duration: number;
  status: string;
}

interface AssemblyAIUploadResponse {
  upload_url: string;
}

interface AssemblyAITranscribeResponse {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  confidence?: number;
  audio_duration?: number;
  error?: string;
}

class AssemblyAIService {
  private getLanguageCode(language: "en" | "es"): string {
    const languageCodes = {
      en: "en_us",
      es: "es",
    };
    return languageCodes[language];
  }

  async transcribeAudio(
    audioBlob: Blob,
    config: AssemblyAIConfig
  ): Promise<TranscriptionResult> {
    try {
      console.log("Starting AssemblyAI transcription process...");

      // Step 1: Upload audio file to AssemblyAI via proxy
      const audioBuffer = await audioBlob.arrayBuffer();

      console.log("Uploading audio to AssemblyAI...");
      const uploadResponse = await axios.post("/api/assemblyai", audioBuffer, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
        timeout: 60000, // 60 second timeout for upload
      });

      const audioUrl = uploadResponse.data.upload_url;
      console.log("Audio uploaded successfully:", audioUrl);

      // Step 2: Submit transcription request
      const transcribeConfig = {
        audio_url: audioUrl,
        language_code: this.getLanguageCode(config.language),
        punctuate: true,
        format_text: true,
      };

      console.log("Submitting transcription request...");
      const transcribeResponse = await axios.post("/api/assemblyai", {
        action: "transcribe",
        config: transcribeConfig,
      });

      const transcriptId = transcribeResponse.data.id;
      console.log("Transcription submitted with ID:", transcriptId);

      // Step 3: Poll for completion
      let result: AssemblyAITranscribeResponse;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes maximum

      do {
        console.log(
          `Polling for transcription results (attempt ${
            attempts + 1
          }/${maxAttempts})...`
        );

        const pollResponse = await axios.post("/api/assemblyai", {
          action: "poll",
          transcriptId: transcriptId,
        });

        result = pollResponse.data;

        if (result.status === "completed") {
          console.log("Transcription completed successfully");
          break;
        } else if (result.status === "error") {
          throw new Error(`AssemblyAI transcription failed: ${result.error}`);
        }

        // Wait 5 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } while (
        attempts < maxAttempts &&
        ["queued", "processing"].includes(result.status)
      );

      if (result.status !== "completed") {
        throw new Error("Transcription timed out after 5 minutes");
      }

      return {
        id: result.id,
        text: result.text || "",
        confidence: result.confidence || 0,
        audio_duration: result.audio_duration || 0,
        status: result.status,
      };
    } catch (error) {
      console.error("AssemblyAI transcription error:", error);
      throw new Error(
        `Transcription failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export const assemblyAI = new AssemblyAIService();
