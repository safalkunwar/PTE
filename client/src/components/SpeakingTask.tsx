/**
 * SpeakingTask — Enhanced speaking task component for PTE Academic
 *
 * Features:
 * - Preparation countdown with animated circular timer (task-specific durations)
 * - Recording phase with live waveform and auto-stop timer
 * - Real-time Web Speech API transcription during recording
 * - Post-submission word-level colour highlighting:
 *     ✅ Green   = correctly pronounced / matched
 *     🟡 Yellow  = hesitation / repeated word
 *     🔴 Red     = mispronounced / missing word
 *     🔵 Blue    = extra word not in original
 *     ⬜ Grey    = skipped / not spoken
 * - Fluency metrics: WPM, pause count, repair count
 * - Side-by-side original vs. spoken comparison
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Mic, Square, Volume2, CheckCircle, AlertCircle,
  Clock, Zap, Info, RefreshCw, ChevronRight, Activity,
} from "lucide-react";

// ─── Task timing config (seconds) ────────────────────────────────────────────

export const SPEAKING_TIMINGS: Record<string, { prep: number; record: number; label: string }> = {
  read_aloud: { prep: 40, record: 40, label: "Read Aloud" },
  repeat_sentence: { prep: 0, record: 15, label: "Repeat Sentence" },
  describe_image: { prep: 25, record: 40, label: "Describe Image" },
  retell_lecture: { prep: 10, record: 40, label: "Re-tell Lecture" },
  answer_short_question: { prep: 3, record: 10, label: "Answer Short Question" },
};

// ─── Word alignment types ─────────────────────────────────────────────────────

type WordStatus = "correct" | "hesitation" | "mispronounced" | "extra" | "missing";

interface AlignedWord {
  word: string;
  status: WordStatus;
  spokenWord?: string; // what was actually said (for mismatches)
}

const STATUS_STYLES: Record<WordStatus, { bg: string; text: string; border: string; tooltip: string }> = {
  correct:      { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300",  tooltip: "Correctly pronounced" },
  hesitation:   { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", tooltip: "Hesitation / repeated" },
  mispronounced:{ bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300",    tooltip: "Mispronounced / unclear" },
  extra:        { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300",   tooltip: "Extra word (not in original)" },
  missing:      { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300",   tooltip: "Missing / not spoken" },
};

// ─── Circular countdown timer ─────────────────────────────────────────────────

function CircularTimer({
  total,
  remaining,
  phase,
}: {
  total: number;
  remaining: number;
  phase: "prep" | "record";
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = circumference * (1 - progress);

  const isUrgent = remaining <= 10;
  const color = phase === "prep"
    ? (isUrgent ? "#f59e0b" : "#0d9488")
    : (isUrgent ? "#ef4444" : "#ef4444");

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span
          className={`text-3xl font-black tabular-nums ${isUrgent ? "text-red-500 animate-pulse" : phase === "prep" ? "text-teal-600" : "text-red-500"}`}
        >
          {remaining}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
          {phase === "prep" ? "seconds" : "sec left"}
        </span>
      </div>
    </div>
  );
}

// ─── Waveform bars ────────────────────────────────────────────────────────────

function LiveWaveform({ isActive }: { isActive: boolean }) {
  const bars = 20;
  return (
    <div className="flex items-center justify-center gap-0.5 h-10">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${isActive ? "bg-red-400" : "bg-gray-200"}`}
          style={{
            height: isActive ? `${Math.random() * 28 + 4}px` : "4px",
            animation: isActive ? `waveform-pulse ${0.4 + i * 0.05}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Word-level highlight display ─────────────────────────────────────────────

function WordHighlight({ words }: { words: AlignedWord[] }) {
  const [tooltip, setTooltip] = useState<{ word: string; status: WordStatus; x: number; y: number } | null>(null);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 leading-relaxed">
        {words.map((w, i) => {
          const style = STATUS_STYLES[w.status];
          return (
            <span
              key={i}
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-sm font-medium cursor-help transition-transform hover:scale-105 ${style.bg} ${style.text} ${style.border}`}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltip({ word: w.word, status: w.status, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {w.status === "missing" ? (
                <span className="line-through opacity-60">{w.word}</span>
              ) : (
                w.word
              )}
              {w.status === "mispronounced" && w.spokenWord && (
                <span className="ml-1 text-[10px] opacity-70">→ "{w.spokenWord}"</span>
              )}
            </span>
          );
        })}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 36 }}
        >
          {STATUS_STYLES[tooltip.status].tooltip}
        </div>
      )}
    </div>
  );
}

// ─── Colour legend ────────────────────────────────────────────────────────────

function ColourLegend() {
  const items: Array<{ status: WordStatus; label: string }> = [
    { status: "correct",       label: "Correct" },
    { status: "hesitation",    label: "Hesitation" },
    { status: "mispronounced", label: "Mispronounced" },
    { status: "extra",         label: "Extra word" },
    { status: "missing",       label: "Missing" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map(({ status, label }) => {
        const s = STATUS_STYLES[status];
        return (
          <div key={status} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
            <div className={`w-2 h-2 rounded-full ${s.bg.replace("100", "400")}`} />
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Fluency metrics bar ──────────────────────────────────────────────────────

function FluencyMetrics({
  wpm,
  pauseCount,
  correctPct,
  missingPct,
}: {
  wpm: number;
  pauseCount: number;
  correctPct: number;
  missingPct: number;
}) {
  const wpmColor = wpm >= 100 && wpm <= 160 ? "text-green-600" : wpm < 80 || wpm > 200 ? "text-red-600" : "text-yellow-600";
  const wpmLabel = wpm >= 100 && wpm <= 160 ? "Good pace" : wpm < 80 ? "Too slow" : wpm > 200 ? "Too fast" : "Slightly off";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
        <div className={`text-2xl font-black ${wpmColor}`}>{wpm}</div>
        <div className="text-xs text-gray-500 mt-0.5">WPM</div>
        <div className={`text-[10px] font-medium mt-0.5 ${wpmColor}`}>{wpmLabel}</div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
        <div className={`text-2xl font-black ${pauseCount <= 2 ? "text-green-600" : pauseCount <= 5 ? "text-yellow-600" : "text-red-600"}`}>
          {pauseCount}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Pauses</div>
        <div className="text-[10px] font-medium mt-0.5 text-gray-400">
          {pauseCount <= 2 ? "Fluent" : pauseCount <= 5 ? "Some pauses" : "Too many pauses"}
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
        <div className={`text-2xl font-black ${correctPct >= 80 ? "text-green-600" : correctPct >= 60 ? "text-yellow-600" : "text-red-600"}`}>
          {correctPct}%
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Accuracy</div>
        <div className="text-[10px] font-medium mt-0.5 text-gray-400">
          {correctPct >= 80 ? "Excellent" : correctPct >= 60 ? "Good" : "Needs work"}
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
        <div className={`text-2xl font-black ${missingPct <= 10 ? "text-green-600" : missingPct <= 25 ? "text-yellow-600" : "text-red-600"}`}>
          {missingPct}%
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Omissions</div>
        <div className="text-[10px] font-medium mt-0.5 text-gray-400">
          {missingPct <= 10 ? "Complete" : missingPct <= 25 ? "Some skipped" : "Many skipped"}
        </div>
      </div>
    </div>
  );
}

// ─── Word alignment algorithm ─────────────────────────────────────────────────

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, "");
}

/**
 * Align spoken words against the original text using a simple
 * Levenshtein-based sequence alignment.
 * Returns an array of AlignedWord with status for each original word,
 * plus any extra spoken words appended at the end.
 */
