import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModuleInfo {
  section: 'speaking' | 'writing' | 'reading' | 'listening';
  completed: number;
  total: number;
}

interface PracticeHeaderProps {
  modules: ModuleInfo[];
  currentSection?: string;
  taskType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  modules,
  currentSection,
  taskType,
  difficulty,
  questionNumber,
  totalQuestions,
  timeRemaining,
}) => {
  const moduleColors = {
    speaking: 'bg-blue-100 text-blue-700 border-blue-300',
    writing: 'bg-purple-100 text-purple-700 border-purple-300',
    reading: 'bg-green-100 text-green-700 border-green-300',
    listening: 'bg-orange-100 text-orange-700 border-orange-300',
  };

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
      {/* Module Tabs */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-border">
        {modules.map((module) => (
          <div
            key={module.section}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              currentSection === module.section
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="font-medium capitalize text-sm">{module.section}</span>
            <span className="text-xs text-muted-foreground">
              {module.completed}/{module.total}
            </span>
          </div>
        ))}
      </div>

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
