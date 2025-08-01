import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";

// Note: This will work if you have Google Cloud credentials set up
// For development, you can use service account key file or Application Default Credentials
async function synthesizeSpeechWithGoogleCloud(
  text: string,
  languageCode: string,
  voiceName?: string
) {
  try {
    // Dynamic import to avoid issues in browser environment
    const { TextToSpeechClient } = await import("@google-cloud/text-to-speech");

    // Creates a client - this will use Application Default Credentials or service account
    const client = new TextToSpeechClient();

    // Construct the request
    const request = {
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: voiceName,
        ssmlGender: "NEUTRAL" as const,
      },
      audioConfig: { audioEncoding: "MP3" as const },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    return response.audioContent;
  } catch (error) {
    console.error("Google Cloud TTS error:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      languageCode = "en-US",
      voiceName,
      mood = "friendly",
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Get appropriate voice name based on language and mood
    const finalVoiceName =
      voiceName || getVoiceForLanguageAndMood(languageCode, mood);

    console.log("Synthesizing speech:", {
      text,
      languageCode,
      voiceName: finalVoiceName,
    });

    // Use Google Cloud TTS
    const audioContent = await synthesizeSpeechWithGoogleCloud(
      text,
      languageCode,
      finalVoiceName
    );

    if (!audioContent) {
      return NextResponse.json(
        { error: "No audio content generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioContent: audioContent.toString("base64"),
      message: "TTS synthesis successful",
    });
  } catch (error) {
    console.error("TTS API error:", error);

    // Provide detailed error information
    let errorMessage = "Internal server error";
    let details = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      details = error.stack || "";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: details,
        hint: "Make sure Google Cloud credentials are properly configured",
      },
      { status: 500 }
    );
  }
}

function getVoiceForLanguageAndMood(
  languageCode: string,
  mood: string
): string {
  const voiceMap: Record<string, Record<string, string>> = {
    "en-US": {
      friendly: "en-US-Wavenet-D",
      excited: "en-US-Wavenet-F",
      calm: "en-US-Wavenet-C",
      happy: "en-US-Wavenet-F",
      encouraging: "en-US-Wavenet-D",
      default: "en-US-Wavenet-D",
    },
    "es-ES": {
      friendly: "es-ES-Wavenet-A",
      excited: "es-ES-Wavenet-B",
      calm: "es-ES-Wavenet-A",
      happy: "es-ES-Wavenet-B",
      encouraging: "es-ES-Wavenet-A",
      default: "es-ES-Wavenet-A",
    },
    "es-US": {
      friendly: "es-US-Wavenet-A",
      excited: "es-US-Wavenet-B",
      calm: "es-US-Wavenet-A",
      happy: "es-US-Wavenet-B",
      encouraging: "es-US-Wavenet-A",
      default: "es-US-Wavenet-A",
    },
    "fr-FR": {
      friendly: "fr-FR-Wavenet-A",
      excited: "fr-FR-Wavenet-B",
      calm: "fr-FR-Wavenet-A",
      happy: "fr-FR-Wavenet-B",
      encouraging: "fr-FR-Wavenet-A",
      default: "fr-FR-Wavenet-A",
    },
  };

  const languageVoices = voiceMap[languageCode] || voiceMap["en-US"];
  return languageVoices[mood] || languageVoices["default"];
}
