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
        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-[#FF4F00] text-white text-[10px] font-black uppercase tracking-[0.2em]">
          <Lightbulb className="w-3.5 h-3.5" /> CONTENT CREATOR ENGINE
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-tight">
          &ldquo;I KNOW MY NICHE. I JUST DON&apos;T KNOW WHAT TO TALK ABOUT.&rdquo;
        </h1>

        <p className="text-xs sm:text-sm text-gray-700 max-w-xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
          Break the curse of knowledge. Stop waiting for inspiration — turn what you already know into high-converting video and podcast concepts.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#FF4F00]">
          ENTER YOUR NICHE OR TOPIC AREA:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Web Development, Fitness, Real Estate, SaaS, AI Tools..."
            className="flex-1 bg-white border-2 border-black p-3 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4F00]"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#FF4F00] hover:bg-[#E04500] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 border-black flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span className="font-black uppercase tracking-wider text-[10px]">Try popular niches:</span>
          {['Web development', 'Fitness & Health', 'Personal Finance', 'Solana', 'AI Tools', 'SaaS Growth'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setNiche(tag);
                handleGenerate();
              }}
              className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white text-black text-[10px] font-black uppercase tracking-wider border-2 border-black transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>

      {/* Generated Ideas Cards */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em]">
            GENERATED CONTENT IDEAS FOR &ldquo;{niche}&rdquo;
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {ideas.map((idea, idx) => (
              <div
                key={idea.id || idx}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-black text-white text-xs font-black flex items-center justify-center border border-black">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 border border-black text-black text-[10px] font-black uppercase tracking-widest">
                        {idea.suggestedMode} MODE
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-black uppercase tracking-tight group-hover:text-[#FF4F00] transition-colors">
                      {idea.headline}
                    </h3>

                    <p className="text-xs text-gray-800 font-extrabold italic bg-gray-100 p-3 border-2 border-black">
                      &ldquo;{idea.hook}&rdquo;
                    </p>

                    {/* Bullet angles */}
                    {idea.angles && idea.angles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {idea.angles.map((angle, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[10px] text-black bg-white px-2.5 py-1 font-bold border border-gray-300 uppercase tracking-wider"
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
                    className="self-start sm:self-center px-5 py-3 bg-[#FF4F00] hover:bg-[#E04500] text-white font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
                  >
                    <span>PRACTICE TOPIC</span>
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
