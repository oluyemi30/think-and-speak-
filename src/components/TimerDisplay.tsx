import React, { useState, useEffect, useRef } from 'react';
import { TopicPrompt } from '../types';
import { Play, Pause, RotateCcw, FastForward, Square } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AudioRecorder } from './AudioRecorder';

interface TimerDisplayProps {
  prompt: TopicPrompt;
  onComplete: (actualSpeakSeconds: number, audioRecordingUrl: string | null) => void;
  onCancel: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  prompt,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<'THINKING' | 'SPEAKING' | 'COMPLETE'>('THINKING');
  const [timeLeft, setTimeLeft] = useState<number>(prompt.thinkTimeSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [actualSpeakSeconds, setActualSpeakSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const initialThinkTime = prompt.thinkTimeSeconds;
  const initialSpeakTime = prompt.speakTimeSeconds;

  const timerRef = useRef<number | null>(null);

  // Format seconds to display as mm:ss or ss
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Main countdown timer effect
  useEffect(() => {
    if (isPaused || phase === 'COMPLETE') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'THINKING') {
            audioService.playSwitchToSpeak();
            setPhase('SPEAKING');
            return initialSpeakTime;
          } else if (phase === 'SPEAKING') {
            audioService.playComplete();
            setPhase('COMPLETE');
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
        }

        if (phase === 'SPEAKING') {
          setActualSpeakSeconds((s) => s + 1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, initialSpeakTime]);

  // Handle phase completion
  useEffect(() => {
    if (phase === 'COMPLETE') {
      setTimeout(() => {
        onComplete(actualSpeakSeconds || initialSpeakTime, audioUrl);
      }, 1000);
    }
  }, [phase, actualSpeakSeconds, initialSpeakTime, audioUrl, onComplete]);

  const handleSkip = () => {
    if (phase === 'THINKING') {
      audioService.playSwitchToSpeak();
      setPhase('SPEAKING');
      setTimeLeft(initialSpeakTime);
    } else if (phase === 'SPEAKING') {
      audioService.playComplete();
      setPhase('COMPLETE');
      onComplete(actualSpeakSeconds || (initialSpeakTime - timeLeft), audioUrl);
    }
  };

  const handleRestart = () => {
    if (phase === 'THINKING') {
      setTimeLeft(initialThinkTime);
    } else {
      setTimeLeft(initialSpeakTime);
      setActualSpeakSeconds(0);
    }
    setIsPaused(false);
  };

  const totalPhaseTime = phase === 'THINKING' ? initialThinkTime : initialSpeakTime;
  const progressPercent = Math.max(0, Math.min(100, ((totalPhaseTime - timeLeft) / totalPhaseTime) * 100));

  return (
    <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 text-center relative my-6">
      {/* Phase Label Badge */}
      <div className="inline-block mb-6">
        {phase === 'THINKING' && (
          <span className="bg-white/10 text-zinc-200 text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full border border-white/10">
            🧠 Thinking Phase — Organize Your Thoughts
          </span>
        )}
        {phase === 'SPEAKING' && (
          <span className="bg-[#f59e0b] text-[#080c14] text-xs font-bold tracking-wider px-4 py-1.5 rounded-full shadow-lg animate-pulse">
            🎙️ Speaking Phase — Speak Out Loud
          </span>
        )}
        {phase === 'COMPLETE' && (
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider px-4 py-1.5 rounded-full border border-emerald-500/30">
            🎉 Practice Completed
          </span>
        )}
      </div>

      {/* Big Timer Clock */}
      <div className="my-4">
        <div className="text-7xl sm:text-9xl font-mono font-bold tracking-tighter text-zinc-100 leading-none">
          {formatTime(timeLeft)}
        </div>
        <span className="text-xs text-zinc-400 tracking-wide mt-3 block font-medium">
          {phase === 'THINKING' ? 'seconds left to prepare your thoughts' : 'seconds left to express your ideas'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 border border-white/10 h-2.5 rounded-full max-w-md mx-auto my-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            phase === 'THINKING' ? 'bg-zinc-300' : 'bg-[#f59e0b]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Voice Recorder Option in Speaking Phase */}
      {phase === 'SPEAKING' && (
        <div className="mb-6">
          <AudioRecorder
            isSpeaking={phase === 'SPEAKING'}
            onAudioRecorded={(url) => setAudioUrl(url)}
          />
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
        {/* Pause / Resume */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-[#f59e0b]" /> : <Pause className="w-3.5 h-3.5 text-zinc-300" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Restart</span>
        </button>

        {/* Skip Phase */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-5 py-2 rounded-full btn-amber text-xs font-bold transition-all cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{phase === 'THINKING' ? 'Start Speaking →' : 'Finish Session'}</span>
        </button>

        {/* End Session */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Square className="w-3 h-3" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

