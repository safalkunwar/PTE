export function playTtsFallback(textToSpeak: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.lang = "en-GB";
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
  ) ?? voices.find(v => v.lang.startsWith("en"));
  if (preferred) utterance.voice = preferred;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}
