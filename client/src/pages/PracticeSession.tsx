import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Mic, MicOff, Square, Play, Clock, CheckCircle, AlertCircle,
  ChevronRight, Volume2, Info, Loader2, ArrowRight, RotateCcw, Brain
} from "lucide-react";
import AIFeedbackPanel from "@/components/AIFeedbackPanel";
import SpeakingTask from "@/components/SpeakingTask";
import { SPEAKING_TIMINGS } from "@/lib/speakingTiming";
import NavigationControls from "@/components/NavigationControls";
import TaskStudyResourceModal from "@/components/TaskStudyResourceModal";
import { PracticeHeader } from "@/components/PracticeHeader";
import AttemptHistory, { InlineAttemptHistory, type Attempt } from "@/components/AttemptHistory";
import { getAudioFallbackText, isUsablePromptAudioUrl } from "@/lib/taskMedia";
import { canStartPromptPlayback, getPromptPlaybackStatus } from "@/lib/examAudioReplay";
import { validateVisualPromptReadiness } from "@/lib/visualPromptValidation";
import { playTtsFallback } from "@/lib/ttsAudioFallback";
import { withMediaRetry } from "@/lib/mediaRetry";
import { applyAttemptScore } from "@/lib/attemptHistory";
import { isSubmitDisabled } from "@/lib/practiceToolbar";
import { buildSessionQuestionUrl, getAdjacentQuestionIndex, resolveSessionQuestionId, shouldCompleteSession } from "@/lib/sessionFlow";
import { hasRequiredQuestionContent, hasScoreableResponse } from "@shared/pteValidation";
import { getPteTaskProcedure } from "@shared/pteTaskConfig";
import { getTextResponseTaskConfig, isListeningAudioPrompt, isTextResponseTask } from "@/lib/listeningPrompt";
import { hasCompleteReadingAnswerBankSelection, isReadingAnswerBankTask } from "@/lib/readingFillBlanks";
import ReadingFillBlanks from "@/components/ReadingFillBlanks";
import { hasCompleteInlineDropdownSelection, isInlineDropdownFillBlanksTask } from "@/lib/inlineDropdownFillBlanks";
import InlineDropdownFillBlanks from "@/components/InlineDropdownFillBlanks";


interface TaskResult {
  responseId: number;
  overallScore?: number;
  normalizedScore?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  pronunciationFeedback?: string;
  fluencyFeedback?: string;
  grammarErrors?: string[];
  vocabularyFeedback?: string;
  isCorrect?: boolean;
  transcription?: string;
  timeTaken?: number;
  // Enhanced AI scoring fields
  cefrLevel?: string;
  wordLevelFeedback?: string;
  modelAnswer?: string;
  strategyTips?: string[];
  traits?: Record<string, { score: number; maxScore: number; feedback: string }>;
  rawScore?: number;
  maxRawScore?: number;
  wordCount?: number;
  explanation?: string;
  scoreConfidence?: number;
  needsReview?: boolean;
}

// ── Repeat Sentence TTS Auto-play ───────────────────────────────────────────
// Plays the sentence once automatically when the component mounts,
// then shows a "Replay" button. Mimics the real PTE exam behaviour.

