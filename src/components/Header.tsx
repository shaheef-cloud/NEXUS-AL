import React from 'react';
import {
  LayoutDashboard,
  Bot,
  FolderGit2,
  HelpCircle,
  CalendarCheck,
  BarChart3,
  User as UserIcon,
  Sparkles,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

export type NavTab = 'dashboard' | 'tutor' | 'vault' | 'quiz' | 'planner' | 'analytics' | 'profile';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: User | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  user,
  onOpenAuth,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4" /> },
    { id: 'vault', label: 'Knowledge Vault', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'quiz', label: 'AI Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'planner', label: 'Mission Planner', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#3f310b] border-b border-slate-300/30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-[#5e4914] border border-amber-300/50 flex items-center justify-center text-amber-300 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-100 font-serif">
                  NEXUS <span className="text-amber-300">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-slate-300/40 text-slate-200 bg-[#544111]">
                  Student Platform
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">Learn • Store • Practice • Plan • Analyze</p>
            </div>
          </div>

          {/* Student Profile & Auth Status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#4f3d10] border border-slate-300/30 hover:border-slate-300/60 cursor-pointer transition-all"
                title="View Student Profile"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-300/50"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-100 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-300 truncate max-w-[120px]">{user.year} • {user.course.split('&')[0]}</div>
                </div>
              </div>
            ) : null}

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-100 bg-[#574513] hover:bg-[#685217] border border-slate-300/40 rounded-lg transition-colors cursor-pointer"
              title="Google Authentication & Accounts"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Google Auth</span>
              <span className="md:hidden">Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-[#46370f] border-t border-slate-300/20 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {navItems.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5c4714] text-slate-100 border border-slate-300/60 shadow-inner font-semibold'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-[#523f11] border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-amber-300' : 'text-slate-300'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
