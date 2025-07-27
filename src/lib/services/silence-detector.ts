export interface SilenceDetectorConfig {
  threshold: number;
  delay: number;
  onSilenceDetected: () => void;
  onSpeechStarted?: () => void;
  onSpeechStopped?: () => void;
}

export class SilenceDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isDetecting = false;
  private silenceStart: number | null = null;
  private isSpeaking = false; // Track current speaking state
  private config: SilenceDetectorConfig;
  private animationFrameId: number | null = null;

  constructor(config: SilenceDetectorConfig) {
    this.config = config;
  }

  async start(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      this.isDetecting = true;
      this.detectSilence();

      console.log("Silence detector started");
    } catch (error) {
      console.error("Error starting silence detector:", error);
      throw error;
    }
  }

  stop(): void {
    this.isDetecting = false;
    this.silenceStart = null;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log("Silence detector stopped");
  }

  private detectSilence(): void {
    if (!this.isDetecting || !this.analyser) return;

    const buffer = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(buffer);

    // Calculate the maximum amplitude
    const max = Math.max(...buffer.map((value) => Math.abs(value - 128))) / 128;

    if (max < this.config.threshold) {
      // We're in silence
      if (this.isSpeaking) {
        // Speech just stopped
        this.isSpeaking = false;
        if (this.config.onSpeechStopped) {
          this.config.onSpeechStopped();
        }
      }

      if (!this.silenceStart) {
        this.silenceStart = Date.now();
      } else if (Date.now() - this.silenceStart > this.config.delay) {
        // Silence detected for long enough
        console.log("Silence detected, triggering callback");
        this.config.onSilenceDetected();
        this.silenceStart = null; // Reset to avoid multiple triggers
        return;
      }
    } else {
      // Sound detected
      if (!this.isSpeaking) {
        // Speech just started
        this.isSpeaking = true;
        if (this.config.onSpeechStarted) {
          this.config.onSpeechStarted();
        }
      }

      // Reset silence timer
      this.silenceStart = null;
    }

    this.animationFrameId = requestAnimationFrame(() => this.detectSilence());
  }

  getCurrentVolume(): number {
    if (!this.analyser) return 0;

    const buffer = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(buffer);

    return Math.max(...buffer.map((value) => Math.abs(value - 128))) / 128;
  }
}
