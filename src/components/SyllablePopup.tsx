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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex gap-4 mb-4 justify-center">
          <button
            onClick={onPlayNormal}
            className="rounded-full border-2 border-green-700 text-green-700 w-12 h-12 flex items-center justify-center hover:bg-green-50"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={onPlaySlow}
            className="rounded-full border-2 border-blue-700 text-blue-700 w-12 h-12 flex items-center justify-center hover:bg-blue-50"
          >
            <LuTurtle size={28} />
          </button>
        </div>
        <table className="w-full text-center border-t border-gray-200">
          <thead>
            <tr className="text-gray-700 text-sm">
              <th className="py-2">Syllable</th>
              <th>Phone</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {phones.map((phone, i) => (
              <tr key={i} className="text-lg">
                {i === 0 && (
                  <td
                    rowSpan={phones.length}
                    className="font-bold align-middle"
                  >
                    {syllable}
                  </td>
                )}
                <td>{phone}</td>
                <td>{scores[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
