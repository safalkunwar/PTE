import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Mic, PenLine, Eye, Headphones, ArrowRight, Trophy, Target,
  TrendingUp, Clock, BookOpen, GraduationCap, Zap, BarChart3
} from "lucide-react";

const sectionCards = [
  { section: "speaking", label: "Speaking", icon: Mic, color: "bg-blue-500", tasks: "Read Aloud, Repeat Sentence, Describe Image..." },
  { section: "writing", label: "Writing", icon: PenLine, color: "bg-purple-500", tasks: "Summarize Written Text, Write Essay" },
  { section: "reading", label: "Reading", icon: Eye, color: "bg-green-500", tasks: "Multiple Choice, Re-order Paragraphs, Fill Blanks..." },
  { section: "listening", label: "Listening", icon: Headphones, color: "bg-orange-500", tasks: "Summarize Spoken Text, Write from Dictation..." },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics } = trpc.analytics.myStats.useQuery();
  const { data: target } = trpc.analytics.todayTarget.useQuery();
  const { data: milestones } = trpc.analytics.milestones.useQuery();

  const latestSession = analytics?.latestSession;
  const avgScore = analytics?.avgScore ? Math.round(analytics.avgScore) : null;
  const totalSessions = analytics?.totalSessions || 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PTELayout title="Dashboard">
      <div className="space-y-6 max-w-6xl">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{greeting()}, {user?.name?.split(" ")[0] || "Learner"}!</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {totalSessions === 0
                  ? "Start your first practice session to get your baseline score."
                  : `You've completed ${totalSessions} practice session${totalSessions !== 1 ? "s" : ""}. Keep it up!`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link href="/mock-test">
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                  Mock Test
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/practice">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Practice
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Score overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-extrabold text-foreground mb-1">
                {avgScore ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground mb-2">Avg. Overall Score</div>
              <div className="text-xs text-muted-foreground">(10–90 scale)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {latestSession?.overallScore ? Math.round(latestSession.overallScore) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Latest Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {milestones?.length ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Milestones</div>
            </CardContent>
          </Card>
        </div>

        {/* Latest score breakdown */}
        {latestSession && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Latest Session Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Speaking", score: latestSession.speakingScore, color: "bg-blue-500" },
                  { label: "Writing", score: latestSession.writingScore, color: "bg-purple-500" },
                  { label: "Reading", score: latestSession.readingScore, color: "bg-green-500" },
                  { label: "Listening", score: latestSession.listeningScore, color: "bg-orange-500" },
                ].map(({ label, score, color }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{score ? Math.round(score) : "—"}</span>
                    </div>
                    <Progress
                      value={score ? ((score - 10) / 80) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Completed {latestSession.completedAt ? new Date(latestSession.completedAt).toLocaleDateString() : "recently"}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/score-report/${latestSession.id}`}>
                    View Full Report <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's target */}
        {target && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Today's Practice Goal</p>
                    <p className="text-sm text-muted-foreground">
                      {target.completedMinutes || 0} / {target.targetMinutes} minutes completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(((target.completedMinutes || 0) / (target.targetMinutes || 30)) * 100)}%
                  </div>
                </div>
              </div>
              <Progress
                value={((target.completedMinutes || 0) / (target.targetMinutes || 30)) * 100}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* Practice sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Practice by Section</h3>
            <Button asChild variant="ghost" size="sm">
              <Link href="/practice">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionCards.map(({ section, label, icon: Icon, color, tasks }) => (
              <Link key={section} href={`/practice/${section}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group">
                  <CardContent className="pt-5 pb-5">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{label}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tasks}</p>
                    <div className="mt-3 flex items-center text-xs text-primary font-medium">
                      Practice <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/mock-test">
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Full Mock Test</p>
                  <p className="text-xs text-muted-foreground">Simulate the real exam</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/learning-modes">
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Learning Modes</p>
                  <p className="text-xs text-muted-foreground">Beginner, Exam, Diagnostic</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/analytics">
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">My Analytics</p>
                  <p className="text-xs text-muted-foreground">Track your progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Recent Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(m.achievedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PTELayout>
  );
}
