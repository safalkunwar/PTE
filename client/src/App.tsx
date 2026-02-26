import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import PracticeSession from "./pages/PracticeSession";
import MockTest from "./pages/MockTest";
import ScoreReport from "./pages/ScoreReport";
import Analytics from "./pages/Analytics";
import LearningModes from "./pages/LearningModes";
import Profile from "./pages/Profile";
import CoachingPlan from "./pages/CoachingPlan";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/practice" component={Practice} />
      <Route path="/practice/:section" component={Practice} />
      <Route path="/session/:sessionId" component={PracticeSession} />
      <Route path="/mock-test" component={MockTest} />
      <Route path="/score-report/:sessionId" component={ScoreReport} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/learning-modes" component={LearningModes} />
      <Route path="/profile" component={Profile} />
      <Route path="/coaching-plan" component={CoachingPlan} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
