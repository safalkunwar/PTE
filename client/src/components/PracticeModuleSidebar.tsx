import { Mic, PenLine, Eye, Headphones, CheckCircle, SkipForward, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ModuleProgress {
  section: "speaking" | "writing" | "reading" | "listening";
  practiced: number;
  skipped: number;
  undone: number;
  total: number;
}

interface PracticeModuleSidebarProps {
  modules: ModuleProgress[];
  currentSection?: string;
}

const sectionConfig = {
  speaking: { icon: Mic, color: "bg-blue-500", label: "Speaking" },
  writing: { icon: PenLine, color: "bg-purple-500", label: "Writing" },
  reading: { icon: Eye, color: "bg-green-500", label: "Reading" },
  listening: { icon: Headphones, color: "bg-orange-500", label: "Listening" },
};

export default function PracticeModuleSidebar({ modules, currentSection }: PracticeModuleSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border rounded-lg p-4 space-y-4 h-fit sticky top-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-foreground">Practice Progress</h3>
        <p className="text-xs text-muted-foreground">Track your session</p>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const config = sectionConfig[module.section];
          const Icon = config.icon;
          const percentage = module.total > 0 ? (module.practiced / module.total) * 100 : 0;
          const isCurrent = currentSection === module.section;

          return (
            <div
              key={module.section}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {module.practiced}/{module.total} done
                  </p>
                </div>
              </div>

              <Progress value={percentage} className="h-1.5 mb-2" />

              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="flex-1 justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {module.practiced}
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center gap-1">
                  <SkipForward className="w-3 h-3" />
                  {module.skipped}
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  {module.undone}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