function alignWords(originalText: string, spokenText: string): AlignedWord[] {
  const origWords = originalText.trim().split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.trim().split(/\s+/).filter(Boolean);

  if (!spokenWords.length) {
    return origWords.map(w => ({ word: w, status: "missing" as WordStatus }));
  }

  const origNorm = origWords.map(normalizeWord);
  const spokenNorm = spokenWords.map(normalizeWord);

  // DP alignment (LCS-based)
  const m = origNorm.length;
  const n = spokenNorm.length;

  // Build DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origNorm[i - 1] === spokenNorm[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Traceback
  const aligned: AlignedWord[] = [];
  const extraWords: AlignedWord[] = [];
  let i = m, j = n;

  const origResult: Array<{ origIdx: number; spokenIdx: number | null }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origNorm[i - 1] === spokenNorm[j - 1]) {
      origResult.unshift({ origIdx: i - 1, spokenIdx: j - 1 });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Extra spoken word
      extraWords.push({ word: spokenWords[j - 1]!, status: "extra" });
      j--;
    } else {
      // Missing original word
      origResult.unshift({ origIdx: i - 1, spokenIdx: null });
      i--;
    }
  }

  // Build result for original words
  for (const { origIdx, spokenIdx } of origResult) {
    const origWord = origWords[origIdx]!;
    if (spokenIdx === null) {
      aligned.push({ word: origWord, status: "missing" });
    } else {
      const spokenWord = spokenWords[spokenIdx]!;
      const oNorm = origNorm[origIdx]!;
      const sNorm = spokenNorm[spokenIdx]!;

      if (oNorm === sNorm) {
        // Check for hesitation: same word repeated in spoken
        const prevSpoken = spokenIdx > 0 ? spokenNorm[spokenIdx - 1] : null;
        if (prevSpoken === sNorm) {
          aligned.push({ word: origWord, status: "hesitation", spokenWord });
        } else {
          aligned.push({ word: origWord, status: "correct" });
        }
      } else {
        // Mispronounced (close but not exact)
        aligned.push({ word: origWord, status: "mispronounced", spokenWord });
      }
    }
  }

  return [...aligned, ...extraWords];
}

