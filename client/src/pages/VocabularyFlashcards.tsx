import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, RotateCw, ChevronLeft, ChevronRight, Sparkles, Award } from "lucide-react";
import { PTE_VOCABULARY_BANK } from "@shared/vocabularyBank";

export default function VocabularyFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  const currentItem = PTE_VOCABULARY_BANK[currentIndex];
  const isMastered = masteredIds.includes(currentItem.id);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % PTE_VOCABULARY_BANK.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + PTE_VOCABULARY_BANK.length) % PTE_VOCABULARY_BANK.length);
  };

  const toggleMastered = () => {
    if (isMastered) {
      setMasteredIds(masteredIds.filter(id => id !== currentItem.id));
    } else {
      setMasteredIds([...masteredIds, currentItem.id]);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            PTE Academic Collocations & Vocabulary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master high-frequency academic collocations required for Reading, Writing, and Speaking 79+ bands.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
            Mastered: {masteredIds.length} / {PTE_VOCABULARY_BANK.length}
          </Badge>
        </div>
      </div>

      <div className="flex justify-center">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-2xl h-80 cursor-pointer perspective-1000 transition-transform duration-300"
        >
          <Card className={`w-full h-full border-2 border-primary/20 shadow-xl rounded-2xl flex flex-col justify-between p-8 bg-gradient-to-br from-card to-muted/30 ${isFlipped ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary font-bold uppercase tracking-wider text-xs">
                {currentItem.pteTaskType.replace(/_/g, " ")}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Card {currentIndex + 1} of {PTE_VOCABULARY_BANK.length}
              </span>
            </div>

            <div className="text-center space-y-4 my-auto">
              {!isFlipped ? (
                <div>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                    {currentItem.collocation}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Click card to reveal definition & example
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-lg font-semibold text-primary">
                    {currentItem.meaning}
                  </p>
                  <p className="text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-xl border">
                    "{currentItem.example}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
              <span>{isMastered ? "✅ Mastered in SRS" : "⏳ Learning"}</span>
              <span className="font-semibold text-primary">Tap to flip</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Button variant="outline" onClick={prevCard} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <Button 
          onClick={toggleMastered} 
          variant={isMastered ? "default" : "outline"}
          className={`gap-2 ${isMastered ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
        >
          <CheckCircle className="w-4 h-4" /> {isMastered ? "Mastered" : "Mark as Mastered"}
        </Button>
        <Button onClick={nextCard} className="gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
