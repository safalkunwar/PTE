import { useState } from "react";
import { Lightbulb, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DAILY_EXAM_TIPS } from "@shared/examTips";

export default function DailyTipsWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tip = DAILY_EXAM_TIPS[currentIndex];

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_EXAM_TIPS.length);
  };

  return (
    <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Daily Pearson Exam Tip</h3>
              <p className="text-[11px] text-muted-foreground">Expert strategy for 79+ band</p>
            </div>
          </div>
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 font-semibold text-xs">
            {tip.category}
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="text-base font-extrabold text-foreground">{tip.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.content}</p>
          <div className="bg-card/80 border rounded-xl p-3 flex items-start gap-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-foreground font-medium">{tip.actionableAdvice}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs">
          <span className="text-muted-foreground">Tip {currentIndex + 1} of {DAILY_EXAM_TIPS.length}</span>
          <Button variant="ghost" size="sm" onClick={nextTip} className="h-7 text-xs font-semibold text-primary gap-1">
            Next Tip <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
