import React from 'react';
import { TopicPrompt } from '../types';
import { HelpCircle, Lightbulb } from 'lucide-react';

interface TopicCardProps {
  prompt: TopicPrompt;
}

export const TopicCard: React.FC<TopicCardProps> = ({ prompt }) => {
  return (
    <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden my-4 text-center sm:text-left shadow-2xl">
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300 px-3 py-1 rounded-full border border-white/10">
          {prompt.category}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-[#f59e0b] px-3 py-1 rounded-full border border-amber-500/30">
          {prompt.difficulty}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-400 px-3 py-1 rounded-full border border-white/10">
          {prompt.practiceMode} mode
        </span>
      </div>

      {/* Main Topic Header */}
      <div className="space-y-4 mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#f59e0b] block">
          TOPIC PROMPT
        </span>
        <h2 className="font-serif-display text-4xl sm:text-6xl text-zinc-100 leading-tight tracking-tight">
          &ldquo;{prompt.topic}&rdquo;
        </h2>
        <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed max-w-2xl">
          {prompt.challenge}
        </p>
      </div>

      {/* Context Scenario if present */}
      {prompt.context && (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-xs text-zinc-300 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px] text-[#f59e0b] mb-0.5">Context &amp; Stakes:</span>
            <span className="text-zinc-300 font-medium leading-relaxed">{prompt.context}</span>
          </div>
        </div>
      )}

      {/* Angles to consider */}
      {prompt.angles && prompt.angles.length > 0 && (
        <div className="pt-5 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-[#f59e0b]" />
            Angles to consider
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prompt.angles.map((angle, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                <span>{angle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

