import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface SpinButtonProps {
  onSpin: () => void;
  isLoading: boolean;
}

export const SpinButton: React.FC<SpinButtonProps> = ({ onSpin, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center my-6">
      <button
        onClick={onSpin}
        disabled={isLoading}
        className="btn-terracotta px-10 py-4 rounded-full text-lg sm:text-xl font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-[#0c0f12]" />
            <span>Spin</span>
          </>
        )}
      </button>

      <span className="text-[11px] text-zinc-500 font-medium tracking-wide mt-2">
        Generate topic &amp; start speaking
      </span>
    </div>
  );
};

