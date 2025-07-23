import { Mic, Square } from "lucide-react";
import { useState } from "react";

export default function MicrophoneButton() {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      console.log("Recording started...");

      // Mock recording functionality
      // In a real app, you'd start microphone capture here
      // navigator.mediaDevices.getUserMedia({ audio: true })
    } else {
      // Stop recording
      setIsRecording(false);
      console.log("Recording stopped.");

      // In a real app, you'd stop microphone capture here
    }
  };

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={handleClick}
        className={`
          w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
          flex items-center justify-center
          ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }
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
