import { assemblyAI } from "./assemblyai";
import { DeepSeekService } from "./deepseek";
import {
  SpeechAceService,
  SpeechAceResult,
  SpeechAceDialect,
} from "./speechace";
import { SilenceDetector } from "./silence-detector";

export interface AudioSegment {
  audioBlob: Blob;
  transcription: string;
  validatedTranscription: string;
  speechAceResult?: SpeechAceResult;
  timestamp: number;
}

export interface AudioProcessorConfig {
  assemblyAIKey: string;
  togetherAIKey: string;
  speechAceKey: string;
  speechAceUserId: string;
  silenceThreshold: number;
  silenceDelay: number;
  maxSegmentDuration: number;
  maxTotalDuration: number;
  groundTruthMode: "transcription" | "fixed";
  fixedGroundTruth?: string;
  // Language configuration
  language: "en" | "es";
  speechAceDialect?: SpeechAceDialect;
  deepSeekPrompt?: string;
  onSegmentProcessed?: (segment: AudioSegment) => void;
  onComplete?: (segments: AudioSegment[]) => void;
}

export class AudioProcessor {
  private config: AudioProcessorConfig;
  private deepSeek: DeepSeekService;
  private speechAce: SpeechAceService;
  private silenceDetector: SilenceDetector | null = null;

  private mediaRecorder: MediaRecorder | null = null;
  private currentChunks: Blob[] = [];
  private isRecording = false;
  private isSpeaking = false; // Track if user is actively speaking
  private hasSpeechInCurrentSegment = false; // Track if current segment has speech
  private startTime: number = 0;
  private segmentStartTime: number = 0;
  private segments: AudioSegment[] = [];

  private maxSegmentTimeout: NodeJS.Timeout | null = null;
  private maxTotalTimeout: NodeJS.Timeout | null = null;

