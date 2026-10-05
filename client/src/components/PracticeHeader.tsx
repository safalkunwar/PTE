import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PracticeHeaderProps {
  taskType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  taskType,
  difficulty,
  questionNumber,
  totalQuestions,
  timeRemaining,
}) => {
  const difficultyColors = {
    easy: 'border-green-300 text-green-700 bg-green-50',
    medium: 'border-yellow-300 text-yellow-700 bg-yellow-50',
    hard: 'border-red-300 text-red-700 bg-red-50',
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      {/* Task Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {taskType.replace(/_/g, ' ')}
          </Badge>
          <Badge
            variant="outline"
            className={`capitalize ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {questionNumber}/{totalQuestions}
          </span>
        </div>

        {timeRemaining !== undefined && (
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
