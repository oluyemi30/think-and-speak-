import React, { useState } from 'react';
import { TopicPrompt, SessionRecord } from '../types';
import { Trophy, CheckCircle, Volume2, ThumbsUp, ThumbsDown, RotateCcw, X } from 'lucide-react';
import { storageService } from '../services/storageService';

interface SessionResultModalProps {
  prompt: TopicPrompt;
  actualSpeakSeconds: number;
  audioRecordingUrl: string | null;
  onClose: () => void;
  onPracticeAgain: () => void;
}

export const SessionResultModal: React.FC<SessionResultModalProps> = ({
  prompt,
  actualSpeakSeconds,
  audioRecordingUrl,
  onClose,
  onPracticeAgain,
}) => {
  const [confidence, setConfidence] = useState<number>(4);
  const [difficultyRating, setDifficultyRating] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [wouldSpeakAgain, setWouldSpeakAgain] = useState<boolean>(true);
  const [skillsPracticed, setSkillsPracticed] = useState<string[]>([
    'Spontaneous communication',
    'Public speaking',
  ]);
  const [notes, setNotes] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const SKILL_OPTIONS = [
    'Critical thinking',
    'Argumentation',
    'Public speaking',
    'Spontaneous communication',
    'Storytelling',
    'Content creation',
    'Structure & logic',
  ];

  const toggleSkill = (skill: string) => {
    setSkillsPracticed((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = () => {
    const sessionRecord: SessionRecord = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      topicPrompt: prompt,
      thinkDurationSeconds: prompt.thinkTimeSeconds,
      speakDurationSeconds: prompt.speakTimeSeconds,
      actualSpeakDurationSeconds: actualSpeakSeconds,
      confidenceRating: confidence,
      difficultyRating,
      wouldSpeakAgain,
      skillsPracticed,
      userNotes: notes,
      audioRecordingUrl: audioRecordingUrl || undefined,
    };

    storageService.saveSession(sessionRecord);
    setSaved(true);
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0f12]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="glass-card p-6 sm:p-8 max-w-xl w-full rounded-3xl border border-white/10 relative my-8 text-zinc-100 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200 p-2 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl text-zinc-100">
            Session Completed 🎉
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Great job getting your thoughts out into the world.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span className="text-[#f59e0b] font-bold">{prompt.category}</span>
            <span>{prompt.difficulty} Mode</span>
          </div>
          <p className="font-serif-display text-lg text-zinc-100">&ldquo;{prompt.topic}&rdquo;</p>
          <p className="text-xs text-zinc-400">&ldquo;{prompt.challenge}&rdquo;</p>

          <div className="flex items-center gap-6 text-xs font-medium pt-3 border-t border-white/10">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Think Time</span>
              <span className="text-[#f59e0b] font-bold">{formatSeconds(prompt.thinkTimeSeconds)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Speak Time</span>
              <span className="text-emerald-400 font-bold">{formatSeconds(actualSpeakSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Audio Recording Playback if available */}
        {audioRecordingUrl && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
              <Volume2 className="w-4 h-4 text-[#f59e0b]" />
              <span>Your Recorded Speech</span>
            </div>
            <audio controls src={audioRecordingUrl} className="w-full h-8" />
          </div>
        )}

        {/* Self Reflection Form */}
        <div className="space-y-5 text-left mb-6">
          {/* Skills Practiced */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              What did you practice?
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = skillsPracticed.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                        : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confidence Rating 1-5 */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              How confident did you feel? (1 to 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConfidence(val)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${
                    confidence === val
                      ? 'bg-[#f59e0b] text-[#080c14] shadow-md'
                      : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty perception */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              How difficult was this topic?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyRating(diff)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    difficultyRating === diff
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Would speak again */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Would you speak about this topic again?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldSpeakAgain(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  wouldSpeakAgain
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldSpeakAgain(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !wouldSpeakAgain
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> No
              </button>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Personal Notes / Takeaways
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? What filler words did you use?..."
              rows={2}
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d97757]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!saved ? (
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:flex-1 py-3 btn-amber rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Save Record
            </button>
          ) : (
            <div className="w-full sm:flex-1 py-3 bg-white/10 border border-white/10 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Saved!
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (!saved) handleSave();
              onPracticeAgain();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Spin Again 🎲
          </button>
        </div>
      </div>
    </div>
  );
};

