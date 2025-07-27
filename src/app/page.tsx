"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RouteProtection } from "@/components/route-protection";
import BottomNavigation from "@/components/BottomNavigation";
import MicrophoneButton from "@/components/MicrophoneButton";
import PhonemeTraining from "@/components/PhonemeTraining";
import InteractionDecision from "@/components/InteractionDecision";
import { TranscriptionDisplay } from "@/components/TranscriptionDisplay";
import { useState, useEffect, useRef } from "react";
import { Plus, Volume2 } from "lucide-react";
import InteractionFlowManager, {
  GreetingSequence,
  AgentResponse,
  PhonemeTrainingSession,
  InteractionDecision as InteractionDecisionType,
} from "@/lib/services/interaction-flow-manager";
import { SpeechAceResult } from "@/lib/services/speechace";

type AppState =
  | "waiting_for_penguin_click"
  | "initializing"
  | "greeting"
  | "waiting_for_user"
  | "processing_input"
  | "agent_responding"
  | "interaction_decision"
  | "phoneme_training"
  | "phoneme_feedback";

export default function HomePage() {
  const { user } = useAuth();
  const { languageConfig } = useLanguage();

  // Core state
  const [appState, setAppState] = useState<AppState>(
    "waiting_for_penguin_click"
  );
  const [currentGreeting, setCurrentGreeting] =
    useState<GreetingSequence | null>(null);
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(
    null
  );
  const [currentDecision, setCurrentDecision] =
    useState<InteractionDecisionType | null>(null);
  const [phonemeSession, setPhonemeSession] =
    useState<PhonemeTrainingSession | null>(null);

  // Input processing state
  const [transcriptionText, setTranscriptionText] = useState<string | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [aggregatedSpeechAceData, setAggregatedSpeechAceData] = useState<
    SpeechAceResult[]
  >([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // UI control state - hardcoded to false (no transcription display)
  const showTranscription = false; // Hardcoded to hide user transcription text

  // Services
  const flowManagerRef = useRef<InteractionFlowManager | null>(null);

  // Initialize interaction flow manager
  useEffect(() => {
    flowManagerRef.current = new InteractionFlowManager();
    // Don't start greeting automatically - wait for penguin click
  }, []);

  // Update language when context changes
  useEffect(() => {
    if (flowManagerRef.current) {
      const language = languageConfig.language === "es" ? "es" : "en";
      flowManagerRef.current.setLanguage(language);
    }
  }, [languageConfig]);

  /**
   * Handle penguin click to start the interaction
   */
  const handlePenguinClick = () => {
    if (appState === "waiting_for_penguin_click") {
      startInitialGreeting();
    }
  };

  /**
   * 1. Initial Greeting Sequence
   */
  const startInitialGreeting = async () => {
    if (!flowManagerRef.current) return;

    try {
      setAppState("initializing");
      const language = languageConfig.language === "es" ? "es" : "en";
      flowManagerRef.current.setLanguage(language);

      const greeting = await flowManagerRef.current.generateGreetingSequence();
      setCurrentGreeting(greeting);
      setAppState("greeting");

      // Play greeting immediately without delay
      if (greeting.audioContent) {
        await playAudio(greeting.audioContent);
      }

      // Set state to wait for user immediately after audio finishes
      setAppState("waiting_for_user");
    } catch (error) {
      console.error("Error starting initial greeting:", error);
      setAppState("waiting_for_user");
    }
  };

  /**
   * Play TTS audio content
   */
  const playAudio = async (base64Audio: string) => {
    if (!base64Audio || base64Audio.trim() === "" || isPlayingAudio) {
      return;
    }

    try {
      setIsPlayingAudio(true);

      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlayingAudio(false);
    }
  };

  /**
   * Handle microphone recording start
   */
  const handleTranscriptionStart = () => {
    setIsTranscribing(true);
    setTranscriptionText(null);
    setAudioBlob(null);
    setAppState("processing_input");
  };

  /**
   * 2. User Input Flow - Handle completed transcription with AudioProcessor results
   */
  const handleTranscriptionComplete = async (text: string, audio?: Blob) => {
    setIsTranscribing(false);
    // Stay in processing_input state to show "Processing..." message
    // setAppState("processing_input") - already set from handleTranscriptionStart

    setTranscriptionText(text);
    if (audio) {
      setAudioBlob(audio);
    }

    if (!flowManagerRef.current || !text.trim()) {
      setAppState("waiting_for_user");
      return;
    }

    try {
      // 3. Generate follow-up response
      setAppState("agent_responding");
      const response = await flowManagerRef.current.generateFollowUpResponse(
        text
      );
      setCurrentResponse(response);

      // Automatically play the response audio
      if (response.audioContent) {
        await playAudio(response.audioContent);
      }

      // Immediately determine next interaction without delay
      await determineNextInteraction();
    } catch (error) {
      console.error("Error processing user input:", error);
      setAppState("waiting_for_user");
    }
  };

  /**
   * Handle AudioProcessor segment processing (when using the existing system)
   */
  // These functions are currently unused - commenting out to reduce code complexity

  /**
   * Handle complete processing from AudioProcessor
   */
  // This function is currently unused - commenting out to reduce code complexity

  /**
   * 4. Post-Response Interaction Logic
   */
  const determineNextInteraction = async () => {
    if (!flowManagerRef.current) return;

    try {
      const decision = await flowManagerRef.current.determineNextInteraction(
        aggregatedSpeechAceData
      );
      setCurrentDecision(decision);

      if (decision.shouldOfferPhonemeTraining && decision.phonemeSession) {
        setPhonemeSession(decision.phonemeSession);
        setAppState("interaction_decision");
      } else {
        // Continue with conversation
        setAppState("waiting_for_user");
      }
    } catch (error) {
      console.error("Error determining next interaction:", error);
      setAppState("waiting_for_user");
    }
  };

  /**
   * Handle user choosing phoneme training
   */
  const handleChoosePhonemeTraining = () => {
    setAppState("phoneme_training");
  };

  /**
   * Handle user choosing to continue conversation
   */
  const handleContinueConversation = () => {
    setAppState("waiting_for_user");
    setCurrentDecision(null);
    setPhonemeSession(null);
  };

  /**
   * Handle phoneme practice completion
   */
  const handlePhonemeTrainingComplete = async (
    userAudio: Blob,
    transcription: string
  ) => {
    if (!flowManagerRef.current || !phonemeSession) return;

    try {
      setAppState("phoneme_feedback");

      const feedback =
        await flowManagerRef.current.processPhonemeTrainingFeedback(
          phonemeSession.practicePhrase,
          userAudio,
          phonemeSession.targetWord
        );

      // Show feedback (you could create a feedback component)
      alert(feedback.feedback); // Temporary - replace with proper UI

      if (feedback.shouldContinue) {
        // Stay in phoneme training for another round
        setAppState("phoneme_training");
      } else {
        // Training complete, continue conversation
        setAppState("waiting_for_user");
        setPhonemeSession(null);
        setCurrentDecision(null);
      }
    } catch (error) {
      console.error("Error processing phoneme training feedback:", error);
      setAppState("waiting_for_user");
    }
  };

  /**
   * Handle skipping phoneme training
   */
  const handleSkipPhonemeTraining = () => {
    handleContinueConversation();
  };

  /**
   * Restart conversation
   */
  const handleRestartConversation = () => {
    setAppState("initializing");
    setCurrentGreeting(null);
    setCurrentResponse(null);
    setCurrentDecision(null);
    setPhonemeSession(null);
    setTranscriptionText(null);
    setAudioBlob(null);
    setAggregatedSpeechAceData([]);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    startInitialGreeting();
  };

  /**
   * Generate TTS for penguin click message
   */
  const generatePenguinClickTTS = async () => {
    try {
      const language = languageConfig.language === "es" ? "es" : "en";
      const voiceName =
        language === "es" ? "es-ES-Standard-G" : "en-US-Standard-I";
      const text = "Click on me to start our conversation!";

      const response = await fetch("/api/google-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          languageCode: language === "es" ? "es-ES" : "en-US",
          voiceName,
        }),
      });

      if (response.ok) {
        const { audioContent } = await response.json();
        if (audioContent) {
          playAudio(audioContent);
        }
      }
    } catch (error) {
      console.error("Error generating TTS for penguin message:", error);
    }
  };

  /**
   * Replay current audio
   */
  const handleReplayAudio = async () => {
    if (isPlayingAudio) return;

    const audioToPlay =
      currentResponse?.audioContent || currentGreeting?.audioContent;

    if (audioToPlay) {
      playAudio(audioToPlay);
    } else if (appState === "waiting_for_penguin_click") {
      await generatePenguinClickTTS();
    }
  };

  /**
   * Clear transcription
   */
  const handleClearTranscription = () => {
    setTranscriptionText(null);
    setAudioBlob(null);
  };

  /**
   * Toggle transcription display
   */
  // Function removed - transcription display is now hardcoded

  // Determine what message to show in speech bubble
  const getSpeechBubbleContent = () => {
    if (appState === "waiting_for_penguin_click") {
      return {
        type: "agent" as const,
        text: "Click on me to start our conversation!",
      };
    }

    if (isTranscribing) {
      return { type: "listening" as const };
    }

    if (appState === "processing_input" && !isTranscribing) {
      return { type: "processing" as const };
    }

    // Show processing while Pip is generating response
    if (appState === "agent_responding") {
      return { type: "processing" as const };
    }

    // Show conversation with transcription only if showTranscription is true
    if (transcriptionText && currentResponse && showTranscription) {
      return {
        type: "conversation" as const,
        userText: transcriptionText,
        agentText: currentResponse.text,
      };
    }

    if (currentResponse) {
      return { type: "agent" as const, text: currentResponse.text };
    }

    if (currentGreeting) {
      return { type: "agent" as const, text: currentGreeting.text };
    }

    return null;
  };

  // Render speech bubble content based on type
  const renderSpeechBubbleContent = () => {
    if (!speechContent) return null;

    switch (speechContent.type) {
      case "listening":
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Listening...</span>
          </div>
        );

      case "processing":
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            <span className="text-sm text-gray-600">Pip is processing...</span>
          </div>
        );

      case "conversation":
        return (
          <div>
            <p className="text-sm text-gray-800 text-center mb-2">
              You said: "{speechContent.userText}"
            </p>
            <div className="border-t pt-2">
              <p className="text-sm text-blue-800 text-center">
                {speechContent.agentText}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-800 text-center">
            {speechContent.text}
          </p>
        );
    }
  };

  const speechContent = getSpeechBubbleContent();
  const showMicrophone = true; // Always show microphone, let button handle disabled states

  return (
    <RouteProtection>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 pb-20 px-4">
          <div className="max-w-md mx-auto pt-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-left flex-1">
                <h1 className="text-xl mb-1">
                  Welcome, {user?.displayName || user?.email}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {(() => {
                    switch (appState) {
                      case "waiting_for_penguin_click":
                        return "Click on Pip to start!";
                      case "waiting_for_user":
                        return "Your turn to speak!";
                      case "processing_input":
                        return "Processing...";
                      case "agent_responding":
                        return "Pip is responding...";
                      default:
                        return "Initializing...";
                    }
                  })()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRestartConversation}
                  className="w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-lg"
                  title="Start new conversation"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Section Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Main interaction area */}
            <div className="space-y-6">
              {/* Penguin with speech bubble */}
              <div className="relative flex flex-col items-center justify-center min-h-[400px]">
                {speechContent && (
                  <div className="relative mb-6 max-w-xs w-full">
                    <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 shadow-lg mx-auto">
                      {renderSpeechBubbleContent()}

                      {/* Audio replay button */}
                      {speechContent.type !== "listening" &&
                        speechContent.type !== "processing" &&
                        (currentResponse?.audioContent ||
                          currentGreeting?.audioContent ||
                          appState === "waiting_for_penguin_click") && (
                          <div className="mt-2 flex justify-center">
                            <button
                              onClick={handleReplayAudio}
                              disabled={isPlayingAudio}
                              className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors disabled:opacity-50"
                              title="Replay audio"
                            >
                              <Volume2
                                className={`w-4 h-4 text-blue-600 ${
                                  isPlayingAudio ? "animate-pulse" : ""
                                }`}
                              />
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Speech bubble tail */}
                    <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                      <div className="absolute top-[-2px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  </div>
                )}

                {/* Penguin SVG */}
                <div className="flex-shrink-0">
                  {appState === "waiting_for_penguin_click" ? (
                    <button
                      onClick={handlePenguinClick}
                      className="cursor-pointer animate-pulse hover:scale-105 transition-transform focus:outline-none"
                      aria-label="Click to start conversation with Fluensy"
                    >
                      <img
                        src="/penguin.svg"
                        alt="Fluensy Penguin"
                        className="w-32 h-32 mx-auto block"
                      />
                    </button>
                  ) : (
                    <img
                      src="/penguin.svg"
                      alt="Fluensy Penguin"
                      className="w-32 h-32 mx-auto block"
                    />
                  )}
                </div>
              </div>

              {/* Interaction Decision */}
              {appState === "interaction_decision" &&
                currentDecision?.phonemeSession && (
                  <InteractionDecision
                    targetWord={currentDecision.phonemeSession.targetWord}
                    onChoosePhonemeTraining={handleChoosePhonemeTraining}
                    onContinueConversation={handleContinueConversation}
                    language={languageConfig.language === "es" ? "es" : "en"}
                  />
                )}

              {/* Phoneme Training */}
              {appState === "phoneme_training" && phonemeSession && (
                <PhonemeTraining
                  targetWord={phonemeSession.targetWord}
                  targetPhoneme={phonemeSession.targetPhoneme}
                  practicePhrase={phonemeSession.practicePhrase}
                  audioContent={phonemeSession.audioContent}
                  onPracticeComplete={handlePhonemeTrainingComplete}
                  onSkip={handleSkipPhonemeTraining}
                  language={languageConfig.language === "es" ? "es" : "en"}
                />
              )}
            </div>
          </div>
        </main>

        {/* Hidden transcription display for audio controls */}
        {audioBlob && (
          <div className="hidden">
            <TranscriptionDisplay
              text={transcriptionText}
              isLoading={isTranscribing}
              audioBlob={audioBlob}
              onClear={handleClearTranscription}
            />
          </div>
        )}

        {/* Enhanced microphone button - only show when waiting for user */}
        {showMicrophone && (
          <MicrophoneButton
            onTranscriptionStart={handleTranscriptionStart}
            onTranscriptionComplete={handleTranscriptionComplete}
            isWaitingForUser={appState === "waiting_for_user"}
            isExternallyProcessing={
              (appState === "processing_input" && !isTranscribing) ||
              appState === "agent_responding" ||
              isPlayingAudio
            }
          />
        )}

        <BottomNavigation />
      </div>
    </RouteProtection>
  );
}
