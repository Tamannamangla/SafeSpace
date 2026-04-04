import { useState, useRef, useCallback } from "react";

interface UseSpeechSynthesisResult {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [isSupported]);

  return { isSpeaking, isSupported, speak, stop };
}
