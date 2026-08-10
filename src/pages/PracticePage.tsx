import React, { useState, useRef, useEffect } from 'react';
import { Category, Difficulty, PracticeMode, TopicPrompt } from '../types';
import { CategorySelector } from '../components/CategorySelector';
import { DifficultySelector } from '../components/DifficultySelector';
import { PracticeModeSelector } from '../components/PracticeModeSelector';
import { TopicCard } from '../components/TopicCard';
import { TimerDisplay } from '../components/TimerDisplay';
import { SessionResultModal } from '../components/SessionResultModal';
import { CurseOfKnowledgeBanner } from '../components/CurseOfKnowledgeBanner';
import { geminiService } from '../services/geminiService';
import { Sparkles, Settings2, Play, Loader2, X, ArrowLeft } from 'lucide-react';

interface PracticePageProps {
  onStartDirectTopic?: (prompt: TopicPrompt) => void;
  initialTopicPrompt?: TopicPrompt | null;
}

const SPINNING_WORDS = [
  "Nostalgia", "Artificial Intelligence", "First Principles", "Remote Work",
  "Imposter Syndrome", "SaaS Pricing", "Stoicism", "Creator Economy",
  "Crypto vs TradFi", "Burnout in Tech", "Bootstrapping", "Zero to One",
  "Growth Mindset", "Deep Work", "Public Speaking", "Future of Work",
  "Mental Models", "Overthinking", "Time Management", "Leadership",
  "Habit Loops", "Asynchronous Culture", "Authenticity", "Monetization",
  "AI Productivity", "Self Discipline", "Storytelling", "Networking"
];

export const PracticePage: React.FC<PracticePageProps> = ({ initialTopicPrompt }) => {
  const [category, setCategory] = useState<Category>('General');
  const [customNiche, setCustomNiche] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('speak');

  // Mode selection: "off_the_cuff" or "deep_research"
  const [unpromptedMode, setUnpromptedMode] = useState<'off_the_cuff' | 'deep_research'>('off_the_cuff');
  const [speechTimerMins, setSpeechTimerMins] = useState<number>(1);
  const [researchTimerMins, setResearchTimerMins] = useState<number>(10);
  const [muteSound, setMuteSound] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [currentPrompt, setCurrentPrompt] = useState<TopicPrompt | null>(initialTopicPrompt || null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningWord, setSpinningWord] = useState<string>('Nostalgia');
  const [isPracticing, setIsPracticing] = useState<boolean>(!!initialTopicPrompt);
  const [previousTopics, setPreviousTopics] = useState<string[]>([]);

  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [lastActualSpeakSeconds, setLastActualSpeakSeconds] = useState<number>(0);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  // Spin to generate topic with word spinning ticker animation
  const handleSpin = async () => {
    setIsSpinning(true);

    // Start slot machine word ticker
    let wordIdx = Math.floor(Math.random() * SPINNING_WORDS.length);
    spinIntervalRef.current = setInterval(() => {
      wordIdx = (wordIdx + 1) % SPINNING_WORDS.length;
      setSpinningWord(SPINNING_WORDS[wordIdx]);
    }, 60);

    const minSpinPromise = new Promise((resolve) => setTimeout(resolve, 1300));

    try {
      const [topic] = await Promise.all([
        geminiService.generateTopic({
          category,
          customNiche,
          difficulty,
          practiceMode,
          previousTopics,
        }),
        minSpinPromise,
      ]);

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
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
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
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-fadeIn min-h-[75vh] flex flex-col justify-center px-2 sm:px-4">
      {/* Curse of Knowledge Banner */}
      <CurseOfKnowledgeBanner />

      {!isPracticing ? (
        /* Main Center Screen */
        <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 py-2 sm:py-6">
          
          {/* Subtitle & Toggle Pills */}
          <div className="space-y-3 flex flex-col items-center w-full">
            {/* Off the cuff / Deep research Toggle Pill */}
            <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/10 rounded-full text-xs font-semibold max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setUnpromptedMode('off_the_cuff');
                  setDifficulty('basic');
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  unpromptedMode === 'off_the_cuff'
                    ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-md'
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
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  unpromptedMode === 'deep_research'
                    ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🔍</span>
                <span>Deep research</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-medium max-w-xs sm:max-w-sm">
              {unpromptedMode === 'off_the_cuff'
                ? 'Minimal prep. Think fast and speak with confidence.'
                : '10 min research & structure time before speaking.'}
            </p>

            {/* Category Pill Selector Dropdown Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Category: <strong className="text-white">{category}</strong></span>
                <span className="text-zinc-500 text-[10px]">▼</span>
              </button>
            </div>
          </div>

          {/* Hero Topic Title Display - Slot Machine Ticker */}
          <div className="py-6 sm:py-10 space-y-3 max-w-2xl px-2 w-full">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#f59e0b] uppercase block">
              {isSpinning ? 'SPINNING TOPIC...' : currentPrompt ? 'CURRENT PROMPT' : 'READY TO THINK?'}
            </span>
            <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-zinc-100 tracking-tight leading-none min-h-[110px] flex items-center justify-center break-words px-2">
              {isSpinning ? (
                <span className="text-[#f59e0b] animate-pulse font-serif-display text-3xl sm:text-6xl md:text-7xl tracking-wide drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  "{spinningWord}"
                </span>
              ) : currentPrompt ? (
                `"${currentPrompt.topic}"`
              ) : (
                '"Nostalgia"'
              )}
            </h1>
            {!isSpinning && currentPrompt && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-lg mx-auto font-normal leading-relaxed pt-2">
                {currentPrompt.challenge}
              </p>
            )}
          </div>

          {/* Bottom Action Bar - Fully Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4">
            {/* Spin Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="btn-amber w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isSpinning ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#080c14]" />
              ) : (
                <Sparkles className="w-5 h-5 fill-[#080c14]" />
              )}
              <span>{isSpinning ? 'Spinning...' : 'Spin Topic'}</span>
            </button>

            {/* Start Timer Button */}
            <button
              type="button"
              onClick={handleStartTimer}
              disabled={isSpinning}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {speechTimerMins}m Timer</span>
            </button>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer self-center"
              title="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Modal Drawer */}
          {showSettings && (
            <div className="fixed inset-0 z-50 bg-[#080c14]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
              <div className="glass-card p-5 sm:p-8 max-w-lg w-full rounded-3xl border border-white/10 space-y-5 sm:space-y-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-serif-display text-2xl sm:text-3xl text-zinc-100">
                      Settings
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure prompt category, difficulty, and timer lengths.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-zinc-500 hover:text-zinc-200 p-1.5 cursor-pointer transition-colors"
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
                    <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2.5 py-0.5 rounded-full border border-[#f59e0b]/30">
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
                    className="w-full accent-[#f59e0b] cursor-pointer"
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
                      <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2.5 py-0.5 rounded-full border border-[#f59e0b]/30">
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
                      className="w-full accent-[#f59e0b] cursor-pointer"
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

                {/* Difficulty Selector */}
                <div className="pt-2 border-t border-white/5">
                  <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />
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
                      muteSound ? 'bg-[#f59e0b] justify-end' : 'bg-white/10 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#080c14] shadow-md" />
                  </button>
                </div>

                {/* Done Button */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="btn-amber px-8 py-2.5 rounded-full text-sm font-bold cursor-pointer"
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
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-[0.2em] bg-[#f59e0b]/15 px-3 py-1 rounded-full border border-[#f59e0b]/30">
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