// ─── Compute fluency metrics ──────────────────────────────────────────────────

function computeFluencyMetrics(
  aligned: AlignedWord[],
  durationSeconds: number
): { wpm: number; pauseCount: number; correctPct: number; missingPct: number } {
  const total = aligned.filter(w => w.status !== "extra").length;
  const correct = aligned.filter(w => w.status === "correct").length;
  const missing = aligned.filter(w => w.status === "missing").length;
  const hesitations = aligned.filter(w => w.status === "hesitation").length;

  const spokenWords = aligned.filter(w => w.status !== "missing").length;
  const wpm = durationSeconds > 0 ? Math.round((spokenWords / durationSeconds) * 60) : 0;

  return {
    wpm,
    pauseCount: hesitations,
    correctPct: total > 0 ? Math.round((correct / total) * 100) : 0,
    missingPct: total > 0 ? Math.round((missing / total) * 100) : 0,
  };
}

// ─── Main SpeakingTask component ──────────────────────────────────────────────

interface SpeakingTaskProps {
  taskType: string;
  originalText?: string;        // the text to be read/repeated (for alignment)
  onRecordingComplete: (blob: Blob) => void;
  transcription?: string;       // filled after Whisper transcription returns
  isSubmitted?: boolean;        // true once the response has been scored
  recordingDuration?: number;   // seconds of the recording (for WPM calc)
}

type Phase = "prep" | "recording" | "done";

