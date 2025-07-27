"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface InteractionDecisionProps {
  targetWord?: string;
  onChoosePhonemeTraining: () => void;
  onContinueConversation: () => void;
  language: "en" | "es";
}

export default function InteractionDecision({
  targetWord,
  onChoosePhonemeTraining,
  onContinueConversation,
  language,
}: InteractionDecisionProps) {
  const labels = {
    en: {
      noticed: targetWord
        ? `I noticed you had trouble with the word "${targetWord}".`
        : "I noticed some pronunciation challenges.",
      wouldLike: "Would you like to practice it?",
      yesTraining: "Yes, I want to practice",
      noContinue: "No, continue conversation",
    },
    es: {
      noticed: targetWord
        ? `Noté que tuviste dificultades con la palabra "${targetWord}".`
        : "Noté algunos desafíos de pronunciación.",
      wouldLike: "¿Te gustaría practicarla?",
      yesTraining: "Sí, quiero practicar",
      noContinue: "No, continuar conversación",
    },
  };

  const l = labels[language];

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-6 bg-orange-50 border-orange-200">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-700">{l.noticed}</p>
          <p className="text-sm font-medium text-orange-700">{l.wouldLike}</p>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={onChoosePhonemeTraining}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {l.yesTraining}
            </Button>

            <Button
              onClick={onContinueConversation}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {l.noContinue}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
