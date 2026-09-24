import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, SkipForward, Bookmark } from "lucide-react";

interface NavigationControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onRedo?: () => void;
  onSkip?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  disabled?: boolean;
}

export default function NavigationControls({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onRedo,
  onSkip,
  onBookmark,
  isBookmarked = false,
  disabled = false,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={disabled || !onPrevious || currentQuestion === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={disabled || !onRedo}
          className="gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Redo
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={disabled || !onNext || currentQuestion === totalQuestions}
          className="gap-1 bg-primary/10 text-primary hover:bg-primary/20"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={disabled || !onSkip}
          className="gap-1 text-muted-foreground"
        >
          <SkipForward className="w-4 h-4" />
          Skip Question
        </Button>

        <Button
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          onClick={onBookmark}
          disabled={disabled || !onBookmark}
          className="gap-1"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          Save
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {currentQuestion} / {totalQuestions}
        </span>
      </div>
    </div>
  );
}
