import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // Check if this is an upload request (binary data) or other request (JSON)
    const contentType = request.headers.get("content-type") || "";

    const assemblyAIApiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;

    if (!assemblyAIApiKey) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured" },
        { status: 500 }
      );
    }

    if (contentType.includes("application/octet-stream")) {
      // Handle audio upload (binary data)
      console.log("Proxying AssemblyAI upload request");

      const audioBuffer = await request.arrayBuffer();

      const response = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        audioBuffer,
        {
          headers: {
            authorization: assemblyAIApiKey,
            "content-type": "application/octet-stream",
          },
          timeout: 60000, // 60 second timeout for uploads
        }
      );

      console.log("AssemblyAI upload completed successfully");
      return NextResponse.json(response.data);
    } else {
      // Handle JSON requests (transcribe, poll)
      let action: string;
      let data: any;

      try {
        const requestText = await request.text();
        console.log(
          "AssemblyAI JSON request body:",
          requestText.substring(0, 200) + "..."
        );

        if (!requestText.trim()) {
          console.error("AssemblyAI request body is empty");
          return NextResponse.json(
            { error: "Request body is empty" },
            { status: 400 }
          );
        }

        const requestData = JSON.parse(requestText);
        action = requestData.action;
        data = requestData;

        if (!action) {
          console.error("AssemblyAI request missing action field");
          return NextResponse.json(
            { error: "Missing action field" },
            { status: 400 }
          );
        }

        console.log(`AssemblyAI action: ${action}`);
      } catch (jsonError) {
        console.error("AssemblyAI JSON parsing error:", jsonError);
        console.error(
          "Request content-type:",
          request.headers.get("content-type")
        );
        return NextResponse.json(
          { error: "Invalid JSON in request body", details: String(jsonError) },
          { status: 400 }
        );
      }

      const headers = {
        authorization: assemblyAIApiKey,
        "Content-Type": "application/json",
      };

      console.log(`Proxying AssemblyAI ${action} request`);

      let response;

      switch (action) {
        case "transcribe":
          // Handle transcription request
          response = await axios.post(
            "https://api.assemblyai.com/v2/transcript",
            data.config,
            { headers, timeout: 30000 }
          );
          break;

        case "poll":
          // Handle polling for results
          response = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${data.transcriptId}`,
            { headers, timeout: 30000 }
          );
          break;

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      console.log(`AssemblyAI ${action} request completed successfully`);
      return NextResponse.json(response.data);
    }
  } catch (error) {
    console.error("AssemblyAI proxy error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message;

      return NextResponse.json(
        {
          error: "AssemblyAI API error",
          message,
          details: error.response?.data,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process AssemblyAI request",
      },
      { status: 500 }
    );
  }
}