  constructor(config: AudioProcessorConfig) {
    this.config = config;
    this.deepSeek = new DeepSeekService({ apiKey: config.togetherAIKey });
    this.speechAce = new SpeechAceService({
      apiKey: config.speechAceKey,
      userId: config.speechAceUserId,
      dialect: config.speechAceDialect,
    });
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.setupMediaRecorder();
      this.setupSilenceDetector(stream);

      this.startTime = Date.now();
      this.segmentStartTime = Date.now();
      this.hasSpeechInCurrentSegment = false; // Initialize speech tracking
      this.isSpeaking = false; // Initialize speaking state
      this.mediaRecorder.start();
      this.isRecording = true;

      // Set up timeouts
      this.setupTimeouts();
    } catch (error) {
      throw error;
    }
  }

  stopRecording(): void {
    this.isRecording = false;
    this.clearTimeouts();

    // Stop the media recorder and release the stream
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      }
      // Release the media stream tracks
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      this.mediaRecorder = null;
    }

    // Stop silence detector
    if (this.silenceDetector) {
      this.silenceDetector.stop();
      this.silenceDetector = null;
    }
  }

  private setupMediaRecorder(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.currentChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.processCurrentSegment();
    };
  }

  private setupSilenceDetector(stream: MediaStream): void {
    this.silenceDetector = new SilenceDetector({
      threshold: this.config.silenceThreshold,
      delay: this.config.silenceDelay,
      onSilenceDetected: () => this.onSilenceDetected(),
      onSpeechStarted: () => this.onSpeechStarted(),
      onSpeechStopped: () => this.onSpeechStopped(),
    });

    this.silenceDetector.start(stream);
  }

  private setupTimeouts(): void {
    // Timeout for current segment
    this.maxSegmentTimeout = setTimeout(() => {
      console.log("Max segment duration reached, processing segment");
      this.onSilenceDetected();
    }, this.config.maxSegmentDuration);

    // Timeout for total recording
    this.maxTotalTimeout = setTimeout(() => {
      console.log("Max total duration reached, stopping recording");
      this.stopRecording();
    }, this.config.maxTotalDuration);
  }

  private clearTimeouts(): void {
    if (this.maxSegmentTimeout) {
      clearTimeout(this.maxSegmentTimeout);
      this.maxSegmentTimeout = null;
    }

    if (this.maxTotalTimeout) {
      clearTimeout(this.maxTotalTimeout);
      this.maxTotalTimeout = null;
    }
  }

  private onSilenceDetected(): void {
    if (!this.isRecording || !this.mediaRecorder) return;

    this.mediaRecorder.stop();

    // Only start a new segment if still recording
    const elapsed = Date.now() - this.startTime;
    if (this.isRecording && elapsed < this.config.maxTotalDuration) {
      setTimeout(() => {
        if (this.isRecording) this.startNewSegment();
      }, 100);
    }
  }

  private onSpeechStarted(): void {
    this.isSpeaking = true;
    this.hasSpeechInCurrentSegment = true;
  }

  private onSpeechStopped(): void {
    this.isSpeaking = false;
  }

  private async startNewSegment(): Promise<void> {
    if (!this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.setupMediaRecorder();
      this.setupSilenceDetector(stream);

      this.segmentStartTime = Date.now();
      this.hasSpeechInCurrentSegment = false; // Reset speech flag for new segment
      this.mediaRecorder.start();

      // Reset segment timeout
      if (this.maxSegmentTimeout) {
        clearTimeout(this.maxSegmentTimeout);
      }

      const remainingTime =
        this.config.maxTotalDuration - (Date.now() - this.startTime);
      const segmentTimeout = Math.min(
        this.config.maxSegmentDuration,
        remainingTime
      );

      this.maxSegmentTimeout = setTimeout(() => {
        if (this.isRecording) this.onSilenceDetected();
      }, segmentTimeout);
    } catch (error) {
      // Swallow error silently
    }
  }

  private async processCurrentSegment(): Promise<void> {
    if (this.currentChunks.length === 0) {
      return;
    }

    // Only process segments that contain actual speech
    if (!this.hasSpeechInCurrentSegment) {
      this.currentChunks = []; // Clear chunks without processing
      return;
    }

    try {
      const audioBlob = new Blob(this.currentChunks, { type: "audio/webm" });
      this.currentChunks = [];

      let groundTruth = "";
      let transcription = "";
      let validatedTranscription = "";

      if (this.config.groundTruthMode === "fixed") {
        // Use provided ground truth, skip AssemblyAI
        groundTruth = this.config.fixedGroundTruth || "";
      } else {
        // Use AssemblyAI to transcribe audio and use as ground truth
        const transcriptionResult = await assemblyAI.transcribeAudio(
          audioBlob,
          {
            language: this.config.language,
            apiKey: this.config.assemblyAIKey,
          }
        );
        transcription = transcriptionResult.text;
        validatedTranscription = transcriptionResult.text;
        groundTruth = transcriptionResult.text;
      }

      // Step 3: Analyze with SpeechAce (silently, no user feedback)
      let speechAceResult: SpeechAceResult | undefined;
      try {
        speechAceResult = await this.speechAce.scoreText(
          audioBlob,
          groundTruth,
          this.config.speechAceDialect,
          `segment_${this.segments.length + 1}`
        );
      } catch (error) {
        // Swallow error silently
      }

      // Step 4: Create segment
      const segment: AudioSegment = {
        audioBlob,
        transcription,
        validatedTranscription,
        speechAceResult,
        timestamp: this.segmentStartTime,
      };

      this.segments.push(segment);

      // Step 5: Notify segment processed (silent process)
      if (this.config.onSegmentProcessed) {
        this.config.onSegmentProcessed(segment);
      }
    } catch (error) {
      // Swallow error silently
    }

    // Check if recording is complete
    if (!this.isRecording) {
      this.completeProcessing();
    }
  }

  private completeProcessing(): void {
    if (this.config.onComplete) {
      this.config.onComplete(this.segments);
    }
  }

  getSegments(): AudioSegment[] {
    return [...this.segments];
  }

  getCombinedTranscription(): string {
    return this.segments
      .map((segment) => segment.validatedTranscription)
      .filter((text) => text.trim().length > 0)
      .join(" ");
  }

  getCombinedAudio(): Blob | null {
    if (this.segments.length === 0) return null;

    const audioBlobs = this.segments.map((segment) => segment.audioBlob);
    return new Blob(audioBlobs, { type: "audio/webm" });
  }
}
