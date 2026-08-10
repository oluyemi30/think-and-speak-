import React from 'react';
import { Difficulty } from '../types';
import { Zap, Layers, Brain } from 'lucide-react';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
}

const DIFFICULTIES: {
  id: Difficulty;
  title: string;
  thinkTime: string;
  speakTime: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'basic',
    title: 'Basic — Quick Think',
    thinkTime: '15s think',
    speakTime: '60s speak',
    desc: 'Train fast thinking & spontaneous speaking.',
    icon: Zap,
  },
  {
    id: 'intermediate',
    title: 'Intermediate — Structured',
    thinkTime: '2m think',
    speakTime: '3m speak',
    desc: 'Organize thoughts & construct logical arguments.',
    icon: Layers,
  },
  {
    id: 'advanced',
    title: 'Advanced — Deep Think',
    thinkTime: '10m think',
    speakTime: '5-10m speak',
    desc: 'High-stakes debates & keynotes prep.',
    icon: Brain,
  },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  setDifficulty,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-[#d97757]" />
        Prep &amp; Speech Timer
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DIFFICULTIES.map((item) => {
          const isSelected = difficulty === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDifficulty(item.id)}
              className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white/[0.08] border border-[#d97757] text-white shadow-md'
                  : 'bg-white/[0.03] border border-white/10 text-zinc-300 hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold tracking-tight">
                    {item.title}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#d97757]' : 'text-zinc-500'}`} />
                </div>
                <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold">
                <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#d97757]/20 text-[#d97757]' : 'bg-white/5 text-zinc-400'}`}>
                  {item.thinkTime}
                </span>
                <span className="text-zinc-600">•</span>
                <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-400'}`}>
                  {item.speakTime}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

