import React, { useState } from "react";
import { Sparkles, Calendar, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { generateAiStudyPlan, AiStudyPlan } from "@shared/aiStudyPlanner";
import { Button } from "@/components/ui/button";

interface AiStudyPlannerWidgetProps {
  userTargetScore?: number;
}

export default function AiStudyPlannerWidget({ userTargetScore = 65 }: AiStudyPlannerWidgetProps) {
  const [plan, setPlan] = useState<AiStudyPlan>(() => generateAiStudyPlan({ targetScore: userTargetScore }));
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">AI Personalized Study Planner</h3>
            <p className="text-sm text-muted-foreground">Tailored 7-day adaptive schedule optimized for your {plan.targetScore}+ target</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wide">
            Weakest Focus: {plan.weakestModule}
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {plan.dailySchedule.map(task => {
          const isDone = completedDays.includes(task.day);
          return (
            <div 
              key={task.day}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                isDone ? "bg-muted/50 border-border opacity-75" : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button 
                  onClick={() => toggleDay(task.day)}
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    isDone ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold text-muted-foreground">{task.day}</span>}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Day {task.day} • {task.section}</span>
                    <span className="text-xs text-muted-foreground">({task.recommendedCount} items)</span>
                  </div>
                  <h4 className={`text-sm font-semibold mt-0.5 ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{task.focusRationale}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isDone ? "outline" : "default"}
                onClick={() => {
                  window.location.href = `/practice?section=${task.section}&taskType=${task.taskType}`;
                }}
                className="shrink-0 gap-1.5"
              >
                <span>{isDone ? "Review" : "Start Drill"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
