"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import MicrophoneButton from "./MicrophoneButton";
import type { AudioSegment } from "../lib/services/audio-processor";

export interface PhonemeTrainingProps {
  readonly targetWord: string;
  readonly targetPhoneme: string;
  readonly practicePhrase: string;
  readonly audioContent?: string;
  readonly onPracticeComplete: (userAudio: Blob, transcription: string) => void;
  readonly onSkip: () => void;
  readonly language: "en" | "es" | "fr";
}

export default function PhonemeTraining({
  targetWord,
  targetPhoneme,
  practicePhrase,
  audioContent,
  onPracticeComplete,
  onSkip,
  language,
}: PhonemeTrainingProps) {
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [hasPlayedExample, setHasPlayedExample] = useState(false);

  const playExampleAudio = async () => {
    if (!audioContent || isPlayingExample) return;

    try {
      setIsPlayingExample(true);
      setHasPlayedExample(true);

      // Convert base64 to blob and play
      const byteCharacters = atob(audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlayingExample(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlayingExample(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing example audio:", error);
      setIsPlayingExample(false);
    }
  };

  const handleTranscriptionComplete = (segments: AudioSegment[]) => {
    if (segments.length > 0) {
      const firstSegment = segments[0];
      if (firstSegment.audioBlob && firstSegment.transcription) {
        onPracticeComplete(firstSegment.audioBlob, firstSegment.transcription);
      }
    }
  };

  const labels = {
    en: {
      title: "Phoneme Practice",
      noticed: `I noticed you had trouble with the word "${targetWord}".`,
      wouldLike: "Would you like to practice it?",
      practiceWith: "Practice with this phrase:",
      listenFirst: "Listen to the example first:",
      nowYouTry: "Now you try! Click the microphone to record:",
      skipPractice: "No, continue conversation",
      tryAgain: "Try Again",
    },
    es: {
      title: "Práctica de Fonemas",
      noticed: `Noté que tuviste dificultades con la palabra "${targetWord}".`,
      wouldLike: "¿Te gustaría practicarla?",
      practiceWith: "Practica con esta frase:",
      listenFirst: "Escucha el ejemplo primero:",
      nowYouTry: "¡Ahora inténtalo tú! Haz clic en el micrófono para grabar:",
      skipPractice: "No, continuar conversación",
      tryAgain: "Intentar de Nuevo",
    },
    fr: {
      title: "Pratique des Phonèmes",
      noticed: `J'ai remarqué que vous avez eu des difficultés avec le mot "${targetWord}".`,
      wouldLike: "Aimeriez-vous le pratiquer ?",
      practiceWith: "Pratiquez avec cette phrase :",
      listenFirst: "Écoutez d'abord l'exemple :",
      nowYouTry:
        "Maintenant à vous ! Cliquez sur le microphone pour enregistrer :",
      skipPractice: "Non, continuer la conversation",
      tryAgain: "Essayer Encore",
    },
  };

  const l = labels[language];

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
          {l.title}
        </h3>

        <div className="space-y-4">
          {/* Explanation */}
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-2">{l.noticed}</p>
            <p className="text-sm font-medium text-blue-700">{l.wouldLike}</p>
          </div>

          {/* Target word highlight */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
            <span className="text-lg font-bold text-yellow-800">
              {targetWord}
            </span>
            {targetPhoneme !== "unknown" && (
              <p className="text-xs text-yellow-600 mt-1">
                Focus on: /{targetPhoneme}/
              </p>
            )}
          </div>

          {/* Practice phrase */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {l.practiceWith}
            </p>
            <div className="bg-white border rounded-lg p-3">
              <p className="text-center font-medium text-gray-800">
                "{practicePhrase}"
              </p>
            </div>
          </div>

          {/* Example audio section */}
          {audioContent && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {l.listenFirst}
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={playExampleAudio}
                  disabled={isPlayingExample}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Volume2
                    className={`w-4 h-4 ${
                      isPlayingExample ? "animate-pulse" : ""
                    }`}
                  />
                  {isPlayingExample ? "Playing..." : "Listen"}
                </Button>
              </div>
            </div>
          )}

          {/* Practice section */}
          {(hasPlayedExample || !audioContent) && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                {l.nowYouTry}
              </p>

              {/* Custom microphone button for practice */}
              <div className="flex justify-center">
                <MicrophoneButton
                  onTranscriptionStart={() => {}}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  groundTruthMode="fixed"
                  fixedGroundTruth={practicePhrase}
                  isWaitingForUser={true}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onSkip} variant="outline" className="flex-1">
              {l.skipPractice}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
