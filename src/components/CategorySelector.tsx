import React from 'react';
import { Category } from '../types';
import { Compass, Edit3 } from 'lucide-react';

interface CategorySelectorProps {
  category: Category;
  setCategory: (cat: Category) => void;
  customNiche: string;
  setCustomNiche: (niche: string) => void;
}

const CATEGORIES: { name: Category; label: string }[] = [
  { name: 'General', label: '✨ General' },
  { name: 'Technology', label: '💻 Tech' },
  { name: 'Programming', label: '⚡ Programming' },
  { name: 'AI', label: '🤖 AI' },
  { name: 'Web3', label: '🌐 Web3' },
  { name: 'Finance', label: '📈 Finance' },
  { name: 'Business', label: '💼 Business' },
  { name: 'Entrepreneurship', label: '🚀 Entrepreneurship' },
  { name: 'Marketing', label: '🎯 Marketing' },
  { name: 'Content Creation', label: '🎬 Content' },
  { name: 'Storytelling', label: '📖 Storytelling' },
  { name: 'Personal Development', label: '🌱 Growth' },
  { name: 'Relationships', label: '🤝 Relationships' },
  { name: 'Society', label: '🏛️ Society' },
  { name: 'Education', label: '🎓 Education' },
  { name: 'Science', label: '🔬 Science' },
  { name: 'Christian', label: '✝️ Faith' },
  { name: 'Custom', label: '✏️ Custom + ' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  setCategory,
  customNiche,
  setCustomNiche,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
          Topic Category
        </label>
        {category === 'General' && (
          <span className="text-[11px] text-zinc-500 font-medium">Everyday topics</span>
        )}
      </div>

      {/* Pill Grid */}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-md'
                  : 'bg-white/[0.04] border border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Custom Niche Input */}
      {category === 'Custom' && (
        <div className="mt-3 animate-fadeIn">
          <div className="relative">
            <Edit3 className="w-4 h-4 text-[#f59e0b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Enter custom niche (e.g. Solana, Fashion, Real Estate)..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-3 pl-10 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#f59e0b]"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Gemini will craft custom topics tailored to your exact niche.
          </p>
        </div>
      )}
    </div>
  );
};

