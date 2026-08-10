import React, { useState } from 'react';
import { ContentIdea, TopicPrompt } from '../types';
import { geminiService } from '../services/geminiService';
import { Lightbulb, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface ContentCreatorPageProps {
  onSelectTopicToPractice: (prompt: TopicPrompt) => void;
}

export const ContentCreatorPage: React.FC<ContentCreatorPageProps> = ({
  onSelectTopicToPractice,
}) => {
  const [niche, setNiche] = useState<string>('Web development');
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const generated = await geminiService.generateContentIdeas(niche);
      setIdeas(generated);
    } catch (err) {
      console.error('Error generating ideas', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeIdea = (idea: ContentIdea) => {
    const prompt: TopicPrompt = {
      id: `content-practice-${Date.now()}`,
      type: 'scenario',
      topic: idea.headline,
      challenge: idea.hook,
      context: `Turn this concept into a compelling 60-second video or audio response. Focus on immediate audience retention.`,
      angles: idea.angles,
      difficulty: 'basic',
      category: niche || 'Content Creation',
      practiceMode: idea.suggestedMode || 'content',
      thinkTimeSeconds: 15,
      speakTimeSeconds: 60,
    };

    onSelectTopicToPractice(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] text-xs font-bold uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5" /> CONTENT CREATOR ENGINE
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif-display font-bold text-zinc-100 leading-tight">
          &ldquo;I know my niche. I just don&apos;t know what to talk about.&rdquo;
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium leading-relaxed">
          Break the curse of knowledge. Stop waiting for inspiration — turn what you already know into high-converting video and podcast concepts.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="glass-card border border-white/10 p-6 rounded-3xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#f59e0b]">
          Enter your niche or topic area:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Web Development, Fitness, Real Estate, SaaS, AI Tools..."
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#f59e0b]"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 btn-amber text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Ideas</span>
              </>
            )}
          </button>
        </div>

        {/* Preset tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-2">
          <span className="font-bold uppercase tracking-wider text-[10px]">Try popular niches:</span>
          {['Web development', 'Fitness & Health', 'Personal Finance', 'Solana', 'AI Tools', 'SaaS Growth'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setNiche(tag);
                handleGenerate();
              }}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-medium rounded-full border border-white/10 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>

      {/* Generated Ideas Cards */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
            Generated Content Ideas for &ldquo;{niche}&rdquo;
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {ideas.map((idea, idx) => (
              <div
                key={idea.id || idx}
                className="glass-card border border-white/10 p-6 rounded-3xl transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-white/10 text-zinc-200 text-xs font-bold flex items-center justify-center rounded-lg border border-white/10">
                        {idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {idea.suggestedMode} MODE
                      </span>
                    </div>

                    <h3 className="text-xl font-serif-display font-bold text-zinc-100 group-hover:text-[#f59e0b] transition-colors">
                      {idea.headline}
                    </h3>

                    <p className="text-xs text-zinc-300 font-medium italic bg-white/[0.03] p-3 rounded-2xl border border-white/10 leading-relaxed">
                      &ldquo;{idea.hook}&rdquo;
                    </p>

                    {/* Bullet angles */}
                    {idea.angles && idea.angles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {idea.angles.map((angle, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 font-medium rounded-full border border-white/10"
                          >
                            • {angle}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Practice Button */}
                  <button
                    type="button"
                    onClick={() => handlePracticeIdea(idea)}
                    className="self-start sm:self-center px-5 py-2.5 btn-amber text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
