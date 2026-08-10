import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export const CurseOfKnowledgeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative glass-card p-4 sm:p-5 rounded-2xl border border-white/10 mb-6 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#f59e0b] mb-0.5">
              Break the Curse of Knowledge
            </h3>
            <p className="text-sm text-zinc-200 font-serif-display italic leading-snug">
              &ldquo;You already know enough. The problem isn&apos;t a lack of knowledge — it&apos;s having so much knowledge that you don&apos;t know how to turn it into something worth saying.&rdquo;
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              You don&apos;t need more knowledge. Practice turning your thoughts into words on demand.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors shrink-0 cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