export default function SpeakingTask({
  taskType,
  originalText,
  onRecordingComplete,
  transcription,
  isSubmitted,
  recordingDuration,
}: SpeakingTaskProps) {
  const timing = SPEAKING_TIMINGS[taskType] ?? { prep: 0, record: 40, label: "Speaking" };

  const [phase, setPhase] = useState<Phase>(timing.prep > 0 ? "prep" : "recording");
  const [prepRemaining, setPrepRemaining] = useState(timing.prep);
  const [recordRemaining, setRecordRemaining] = useState(timing.record);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [recordStart, setRecordStart] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);

  // ── Start recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        const dur = (Date.now() - recordStart) / 1000;
        setActualDuration(dur);
        setPhase("done");
        setAudioBlob(blob);
        onRecordingComplete(blob);
        clearInterval(recordTimerRef.current);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordStart(Date.now());

      // Start record countdown
      recordTimerRef.current = setInterval(() => {
        setRecordRemaining(prev => {
          if (prev <= 1) {
            clearInterval(recordTimerRef.current);
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Web Speech API for live transcript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition: any = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result && result[0]) {
              if (result.isFinal) {
                final += result[0].transcript + " ";
              } else {
                interim += result[0].transcript;
              }
            }
          }
          setLiveTranscript(prev => (prev + final + interim).trim());
        };
        recognition.onerror = () => {}; // silently ignore errors
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch {
      toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
    }
  }, [onRecordingComplete, recordStart]);

  // ── Stop recording manually ────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    speechRecognitionRef.current?.stop();
    clearInterval(recordTimerRef.current);
  }, []);

  // ── Prep countdown ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "prep") return;

    if (timing.prep === 0) {
      setPhase("recording");
      return;
    }

    prepTimerRef.current = setInterval(() => {
      setPrepRemaining(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          setPhase("recording");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(prepTimerRef.current);
  }, [phase, timing.prep]);

  // ── Auto-start recording when phase changes ────────────────────────────────

  useEffect(() => {
    if (phase === "recording" && !isRecording) {
      startRecording();
    }
  }, [phase, isRecording, startRecording]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearInterval(prepTimerRef.current);
      clearInterval(recordTimerRef.current);
      speechRecognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ── Compute alignment (shown after submission) ────────────────────────────

  const finalTranscript = transcription || liveTranscript;
  const aligned = (isSubmitted && originalText && finalTranscript)
    ? alignWords(originalText, finalTranscript)
    : null;

  const fluency = (aligned && (recordingDuration ?? actualDuration) > 0)
    ? computeFluencyMetrics(aligned, recordingDuration ?? actualDuration)
    : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── PREP PHASE ── */}
      {phase === "prep" && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Phase label */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">Preparation Time</span>
            </div>

            {/* Circular timer */}
            <CircularTimer total={timing.prep} remaining={prepRemaining} phase="prep" />

            {/* Task instructions */}
            <div className="text-center max-w-sm">
              {taskType === "read_aloud" && (
                <p className="text-sm text-teal-700">
                  Read the text carefully. Recording will begin automatically when the timer reaches zero.
                </p>
              )}
              {taskType === "describe_image" && (
                <p className="text-sm text-teal-700">
                  Study the image. Plan what you will say about the key features, trends, or comparisons.
                </p>
              )}
              {taskType === "retell_lecture" && (
                <p className="text-sm text-teal-700">
                  Review your notes. Organise the main points you heard in the lecture.
                </p>
              )}
              {taskType === "answer_short_question" && (
                <p className="text-sm text-teal-700">
                  Think of your answer. Speak clearly and concisely when recording starts.
                </p>
              )}
            </div>

            {/* Prep tips */}
            <div className="bg-white/70 rounded-xl p-3 w-full max-w-sm border border-teal-100">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-700 space-y-1">
                  {taskType === "read_aloud" && (
                    <>
                      <p>• Scan the entire text before speaking</p>
                      <p>• Note punctuation for natural pauses</p>
                      <p>• Aim for 100–160 words per minute</p>
                    </>
                  )}
                  {taskType === "describe_image" && (
                    <>
                      <p>• Identify the main topic of the image</p>
                      <p>• Note 2–3 key features or trends</p>
                      <p>• Plan an opening, body, and conclusion</p>
                    </>
                  )}
                  {taskType === "retell_lecture" && (
                    <>
                      <p>• Start with the main topic</p>
                      <p>• Include 2–3 supporting details</p>
                      <p>• End with a conclusion or implication</p>
                    </>
                  )}
                  {taskType === "answer_short_question" && (
                    <>
                      <p>• Give a direct, concise answer</p>
                      <p>• One or two words is often enough</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORDING PHASE ── */}
      {phase === "recording" && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Phase label */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-red-700 uppercase tracking-wider">Recording</span>
            </div>

            {/* Circular timer */}
            <CircularTimer total={timing.record} remaining={recordRemaining} phase="record" />

            {/* Mic icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center shadow-lg">
              <Mic className="w-7 h-7 text-red-500" />
            </div>

            {/* Waveform */}
            <LiveWaveform isActive={isRecording} />

            {/* Live transcript */}
            {liveTranscript && (
              <div className="w-full bg-white/80 rounded-xl border border-red-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Live Transcript</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{liveTranscript}"</p>
              </div>
            )}

            {/* Stop button */}
            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="border-red-300 text-red-600 hover:bg-red-50 mt-1"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Stop Recording
            </Button>

            <p className="text-xs text-red-400">Recording stops automatically when the timer ends</p>
          </div>
        </div>
      )}

      {/* ── DONE PHASE (before submission result) ── */}
      {phase === "done" && !isSubmitted && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-sm font-bold text-green-700">Recording Complete</p>

            {/* Live transcript preview */}
            {liveTranscript && (
              <div className="w-full bg-white/80 rounded-xl border border-green-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">What You Said</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{liveTranscript}"</p>
              </div>
            )}

            {/* Audio playback */}
            {audioBlob && (
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-1.5 text-center">Review your recording:</p>
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-10 rounded-lg" />
              </div>
            )}

            <p className="text-xs text-green-500">Click Submit to get your AI score and pronunciation feedback</p>
          </div>
        </div>
      )}

      {/* ── POST-SUBMISSION: Pronunciation Analysis ── */}
      {isSubmitted && finalTranscript && (
        <div className="space-y-4">
          {/* What you said */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-teal-500" />
              <h4 className="text-sm font-bold text-gray-800">What You Said</h4>
              <Badge variant="outline" className="text-xs ml-auto">Whisper Transcription</Badge>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100 italic">
              "{finalTranscript}"
            </p>
          </div>

          {/* Word-level analysis */}
          {aligned && originalText && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h4 className="text-sm font-bold text-gray-800">Pronunciation Analysis</h4>
                <span className="text-xs text-gray-400 ml-auto">Hover over words for details</span>
              </div>

              {/* Tabs: Original vs Spoken */}
              <div className="space-y-4">
                {/* Original text with highlights */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Original Text — Colour-Coded by Pronunciation
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <WordHighlight words={aligned} />
                  </div>
                </div>

                {/* Colour legend */}
                <ColourLegend />

                {/* Side-by-side comparison */}
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
                      ✓ Original Text
                    </p>
                    <p className="text-xs text-teal-800 leading-relaxed">{originalText}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                      🎤 You Said
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed">{finalTranscript}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fluency metrics */}
          {fluency && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-bold text-gray-800">Fluency Metrics</h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">Based on your recording duration and word alignment</p>
              <FluencyMetrics {...fluency} />

              {/* WPM guide */}
              <div className="mt-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 mb-1">PTE Speaking Speed Guide</p>
                <div className="flex gap-3 text-xs text-purple-600">
                  <span className="text-red-500">{"< 80 WPM"} = Too slow</span>
                  <span className="text-green-600">100–160 WPM = Ideal</span>
                  <span className="text-red-500">{"> 200 WPM"} = Too fast</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
