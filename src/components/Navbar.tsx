import React from 'react';
import { Flame, Lightbulb, Users, BarChart3, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'practice' | 'content' | 'group' | 'progress';
  setActiveTab: (tab: 'practice' | 'content' | 'group' | 'progress') => void;
  streakDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, streakDays }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0f12]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:py-4 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setActiveTab('practice')}
          className="flex flex-col text-left cursor-pointer group"
        >
          <span className="font-serif-display text-2xl sm:text-3xl text-zinc-100 tracking-tight leading-none group-hover:text-[#d97757] transition-colors">
            Unprompted
          </span>
          <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
            think &amp; speak
          </span>
        </button>

        {/* Navigation Tabs Pills */}
        <nav className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ideas</span>
          </button>

          <button
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'group'
                ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Group</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </nav>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-300 font-semibold shrink-0">
          <Flame className="w-3.5 h-3.5 text-[#d97757] fill-[#d97757]" />
          <span className="text-[11px]">{streakDays}d streak</span>
        </div>
      </div>
    </header>
  );
};

