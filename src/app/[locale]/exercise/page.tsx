"use client";

import { RouteProtection } from "@/components/route-protection";
import BottomNavigation from "@/components/BottomNavigation";
import MicrophoneButton from "@/components/MicrophoneButton";
// import { TranscriptionDisplay } from "@/components/TranscriptionDisplay";
import { useState } from "react";
import { ColoredPhrase } from "@/components/ColoredPhrase";
import { SyllablePopup } from "@/components/SyllablePopup";
import { playTTS } from "@/lib/playTTS";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/translations";

export default function ExercisePage() {
  const { currentLanguage } = useLanguage();
  const t = useTranslations(currentLanguage);

  // Helper to get phones and scores for a syllable from SpeechAce result
  function getPhonesAndScores(syllable: string, speechAceResult: any) {
    if (!speechAceResult?.text_score?.word_score_list)
      return { phones: [], scores: [] };
    for (const word of speechAceResult.text_score.word_score_list) {
      if (!word.syllable_score_list) continue;
      for (const syll of word.syllable_score_list) {
        if (syll.letters.toLowerCase() === syllable.toLowerCase()) {
          // Find phones for this syllable in phone_score_list
          const phones: string[] = [];
          const scores: string[] = [];
          if (word.phone_score_list) {
            for (const phone of word.phone_score_list) {
              if (phone.word_extent && phone.word_extent.length === 2) {
                // Just push all phones for now (could refine by extent)
                phones.push(phone.phone);
                scores.push(
                  phone.quality_score >= 85
                    ? "Good"
                    : phone.quality_score >= 60
                    ? "OK"
                    : "Needs work"
                );
              }
            }
          }
          return { phones, scores };
        }
      }
    }
    return { phones: [], scores: [] };
  }
  // No transcription or AssemblyAI logic needed
  const [syllableScores, setSyllableScores] = useState<any[] | null>(null);
  const [speechAceResult, setSpeechAceResult] = useState<any | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSyllable, setPopupSyllable] = useState<string>("");

  // Example fixed ground truth for pronunciation practice
  const exercisePhrase = "The quick brown fox jumps over the lazy dog";

  const handleTranscriptionStart = () => {};

  // Accepts segments array from MicrophoneButton
  const handleTranscriptionComplete = (segments: any[]) => {
    if (!segments || segments.length === 0) {
      setSyllableScores(null);
      setSpeechAceResult(null);
      return;
    }
    // Use the last segment (should have speechAceResult)
    const last = segments[segments.length - 1];
    if (last.speechAceResult && last.speechAceResult.text_score) {
      setSpeechAceResult(last.speechAceResult);
      // Syllable scores: last.speechAceResult.text_score.word_score_list[0].syllable_score_list
      const wordList = last.speechAceResult.text_score.word_score_list || [];
      let sylls: any[] = [];
      wordList.forEach((w: any) => {
        if (w.syllable_score_list) {
          sylls = sylls.concat(w.syllable_score_list);
        }
      });
      setSyllableScores(sylls);
    } else {
      setSyllableScores(null);
    }
  };

  // No transcription to clear

  return (
    <RouteProtection>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 pb-20 px-4">
          <div className="max-w-md mx-auto pt-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl mb-2">{t.pronunciationExercise}</h1>
              <p className="text-muted-foreground mb-6">{t.practiceSubtitle}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  {t.practicePhrase}
                </h3>
                {/* Colored phrase if available, else plain */}
                {syllableScores ? (
                  <ColoredPhrase
                    phrase={exercisePhrase}
                    syllableScores={syllableScores}
                    onSyllableClick={(syll) => {
                      setPopupSyllable(syll);
                      setPopupOpen(true);
                    }}
                  />
                ) : (
                  <p className="text-lg font-medium text-blue-800">
                    "{exercisePhrase}"
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t.practiceInstructions}
              </p>
            </div>
          </div>
        </main>

        <MicrophoneButton
          onTranscriptionStart={handleTranscriptionStart}
          onTranscriptionComplete={handleTranscriptionComplete}
          groundTruthMode="fixed"
          fixedGroundTruth={exercisePhrase}
          maxRecordingSeconds={15}
        />
        <BottomNavigation />
        {/* Syllable popup modal */}
        <SyllablePopup
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          syllable={popupSyllable}
          phones={getPhonesAndScores(popupSyllable, speechAceResult).phones}
          scores={getPhonesAndScores(popupSyllable, speechAceResult).scores}
          onPlayNormal={async () => {
            // Find the parent word for the syllable
            let word = popupSyllable;
            if (speechAceResult?.text_score?.word_score_list) {
              for (const w of speechAceResult.text_score.word_score_list) {
                if (
                  w.syllable_score_list?.some(
                    (s: any) =>
                      s.letters.toLowerCase() === popupSyllable.toLowerCase()
                  )
                ) {
                  word = w.word;
                  break;
                }
              }
            }
            await playTTS(word, false);
          }}
          onPlaySlow={async () => {
            let word = popupSyllable;
            if (speechAceResult?.text_score?.word_score_list) {
              for (const w of speechAceResult.text_score.word_score_list) {
                if (
                  w.syllable_score_list?.some(
                    (s: any) =>
                      s.letters.toLowerCase() === popupSyllable.toLowerCase()
                  )
                ) {
                  word = w.word;
                  break;
                }
              }
            }
            await playTTS(word, true);
          }}
        />
      </div>
    </RouteProtection>
  );
}
