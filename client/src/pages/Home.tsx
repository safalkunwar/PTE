import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  GraduationCap, Mic, PenLine, Eye, Headphones, BarChart3,
  CheckCircle, ArrowRight, Star, Trophy, Target, Zap, Brain
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Speaking Practice",
    description: "Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question — with AI pronunciation & fluency scoring.",
    color: "bg-blue-500",
  },
  {
    icon: PenLine,
    title: "Writing Practice",
    description: "Summarize Written Text and Write Essay tasks with AI-powered grammar, vocabulary, and discourse evaluation.",
    color: "bg-purple-500",
  },
  {
    icon: Eye,
    title: "Reading Practice",
    description: "Multiple Choice, Re-order Paragraphs, Fill in the Blanks — all question types with instant feedback.",
    color: "bg-green-500",
  },
  {
    icon: Headphones,
    title: "Listening Practice",
    description: "Summarize Spoken Text, Write from Dictation, Highlight Incorrect Words, and more listening tasks.",
    color: "bg-orange-500",
  },
];

const benefits = [
  "AI scoring aligned with official PTE score guide",
  "Detailed enabling skills breakdown (Grammar, Pronunciation, Fluency, etc.)",
  "Full mock tests with real exam timing",
  "Personalized diagnostic feedback and action plans",
  "Progress analytics and score trend tracking",
  "Multiple learning modes: Beginner, Exam, Diagnostic, Revision",
];

const stats = [
  { label: "Task Types", value: "20+", icon: Target },
  { label: "Practice Questions", value: "100+", icon: Brain },
  { label: "Score Scale", value: "10–90", icon: Trophy },
  { label: "Skills Tracked", value: "10", icon: Zap },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">PTE Practice</span>
            <span className="hidden sm:inline text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">Academic</span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button asChild size="sm">
                  <Link href="/dashboard">Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-primary text-primary-foreground">
                  <a href={getLoginUrl()}>Get Started Free</a>
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5" />
              AI-Powered PTE-Style Assessment Platform
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Master PTE Academic
              <span className="text-accent block">with AI Precision</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Practice all PTE Academic task types with an AI scoring engine aligned with the official PTE score guide.
              Get detailed feedback on Content, Form, Language, Pronunciation, and Fluency — just like the real exam.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground text-base px-8">
                    <Link href="/dashboard">Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <Link href="/mock-test">Start Mock Test</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground text-base px-8">
                    <a href={getLoginUrl()}>Start Practicing Free <ArrowRight className="w-5 h-5 ml-2" /></a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <a href={getLoginUrl()}>View Demo</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="container py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-extrabold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">All Four PTE Sections</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive practice covering every task type in the PTE Academic exam, with AI-powered scoring and feedback.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-card border-y border-border">
        <div className="container py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Scoring Aligned with the Official PTE Score Guide
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our AI scoring engine follows the same criteria as the official PTE Academic assessment —
                evaluating Communicative Skills (Speaking, Writing, Reading, Listening) and Enabling Skills
                (Grammar, Oral Fluency, Pronunciation, Spelling, Vocabulary, Written Discourse).
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
              <div className="text-center mb-6">
                <div className="text-6xl font-extrabold mb-1">83</div>
                <div className="text-primary-foreground/70 text-sm">Overall Score (10–90)</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Listening", score: 82 },
                  { label: "Reading", score: 87 },
                  { label: "Speaking", score: 90 },
                  { label: "Writing", score: 82 },
                ].map(({ label, score }) => (
                  <div key={label} className="bg-primary-foreground/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{score}</div>
                    <div className="text-xs text-primary-foreground/70">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                <p className="text-xs text-primary-foreground/60 text-center">
                  Sample score report — aligned with official PTE Academic format
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Improve Your PTE Score?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Start with a diagnostic test to identify your weak areas, then follow a personalized practice plan.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground text-base px-10">
          <a href={getLoginUrl()}>
            Begin Your Practice Journey <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          This platform is PTE-style, not affiliated with or endorsed by Pearson. Aligned with official PTE scoring descriptors.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">PTE Practice Platform — AI-powered, PTE-style assessment</span>
          </div>
          <p className="text-xs text-muted-foreground">Not affiliated with Pearson PTE</p>
        </div>
      </footer>
    </div>
  );
}
