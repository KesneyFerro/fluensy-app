import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Extract SpeechAce API configuration from environment
    const speechAceApiUrl =
      process.env.NEXT_PUBLIC_SPEECHACE_API_URL ||
      "https://api.speechace.co/api/scoring/text/v9/json";

    const speechAceApiKey = process.env.NEXT_PUBLIC_SPEECHACE_API_KEY;

    if (!speechAceApiKey) {
      console.error("SpeechAce API key not found in environment variables");
      return NextResponse.json(
        { error: "SpeechAce API key not configured" },
        { status: 500 }
      );
    }

    // Decode URL-encoded API key
    const decodedApiKey = decodeURIComponent(speechAceApiKey);

    // Prepare FormData for the API request (do NOT include key or dialect)
    const apiFormData = new FormData();

    let userLanguage = "en"; // default language
    for (const [key, value] of formData.entries()) {
      if (key === "key" || key === "dialect") {
        continue;
      }
      if (key === "language") {
        userLanguage = typeof value === "string" ? value : "en";
        continue;
      }
      apiFormData.append(key, value);
    }

    // Set dialect based on user language
    const dialect =
      userLanguage === "es" ||
      userLanguage === "spanish" ||
      userLanguage === "es-mx"
        ? "es-mx"
        : "en-us";

    // Build the SpeechAce API URL with query parameters
    const url = `${speechAceApiUrl}?key=${encodeURIComponent(
      decodedApiKey
    )}&dialect=${encodeURIComponent(dialect)}`;

    // Make the request to SpeechAce API from the server
    const response = await axios.post(url, apiFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    });

    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("❌ SpeechAce proxy error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      const details = error.response?.data;

      console.error("=== SPEECHACE API ERROR DETAILS ===");
      console.error("Status code:", status);
      console.error("Error message:", message);
      console.error(
        "Complete error response:",
        JSON.stringify(details, null, 2)
      );
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);
      console.error("Request headers:", error.config?.headers);
      console.error("==================================");

      return NextResponse.json(
        {
          error: "SpeechAce API error",
          message,
          details,
          status,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process SpeechAce request",
      },
      { status: 500 }
    );
  }
}
