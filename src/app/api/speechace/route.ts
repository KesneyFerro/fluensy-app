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
    console.log(
      "SpeechAce API key found:",
      speechAceApiKey ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "Original API key (first 20 chars):",
      speechAceApiKey.substring(0, 20) + "..."
    );
    console.log(
      "Decoded API key (first 20 chars):",
      decodedApiKey.substring(0, 20) + "..."
    );
    console.log("API key decoded successfully");

    // Create a new FormData object for the API request
    const apiFormData = new FormData();

    // Add the decoded API key from environment variables
    apiFormData.append("key", decodedApiKey);
    console.log("Added decoded API key to FormData");
    console.log(
      "Verifying key in FormData:",
      apiFormData.get("key") ? "✓ Present" : "✗ Missing"
    );

    // Copy all other form fields to the new FormData (except key if it exists)
    for (const [key, value] of formData.entries()) {
      if (key !== "key") {
        // Don't copy client-side key, use server-side one
        apiFormData.append(key, value);
        console.log(
          `Added field to FormData: ${key} = ${
            typeof value === "string" ? value : "[File]"
          }`
        );
      } else {
        console.log("Skipping client-side 'key' field");
      }
    }

    console.log(
      "Final SpeechAce request fields:",
      Array.from(apiFormData.keys())
    );

    // Final verification before API call
    console.log("=== FINAL API REQUEST VERIFICATION ===");
    console.log("API URL:", speechAceApiUrl);
    console.log(
      "FormData fields count:",
      Array.from(apiFormData.keys()).length
    );
    console.log("Key field present:", apiFormData.has("key"));
    console.log(
      "Key field value (first 20 chars):",
      apiFormData.get("key")?.toString().substring(0, 20) + "..."
    );
    console.log("=== COMPLETE PAYLOAD CONTENTS ===");
    for (const [key, value] of apiFormData.entries()) {
      if (key === "key") {
        console.log(`- ${key}: ${value} (FULL API KEY)`);
      } else if (key === "user_audio_file") {
        console.log(
          `- ${key}: [Audio File - ${
            value instanceof File ? value.size : "Unknown size"
          } bytes]`
        );
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }
    console.log("======================================");

    // Log the exact request that will be made
    console.log("=== AXIOS REQUEST DETAILS ===");
    console.log("URL:", speechAceApiUrl);
    console.log("Method: POST");
    console.log("Headers: Content-Type: multipart/form-data");
    console.log(
      "FormData size:",
      Array.from(apiFormData.keys()).length,
      "fields"
    );
    console.log("=============================");

    // Make the request to SpeechAce API from the server
    console.log("🚀 MAKING REQUEST TO SPEECHACE API...");
    const response = await axios.post(speechAceApiUrl, apiFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("✅ SpeechAce API response received successfully");
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    console.log("Full response data:", JSON.stringify(response.data, null, 2));

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
