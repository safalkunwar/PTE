import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, X, Lightbulb, AlertTriangle, Target, CheckCircle2, ListChecks, Timer, Dumbbell } from "lucide-react";
import { getTaskStudyResource } from "@shared/taskResources";

interface TaskStudyResourceModalProps {
  taskType: string;
}

export default function TaskStudyResourceModal({ taskType }: TaskStudyResourceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resource = getTaskStudyResource(taskType);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 border-teal-200 bg-teal-50/50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
      >
        <BookOpen className="h-3.5 w-3.5 text-teal-600" />
        <span>Study Guide & Tips</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-card shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">{resource.title}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{taskType.replace(/_/g, " ")} • Official Pearson Format</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-600">Task Overview</h4>
                <p className="text-sm leading-relaxed text-foreground">{resource.overview}</p>
              </div>

              {resource.timingAndFormat && (
                <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                  <Timer className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-700">Timing & Format</h4>
                    <p className="mt-1 text-xs leading-relaxed text-sky-900">{resource.timingAndFormat}</p>
                  </div>
                </div>
              )}

              {/* Strategy */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4 text-teal-600" />
                  <span>Scoring Strategy</span>
                </div>
                <p className="text-xs leading-relaxed text-teal-900">{resource.strategySummary}</p>
              </div>

              {/* Templates / Rules */}
              {resource.templates.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Recommended Templates & Rules</span>
                  </h4>
                  <ul className="space-y-2">
                    {resource.templates.map((template, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground bg-muted/50 rounded-lg p-3 border border-border">
                        <span className="font-mono font-bold text-teal-600 mt-0.5">{idx + 1}.</span>
                        <span className="leading-relaxed">{template}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resource.stepByStep && (
                <div className="space-y-2.5">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5 text-teal-600" />
                    <span>Step-by-Step Method</span>
                  </h4>
                  <ol className="grid gap-2 sm:grid-cols-2">
                    {resource.stepByStep.map((step, idx) => (
                      <li key={step} className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
                        <span className="mr-2 font-mono font-bold text-teal-600">{idx + 1}</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {resource.quickChecklist && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Before You Submit</span>
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resource.quickChecklist.map((item) => (
                      <span key={item} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-emerald-900">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {resource.practiceDrills && (
                <div className="space-y-2.5">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-700">
                    <Dumbbell className="h-3.5 w-3.5" />
                    <span>Practice Drills</span>
                  </h4>
                  <ul className="space-y-2">
                    {resource.practiceDrills.map((drill) => (
                      <li key={drill} className="rounded-lg border border-violet-100 bg-violet-50/60 p-3 text-xs leading-relaxed text-violet-950">{drill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {resource.commonMistakes.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Common Mistakes to Avoid</span>
                  </h4>
                  <ul className="space-y-2">
                    {resource.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground bg-amber-50/50 rounded-lg p-3 border border-amber-200">
                        <span className="font-mono font-bold text-amber-600 mt-0.5">✕</span>
                        <span className="leading-relaxed text-amber-900">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Breakdown */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs uppercase tracking-wider">
                  <Target className="h-4 w-4 text-teal-600" />
                  <span>{resource.sampleBreakdown.heading}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{resource.sampleBreakdown.description}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-5 h-9 font-medium"
                >
                  Got It, Start Practicing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
