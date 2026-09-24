import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard, BookOpen, Mic, PenLine, Headphones, Eye,
  BarChart3, Target, Settings, LogOut, ChevronDown, Trophy,
  GraduationCap, Menu, X, Brain, RotateCcw, FileText
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

const modules = [
  { section: 'speaking', label: 'Speaking', icon: Mic, color: 'bg-blue-100 border-blue-400 text-blue-600' },
  { section: 'writing', label: 'Writing', icon: PenLine, color: 'bg-purple-100 border-purple-400 text-purple-600' },
  { section: 'reading', label: 'Reading', icon: Eye, color: 'bg-green-100 border-green-400 text-green-600' },
  { section: 'listening', label: 'Listening', icon: Headphones, color: 'bg-orange-100 border-orange-400 text-orange-600' },
];

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/practice', label: 'Practice', icon: BookOpen },
  { path: '/mock-test', label: 'Mock Test', icon: GraduationCap },
  { path: '/revision', label: 'Revision', icon: RotateCcw },
  { path: '/coaching-plan', label: 'AI Coach', icon: Brain },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface TopNavbarProps {
  user?: any;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ user, onLogout }) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logout.mutateAsync();
    onLogout?.();
    toast.success('Logged out successfully');
  };

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  if (!user) {
    return (
      <nav className="h-14 bg-white border-b border-border flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <p className="font-bold text-foreground text-sm">PTE<span className="text-teal-400">Master</span></p>
        </div>
        <div className="ml-auto">
          <Button asChild size="sm">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      {/* Single Row: Logo + Modules + Nav Items + User */}
      <div className="px-3 py-2 flex items-center justify-between gap-3 h-14">
        {/* Logo */}
        <Link href="/dashboard">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="font-bold text-foreground text-xs hidden sm:block">PTE<span className="text-teal-400">Master</span></p>
          </div>
        </Link>

        {/* Module Tabs - Center */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {modules.map(({ section, label, icon: Icon, color }) => {
            const isActive = location.includes(section);
            return (
              <Link key={section} href={`/practice/${section}`}>
                <button
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? `${color} border-2`
                      : 'bg-muted hover:bg-muted/80 border border-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* Navigation Items - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {navItems.slice(0, 3).map(({ path, label, icon: Icon }) => {
            const isActive = location === path || location.startsWith(path + '/');
            return (
              <Link key={path} href={path}>
                <button
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  title={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* User Menu - Right side */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Dropdown Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-border rounded-lg shadow-lg p-1 z-50">
                <Link href="/profile">
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-foreground hover:bg-muted transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Settings className="w-3.5 h-3.5" />
                    Profile
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border px-3 py-2 space-y-1 bg-muted/30">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path || location.startsWith(path + '/');
            return (
              <Link key={path} href={path}>
                <button
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;
