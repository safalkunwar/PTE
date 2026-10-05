import { Link } from "wouter";
import {
  Mic, PenLine, Eye, Headphones, MoreHorizontal, Search, Bell, Moon, Sun,
  ChevronDown, Play, Clock, TrendingUp,
  Zap, BarChart3, BookOpen, Users, MessageSquare, Bookmark, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getPracticeTaskUrl, isPracticeModuleRoute } from "@/lib/practiceRoutes";
import { getSavedThemePreference } from "@/lib/themePreference";

type MenuItem = {
  label: string;
  icon: typeof Play;
  taskType?: string;
  section?: "speaking" | "writing" | "reading" | "listening";
  href?: string;
};

export const menuItems: Record<string, MenuItem[]> = {
  speaking: [
    { label: "Read Aloud", icon: Play, taskType: "read_aloud", section: "speaking" },
    { label: "Repeat Sentence", icon: Mic, taskType: "repeat_sentence", section: "speaking" },
    { label: "Describe Image", icon: Eye, taskType: "describe_image", section: "speaking" },
    { label: "Retell Lecture", icon: BookOpen, taskType: "retell_lecture", section: "speaking" },
    { label: "Answer Short Question", icon: MessageSquare, taskType: "answer_short_question", section: "speaking" },
    { label: "Respond to a Situation", icon: Zap, taskType: "respond_to_situation", section: "speaking" },
    { label: "Summarize Group Discussion", icon: Users, taskType: "summarize_group_discussion", section: "speaking" },
  ],
  writing: [
    { label: "Summarize Written Text", icon: PenLine, taskType: "summarize_written_text", section: "writing" },
    { label: "Write Essay", icon: BookOpen, taskType: "write_essay", section: "writing" },
  ],
  reading: [
    { label: "Reading & Writing: Fill in the Blanks", icon: Eye, taskType: "fill_blanks_rw", section: "reading" },
    { label: "Fill in the Blanks", icon: PenLine, taskType: "fill_blanks_reading", section: "reading" },
    { label: "Reorder Paragraphs", icon: BarChart3, taskType: "reorder_paragraphs", section: "reading" },
    { label: "Multiple Choice: Single Answer", icon: Eye, taskType: "multiple_choice_single", section: "reading" },
    { label: "Multiple Choice: Multiple Answers", icon: Eye, taskType: "multiple_choice_multiple", section: "reading" },
  ],
  listening: [
    { label: "Summarize Spoken Text", icon: Headphones, taskType: "summarize_spoken_text", section: "listening" },
    { label: "Multiple Choice: Multiple Answers", icon: Eye, taskType: "multiple_choice_multiple", section: "listening" },
    { label: "Fill in the Blanks", icon: PenLine, taskType: "fill_blanks_listening", section: "listening" },
    { label: "Highlight Correct Summary", icon: Bookmark, taskType: "highlight_correct_summary", section: "listening" },
    { label: "Multiple Choice: Single Answer", icon: Eye, taskType: "multiple_choice_single", section: "listening" },
    { label: "Select Missing Word", icon: Zap, taskType: "select_missing_word", section: "listening" },
    { label: "Highlight Incorrect Words", icon: AlertCircle, taskType: "highlight_incorrect_words", section: "listening" },
    { label: "Write from Dictation", icon: PenLine, taskType: "write_from_dictation", section: "listening" },
  ],
  more: [
    { label: "AI Study Plan", icon: Zap, href: "/coaching-plan" },
    { label: "AI Score Analysis", icon: TrendingUp, href: "/analytics" },
    { label: "Vocabulary", icon: BookOpen, href: "/revision" },
    { label: "Shadowing", icon: Mic, taskType: "read_aloud", section: "speaking" },
    { label: "Study Materials", icon: BookOpen, href: "/resources" },
    { label: "Mock Tests", icon: BarChart3, href: "/mock-test" },
    { label: "Performance Analytics", icon: TrendingUp, href: "/analytics" },
    { label: "Flashcards", icon: Bookmark, href: "/revision" },
    { label: "Question Collections", icon: BookOpen, href: "/practice" },
    { label: "Bookmarked Questions", icon: Bookmark, href: "/revision" },
    { label: "Recently Practiced", icon: Clock, href: "/dashboard" },
    { label: "Leaderboard", icon: TrendingUp, href: "/analytics" },
    { label: "Community Discussion", icon: Users, href: "/resources" },
  ],
};

