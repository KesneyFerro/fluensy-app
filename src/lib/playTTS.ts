// Utility for caching and playing TTS audio for a word at a given speed
// Uses localStorage for caching (base64-encoded audio)

// Use /api/google-tts endpoint for TTS, cache as base64 in localStorage
export async function playTTS(
  word: string,
  slow: boolean = false,
  languageCode: string = "en-US"
) {
  // Always use the same cache key and voice for both normal and slow
  const cacheKey = `tts_${languageCode}_${word}_normal`;
  let base64Audio = localStorage.getItem(cacheKey);
  if (!base64Audio) {
    // Fetch audio from internal API (always normal speed)
    const response = await fetch("/api/google-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: word,
        languageCode,
        mood: "friendly",
      }),
    });
    if (!response.ok) throw new Error("TTS fetch failed");
    const data = await response.json();
    if (!data.audioContent) throw new Error("No audio content returned");
    base64Audio = `data:audio/mp3;base64,${data.audioContent}`;
    localStorage.setItem(cacheKey, base64Audio);
  }
  const audio = new Audio(base64Audio);
  if (slow) audio.playbackRate = 0.7;
  audio.play();
}