function RepeatSentencePlayer({ sentence }: { sentence: string }) {
  const [status, setStatus] = useState<"playing" | "done" | "error">("playing");
  const [hasPlayed, setHasPlayed] = useState(false);

  const playTTS = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setStatus("error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = "en-GB";
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
    ) ?? voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { setStatus("done"); setHasPlayed(true); };
    utterance.onerror = () => { setStatus("error"); setHasPlayed(true); };
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }, []);

  // Auto-play on mount — wait for voices to load first
  useEffect(() => {
    const startPlayback = () => playTTS(sentence);
    if (window.speechSynthesis.getVoices().length > 0) {
      // Voices already loaded — small delay to let the UI render first
      const t = setTimeout(startPlayback, 600);
      return () => clearTimeout(t);
    } else {
      // Voices not yet loaded — wait for the event
      window.speechSynthesis.addEventListener("voiceschanged", startPlayback, { once: true });
      return () => window.speechSynthesis.removeEventListener("voiceschanged", startPlayback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          status === "playing" ? "bg-teal-500 animate-pulse" : "bg-teal-100"
        }`}>
          <Volume2 className={`w-5 h-5 ${ status === "playing" ? "text-white" : "text-teal-600" }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-700">
            {status === "playing" ? "Playing sentence…" : status === "done" ? "Sentence played — now repeat it" : "Could not play audio"}
          </p>
          <p className="text-xs text-teal-600 mt-0.5">
            {status === "playing"
              ? "Listen carefully. The sentence will play once."
              : "Recording will begin automatically. Repeat the sentence exactly as you heard it."}
          </p>
        </div>
        {hasPlayed && (
          <button
            onClick={() => playTTS(sentence)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay
          </button>
        )}
      </div>
      {status === "playing" && (
        <div className="mt-3 flex items-center gap-1.5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="w-1 bg-teal-400 rounded-full animate-bounce"
              style={{ height: `${6 + (i % 4) * 4}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
          <span className="text-xs text-teal-500 ml-1 animate-pulse">Audio playing…</span>
        </div>
      )}
    </div>
  );
}

// Timer component
function CountdownTimer({ seconds, onExpire, urgent = false }: { seconds: number; onExpire: () => void; urgent?: boolean }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Stable ref so the interval callback always calls the latest onExpire
  // without needing it as a dependency (avoids re-creating the interval).
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      // Defer out of the render phase to avoid "setState during render" warning
      const t = setTimeout(() => onExpireRef.current(), 0);
      return () => clearTimeout(t);
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Defer here too — the setRemaining updater runs inside React internals
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 30 && urgent;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${isUrgent ? "text-red-500 animate-pulse" : "text-foreground"}`}>
      <Clock className="w-4 h-4" />
      {mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`}
    </div>
  );
}

// Audio recorder component
function AudioRecorder({ onRecordingComplete, preparationTime = 0 }: {
  onRecordingComplete: (audioBlob: Blob) => void;
  preparationTime?: number;
}) {
  const [phase, setPhase] = useState<"preparing" | "recording" | "done">(preparationTime > 0 ? "preparing" : "recording");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [prepTime, setPrepTime] = useState(preparationTime);

  useEffect(() => {
    if (phase === "preparing" && preparationTime > 0) {
      const timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("recording");
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    if (phase === "recording" && !isRecording) {
      startRecording();
    }
  }, [phase]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        setPhase("done");
        onRecordingComplete(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (phase === "preparing") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center">
          <span className="text-2xl font-bold text-yellow-600">{prepTime}</span>
        </div>
        <p className="text-sm text-muted-foreground">Preparation time — recording starts automatically</p>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center recording-pulse">
          <Mic className="w-7 h-7 text-red-500" />
        </div>
        <div className="flex gap-1 items-end h-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="waveform-bar w-1.5 bg-red-400 rounded-full" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-sm font-medium text-red-600">Recording... Speak clearly</p>
        <Button variant="outline" size="sm" onClick={stopRecording} className="border-red-300 text-red-600">
          <Square className="w-3 h-3 mr-1.5 fill-current" />
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center">
        <CheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <p className="text-sm text-green-600 font-medium">Recording complete — processing...</p>
    </div>
  );
}

// Trait score bar component
function TraitBar({ label, score, maxScore, feedback, color = "blue" }: {
  label: string; score: number; maxScore: number; feedback: string; color?: string;
}) {
  const pct = Math.round((score / maxScore) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500",
    orange: "bg-orange-500", teal: "bg-teal-500", red: "bg-red-500",
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorMap[color] || colorMap.blue}`} style={{ width: `${pct}%` }} />
      </div>
      {feedback && <p className="text-xs text-muted-foreground leading-snug">{feedback}</p>}
    </div>
  );
}

function QuestionAudioPlayer({ audioUrl, fallbackText, label, allowReplay = true }: { audioUrl?: string; fallbackText: string; label: string; allowReplay?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const hasStartedRef = useRef(false);
  const [usingFallback, setUsingFallback] = useState(!audioUrl);
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(Boolean(audioUrl));
  const [mediaRetryCount, setMediaRetryCount] = useState(0);
  const [speed, setSpeed] = useState(0.9);

  useEffect(() => {
    setUsingFallback(!audioUrl);
    setMediaError(false);
    setMediaLoading(Boolean(audioUrl));
    setMediaRetryCount(0);
    setIsPlaying(false);
    setHasFinished(false);
    hasStartedRef.current = false;
    // Auto-play audio when question loads as requested
    const timer = setTimeout(() => {
      try {
        play();
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [audioUrl]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  const playFallback = useCallback(() => {
    const started = playTtsFallback(fallbackText, () => setIsPlaying(false));
    if (started) {
      setUsingFallback(true);
      setIsPlaying(true);
      toast.info("Using synthesized audio for this practice prompt.");
    } else {
      toast.error("Audio playback is not supported in this browser.");
    }
  }, [fallbackText]);

  const retryAudio = useCallback(() => {
    setUsingFallback(false);
    setMediaError(false);
    setMediaLoading(true);
    setMediaRetryCount(previous => previous + 1);
  }, []);

  const audioSrc = audioUrl ? withMediaRetry(audioUrl, mediaRetryCount) : undefined;

  const play = useCallback(() => {
    if (!canStartPromptPlayback(hasStartedRef.current, allowReplay)) return;
    hasStartedRef.current = true;
    if (usingFallback || !audioRef.current) {
      playFallback();
      return;
    }
    audioRef.current.playbackRate = speed;
    void audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => playFallback());
  }, [allowReplay, playFallback, speed, usingFallback]);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Volume2 className="h-4 w-4 shrink-0 text-blue-600" />
        <span className="text-xs font-bold text-blue-800">{label}</span>
        <span className="text-[10px] text-blue-600">{usingFallback ? "Synthesized prompt" : "Exam-style audio"}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {allowReplay && isPlaying ? (
            <Button type="button" size="sm" variant="outline" onClick={stop} className="h-7 border-blue-300 px-2 text-xs text-blue-700">
              Stop
            </Button>
          ) : allowReplay ? (
            <Button type="button" size="sm" onClick={play} className="h-7 bg-blue-600 px-2 text-xs text-white hover:bg-blue-700">
              <Play className="mr-1 h-3 w-3 fill-current" /> Play
            </Button>
          ) : null}
          {allowReplay && <select
            aria-label="Audio playback speed"
            value={speed}
            onChange={(event) => {
              const nextSpeed = Number(event.target.value);
              setSpeed(nextSpeed);
              if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
            }}
            className="h-7 rounded-md border border-blue-200 bg-white px-1.5 text-[11px] text-blue-700"
          >
            <option value={0.7}>0.7x</option>
            <option value={0.9}>0.9x</option>
            <option value={1}>1x</option>
            <option value={1.1}>1.1x</option>
          </select>
          }
        </div>
      </div>
      {mediaLoading && !usingFallback && <p className="mt-2 text-[10px] text-blue-600">Loading exam-style audio…</p>}
      {mediaError && audioUrl && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] text-amber-800">
          <span>Original audio could not be loaded. A synthesized fallback is available.</span>
          {allowReplay && <Button type="button" variant="outline" size="sm" onClick={retryAudio} className="h-6 border-amber-300 px-2 text-[10px] text-amber-800">
            Retry audio
          </Button>}
        </div>
      )}
      <p className="mt-2 text-[10px] text-blue-600">{getPromptPlaybackStatus(hasFinished, allowReplay)}</p>
      {isPlaying && <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />Audio playing…</div>}
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" onLoadStart={() => setMediaLoading(true)} onCanPlay={() => setMediaLoading(false)} onEnded={() => { setIsPlaying(false); setHasFinished(true); }} onError={() => { setMediaLoading(false); setMediaError(true); setUsingFallback(true); setIsPlaying(false); playFallback(); }} controlsList="nodownload" />}
    </div>
  );
}

function PersonalIntroductionConfirmation() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <CheckCircle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-blue-900">Personal Introduction saved</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-blue-800">
        This is an unscored familiarization task. Use it to check your microphone and become comfortable with the PTE test environment; it does not contribute to your PTE score.
      </p>
    </div>
  );
}

// Score display component
function ScoreDisplay({ result, taskType }: { result: TaskResult; taskType: string }) {
  const displayScore = result.normalizedScore ?? result.overallScore;
  const isUnscored = getPteTaskProcedure(taskType)?.scored === false;
  const isSpeaking = ["read_aloud", "repeat_sentence", "describe_image", "retell_lecture", "answer_short_question", "respond_to_situation", "summarize_group_discussion"].includes(taskType);
  const isObjective = ["multiple_choice_single", "multiple_choice_multiple", "reorder_paragraphs",
    "fill_blanks_reading", "fill_blanks_rw", "highlight_correct_summary", "select_missing_word",
    "highlight_incorrect_words", "write_from_dictation"].includes(taskType);
  const isWriting = ["write_essay", "summarize_written_text"].includes(taskType);
  const isListening = ["summarize_spoken_text", "write_from_dictation", "highlight_correct_summary", "fill_blanks_listening"].includes(taskType);

  // Trait color mapping
  const traitColors: Record<string, string> = {
    pronunciation: "blue", oralFluency: "purple", content: "green",
    form: "teal", grammar: "orange", vocabulary: "blue", development: "purple",
    linguisticRange: "teal", spelling: "red",
  };
  const traitLabels: Record<string, string> = {
    pronunciation: "Pronunciation", oralFluency: "Oral Fluency", content: "Content",
    form: "Form", grammar: "Grammar", vocabulary: "Vocabulary", development: "Development",
    linguisticRange: "Linguistic Range", spelling: "Spelling",
  };

  const hasTraits = result.traits && Object.keys(result.traits).length > 0;

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="text-center py-4">
        {isUnscored ? (
          <div className="inline-flex flex-col items-center gap-1 rounded-xl bg-muted px-6 py-3 text-center">
            <span className="text-base font-bold text-foreground">Response saved</span>
            <span className="text-sm text-muted-foreground">This familiarization item does not receive a PTE score.</span>
          </div>
        ) : isObjective && !displayScore ? (
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
            result.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {result.isCorrect ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {result.isCorrect ? "Correct!" : "Incorrect"}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="text-5xl font-extrabold text-foreground">
              {displayScore ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">PTE Score (10–90)</div>
            {result.cefrLevel && (
              <span className="mt-1 px-3 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                CEFR {result.cefrLevel}
              </span>
            )}
            {result.rawScore !== undefined && result.maxRawScore !== undefined && (
              <div className="text-xs text-muted-foreground mt-1">
                Raw: {result.rawScore}/{result.maxRawScore} points
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trait breakdown */}
      {hasTraits && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Score Breakdown</h4>
          {Object.entries(result.traits!).map(([key, trait]) => (
            <TraitBar
              key={key}
              label={traitLabels[key] || key}
              score={trait.score}
              maxScore={trait.maxScore}
              feedback={trait.feedback}
              color={traitColors[key] || "blue"}
            />
          ))}
        </div>
      )}

      {/* Feedback */}
      {result.feedback && (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-foreground leading-relaxed">{result.feedback}</p>
        </div>
      )}

      {/* Explanation for objective tasks */}
      {result.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">Why this answer?</p>
          <p className="text-xs text-blue-600 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid sm:grid-cols-2 gap-4">
        {result.strengths && result.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-xs text-foreground bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {result.improvements && result.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Areas to Improve
            </h4>
            <ul className="space-y-1">
              {result.improvements.map((s, i) => (
                <li key={i} className="text-xs text-foreground bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5">{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Strategy tips */}
      {result.strategyTips && result.strategyTips.length > 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Strategy Tips
          </p>
          <ul className="space-y-1">
            {result.strategyTips.map((t, i) => (
              <li key={i} className="text-xs text-teal-700">• {t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Model answer */}
      {result.modelAnswer && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-2">Model Answer (C1 level)</p>
          <p className="text-xs text-purple-700 leading-relaxed italic">{result.modelAnswer}</p>
        </div>
      )}

      {/* Speaking-specific feedback */}
      {isSpeaking && !hasTraits && (result.pronunciationFeedback || result.fluencyFeedback) && (
        <div className="space-y-2">
          {result.pronunciationFeedback && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Pronunciation</p>
              <p className="text-xs text-blue-600">{result.pronunciationFeedback}</p>
            </div>
          )}
          {result.fluencyFeedback && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700 mb-1">Oral Fluency</p>
              <p className="text-xs text-purple-600">{result.fluencyFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Grammar errors */}
      {result.grammarErrors && result.grammarErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 mb-2">Grammar Issues</p>
          <ul className="space-y-1">
            {result.grammarErrors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary feedback */}
      {result.vocabularyFeedback && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-700 mb-1">Vocabulary</p>
          <p className="text-xs text-indigo-600">{result.vocabularyFeedback}</p>
        </div>
      )}
    </div>
  );
}

export default function PracticeSession() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId);
  const [location, setLocation] = useLocation();

  // Parse URL params from the reactive router location so changing questions
  // updates the query and reloads the question without a full page refresh.
  const queryString = location.includes("?") ? location.slice(location.indexOf("?") + 1) : "";
  const urlParams = new URLSearchParams(queryString);
  const questionId = parseInt(urlParams.get("questionId") || "0");
  const mode = (urlParams.get("mode") || "beginner") as "beginner" | "exam" | "diagnostic" | "revision";
  const isMockTestFlow = urlParams.get("mockTest") === "true";

  const sessionQuery = trpc.sessions.getById.useQuery(
    { id: sessionId },
    { enabled: Number.isFinite(sessionId) },
  );
  const sessionType = sessionQuery.data?.sessionType;
  const isMockOrSectional = sessionType === "mock_test" || sessionType === "section_practice" || isMockTestFlow;
  const plannedSessionQuestionCount = Array.isArray(sessionQuery.data?.questionPlan)
    ? (sessionQuery.data.questionPlan as Array<{ questionId: number }>).length
    : 0;
  const isValidExamFlow = mode === "exam" && (
    isMockTestFlow ||
    sessionType === "mock_test" ||
    (sessionType === "section_practice" && plannedSessionQuestionCount > 1)
  );
  const planFirstId = Array.isArray(sessionQuery.data?.questionPlan) && sessionQuery.data.questionPlan.length > 0
    ? (sessionQuery.data.questionPlan[0] as { questionId?: number }).questionId
    : undefined;
  const activeQuestionId = (Number.isFinite(questionId) && questionId > 0) ? questionId : (planFirstId || 0);

  const urlTaskType = urlParams.get("taskType") || "";
  const { data: primaryQuestion, isLoading: primaryLoading, isError: primaryError } = trpc.questions.getById.useQuery(
    { id: activeQuestionId },
    { enabled: !!activeQuestionId }
  );
  const { data: fallbackQuestions, isLoading: fallbackLoading } = trpc.questions.getByTaskType.useQuery(
    { taskType: urlTaskType },
    { enabled: (!primaryQuestion || primaryError) && !!urlTaskType }
  );
  const question = primaryQuestion ?? fallbackQuestions?.[0];
  const questionLoading = primaryLoading || (Boolean(urlTaskType) && !primaryQuestion && fallbackLoading);
  const questionError = primaryError && (!fallbackQuestions || fallbackQuestions.length === 0);

  const submitResponse = trpc.responses.submit.useMutation();
  const completeSession = trpc.sessions.complete.useMutation();
  const pauseSession = trpc.sessions.pause.useMutation();
  const resumeSession = trpc.sessions.resume.useMutation();

  const handlePause = async () => {
    try {
      await pauseSession.mutateAsync({ id: sessionId, pausedIndex: currentQuestionIndex });
      toast.success("Test paused successfully. You can resume at any time from your dashboard or mock test history.");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Failed to pause session.");
    }
  };
  const aiScoreSpeak = trpc.aiScoring.scoreSpeak.useMutation();
  const aiScoreWrite = trpc.aiScoring.scoreWrite.useMutation();
  const aiScoreRead = trpc.aiScoring.scoreRead.useMutation();
  const aiScoreListen = trpc.aiScoring.scoreListen.useMutation();
  const trpcUtils = trpc.useUtils();
  const persistedResponses = trpc.sessions.getResponses.useQuery(
    { sessionId },
    { enabled: Number.isFinite(sessionId) }
  );
  const [isAIScoring, setIsAIScoring] = useState(false);

  const [textResponse, setTextResponse] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [localAttempts, setLocalAttempts] = useState<Attempt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingHasSpeech, setRecordingHasSpeech] = useState<boolean | undefined>(undefined);
  const [isVisualPromptReady, setIsVisualPromptReady] = useState(false);
  const [startTime] = useState(Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [reorderItems, setReorderItems] = useState<Array<{ id: string; text: string }>>([])
  const [arrangedItems, setArrangedItems] = useState<Array<{ id: string; text: string }>>([])
  // Speaking-specific state
  const [speakingTranscription, setSpeakingTranscription] = useState<string | undefined>(undefined);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const recordingStartRef = useRef<number>(0);

  // Navigation and progress tracking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<Array<{
    id: number;
    taskType: string;
    section: string;
    status: "practiced" | "undone" | "skipped";
    score?: number;
  }>>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [moduleProgress, setModuleProgress] = useState({
    speaking: { practiced: 0, skipped: 0, undone: 0, total: 0 },
    writing: { practiced: 0, skipped: 0, undone: 0, total: 0 },
    reading: { practiced: 0, skipped: 0, undone: 0, total: 0 },
    listening: { practiced: 0, skipped: 0, undone: 0, total: 0 },
  });

  // Initialize reorder items
  useEffect(() => {
    if (question?.taskType === "reorder_paragraphs" && question.content) {
      try {
        const items = JSON.parse(question.content as string);
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setReorderItems(shuffled);
      } catch {}
    }
  }, [question]);

  useEffect(() => {
    setIsVisualPromptReady(question?.taskType !== "describe_image");
  }, [question?.id, question?.taskType]);

  const isPersonalIntroduction = question?.taskType === "personal_introduction";
  const isSpeakingTask = question && ["personal_introduction", "read_aloud", "repeat_sentence", "describe_image", "retell_lecture", "answer_short_question", "respond_to_situation", "summarize_group_discussion"].includes(question.taskType);
  const isWritingTask = question && ["summarize_written_text", "write_essay"].includes(question.taskType);
  const isListeningPromptTask = question ? isListeningAudioPrompt(question.section, question.taskType) : false;
  const textResponseTaskConfig = question ? getTextResponseTaskConfig(question.taskType) : undefined;
  const isReadingAnswerBankQuestion = question ? isReadingAnswerBankTask(question.taskType) : false;
  const isInlineDropdownQuestion = question ? isInlineDropdownFillBlanksTask(question.taskType) : false;
  const isObjectiveTask = question && !isSpeakingTask && !isWritingTask;
  const taskProcedure = question ? getPteTaskProcedure(question.taskType, question.section) : undefined;
  const questionValidation = question
    ? hasRequiredQuestionContent(question)
    : { valid: false, reason: "Question content is unavailable." };
  const responseValidation = question
    ? (!validateVisualPromptReadiness(question.taskType, isVisualPromptReady).valid
      ? validateVisualPromptReadiness(question.taskType, isVisualPromptReady)
      : isReadingAnswerBankQuestion && !hasCompleteReadingAnswerBankSelection(question.content as string | undefined, selectedOptions)
      ? { valid: false, reason: "Fill every blank using the answer bank before submitting." }
      : isInlineDropdownQuestion && !hasCompleteInlineDropdownSelection(question.content as string | undefined, selectedOptions)
      ? { valid: false, reason: "Select an answer for every blank before submitting." }
      : isSpeakingTask && audioBlob && recordingHasSpeech === false
      ? { valid: false, reason: "No speech was detected in the first 3 seconds. Please record your response again." }
      : hasScoreableResponse(question, {
        responseText: textResponse,
        transcription: speakingTranscription,
        audioUrl: audioBlob ? "/practice-recording.webm" : undefined,
        selectedOptions,
      }))
    : { valid: false, reason: "Question is unavailable." };

  // Navigation hooks
  const getSessionQuestions = trpc.navigation.getSessionQuestions.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );
  const bookmarkQuestionMutation = trpc.navigation.bookmarkQuestion.useMutation();
  const getProgressQuery = trpc.navigation.getProgress.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    const plannedQuestions = getSessionQuestions.data;
    if (!plannedQuestions || plannedQuestions.length === 0) return;
    setSessionQuestions(plannedQuestions.map(item => ({
      id: item.id,
      taskType: item.taskType || "",
      section: item.section || "speaking",
      status: item.status as "practiced" | "undone" | "skipped",
      score: item.score ?? undefined,
    })));
    const index = plannedQuestions.findIndex(item => item.id === questionId);
    if (index >= 0) setCurrentQuestionIndex(index);
  }, [getSessionQuestions.data, questionId]);

  useEffect(() => {
    if (!sessionQuery.data || getSessionQuestions.isLoading) return;
    const validQuestions = getSessionQuestions.data ?? [];
    if (mode === "exam" && !isValidExamFlow) {
      setLocation("/mock-test", { replace: true });
      return;
    }
    if (validQuestions.length > 0) {
      const isValidId = questionId > 0 && validQuestions.some(item => item.id === questionId);
      if (!isValidId) {
        setLocation(`/session/${sessionId}?questionId=${validQuestions[0].id}&mode=${mode}${isMockTestFlow ? "&mockTest=true" : ""}`, { replace: true });
      }
    }
  }, [sessionQuery.data, getSessionQuestions.data, getSessionQuestions.isLoading, questionId, sessionId, mode, isMockTestFlow, sessionType, isValidExamFlow, setLocation]);

  const navigableQuestions = sessionQuestions.length > 0
    ? sessionQuestions
    : (getSessionQuestions.data ?? []).map(item => ({
      id: item.id,
      taskType: item.taskType || "",
      section: item.section || "speaking",
      status: item.status as "practiced" | "undone" | "skipped",
      score: item.score ?? undefined,
    }));
  const persistedAttempts: Attempt[] = (persistedResponses.data ?? [])
    .filter(response => response.questionId === questionId)
    .map(response => ({
      id: response.id,
      timestamp: new Date(response.submittedAt),
      score: response.normalizedScore ?? (response.isCorrect === true ? 1 : response.isCorrect === false ? 0 : undefined),
      maxScore: response.normalizedScore !== null && response.normalizedScore !== undefined ? 90 : response.isCorrect === null || response.isCorrect === undefined ? undefined : 1,
      audioUrl: response.audioUrl ?? undefined,
      transcription: response.transcription ?? undefined,
      responseText: response.responseText ?? undefined,
      taskType: response.question?.taskType ?? question?.taskType ?? "",
    }));
  const attempts = [
    ...localAttempts,
    ...persistedAttempts.filter(response => !localAttempts.some(local => local.id === response.id)),
  ];

  // Update module progress when data loads
  useEffect(() => {
    if (getProgressQuery.data) {
      const { practiced, skipped, undone, total } = getProgressQuery.data;
      if (question?.section) {
        setModuleProgress(prev => ({
          ...prev,
          [question.section]: { practiced, skipped, undone, total }
        }));
      }
    }
  }, [getProgressQuery.data, question?.section]);

  // Navigation handlers
  const resetCurrentResponse = (showToast = false) => {
    setResult(null);
    setTimedOut(false);
    setTextResponse("");
    setSelectedOptions([]);
    setAudioBlob(null);
    setRecordingHasSpeech(undefined);
    setSpeakingTranscription(undefined);
    setRecordingDuration(0);
    setReorderItems([]);
    setArrangedItems([]);
    if (showToast) toast.success("Question reset. Try again!");
  };

  const goToQuestion = (index: number) => {
    const target = navigableQuestions[index];
    if (!target) return;
    setCurrentQuestionIndex(index);
    resetCurrentResponse();
    setLocation(buildSessionQuestionUrl({
      sessionId,
      questionId: target.id,
      mode,
      mockTest: isMockTestFlow,
    }));
  };

  const handlePrevious = () => {
    const previousIndex = getAdjacentQuestionIndex(currentQuestionIndex, navigableQuestions.length, "previous");
    if (previousIndex !== null) goToQuestion(previousIndex);
  };

  const handleNext = () => {
    const nextIndex = getAdjacentQuestionIndex(currentQuestionIndex, navigableQuestions.length, "next");
    if (nextIndex !== null) goToQuestion(nextIndex);
  };

  const handleRedo = () => resetCurrentResponse(true);


  const isPlannedFlow = navigableQuestions.length > 0 || plannedSessionQuestionCount > 0;
  const isFinalQuestion = shouldCompleteSession(
    currentQuestionIndex,
    navigableQuestions.length || plannedSessionQuestionCount,
  );

  const handleBookmark = async () => {
    const currentQuestionId = resolveSessionQuestionId(question?.id, activeQuestionId, questionId, planFirstId);
    if (!currentQuestionId) {
      toast.error("The current question is still loading. Please wait and try again.");
      return;
    }
    try {
      await bookmarkQuestionMutation.mutateAsync({
        sessionId,
        questionId: currentQuestionId,
      });
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentQuestionId)) {
          newSet.delete(currentQuestionId);
        } else {
          newSet.add(currentQuestionId);
        }
        return newSet;
      });
      toast.success(bookmarkedQuestions.has(currentQuestionId) ? "Bookmark removed" : "Question bookmarked!");
    } catch (err) {
      toast.error("Failed to bookmark question");
    }
  };

  const handleSubmit = async () => {
    if (!question) return;
    if (!questionValidation.valid || !responseValidation.valid) {
      toast.error(responseValidation.reason || questionValidation.reason || "Complete the task before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      let audioUrl: string | undefined;

      // Upload audio if speaking task
      if (isSpeakingTask && audioBlob) {
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const response = await fetch("/api/upload-audio", {
            method: "POST",
            headers: { "Content-Type": "audio/webm" },
            body: uint8Array,
          });
          if (response.ok) {
            const data = await response.json();
            audioUrl = data.url;
          }
        } catch (e) {
          console.error("Audio upload failed:", e);
        }
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const targetQuestionId = resolveSessionQuestionId(
        question?.id,
        activeQuestionId,
        questionId,
        (sessionQuery.data?.questionPlan?.[0] as { questionId?: number } | undefined)?.questionId,
      );
      if (!targetQuestionId) {
        toast.error("Could not determine valid question ID. Please reload session.");
        setIsSubmitting(false);
        return;
      }
      const response = await submitResponse.mutateAsync({
        sessionId,
        questionId: targetQuestionId,
        responseText: textResponse || undefined,
        audioUrl,
        selectedOptions: selectedOptions.filter(Boolean).length > 0 ? selectedOptions.filter(Boolean) : undefined,
        timeTaken,
      });

      const taskResult = response as TaskResult;
      setResult(taskResult);
      setLocalAttempts(prev => [
        {
          id: taskResult.responseId,
          timestamp: new Date(),
          score: taskResult.normalizedScore ?? (taskResult.isCorrect === true ? 1 : taskResult.isCorrect === false ? 0 : undefined),
          maxScore: taskResult.normalizedScore !== undefined ? 90 : taskResult.isCorrect === undefined ? undefined : 1,
          audioUrl,
          transcription: taskResult.transcription,
          responseText: textResponse || undefined,
          taskType: question.taskType,
        },
        ...prev.filter(attempt => attempt.id !== taskResult.responseId),
      ]);
      // Capture Whisper transcription for word-level analysis
      if (taskResult.transcription) {
        setSpeakingTranscription(taskResult.transcription);
      }
      // A planned session is completed only after the final question is scored.
      // Trigger section-specific AI scoring in the background first so the final
      // aggregate includes the latest AI-updated response.
      if (taskResult.responseId && question && !isPersonalIntroduction) {
        setIsAIScoring(true);
        try {
          let aiResult: TaskResult | null = null;
          if (isSpeakingTask) {
            aiResult = await aiScoreSpeak.mutateAsync({
              responseId: taskResult.responseId,
              audioUrl: audioUrl,
              transcription: taskResult.transcription,
              durationSeconds: recordingDuration > 0 ? recordingDuration : undefined,
            }) as unknown as TaskResult;
          } else if (isWritingTask) {
            aiResult = await aiScoreWrite.mutateAsync({
              responseId: taskResult.responseId,
              responseText: textResponse || undefined,
            }) as unknown as TaskResult;
          } else if (question.section === "reading") {
            aiResult = await aiScoreRead.mutateAsync({
              responseId: taskResult.responseId,
              selectedOptions: selectedOptions.filter(Boolean).length > 0 ? selectedOptions.filter(Boolean) : undefined,
              orderedItems: arrangedItems.length > 0 ? arrangedItems.map(i => i.id) : undefined,
            }) as unknown as TaskResult;
          } else if (question.section === "listening") {
            aiResult = await aiScoreListen.mutateAsync({
              responseId: taskResult.responseId,
              responseText: textResponse || undefined,
              selectedOptions: selectedOptions.filter(Boolean).length > 0 ? selectedOptions.filter(Boolean) : undefined,
            }) as unknown as TaskResult;
          }
          if (aiResult) {
            // Merge AI result into the existing task result and the visible attempt history.
            setResult(prev => prev ? {
              ...prev,
              ...aiResult,
              normalizedScore: aiResult.normalizedScore ?? aiResult.overallScore,
            } : {
              ...aiResult,
              normalizedScore: aiResult.normalizedScore ?? aiResult.overallScore,
            });
            setLocalAttempts(prev => applyAttemptScore(
              prev,
              taskResult.responseId,
              aiResult.normalizedScore,
              aiResult.transcription,
            ));
          }
          await trpcUtils.sessions.getResponses.invalidate({ sessionId });
          if (isFinalQuestion) {
            await completeSession.mutateAsync({ id: sessionId });
          } else {
            await trpcUtils.navigation.getSessionQuestions.invalidate({ sessionId });
            await trpcUtils.navigation.getProgress.invalidate({ sessionId });
            toast.success("Answer saved. Continue to the next question when ready.");
          }
        } catch (aiErr) {
          console.error("AI scoring failed (non-critical):", aiErr);
        } finally {

          setIsAIScoring(false);
        }
      } else if (taskResult.responseId && question && isPersonalIntroduction) {
        await trpcUtils.sessions.getResponses.invalidate({ sessionId });
        if (isFinalQuestion) {
          await completeSession.mutateAsync({ id: sessionId });
          toast.success("Personal Introduction saved. This familiarization item is not scored.");
        } else {
          await trpcUtils.navigation.getSessionQuestions.invalidate({ sessionId });
          await trpcUtils.navigation.getProgress.invalidate({ sessionId });
          toast.success("Personal Introduction saved. Continue to the next question when ready.");
        }
      }
    } catch (err) {
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setTimedOut(true);
  }, []);

  useEffect(() => {
    if (timedOut && !result && !isSubmitting && responseValidation.valid) {
      void handleSubmit();
    }
  }, [timedOut, result, isSubmitting, responseValidation.valid]);

  const handleOptionToggle = (optionId: string, isSingle: boolean) => {
    if (isSingle) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId) ? prev.filter(o => o !== optionId) : [...prev, optionId]
      );
    }
  };

  const moveToArranged = (item: { id: string; text: string }) => {
    setReorderItems(prev => prev.filter(i => i.id !== item.id));
    setArrangedItems(prev => [...prev, item]);
    setSelectedOptions(prev => [...prev, item.id]);
  };

  const moveBack = (item: { id: string; text: string }) => {
    setArrangedItems(prev => prev.filter(i => i.id !== item.id));
    setReorderItems(prev => [...prev, item]);
    setSelectedOptions(prev => prev.filter(id => id !== item.id));
  };

  if (questionLoading || sessionQuery.isLoading || sessionQuery.isPending || !sessionId || Number.isNaN(sessionId)) {
    return (
      <PTELayout title="Practice Session">
        <div className="mx-auto w-full max-w-4xl space-y-4 py-8 animate-pulse" aria-busy="true" aria-label="Loading practice question">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 rounded-lg bg-muted" />
            <div className="h-12 rounded-lg bg-muted" />
          </div>
        </div>
      </PTELayout>
    );
  }

  // Use activeQuestionId (which falls back to planFirstId) so missing URL questionId doesn't trigger the error card
  const effectiveQuestionId = (Number.isFinite(questionId) && questionId > 0) ? questionId : (planFirstId || 0);
  if (!Number.isFinite(effectiveQuestionId) || effectiveQuestionId <= 0 || questionError || !question) {
    return (
      <PTELayout title="Practice Session">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">We could not load this practice question.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Please return to the practice dashboard and choose another question.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button asChild>
                <a href="/practice">Back to Practice</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PTELayout>
    );
  }

  // Parse options from both legacy arrays and the object-shaped gap options
  // used by the Reading & Writing Fill in the Blanks question bank.
  let options: Array<{ id: string; text: string; correct: boolean }> = [];
  let blankOptionGroups: Array<{ id: string; choices: string[] }> = [];
  if (question.options) {
    try {
      const parsed: unknown = typeof question.options === "string" ? JSON.parse(question.options) : question.options;
      const decoded = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
      if (Array.isArray(decoded)) {
        if (decoded.length > 0 && typeof decoded[0] === "string") {
          options = decoded.map((text: string, idx: number) => ({
            id: String.fromCharCode(65 + idx),
            text,
            correct: false,
          }));
        } else {
          options = decoded as Array<{ id: string; text: string; correct: boolean }>;
        }
      } else if (decoded && typeof decoded === "object") {
        blankOptionGroups = Object.entries(decoded as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
          .map(([id, choices]) => ({
            id,
            choices: Array.isArray(choices) ? choices.map(String) : [],
          }))
          .filter(group => group.choices.length > 0);
      }
    } catch {
      // Invalid question-bank JSON is surfaced by questionValidation; keep the
      // page renderable so the learner can return to the task list.
    }
  }

  return (
    <PTELayout title={question.title}>
      {/* APEUni-style Header with Module Tabs */}
      <PracticeHeader
        modules={Object.entries(moduleProgress).map(([section, progress]) => ({
          section: section as "speaking" | "writing" | "reading" | "listening",
          completed: progress.practiced,
          total: progress.total,
        }))}
        currentSection={question?.section}
        taskType={question.taskType}
        difficulty={question.difficulty}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={navigableQuestions.length || 1}
        timeRemaining={!result && question.timeLimit && mode === "exam" ? question.timeLimit : undefined}
      />

      {/* Pause Test Banner / Button for Mock Tests and Sectional Tests Only */}
      {isValidExamFlow && (
        <div className="max-w-4xl mx-auto px-4 pt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={handlePause} className="gap-2 bg-card hover:bg-accent">
            <Clock className="w-4 h-4 text-amber-500" />
            Pause Test & Save Progress
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
        {/* Mode hint */}
        {mode === "beginner" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Beginner Mode:</strong> Take your time. There's no strict time limit. Focus on understanding the task format.
            </p>
          </div>
        )}

        {/* Pearson procedure, timing, and study resources */}
        {taskProcedure && !result && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{taskProcedure.label}</span>
            {taskProcedure.officialPreparationRange ? (
              <span>Prepare: {taskProcedure.officialPreparationRange[0]}–{taskProcedure.officialPreparationRange[1]}s</span>
            ) : taskProcedure.preparationSeconds > 0 ? (
              <span>Prepare: {taskProcedure.preparationSeconds}s</span>
            ) : null}
            {taskProcedure.responseSeconds ? <span>Speak: {taskProcedure.responseSeconds}s</span> : null}
            {taskProcedure.minWords || taskProcedure.maxWords ? (
              <span>Words: {taskProcedure.minWords ?? 0}–{taskProcedure.maxWords ?? "no limit"}</span>
            ) : null}
            {taskProcedure.audioPlaysOnce && <span>Audio plays once</span>}
            <div className="ml-auto flex items-center gap-2">
              <TaskStudyResourceModal taskType={question.taskType} />
              {taskProcedure.timeLimitSeconds && !isSpeakingTask && (
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  <Clock className="h-3.5 w-3.5" />
                  <CountdownTimer
                    key={`${question.id}-${taskProcedure.timeLimitSeconds}`}
                    seconds={taskProcedure.timeLimitSeconds}
                    onExpire={handleTimeUp}
                    urgent
                  />
                </span>
              )}
            </div>
            {timedOut && <span className="basis-full font-semibold text-red-600">Time expired. This response was submitted only if it met the task requirements.</span>}
          </div>
        )}

        {/* Question card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {question.prompt || "Follow the task instructions below."}
            </CardTitle>
            {!questionValidation.valid && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertCircle className="h-3.5 w-3.5" />
                {questionValidation.reason}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isListeningPromptTask && !result && (
              <QuestionAudioPlayer
                audioUrl={isUsablePromptAudioUrl(question.audioUrl) ? question.audioUrl ?? undefined : undefined}
                fallbackText={getAudioFallbackText(question.taskType, question.content as string | undefined, question.prompt ?? undefined)}
                label="Listen to the recording before answering"
                allowReplay={!isMockOrSectional}
              />
            )}

            {/* Content display — skip describe_image (handled inside SpeakingTask) and repeat_sentence (audio only) */}
            {question.content && !["reorder_paragraphs", "describe_image", "repeat_sentence", "respond_to_situation", "summarize_group_discussion"].includes(question.taskType) && !isListeningPromptTask && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed">{question.content as string}</p>
              </div>
            )}

            {/* Speaking task — enhanced with prep timer, live transcript, and colour highlighting */}
            {isSpeakingTask && (
              <div className="space-y-3">
                {/* Repeat Sentence TTS auto-play */}
                {question.taskType === "repeat_sentence" && !result && (
                  <RepeatSentencePlayer sentence={question.content as string} />
                )}

                {/* Task timing info banner */}
                {!result && (() => {
                  const t = SPEAKING_TIMINGS[question.taskType];
                  return t ? (
                    <div className="flex gap-3 text-xs">
                      {t.prep > 0 && (
                        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-teal-700 font-medium">Prep: {t.prep}s</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                        <Mic className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-700 font-medium">Record: {t.record}s</span>
                      </div>
                    </div>
                  ) : null;
                })()}

                <SpeakingTask
                  key={question.id}
                  taskType={question.taskType}
                  originalText={question.content as string | undefined}
                  imageUrl={question.imageUrl || undefined}
                  questionAudioUrl={question.audioUrl || undefined}
                  onRecordingComplete={(blob, metadata) => {
                    setAudioBlob(blob);
                    setRecordingHasSpeech(metadata.speechDetected);
                    setRecordingDuration((Date.now() - recordingStartRef.current) / 1000);
                  }}
                  transcription={speakingTranscription}
                  isSubmitted={!!result}
                  recordingDuration={recordingDuration}
                  onVisualPromptStatusChange={setIsVisualPromptReady}
                />
              </div>
            )}

            {/* Writing task */}
            {isWritingTask && !result && (
              <div className="space-y-3">
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder={question.taskType === "summarize_written_text"
                    ? "Write your one-sentence summary here (5–75 words)..."
                    : "Write your essay here (200–300 words)..."}
                  className="min-h-[200px] text-sm resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Word count: {textResponse.trim().split(/\s+/).filter(Boolean).length}</span>
                  {question.wordLimit && <span>Target: {question.taskType === "summarize_written_text" ? "5–75" : "200–300"} words</span>}
                </div>
                {mode === "beginner" && question.modelAnswer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">Model Answer (Beginner Mode)</p>
                    <p className="text-xs text-green-600">{question.modelAnswer as string}</p>
                  </div>
                )}
              </div>
            )}

            {/* MCQ tasks */}
            {(question.taskType === "multiple_choice_single" || question.taskType === "multiple_choice_multiple") && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionToggle(opt.id, question.taskType === "multiple_choice_single")}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium mr-2">{opt.id ? opt.id.toUpperCase() : "?"}.</span>
                    {opt.text}
                  </button>
                ))}
                {question.taskType === "multiple_choice_multiple" && (
                  <p className="text-xs text-muted-foreground">Select all correct answers.</p>
                )}
              </div>
            )}

            {/* Reorder paragraphs */}
            {question.taskType === "reorder_paragraphs" && !result && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Available (click to add)</p>
                  <div className="space-y-2 min-h-[100px] border border-dashed border-border rounded-xl p-2">
                    {reorderItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => moveToArranged(item)}
                        className="w-full text-left p-2.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors"
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Your Order (click to remove)</p>
                  <div className="space-y-2 min-h-[100px] border border-dashed border-primary/30 rounded-xl p-2">
                    {arrangedItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => moveBack(item)}
                        className="w-full text-left p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-xs hover:bg-primary/20 transition-colors"
                      >
                        <span className="font-bold text-primary mr-2">{idx + 1}.</span>
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text input tasks (fill blanks, write from dictation) */}
            {isTextResponseTask(question.taskType) && !result && (
              <div className="space-y-2">
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder={textResponseTaskConfig?.placeholder}
                  className={`${textResponseTaskConfig?.minHeightClass ?? "min-h-[80px]"} text-sm resize-none`}
                />
                {textResponseTaskConfig?.wordTarget && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Word count: {textResponse.trim().split(/\s+/).filter(Boolean).length}</span>
                    <span>Target: {textResponseTaskConfig.wordTarget}</span>
                  </div>
                )}
              </div>
            )}

            {/* Highlight correct summary */}
            {question.taskType === "highlight_correct_summary" && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptions([opt.id])}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Select missing word */}
            {question.taskType === "select_missing_word" && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptions([opt.id])}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium mr-2">{opt.id ? opt.id.toUpperCase() : "?"}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Highlight incorrect words — click words to select them */}
            {question.taskType === "highlight_incorrect_words" && !result && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click on the words that are incorrect or out of place:</p>
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex flex-wrap gap-2">
                    {(question.content as string)?.split(/\s+/).map((word, idx) => {
                      const cleanWord = word.replace(/[^\w]/g, '');
                      const isSelected = selectedOptions.includes(cleanWord);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const wordToToggle = cleanWord;
                            if (selectedOptions.includes(wordToToggle)) {
                              setSelectedOptions(selectedOptions.filter(w => w !== wordToToggle));
                            } else {
                              setSelectedOptions([...selectedOptions, wordToToggle]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-red-500 text-white border-2 border-red-600"
                              : "bg-white text-foreground border-2 border-border hover:border-primary cursor-pointer"
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedOptions.length > 0 ? selectedOptions.join(", ") : "None"}
                </div>
              </div>
            )}

            {/* Fill in the blanks (Reading & Writing) — one dropdown per gap */}
            {isInlineDropdownQuestion && !result && (
              blankOptionGroups.length > 0 ? (
                <InlineDropdownFillBlanks
                  content={question.content as string}
                  groups={blankOptionGroups}
                  answers={selectedOptions}
                  onAnswersChange={setSelectedOptions}
                />
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">This question is missing its dropdown options. Please choose another practice question.</p>
              )
            )}

            {/* Reading Fill in the Blanks — inline blanks with an answer-bank interaction */}
            {isReadingAnswerBankQuestion && !result && (
              <ReadingFillBlanks
                content={question.content as string}
                wordBank={options.map((option) => option.text)}
                answers={selectedOptions}
                onAnswersChange={setSelectedOptions}
              />
            )}

            {/* Result display */}
            {result && (isPersonalIntroduction
              ? <PersonalIntroductionConfirmation />
              : <ScoreDisplay result={result} taskType={question.taskType} />)}
            {/* AI scoring loading indicator */}
            {isAIScoring && (
              <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                <span className="text-xs text-primary font-medium">Analysing with section-specific AI engine…</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Feedback Panel - shown after submission */}
        {result && result.responseId && !isPersonalIntroduction && (
          <AIFeedbackPanel
            responseId={result.responseId}
            taskType={question.taskType}
            score={result.normalizedScore ?? result.overallScore ?? 0}
            maxScore={90}
            scoreConfidence={result.scoreConfidence}
            needsReview={result.needsReview}
          />
        )}

        {result && <InlineAttemptHistory attempts={attempts} />}

        {/* Sticky session toolbar: navigation stays reachable without covering the response area. */}
        {!result && (
          <div className="sticky bottom-3 z-30 -mx-1 mt-2 rounded-2xl border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
            <NavigationControls
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={navigableQuestions.length || 1}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRedo={handleRedo}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedQuestions.has(resolveSessionQuestionId(question?.id, activeQuestionId, questionId, planFirstId) ?? -1)}
              disabled={isSubmitting || isAIScoring}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/practice">Cancel</a>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled({
                  isSubmitting: isSubmitting || timedOut,
                  isSpeakingTask: Boolean(isSpeakingTask),
                  hasAudio: Boolean(audioBlob),
                  isWritingTask: Boolean(isWritingTask),
                  hasText: Boolean(textResponse.trim()),
                  isQuestionValid: questionValidation.valid,
                  isResponseValid: responseValidation.valid,
                })}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPersonalIntroduction ? "Saving response..." : "Scoring with AI..."}
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Result actions stay in normal flow after scoring. */}
        {result && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <a href="/practice">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice More
                </a>
              </Button>
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                View History
              </Button>
            </div>
            {isPlannedFlow && !isFinalQuestion ? (
              <Button onClick={handleNext} className="bg-primary text-primary-foreground">
                Next Question
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground">
                <a href={`/score-report/${sessionId}`}>
                  View Full Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Attempt History Modal */}
      <AttemptHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        attempts={attempts}
        taskType={question?.taskType || ''}
      />
    </PTELayout>
  );
}
