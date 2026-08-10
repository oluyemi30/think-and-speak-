import React from 'react';
import { Flame, Lightbulb, Users, BarChart3, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'practice' | 'content' | 'group' | 'progress';
  setActiveTab: (tab: 'practice' | 'content' | 'group' | 'progress') => void;
  streakDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, streakDays }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => setActiveTab('practice')}
          className="flex flex-col text-left cursor-pointer group shrink-0"
        >
          <span className="font-serif-display text-xl sm:text-2xl md:text-3xl text-zinc-100 tracking-tight leading-none group-hover:text-[#f59e0b] transition-colors">
            Off The Cuff
          </span>
          <span className="text-[9px] sm:text-[10px] text-amber-500/80 font-medium tracking-wide hidden xs:block">
            spontaneous speaking gym
          </span>
        </button>

        {/* Navigation Tabs Pills - Horizontal Scroll on small screens */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-full text-xs font-semibold overflow-x-auto custom-scrollbar max-w-[210px] xs:max-w-none">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'practice'
                ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Ideas</span>
          </button>

          <button
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'group'
                ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Group</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Stats</span>
          </button>
        </nav>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold shrink-0">
          <Flame className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
          <span className="text-[10px] sm:text-[11px] font-bold">{streakDays}d</span>
        </div>
      </div>
    </header>
  );
};

