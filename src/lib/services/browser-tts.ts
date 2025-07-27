/**
 * Fallback TTS service using the browser's built-in Speech Synthesis API
 * This will be used when Google TTS is not available or fails
 */
export class BrowserTTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();

    // If voices are not loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synth.addEventListener("voiceschanged", () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  /**
   * Get appropriate voice for language and mood
   */
  private getVoice(
    languageCode: string,
    mood: string = "friendly"
  ): SpeechSynthesisVoice | null {
    // Wait for voices to load if they haven't yet
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    // Find voice by language
    const targetLang = languageCode.substring(0, 2); // 'en' from 'en-US'

    // Prefer high-quality voices
    const preferredVoices = this.voices.filter(
      (voice) =>
        voice.lang.startsWith(targetLang) && !voice.name.includes("Google") // Avoid potential conflicts
    );

    // Try to find a suitable voice based on mood and quality
    if (preferredVoices.length > 0) {
      // For English, prefer certain voices
      if (targetLang === "en") {
        const goodVoices = preferredVoices.filter(
          (voice) =>
            voice.name.includes("Enhanced") ||
            voice.name.includes("Premium") ||
            voice.name.includes("Natural")
        );
        if (goodVoices.length > 0) {
          return goodVoices[0];
        }
      }

      return preferredVoices[0];
    }

    // Fallback to any voice that matches the language
    const fallbackVoice = this.voices.find((voice) =>
      voice.lang.startsWith(targetLang)
    );
    return fallbackVoice || null;
  }

  /**
   * Speak text using browser TTS
   */
  async speak(
    text: string,
    languageCode: string = "en-US",
    mood: string = "friendly"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      const voice = this.getVoice(languageCode, mood);
      if (voice) {
        utterance.voice = voice;
      }

      // Set language
      utterance.lang = languageCode;

      // Set speech parameters based on mood
      const moodConfig = this.getMoodConfig(mood);
      utterance.rate = moodConfig.rate;
      utterance.pitch = moodConfig.pitch;
      utterance.volume = moodConfig.volume;

      // Set up event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error("Browser TTS error:", event);
        reject(new Error("Speech synthesis failed"));
      };

      // Start speaking
      this.synth.speak(utterance);
    });
  }

  /**
   * Get speech parameters based on mood
   */
  private getMoodConfig(mood: string): {
    rate: number;
    pitch: number;
    volume: number;
  } {
    const configs: Record<
      string,
      { rate: number; pitch: number; volume: number }
    > = {
      excited: { rate: 1.2, pitch: 1.2, volume: 1.0 },
      calm: { rate: 0.9, pitch: 0.9, volume: 0.8 },
      happy: { rate: 1.1, pitch: 1.1, volume: 1.0 },
      sad: { rate: 0.8, pitch: 0.8, volume: 0.7 },
      serious: { rate: 0.9, pitch: 1.0, volume: 0.9 },
      friendly: { rate: 1.0, pitch: 1.0, volume: 1.0 },
      encouraging: { rate: 1.0, pitch: 1.1, volume: 1.0 },
      default: { rate: 1.0, pitch: 1.0, volume: 1.0 },
    };

    return configs[mood.toLowerCase()] || configs["default"];
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    this.synth.cancel();
  }

  /**
   * Check if speech synthesis is available
   */
  isAvailable(): boolean {
    return "speechSynthesis" in window;
  }

  /**
   * Get available voices for debugging
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

export default BrowserTTSService;
