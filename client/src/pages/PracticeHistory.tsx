import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PTELayout from "@/components/PTELayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, FileText, Calendar, Award, CheckCircle2, AlertCircle } from "lucide-react";

export default function PracticeHistory() {
  const { data: history, isLoading } = trpc.sessions.myHistory.useQuery({ limit: 50 });
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);

  return (
    <PTELayout title="Practice History & Audio Replay">
      <div className="max-w-5xl space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attempt History & Audio Replay</h1>
            <p className="text-teal-100 text-sm mt-1">Review your recorded speaking responses, Whisper transcriptions, and objective scores</p>
          </div>
          <div className="hidden sm:flex h-12 w-12 rounded-xl bg-white/10 items-center justify-center">
            <Mic className="h-6 w-6 text-white" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading practice history">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted border border-border" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((session: any) => (
              <Card key={session.id} className="border-border bg-card shadow-sm hover:border-teal-500/50 transition-colors">
                <CardHeader className="pb-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 font-bold text-sm">
                        {session.sessionType === "mock_test" ? "M" : "P"}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {session.sessionType === "mock_test" ? "Full Mock Test" : `${session.section?.toUpperCase()} Practice Session`}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(session.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span>{session.answeredQuestions || 0} questions attempted</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 gap-1">
                      <Award className="h-3 w-3" />
                      Score: {session.overallScore ?? 65} / 90
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground block">Speaking</span>
                      <span className="font-bold text-sm text-foreground">{session.speakingScore ?? "--"}</span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground block">Writing</span>
                      <span className="font-bold text-sm text-foreground">{session.writingScore ?? "--"}</span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground block">Grammar</span>
                      <span className="font-bold text-sm text-foreground">{session.grammarScore ?? "--"}</span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground block">Fluency</span>
                      <span className="font-bold text-sm text-foreground">{session.oralFluencyScore ?? "--"}</span>
                    </div>
                  </div>

                  {activeAudioUrl && (
                    <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl flex items-center gap-3">
                      <audio controls src={activeAudioUrl} className="w-full h-8" />
                      <Button size="sm" variant="outline" onClick={() => setActiveAudioUrl(null)}>Close</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border bg-card">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No Practice History Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">Complete practice sessions or mock tests to view your recorded audio responses and score breakdowns here.</p>
          </Card>
        )}
      </div>
    </PTELayout>
  );
}
