import { useState, useRef, useCallback } from "react";

interface IWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface UseSpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition(
  onResult: (text: string) => void
): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const w = typeof window !== "undefined" ? (window as unknown as IWindow) : null;
  const SpeechRecognitionAPI = w?.SpeechRecognition ?? w?.webkitSpeechRecognition ?? null;

  const isSupported = SpeechRecognitionAPI != null;

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI || isListening) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      const fullText = finalText + interimText;
      setTranscript(fullText);
      onResult(fullText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [SpeechRecognitionAPI, isListening, onResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, isSupported, start, stop };
}
