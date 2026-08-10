import React, { useState } from 'react';
import { Category, Difficulty, PracticeMode, TopicPrompt } from '../types';
import { CategorySelector } from '../components/CategorySelector';
import { DifficultySelector } from '../components/DifficultySelector';
import { PracticeModeSelector } from '../components/PracticeModeSelector';
import { TopicCard } from '../components/TopicCard';
import { TimerDisplay } from '../components/TimerDisplay';
import { SessionResultModal } from '../components/SessionResultModal';
import { CurseOfKnowledgeBanner } from '../components/CurseOfKnowledgeBanner';
import { geminiService } from '../services/geminiService';
import { Sparkles, Settings2, Play, Loader2, X, Brain, VolumeX, Volume2, ArrowLeft } from 'lucide-react';

interface PracticePageProps {
  onStartDirectTopic?: (prompt: TopicPrompt) => void;
  initialTopicPrompt?: TopicPrompt | null;
}

export const PracticePage: React.FC<PracticePageProps> = ({ initialTopicPrompt }) => {
  const [category, setCategory] = useState<Category>('General');
  const [customNiche, setCustomNiche] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('speak');

  // Unprompted Mode: "off_the_cuff" or "deep_research"
  const [unpromptedMode, setUnpromptedMode] = useState<'off_the_cuff' | 'deep_research'>('off_the_cuff');
  const [speechTimerMins, setSpeechTimerMins] = useState<number>(1);
  const [researchTimerMins, setResearchTimerMins] = useState<number>(10);
  const [muteSound, setMuteSound] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [currentPrompt, setCurrentPrompt] = useState<TopicPrompt | null>(initialTopicPrompt || null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isPracticing, setIsPracticing] = useState<boolean>(!!initialTopicPrompt);
  const [previousTopics, setPreviousTopics] = useState<string[]>([]);

  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [lastActualSpeakSeconds, setLastActualSpeakSeconds] = useState<number>(0);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);

  // Spin to generate topic
  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      const topic = await geminiService.generateTopic({
        category,
        customNiche,
        difficulty,
        practiceMode,
        previousTopics,
      });

      // Override timers based on unprompted speech/research timer selections if set
      const thinkSecs = unpromptedMode === 'deep_research' ? researchTimerMins * 60 : 15;
      const speakSecs = speechTimerMins * 60;

      const customizedTopic: TopicPrompt = {
        ...topic,
        thinkTimeSeconds: thinkSecs,
        speakTimeSeconds: speakSecs,
      };

      setCurrentPrompt(customizedTopic);
      setPreviousTopics((prev) => [topic.topic, ...prev].slice(0, 10));
      setSessionCompleted(false);
    } catch (e) {
      console.error('Spin error', e);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleStartTimer = () => {
    if (!currentPrompt) {
      handleSpin().then(() => setIsPracticing(true));
    } else {
      setIsPracticing(true);
    }
  };

  const handleTimerComplete = (actualSpeakSeconds: number, audioUrl: string | null) => {
    setLastActualSpeakSeconds(actualSpeakSeconds);
    setLastAudioUrl(audioUrl);
    setSessionCompleted(true);
  };

  const handleCancelPractice = () => {
    setIsPracticing(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-fadeIn min-h-[75vh] flex flex-col justify-center">
      {/* Curse of Knowledge Banner */}
      <CurseOfKnowledgeBanner />

      {!isPracticing ? (
        /* Unprompted Main Center Screen */
        <div className="flex flex-col items-center text-center space-y-8 py-4 sm:py-8">
          
          {/* Unprompted Subtitle & Toggle Pills */}
          <div className="space-y-3 flex flex-col items-center">
            {/* Off the cuff / Deep research Toggle Pill */}
            <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/10 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setUnpromptedMode('off_the_cuff');
                  setDifficulty('basic');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                  unpromptedMode === 'off_the_cuff'
                    ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🧠</span>
                <span>Off the cuff</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnpromptedMode('deep_research');
                  setDifficulty('advanced');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                  unpromptedMode === 'deep_research'
                    ? 'bg-[#d97757] text-[#0c0f12] font-bold shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🔍</span>
                <span>Deep research</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-medium max-w-sm">
              {unpromptedMode === 'off_the_cuff'
                ? 'Minimal prep. Try to think quick on your feet.'
                : '10 min research & structure time before speaking.'}
            </p>

            {/* Category Pill Selector Dropdown Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97757]" />
                <span>Category: <strong className="text-white">{category}</strong></span>
                <span className="text-zinc-500 text-[10px]">▼</span>
              </button>
            </div>
          </div>

          {/* Hero Topic Title Display */}
          <div className="py-8 sm:py-12 space-y-3 max-w-2xl px-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#d97757] uppercase block">
              {currentPrompt ? 'CURRENT PROMPT' : 'READY TO THINK?'}
            </span>
            <h1 className="font-serif-display text-5xl sm:text-7xl md:text-8xl text-zinc-100 tracking-tight leading-none min-h-[100px] flex items-center justify-center">
              {isSpinning ? (
                <span className="text-zinc-500 animate-pulse font-sans text-3xl sm:text-5xl">
                  Spinning topic...
                </span>
              ) : currentPrompt ? (
                `"${currentPrompt.topic}"`
              ) : (
                'Nostalgia'
              )}
            </h1>
            {currentPrompt && (
              <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-normal leading-relaxed pt-2">
                {currentPrompt.challenge}
              </p>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Spin Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="btn-terracotta px-8 py-3.5 rounded-full text-base font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isSpinning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 fill-[#0c0f12]" />
              )}
              <span>Spin</span>
            </button>

            {/* Start Timer Button */}
            <button
              type="button"
              onClick={handleStartTimer}
              disabled={isSpinning}
              className="px-8 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold text-base flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {speechTimerMins} min timer</span>
            </button>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Modal Drawer */}
          {showSettings && (
            <div className="fixed inset-0 z-50 bg-[#0c0f12]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
              <div className="glass-card p-6 sm:p-8 max-w-lg w-full rounded-3xl border border-white/10 space-y-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-serif-display text-2xl sm:text-3xl text-zinc-100">
                      Settings
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure topic prompt category and timer lengths.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Speech Timer Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Speech Duration
                    </span>
                    <span className="text-xs font-bold text-[#d97757] bg-[#d97757]/15 px-2.5 py-0.5 rounded-full border border-[#d97757]/30">
                      {speechTimerMins} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={speechTimerMins}
                    onChange={(e) => setSpeechTimerMins(Number(e.target.value))}
                    className="w-full accent-[#d97757] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                    <span>1 min</span>
                    <span>5 min</span>
                    <span>10 min</span>
                  </div>
                </div>

                {/* Research Timer Slider if deep research */}
                {unpromptedMode === 'deep_research' && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Research &amp; Prep Duration
                      </span>
                      <span className="text-xs font-bold text-[#d97757] bg-[#d97757]/15 px-2.5 py-0.5 rounded-full border border-[#d97757]/30">
                        {researchTimerMins} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={researchTimerMins}
                      onChange={(e) => setResearchTimerMins(Number(e.target.value))}
                      className="w-full accent-[#d97757] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                      <span>1 min</span>
                      <span>15 min</span>
                      <span>30 min</span>
                    </div>
                  </div>
                )}

                {/* Category Picker */}
                <div className="pt-2 border-t border-white/5">
                  <CategorySelector
                    category={category}
                    setCategory={setCategory}
                    customNiche={customNiche}
                    setCustomNiche={setCustomNiche}
                  />
                </div>

                {/* Practice Format */}
                <div className="pt-2 border-t border-white/5">
                  <PracticeModeSelector
                    practiceMode={practiceMode}
                    setPracticeMode={setPracticeMode}
                  />
                </div>

                {/* Mute toggle */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">
                    Mute sound effects
                  </span>
                  <button
                    type="button"
                    onClick={() => setMuteSound(!muteSound)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      muteSound ? 'bg-[#d97757] justify-end' : 'bg-white/10 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Done Button */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="btn-terracotta px-8 py-2.5 rounded-full text-sm font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Practice Mode View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancelPractice}
              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-[10px] font-bold text-[#d97757] uppercase tracking-[0.2em] bg-[#d97757]/15 px-3 py-1 rounded-full border border-[#d97757]/30">
              Active Session
            </span>
          </div>

          {/* Topic Card Display */}
          {currentPrompt && <TopicCard prompt={currentPrompt} />}

          {/* Timer Display */}
          {currentPrompt && (
            <TimerDisplay
              prompt={currentPrompt}
              onComplete={handleTimerComplete}
              onCancel={handleCancelPractice}
            />
          )}

          {/* Session Result Modal when finished */}
          {sessionCompleted && currentPrompt && (
            <SessionResultModal
              prompt={currentPrompt}
              actualSpeakSeconds={lastActualSpeakSeconds}
              audioRecordingUrl={lastAudioUrl}
              onClose={() => setSessionCompleted(false)}
              onPracticeAgain={() => {
                setSessionCompleted(false);
                handleSpin();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

