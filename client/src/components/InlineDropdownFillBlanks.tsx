import React, { useMemo } from "react";
import { getInlineDropdownBlankIds } from "@/lib/inlineDropdownFillBlanks";

type BlankGroup = { id: string; choices: string[] };

type InlineDropdownFillBlanksProps = {
  content: string;
  groups: BlankGroup[];
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
};

export default function InlineDropdownFillBlanks({ content, groups, answers, onAnswersChange }: InlineDropdownFillBlanksProps) {
  const tokens = useMemo(() => content.split(/(\[\[gap\d+\]\]|\{gap\d+\})/g), [content]);
  const blankIds = useMemo(() => getInlineDropdownBlankIds(content), [content]);
  const groupIndex = new Map(groups.map((group, index) => [group.id, index]));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Choose the best word for each blank in the passage.</p>
      <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm leading-8 text-foreground">
        {tokens.map((token, tokenIndex) => {
          const match = token.match(/^\[\[(gap\d+)\]\]$|^\{(gap\d+)\}$/);
          if (!match) return <span key={`${tokenIndex}-${token.slice(0, 12)}`}>{token}</span>;
          const blankId = match[1] ?? match[2];
          const selectionIndex = groupIndex.get(blankId) ?? blankIds.indexOf(blankId);
          const group = groups[selectionIndex];
          return (
            <select
              key={blankId}
              aria-label={`Blank ${selectionIndex + 1}`}
              value={answers[selectionIndex] ?? ""}
              onChange={(event) => {
                const next = Array.from({ length: groups.length }, (_, index) => answers[index] ?? "");
                next[selectionIndex] = event.target.value;
                onAnswersChange(next);
              }}
              className="mx-1 inline-block min-w-32 rounded-md border border-primary/40 bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select</option>
              {(group?.choices ?? []).map((choice) => <option key={choice} value={choice}>{choice}</option>)}
            </select>
          );
        })}
      </p>
    </div>
  );
}
