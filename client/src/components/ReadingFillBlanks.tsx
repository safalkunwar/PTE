import React, { useMemo, useState } from "react";

type ReadingFillBlanksProps = {
  content: string;
  wordBank: string[];
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
};

export default function ReadingFillBlanks({ content, wordBank, answers, onAnswersChange }: ReadingFillBlanksProps) {
  const [activeBlank, setActiveBlank] = useState<number>(0);
  const parts = useMemo(() => content.split("_____"), [content]);
  const blankCount = Math.max(parts.length - 1, 0);
  const availableWords = wordBank.filter((word) => !answers.includes(word));

  const assignWord = (word: string, blankIndex = activeBlank) => {
    if (blankIndex < 0 || blankIndex >= blankCount) return;
    const next = Array.from({ length: blankCount }, (_, index) => answers[index] ?? "");
    const priorIndex = next.indexOf(word);
    if (priorIndex >= 0) next[priorIndex] = "";
    next[blankIndex] = word;
    onAnswersChange(next);
    const nextOpen = next.findIndex((answer) => !answer);
    setActiveBlank(nextOpen >= 0 ? nextOpen : blankIndex);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Drag a word to each blank, or select a blank and then choose a word from the answer bank.</p>
      <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm leading-8 text-foreground">
        {parts.map((part, index) => (
          <span key={`${index}-${part.slice(0, 12)}`}>
            {part}
            {index < blankCount && (
              <button
                type="button"
                aria-label={`Blank ${index + 1}`}
                onClick={() => setActiveBlank(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  assignWord(event.dataTransfer.getData("text/plain"), index);
                }}
                className={`mx-1 inline-flex min-w-28 items-center justify-center border-b-2 px-2 py-0.5 text-sm font-semibold ${
                  activeBlank === index ? "border-primary bg-primary/10 text-primary" : "border-primary/40 text-foreground"
                }`}
              >
                {answers[index] || `Blank ${index + 1}`}
              </button>
            )}
          </span>
        ))}
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Answer bank</p>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word) => (
            <button
              key={word}
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", word)}
              onClick={() => assignWord(word)}
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
