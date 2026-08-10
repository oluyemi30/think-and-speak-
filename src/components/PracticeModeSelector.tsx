import React from 'react';
import { PracticeMode } from '../types';
import { Target } from 'lucide-react';

interface PracticeModeSelectorProps {
  practiceMode: PracticeMode;
  setPracticeMode: (mode: PracticeMode) => void;
}

const MODES: { id: PracticeMode; label: string; desc: string }[] = [
  { id: 'speak', label: 'Speak', desc: 'Spontaneous thoughts' },
  { id: 'explain', label: 'Explain', desc: 'Explain simply (ELI5)' },
  { id: 'debate', label: 'Debate', desc: 'Defend your position' },
  { id: 'hottake', label: 'Hot Take', desc: 'Bold contrarian opinion' },
  { id: 'story', label: 'Story', desc: 'Narrative storytelling' },
  { id: 'solve', label: 'Solve', desc: 'Propose solution' },
  { id: 'content', label: 'Content', desc: 'Video / post script' },
  { id: 'teach', label: 'Teach', desc: 'Masterclass guide' },
  { id: 'devils_advocate', label: "Devil's Advocate", desc: 'Unpopular view' },
];

export const PracticeModeSelector: React.FC<PracticeModeSelectorProps> = ({
  practiceMode,
  setPracticeMode,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-[#f59e0b]" />
        Practice Format
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {MODES.map((m) => {
          const isSelected = practiceMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setPracticeMode(m.id)}
              className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border border-[#f59e0b] text-white shadow-md'
                  : 'bg-white/[0.03] border border-white/10 text-zinc-300 hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <span className="block text-xs font-bold tracking-tight">{m.label}</span>
              <span className="block text-[10px] truncate text-zinc-400 mt-0.5">
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

