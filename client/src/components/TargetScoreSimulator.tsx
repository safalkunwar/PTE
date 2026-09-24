import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { simulateTargetScores } from "@shared/scoreSimulation";

interface TargetScoreSimulatorProps {
  initialTarget?: number;
  userStats?: {
    overall?: number;
    speaking?: number;
    writing?: number;
    reading?: number;
    listening?: number;
    grammar?: number;
    vocabulary?: number;
    oralFluency?: number;
    pronunciation?: number;
    spelling?: number;
    writtenDiscourse?: number;
  };
}

export default function TargetScoreSimulator({ initialTarget = 65, userStats }: TargetScoreSimulatorProps) {
  const [targetScore, setTargetScore] = useState<number>(initialTarget);
  const [practiceHours, setPracticeHours] = useState<number>(20);

  const simulation = simulateTargetScores({
    currentOverall: userStats?.overall ?? 62,
    targetScore,
    speaking: userStats?.speaking ?? 64,
    writing: userStats?.writing ?? 60,
    reading: userStats?.reading ?? 63,
    listening: userStats?.listening ?? 61,
    grammar: userStats?.grammar ?? 65,
    vocabulary: userStats?.vocabulary ?? 62,
    oralFluency: userStats?.oralFluency ?? 66,
    pronunciation: userStats?.pronunciation ?? 63,
    spelling: userStats?.spelling ?? 70,
    writtenDiscourse: userStats?.writtenDiscourse ?? 64,
  }, practiceHours);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">Interactive Target Score Simulator</CardTitle>
              <CardDescription className="text-xs">Model your PTE score trajectory based on study hours & targeted drills</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 bg-primary/5 text-primary border-primary/20">
            <Sparkles className="h-3 w-3" />
            AI Projections
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Controls */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Target PTE Score</span>
              <span className="font-mono text-primary font-bold text-sm">{targetScore}</span>
            </label>
            <div className="flex gap-2">
              {[50, 58, 65, 79].map((score) => (
                <button
                  key={score}
                  onClick={() => setTargetScore(score)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                    targetScore === score
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {score}+
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Weekly Practice Hours</span>
              <span className="font-mono text-primary font-bold text-sm flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {practiceHours} hrs/wk
              </span>
            </label>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={practiceHours}
              onChange={(e) => setPracticeHours(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
            />
          </div>
        </div>

        {/* Projection Banner */}
        <div className={`rounded-xl border p-4 flex items-center justify-between ${
          simulation.isTargetMet ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-sky-50 border-sky-200 text-sky-950"
        }`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Projected Overall Band</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono">{simulation.projectedOverall}</span>
              <span className="text-xs font-medium">/ 90 PTE Academic</span>
            </div>
          </div>
          <div className="text-right">
            {simulation.isTargetMet ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Target Achievable!
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                {simulation.scoreGap} points to target
              </div>
            )}
          </div>
        </div>

        {/* Skill Projections Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Communicative & Enabling Skill Trajectories</h4>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {simulation.projections.map((p) => (
              <div key={p.skill} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{p.skill}</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-muted-foreground">{p.current}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-bold text-primary">{p.projected}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(p.projected / 90) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">{p.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