const modules = [
  { id: "speaking", label: "Speaking", icon: Mic, color: "text-blue-600" },
  { id: "writing", label: "Writing", icon: PenLine, color: "text-purple-600" },
  { id: "reading", label: "Reading", icon: Eye, color: "text-green-600" },
  { id: "listening", label: "Listening", icon: Headphones, color: "text-orange-600" },
] as const;

export default function PremiumHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const currentIsDark = document.documentElement.classList.contains("dark");
    return getSavedThemePreference(window.localStorage, currentIsDark) === "dark";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    try { localStorage.setItem("pte-theme", isDarkMode ? "dark" : "light"); } catch { /* storage may be unavailable */ }
  }, [isDarkMode]);

  const filteredItems = (items: MenuItem[]) => {
    const query = searchQuery.trim().toLowerCase();
    return query ? items.filter(item => item.label.toLowerCase().includes(query)) : items;
  };

  const openMenu = (menuId: string) => setActiveMenu(current => current === menuId ? null : menuId);

  const renderMenu = (menuId: string, align: "left" | "right" = "left") => {
    const items = filteredItems(menuItems[menuId]);
    return (
      <AnimatePresence>
        {activeMenu === menuId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 w-64 max-h-[70vh] overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-2 space-y-1`}
            role="menu"
          >
            {items.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No matching tasks</p>
            ) : items.map(item => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={`${menuId}-${item.label}`}
                  type="button"
                  role="menuitem"
                  onClick={() => { setActiveMenu(null); window.location.href = getPracticeTaskUrl(item); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  <ItemIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer shrink-0" aria-label="PTEMaster home">
              <span className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </span>
              <span className="font-bold text-lg hidden md:inline">PTEMaster</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 min-w-0" ref={menuRef} aria-label="PTE task navigation">
            {modules.map(module => {
              const Icon = module.icon;
              const isActive = activeMenu === module.id;
              const isRouteActive = isPracticeModuleRoute(location, module.id);
              const isHighlighted = isActive || isRouteActive;
              return (
                <div key={module.id} className="relative">
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-haspopup="menu"
                    onClick={() => openMenu(module.id)}
                    onMouseEnter={() => setActiveMenu(module.id)}
                    className={`relative px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${isHighlighted ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    <Icon className={`w-4 h-4 ${module.color}`} />
                    <span className="hidden xl:inline">{module.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? "rotate-180" : ""}`} />
                    {isHighlighted && (
                      <motion.span
                        layoutId="premium-module-highlight"
                        className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {renderMenu(module.id)}
                </div>
              );
            })}

            <div className="relative">
              <button
                type="button"
                aria-expanded={activeMenu === "more"}
                aria-haspopup="menu"
                onClick={() => openMenu("more")}
                onMouseEnter={() => setActiveMenu("more")}
                className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${activeMenu === "more" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden xl:inline">More</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === "more" ? "rotate-180" : ""}`} />
              </button>
              {renderMenu("more", "right")}
            </div>
          </nav>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <label className="hidden lg:flex items-center bg-muted rounded-lg px-3 py-2" aria-label="Search tasks">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="search" placeholder="Search tasks" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent ml-2 text-sm outline-none w-28" />
            </label>
            <button type="button" aria-label="Notifications" className="p-2 hover:bg-muted rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            </button>
            <button type="button" aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setIsDarkMode(value => !value)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <Link href="/profile">
              <span className="w-7 h-7 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer" aria-label="Open profile">
                {user?.name?.charAt(0) || "U"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
