import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { getPracticeTaskUrl } from '@/lib/practiceRoutes';

interface ModuleProgress {
  section: 'speaking' | 'writing' | 'reading' | 'listening';
  practiced: number;
  total: number;
}

interface TaskType {
  id: string;
  name: string;
  completed: number;
  total: number;
}

interface GlobalModuleNavbarProps {
  modules: ModuleProgress[];
  currentSection?: string;
  onModuleClick?: (section: string) => void;
}

const TASK_TYPES: Record<string, TaskType[]> = {
  speaking: [
    { id: 'personal_introduction', name: 'Personal Introduction (unscored)', completed: 0, total: 0 },
    { id: 'read_aloud', name: 'Read Aloud', completed: 0, total: 0 },
    { id: 'repeat_sentence', name: 'Repeat Sentence', completed: 0, total: 0 },
    { id: 'describe_image', name: 'Describe Image', completed: 0, total: 0 },
    { id: 'retell_lecture', name: 'Retell Lecture', completed: 0, total: 0 },
    { id: 'answer_short_question', name: 'Answer Short Question', completed: 0, total: 0 },
    { id: 'summarize_group_discussion', name: 'Summarize Group Discussion', completed: 0, total: 0 },
    { id: 'respond_to_situation', name: 'Respond to a Situation', completed: 0, total: 0 },
  ],
  writing: [
    { id: 'summarize_written_text', name: 'Summarize Written Text', completed: 0, total: 0 },
    { id: 'write_essay', name: 'Write Essay', completed: 0, total: 0 },
  ],
  reading: [
    { id: 'multiple_choice_single', name: 'Multiple Choice (Single)', completed: 0, total: 0 },
    { id: 'multiple_choice_multiple', name: 'Multiple Choice (Multiple)', completed: 0, total: 0 },
    { id: 'reorder_paragraphs', name: 'Reorder Paragraph', completed: 0, total: 0 },
    { id: 'fill_blanks_reading', name: 'Fill in the Blanks (Dropdown)', completed: 0, total: 0 },
    { id: 'fill_blanks_rw', name: 'Reading and Writing: Fill in the Blanks', completed: 0, total: 0 },
  ],
  listening: [
    { id: 'summarize_spoken_text', name: 'Summarize Spoken Text', completed: 0, total: 0 },
    { id: 'multiple_choice_single', name: 'Multiple Choice, Single Answer', completed: 0, total: 0 },
    { id: 'multiple_choice_multiple', name: 'Multiple Choice, Multiple Answers', completed: 0, total: 0 },
    { id: 'fill_blanks_listening', name: 'Fill in the Blanks', completed: 0, total: 0 },
    { id: 'highlight_correct_summary', name: 'Highlight Correct Summary', completed: 0, total: 0 },
    { id: 'select_missing_word', name: 'Select Missing Word', completed: 0, total: 0 },
    { id: 'highlight_incorrect_words', name: 'Highlight Incorrect Words', completed: 0, total: 0 },
    { id: 'write_from_dictation', name: 'Write from Dictation', completed: 0, total: 0 },
  ],
};

const MODULE_COLORS: Record<string, string> = {
  speaking: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  writing: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  reading: 'bg-green-50 hover:bg-green-100 border-green-200',
  listening: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
};

const MODULE_TEXT_COLORS: Record<string, string> = {
  speaking: 'text-blue-700',
  writing: 'text-purple-700',
  reading: 'text-green-700',
  listening: 'text-orange-700',
};

export const GlobalModuleNavbar: React.FC<GlobalModuleNavbarProps> = ({
  modules,
  currentSection,
  onModuleClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const getModuleProgress = (section: string): ModuleProgress | undefined => {
    return modules.find((m) => m.section === section);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 items-center">
          {/* Module Tabs */}
          {['speaking', 'writing', 'reading', 'listening'].map((section) => {
            const progress = getModuleProgress(section);
            const isActive = currentSection === section;
            const practiced = progress?.practiced || 0;

            return (
              <div key={section} className="relative">
                <button
                  onClick={() => {
                    setOpenDropdown(openDropdown === section ? null : section);
                    onModuleClick?.(section);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? `${MODULE_COLORS[section]} border-current`
                      : 'bg-muted hover:bg-muted/80 border-border'
                  }`}
                >
                  <span className={`capitalize font-medium ${isActive ? MODULE_TEXT_COLORS[section] : ''}`}>
                    {section}
                  </span>
                  <span className={`text-xs font-semibold ${isActive ? MODULE_TEXT_COLORS[section] : 'text-muted-foreground'}`}>
                    {practiced}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === section && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-3 min-w-[250px] z-50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
                      {section} Tasks
                    </p>
                    <div className="space-y-1">
                      {TASK_TYPES[section].map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setLocation(getPracticeTaskUrl({
                            section: section as 'speaking' | 'writing' | 'reading' | 'listening',
                            taskType: task.id,
                          }))}
                          className="flex w-full items-center justify-between px-2 py-1.5 rounded hover:bg-muted transition-colors text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span className="text-foreground">{task.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {task.completed}/{task.total}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalModuleNavbar;
