import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceLang = "en" | "hi";

export function useVoice() {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [lang, setLang] = useState<VoiceLang>("en");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !voiceEnabled || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Auto-detect Hindi by Devanagari characters
      const hasDevanagari = /[\u0900-\u097F]/.test(text);
      const useLang = hasDevanagari ? "hi" : lang;
      const langCode = useLang === "hi" ? "hi-IN" : "en-US";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.88;   // slightly slower = gentle, calm
      utterance.pitch = 1.05;  // slightly warm
      utterance.volume = 1;

      // Try to pick the best available voice for the language
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith(useLang === "hi" ? "hi" : "en") && v.localService
      ) || voices.find(
        (v) => v.lang.startsWith(useLang === "hi" ? "hi" : "en")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, voiceEnabled, lang]
  );

  return { voiceEnabled, setVoiceEnabled, lang, setLang, speak, stop, isSpeaking, supported };
}
