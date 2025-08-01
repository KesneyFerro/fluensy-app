import React, { useState } from "react";

interface SyllableScore {
  letters: string;
  quality_score: number;
}

interface ColoredPhraseProps {
  phrase: string;
  syllableScores: SyllableScore[];
  thresholds?: { good: number; ok: number };
  onSyllableClick?: (syllable: string) => void;
}

// Default thresholds: good >= 85, ok >= 60, else bad
const defaultThresholds = { good: 85, ok: 60 };

export const ColoredPhrase: React.FC<ColoredPhraseProps> = ({
  phrase,
  syllableScores,
  thresholds = defaultThresholds,
  onSyllableClick,
}) => {
  // Improved: preserve every character and space exactly as in the original phrase
  let phrasePos = 0;
  let syllIdx = 0;
  const colored: React.ReactNode[] = [];
  while (phrasePos < phrase.length) {
    let matched = false;
    if (syllIdx < syllableScores.length) {
      const syll = syllableScores[syllIdx];
      const part = phrase.substr(phrasePos, syll.letters.length);
      // Case-insensitive match, but always render the original phrase substring
      if (part.length === syll.letters.length && part.localeCompare(syll.letters, undefined, { sensitivity: 'accent' }) === 0 || part.toLowerCase() === syll.letters.toLowerCase()) {
        const color =
          syll.quality_score >= thresholds.good
            ? "text-green-600"
            : syll.quality_score >= thresholds.ok
            ? "text-yellow-600"
            : "text-red-600";
        colored.push(
          <span
            key={`syll-${syllIdx}`}
            className={`cursor-pointer font-semibold ${color}`}
            onClick={() => onSyllableClick?.(part)}
          >
            {part}
          </span>
        );
        phrasePos += syll.letters.length;
        syllIdx++;
        matched = true;
      }
    }
    if (!matched) {
      // Group consecutive spaces together for a single span
      if (phrase[phrasePos] === ' ') {
        let spaceStart = phrasePos;
        while (phrase[phrasePos] === ' ' && phrasePos < phrase.length) {
          phrasePos++;
        }
        colored.push(
          <span key={`space-${spaceStart}`}>{phrase.slice(spaceStart, phrasePos)}</span>
        );
      } else {
        colored.push(
          <span key={`char-${phrasePos}`}>{phrase[phrasePos]}</span>
        );
        phrasePos++;
      }
    }
  }
  return <div className="text-xl whitespace-pre-wrap">{colored}</div>;
};
