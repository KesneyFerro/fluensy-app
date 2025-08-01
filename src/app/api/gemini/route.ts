import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    if (contentType.includes("application/octet-stream")) {
      // Handle audio transcription (binary data)
      console.log("Processing Gemini audio transcription request");

      const audioBuffer = await request.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });

      // Get language from query params or headers
      const url = new URL(request.url);
      const language = (url.searchParams.get("language") || "en") as
        | "en"
        | "es"
        | "fr";

      const geminiService = new GeminiService({ apiKey: geminiApiKey });

      const result = await geminiService.transcribeAudio(audioBlob, {
        language,
        apiKey: geminiApiKey,
      });

      console.log("Gemini transcription completed successfully");
      return NextResponse.json(result);
    } else {
      // Handle JSON requests (conversation, correction)
      let action: string;
      let data: any;

      try {
        const requestText = await request.text();
        console.log(
          "Gemini JSON request body:",
          requestText.substring(0, 200) + "..."
        );

        if (!requestText.trim()) {
          console.error("Gemini request body is empty");
          return NextResponse.json(
            { error: "Request body is empty" },
            { status: 400 }
          );
        }

        const requestData = JSON.parse(requestText);
        action = requestData.action;
        data = requestData;

        if (!action) {
          console.error("Gemini request missing action field");
          return NextResponse.json(
            { error: "Missing action field" },
            { status: 400 }
          );
        }

        console.log(`Gemini action: ${action}`);
      } catch (jsonError) {
        console.error("Gemini JSON parsing error:", jsonError);
        console.error(
          "Request content-type:",
          request.headers.get("content-type")
        );
        return NextResponse.json(
          { error: "Invalid JSON in request body", details: String(jsonError) },
          { status: 400 }
        );
      }

      const geminiService = new GeminiService({ apiKey: geminiApiKey });
      console.log(`Processing Gemini ${action} request`);

      let result;

      switch (action) {
        case "correct":
          // Handle transcription correction
          result = await geminiService.correctTranscription({
            transcription: data.transcription,
            language: data.language || "en",
          });
          return NextResponse.json({ correctedText: result });

        case "conversation":
          // Handle conversation generation
          result = await geminiService.generateConversationalResponse({
            msg1: data.msg1,
            msg2: data.msg2,
            hasQuestion: data.hasQuestion || false,
            language: data.language || "en",
          });
          return NextResponse.json(result);

        case "stream":
          // Handle streaming conversation (not implemented in this route)
          return NextResponse.json(
            { error: "Streaming not supported in this route" },
            { status: 400 }
          );

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error);

    let errorMessage = "Internal server error";
    let details = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      details = error.stack || "";
    }

    return NextResponse.json(
      {
        error: "Gemini API error",
        message: errorMessage,
        details,
      },
      { status: 500 }
    );
  }
}
