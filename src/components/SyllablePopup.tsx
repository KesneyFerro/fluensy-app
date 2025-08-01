import { LuTurtle } from "react-icons/lu";

interface SyllablePopupProps {
  open: boolean;
  onClose: () => void;
  syllable: string;
  phones: string[];
  scores: string[];
  onPlayNormal: () => void;
  onPlaySlow: () => void;
}

export const SyllablePopup: React.FC<SyllablePopupProps> = ({
  open,
  onClose,
  syllable,
  phones,
  scores,
  onPlayNormal,
  onPlaySlow,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50">
      <div className="bg-background border rounded-xl shadow-xl p-6 min-w-[320px] relative">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex gap-4 mb-4 justify-center">
          <button
            onClick={onPlayNormal}
            className="rounded-full border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 w-12 h-12 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={onPlaySlow}
            className="rounded-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 w-12 h-12 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <LuTurtle size={28} />
          </button>
        </div>
        <table className="w-full text-center border-t border-border">
          <thead>
            <tr className="text-muted-foreground text-sm">
              <th className="py-2">Syllable</th>
              <th>Phone</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {phones.map((phone, i) => (
              <tr key={i} className="text-lg text-foreground">
                {i === 0 && (
                  <td
                    rowSpan={phones.length}
                    className="font-bold align-middle text-foreground"
                  >
                    {syllable}
                  </td>
                )}
                <td className="text-foreground">{phone}</td>
                <td className="text-foreground">{scores[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
