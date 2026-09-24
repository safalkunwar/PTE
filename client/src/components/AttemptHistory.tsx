import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAttemptScoreLabel, getAttemptScorePercent, hasAttemptScore } from '@/lib/attemptHistoryDisplay';

export interface Attempt {
  id: number;
  timestamp: Date;
  score?: number;
  maxScore?: number;
  audioUrl?: string;
  transcription?: string;
  responseText?: string;
  taskType: string;
}

interface AttemptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: Attempt[];
  taskType: string;
}

export function InlineAttemptHistory({ attempts }: { attempts: Attempt[] }) {
  if (attempts.length === 0) return null;

  return (
    <section id="attempt-history" className="mt-6 border-t border-border pt-5" aria-label="Recent attempts">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Attempts</h3>
          <p className="text-xs text-muted-foreground">Your saved recordings, transcriptions, and scores for this question.</p>
        </div>
        <Badge variant="secondary">{attempts.length}</Badge>
      </div>
      <div className="space-y-3">
        {attempts.map((attempt, index) => {
          const scored = hasAttemptScore(attempt.score, attempt.maxScore);
          return (
            <article key={attempt.id} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Attempt {attempts.length - index}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(attempt.timestamp, { addSuffix: true })}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{getAttemptScoreLabel(attempt.score, attempt.maxScore)}</span>
              </div>
              {scored && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${getAttemptScorePercent(attempt.score, attempt.maxScore)}%` }} />
                </div>
              )}
              {attempt.audioUrl && (
                <audio className="mt-3 w-full" controls controlsList="nodownload" src={attempt.audioUrl} preload="metadata" />
              )}
              {attempt.transcription && <p className="mt-3 rounded-lg bg-background/80 p-2 text-sm text-foreground"><span className="font-semibold">Transcription: </span>{attempt.transcription}</p>}
              {attempt.responseText && <p className="mt-3 rounded-lg bg-background/80 p-2 text-sm text-foreground"><span className="font-semibold">Your response: </span>{attempt.responseText}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  isOpen,
  onClose,
  attempts,
  taskType,
}) => {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlayAudio = (attemptId: number, audioUrl: string) => {
    if (playingId === attemptId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play();
      }
      setPlayingId(attemptId);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attempt History</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attempts yet. Start practicing to see your history.
            </p>
          ) : (
            attempts.map((attempt, idx) => (
              <div
                key={attempt.id}
                className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Attempt {attempts.length - idx}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(attempt.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {getAttemptScoreLabel(attempt.score, attempt.maxScore)}
                    </span>
                    {hasAttemptScore(attempt.score, attempt.maxScore) && <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${getAttemptScorePercent(attempt.score, attempt.maxScore)}%`,
                        }}
                      />
                    </div>}
                  </div>
                </div>

                {/* Audio Playback for Speaking Tasks */}
                {attempt.audioUrl && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayAudio(attempt.id, attempt.audioUrl!)}
                      >
                        {playingId === attempt.id ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </>
                        )}
                      </Button>

                      {/* Speed Controls */}
                      <div className="flex gap-1">
                        {[0.5, 1, 1.5, 2].map((speed) => (
                          <Button
                            key={speed}
                            size="sm"
                            variant={playbackSpeed === speed ? 'default' : 'outline'}
                            onClick={() => handleSpeedChange(speed)}
                            className="text-xs"
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>

                    </div>
                  </div>
                )}

                {/* Transcription for Speaking Tasks */}
                {attempt.transcription && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Transcription:</p>
                    <p className="text-sm">{attempt.transcription}</p>
                  </div>
                )}

                {/* Response Text for Writing/Reading Tasks */}
                {attempt.responseText && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Your Response:</p>
                    <p className="text-sm">{attempt.responseText}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      </DialogContent>
    </Dialog>
  );
};

export default AttemptHistory;
