import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceLang = "en" | "hi";

// Split text into sentence-sized chunks for natural pacing
function splitSentences(text: string): string[] {
  const parts: string[] = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [];
  const leftover = text.replace(/[^.!?]+[.!?]+[\s]*/g, "").trim();
  if (leftover.length > 0) parts.push(leftover);
  return parts.map((s) => s.trim()).filter(Boolean);
}

function pickVoice(lang: VoiceLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const isHindi = lang === "hi";
  const prefix = isHindi ? "hi" : "en";

  // Prefer high-quality Google voices, then any network voice, then local
  const candidates: Array<SpeechSynthesisVoice | undefined> = [
    voices.find((v) => v.name === "Google US English"),
    voices.find((v) => v.name === "Google UK English Female"),
    voices.find((v) => v.name === "Google UK English Male"),
    voices.find((v) => v.lang.startsWith(prefix) && v.name.toLowerCase().includes("google")),
    voices.find((v) => v.lang === (isHindi ? "hi-IN" : "en-US") && !v.localService),
    voices.find((v) => v.lang.startsWith(prefix) && !v.localService),
    voices.find((v) => v.lang.startsWith(prefix)),
  ];
  return candidates.find(Boolean) ?? null;
}

export function useVoice() {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [lang, setLang] = useState<VoiceLang>("en");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const activeRef = useRef<boolean>(false);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Chrome bug: speechSynthesis pauses itself after ~14s — resume it
  useEffect(() => {
    if (!supported) return;
    const id = setInterval(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);
    return () => {
      clearInterval(id);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    activeRef.current = false;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const enqueueSentence = useCallback(
    (sentence: string, isFirst: boolean, isLast: boolean) => {
      if (!sentence.trim()) return;
      const hasDevanagari = /[\u0900-\u097F]/.test(sentence);
      const useLang: VoiceLang = hasDevanagari ? "hi" : lang;
      const langCode = useLang === "hi" ? "hi-IN" : "en-US";

      const utt = new SpeechSynthesisUtterance(sentence.trim());
      utt.lang = langCode;
      utt.rate = 0.95;   // near-natural — not sluggish
      utt.pitch = 1.0;
      utt.volume = 1;

      const voice = pickVoice(useLang);
      if (voice) utt.voice = voice;

      if (isFirst) {
        utt.onstart = () => {
          activeRef.current = true;
          setIsSpeaking(true);
        };
      }
      if (isLast) {
        utt.onend = () => {
          activeRef.current = false;
          setIsSpeaking(false);
        };
      }
      utt.onerror = (e) => {
        if (e.error !== "canceled") {
          activeRef.current = false;
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utt);
    },
    [lang]
  );

  // Speak a full text — cancels any in-progress speech, then queues all sentences
  const speak = useCallback(
    (text: string) => {
      if (!supported || !voiceEnabled || !text.trim()) return;
      window.speechSynthesis.cancel();
      activeRef.current = false;

      const sentences = splitSentences(text);
      if (sentences.length === 0) return;
      sentences.forEach((s, i) => enqueueSentence(s, i === 0, i === sentences.length - 1));
    },
    [supported, voiceEnabled, enqueueSentence]
  );

  // Append a new chunk to the current speaking queue (for streaming)
  const speakChunk = useCallback(
    (chunk: string) => {
      if (!supported || !voiceEnabled || !chunk.trim()) return;
      const sentences = splitSentences(chunk);
      sentences.forEach((s) => enqueueSentence(s, !activeRef.current, false));
    },
    [supported, voiceEnabled, enqueueSentence]
  );

  return {
    voiceEnabled,
    setVoiceEnabled,
    lang,
    setLang,
    speak,
    speakChunk,
    stop,
    isSpeaking,
    supported,
  };
}
