"use client";

import { RouteProtection } from "@/components/route-protection";
import BottomNavigation from "@/components/BottomNavigation";
import MicrophoneButton from "@/components/MicrophoneButton";
import { TranscriptionDisplay } from "@/components/TranscriptionDisplay";
import { useState } from "react";

export default function ExercisePage() {
  const [transcriptionText, setTranscriptionText] = useState<string | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Example fixed ground truth for pronunciation practice
  const exercisePhrase = "The quick brown fox jumps over the lazy dog";

  const handleTranscriptionStart = () => {
    setIsTranscribing(true);
    setTranscriptionText(null);
    setAudioBlob(null);
  };

  const handleTranscriptionComplete = (text: string, audio?: Blob) => {
    console.log("Exercise transcription completed:", text);
    setIsTranscribing(false);
    setTranscriptionText(text);
    if (audio) {
      setAudioBlob(audio);
    }
  };

  const handleClearTranscription = () => {
    setTranscriptionText(null);
    setAudioBlob(null);
  };

  return (
    <RouteProtection>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main content area */}
        <main className="flex-1 pb-20 px-4">
          <div className="max-w-md mx-auto pt-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl mb-2">Pronunciation Exercise</h1>
              <p className="text-muted-foreground mb-6">
                Practice pronouncing the phrase below
              </p>

              {/* Exercise phrase display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Practice Phrase:
                </h3>
                <p className="text-lg font-medium text-blue-800">
                  "{exercisePhrase}"
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Press the microphone button and say the phrase above. Your
                pronunciation will be analyzed automatically.
              </p>
            </div>
          </div>
        </main>

        {/* Transcription display */}
        <TranscriptionDisplay
          text={transcriptionText}
          isLoading={isTranscribing}
          audioBlob={audioBlob}
          onClear={handleClearTranscription}
        />

        {/* Floating microphone button with fixed ground truth */}
        <MicrophoneButton
          onTranscriptionStart={handleTranscriptionStart}
          onTranscriptionComplete={handleTranscriptionComplete}
          groundTruthMode="fixed"
          fixedGroundTruth={exercisePhrase}
        />

        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
    </RouteProtection>
  );
}
