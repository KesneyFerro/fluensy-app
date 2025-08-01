import type { AudioSegment } from "../lib/services/audio-processor";
import { Mic, Square } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { AudioProcessor } from "../lib/services/audio-processor";
import { useLanguage } from "../contexts/LanguageContext";

interface MicrophoneButtonProps {
  readonly onTranscriptionStart: () => void;
  readonly onTranscriptionComplete: (segments: AudioSegment[]) => void;
  readonly groundTruthMode?: "transcription" | "fixed";
  readonly fixedGroundTruth?: string;
  readonly isWaitingForUser?: boolean;
  readonly isExternallyProcessing?: boolean;
  readonly maxRecordingSeconds?: number; // Optional max recording time in seconds
}

export default function MicrophoneButton({
  onTranscriptionStart,
  onTranscriptionComplete,
  groundTruthMode = "transcription",
  fixedGroundTruth,
  isWaitingForUser = false,
  isExternallyProcessing = false,
  maxRecordingSeconds = 60,
}: MicrophoneButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { languageConfig, getDeepSeekPrompt } = useLanguage();

  const startRecording = useCallback(async () => {
    try {
      onTranscriptionStart();



      // Support both transcription and fixed modes
      const config: any = {
        speechAceKey: process.env.NEXT_PUBLIC_SPEECHACE_API_KEY || "",
        speechAceUserId: process.env.NEXT_PUBLIC_SPEECHACE_USER_ID || "",
        silenceThreshold: parseFloat(
          process.env.NEXT_PUBLIC_SILENCE_THRESHOLD || "0.01"
        ),
        silenceDelay: parseInt(process.env.NEXT_PUBLIC_SILENCE_DELAY || "1000"),
        maxSegmentDuration: parseInt(
          process.env.NEXT_PUBLIC_MAX_SEGMENT_DURATION || "12000"
        ),
        maxTotalDuration: parseInt(
          process.env.NEXT_PUBLIC_MAX_TOTAL_DURATION || "60000"
        ),
        groundTruthMode: groundTruthMode,
        fixedGroundTruth,
        language: languageConfig.assemblyAICode as "en" | "es",
        speechAceDialect: languageConfig.speechAceDialect as any,
        onSegmentProcessed: (segment: AudioSegment) => {
          // Segment processed silently in background
        },
        onComplete: (segments: AudioSegment[]) => {
          // All segments processing completed
          onTranscriptionComplete(segments);

          // Reset all states when processing is complete
          setIsRecording(false);
          setIsProcessing(false);
          setRecordingTime(0);

          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
        },
      };

      // Only needed for transcription mode
      if (groundTruthMode === "transcription") {
        config.assemblyAIKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "";
        config.togetherAIKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "";
      }

      if (!config.speechAceKey) {
        throw new Error("SpeechAce API key is required");
      }
      if (groundTruthMode === "transcription" && !config.assemblyAIKey) {
        throw new Error("AssemblyAI API key is required");
      }

      audioProcessorRef.current = new AudioProcessor(config);
      await audioProcessorRef.current.startRecording();

      setIsRecording(true);
      setRecordingTime(0);

      // Start timer to track recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= maxRecordingSeconds) {
            // Stop at maxRecordingSeconds
            stopRecording();
            return maxRecordingSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      console.log(
        `Advanced audio processing started successfully (${languageConfig.displayName})`
      );
    } catch (error) {
      console.error("Error starting audio processing:", error);

      // For error, pass an empty array to indicate failure
      onTranscriptionComplete([]);
      setIsRecording(false);
    }
  }, [
    onTranscriptionStart,
    onTranscriptionComplete,
    groundTruthMode,
    fixedGroundTruth,
    languageConfig,
    getDeepSeekPrompt,
  ]);

  const stopRecording = useCallback(() => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
      audioProcessorRef.current = null;
    }

    // Immediately set recording to false and processing to true
    setIsRecording(false);
    setIsProcessing(true);
    setRecordingTime(0);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, []);

  const handleClick = () => {
    // Don't allow clicks during processing
    if (isProcessing) return;

    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getButtonClasses = () => {
    if (isRecording) {
      return "bg-red-500 hover:bg-red-600 text-white";
    }
    if (isProcessing || isExternallyProcessing) {
      return "bg-gray-400 text-white opacity-75 cursor-not-allowed";
    }
    if (isWaitingForUser) {
      return "bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-blue-400 animate-pulse";
    }
    return "bg-primary hover:bg-primary/90 text-primary-foreground";
  };

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Stopwatch display */}
      <div className="mb-2 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-mono">
        {formatTime(recordingTime)}/{formatTime(maxRecordingSeconds)}
      </div>

      {/* Microphone button */}
      <button
        onClick={handleClick}
        disabled={isProcessing || isExternallyProcessing}
        className={`
          w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
          flex items-center justify-center cursor-pointer disabled:cursor-not-allowed
          ${getButtonClasses()}
        `}
      >
        {isRecording ? (
          <Square className="w-6 h-6 fill-current" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
