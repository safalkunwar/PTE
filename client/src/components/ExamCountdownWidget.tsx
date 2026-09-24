import { useState } from "react";
import { Calendar, Clock, Target, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateDaysRemaining, getRecommendedDailyMinutes } from "@shared/examCountdown";

export default function ExamCountdownWidget() {
  // Default target date 30 days in the future
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [isEditing, setIsEditing] = useState(false);

  const daysRemaining = calculateDaysRemaining(targetDate);
  const recommendedMinutes = getRecommendedDailyMinutes(daysRemaining, 79);

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">PTE Exam Countdown</h3>
              <p className="text-[11px] text-muted-foreground">Target Test Date Planner</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
            {daysRemaining} Days Left
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-xl border">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Target Date</p>
            {isEditing ? (
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="text-xs font-bold text-foreground bg-background border rounded px-1.5 py-0.5 mt-1"
                autoFocus
              />
            ) : (
              <p 
                onClick={() => setIsEditing(true)} 
                className="text-sm font-extrabold text-foreground cursor-pointer hover:text-primary transition-colors mt-0.5"
                title="Click to change date"
              >
                {new Date(targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ✏️
              </p>
            )}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Daily Goal</p>
            <p className="text-sm font-extrabold text-primary mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {recommendedMinutes} mins/day
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs">
          <span className="text-muted-foreground">Stay consistent for 79+ band</span>
          <a href="/practice">
            <Button size="sm" className="h-7 text-xs font-semibold gap-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Daily Practice <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
