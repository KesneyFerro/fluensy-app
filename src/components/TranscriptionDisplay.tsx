import { Card } from "./ui/card";
import { X } from "lucide-react";

interface TranscriptionDisplayProps {
  readonly text: string | null;
  readonly isLoading: boolean;
  readonly audioBlob?: Blob | null;
  readonly onClear?: () => void;
}

export function TranscriptionDisplay({
  text,
  isLoading,
  onClear,
}: TranscriptionDisplayProps) {
  if (!text && !isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40 px-4">
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg p-6 max-w-lg w-full pointer-events-auto relative">
        {onClear && text && !isLoading && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Clear transcription"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Processing audio with advanced AI analysis...
            </span>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Enhanced Transcription:
            </h3>
            <p className="text-lg leading-relaxed">{text}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              ✨ Processed with AssemblyAI + DeepSeek validation + SpeechAce
              analysis
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
