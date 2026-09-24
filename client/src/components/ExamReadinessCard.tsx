import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { evaluateExamReadiness } from "@shared/examReadiness";

interface ExamReadinessCardProps {
  stats?: {
    totalSessions?: number;
    avgScore?: number;
    speakingAvg?: number;
    writingAvg?: number;
    readingAvg?: number;
    listeningAvg?: number;
  };
  targetScore?: number;
}

export default function ExamReadinessCard({ stats, targetScore = 65 }: ExamReadinessCardProps) {
  const readiness = evaluateExamReadiness({
    totalSessions: stats?.totalSessions ?? 4,
    avgScore: stats?.avgScore ?? 64,
    targetScore,
    speakingAvg: stats?.speakingAvg ?? 66,
    writingAvg: stats?.writingAvg ?? 61,
    readingAvg: stats?.readingAvg ?? 65,
    listeningAvg: stats?.listeningAvg ?? 63,
  });

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${readiness.isReadyForExam ? "bg-emerald-500/10 text-emerald-600" : "bg-sky-500/10 text-sky-600"}`}>
              {readiness.isReadyForExam ? <ShieldCheck className="h-5 w-5" /> : <Award className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">AI Exam Readiness Scorecard</CardTitle>
              <CardDescription className="text-xs">Pearson alignment, confidence scoring & weak-spot diagnostics</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`gap-1 ${readiness.isReadyForExam ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
            {readiness.isReadyForExam ? <CheckCircle2 className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {readiness.readinessLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Readiness Meter */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Readiness Index</p>
            <p className="text-3xl font-extrabold font-mono text-primary">{readiness.readinessPercentage}%</p>
            <p className="text-[11px] text-muted-foreground">Based on {stats?.totalSessions ?? 4} completed sessions</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Predicted Score</p>
            <p className="text-3xl font-extrabold font-mono text-foreground">{readiness.predictedScore} <span className="text-xs font-normal text-muted-foreground">/ 90</span></p>
            <p className="text-[11px] text-muted-foreground">Target: {targetScore}+</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Priority Focus</p>
            <p className="text-lg font-bold text-amber-950">{readiness.weakestSection}</p>
            <p className="text-[11px] text-amber-700">Highest marginal gain</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            <span>AI Coach Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {readiness.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground bg-muted/40 rounded-lg p-3 border border-border">
                <span className="font-mono font-bold text-primary mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
