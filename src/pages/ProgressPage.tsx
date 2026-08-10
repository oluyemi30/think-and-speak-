import React, { useState, useEffect } from 'react';
import { UserStats, SessionRecord } from '../types';
import { storageService } from '../services/storageService';
import { Flame, Clock, Trophy, Star, Volume2, Compass, Trash2 } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(storageService.getStats());
  const [sessions, setSessions] = useState<SessionRecord[]>(storageService.getSessions());

  useEffect(() => {
    setStats(storageService.getStats());
    setSessions(storageService.getSessions());
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local practice history?')) {
      storageService.clearHistory();
      setStats(storageService.getStats());
      setSessions([]);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-serif-display font-bold text-zinc-100 leading-tight">
            Your Practice Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Consistency over perfection. Track your growing confidence and speaking volume.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-zinc-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sessions Completed */}
        <div className="glass-card border border-white/10 p-5 rounded-3xl text-left">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">SESSIONS</span>
            <Trophy className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-4xl font-mono font-bold text-zinc-100 leading-none">{stats.sessionsCompleted}</div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-2 block">TOPICS PRACTICED</span>
        </div>

        {/* Total Speaking Time */}
        <div className="glass-card border border-white/10 p-5 rounded-3xl text-left">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">SPEAKING TIME</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-4xl font-mono font-bold text-zinc-100 leading-none">{formatTime(stats.totalSpeakSeconds)}</div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-2 block">VOCAL PRACTICE</span>
        </div>

        {/* Current Streak */}
        <div className="glass-card border border-white/10 p-5 rounded-3xl text-left">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">STREAK</span>
            <Flame className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </div>
          <div className="text-4xl font-mono font-bold text-zinc-100 leading-none">{stats.streakDays} {stats.streakDays === 1 ? 'DAY' : 'DAYS'}</div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-2 block">CONSISTENCY</span>
        </div>

        {/* Average Confidence */}
        <div className="glass-card border border-white/10 p-5 rounded-3xl text-left">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">AVG CONFIDENCE</span>
            <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </div>
          <div className="text-4xl font-mono font-bold text-zinc-100 leading-none">
            {stats.averageConfidence > 0 ? `${stats.averageConfidence}/5` : 'N/A'}
          </div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-2 block">SELF-RATED</span>
        </div>
      </div>

      {/* Strongest Areas / Category Breakdown */}
      {Object.keys(stats.categoryCounts).length > 0 && (
        <div className="glass-card border border-white/10 p-6 rounded-3xl space-y-4">
          <h2 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4" /> Practiced Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.categoryCounts).map(([cat, count]) => (
              <div key={cat} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{cat}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] text-xs font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History Log */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
          Practice History Log ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="glass-card border border-white/10 p-8 rounded-3xl text-center text-zinc-400 text-xs font-medium space-y-2">
            <p>No practice sessions recorded yet.</p>
            <p className="text-[#f59e0b] font-semibold">Head to the Practice tab and spin your first topic!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="glass-card border border-white/10 p-6 rounded-3xl space-y-3 relative"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {sess.topicPrompt.category}
                    </span>
                    <span className="px-2.5 py-1 border border-white/10 bg-white/5 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {sess.topicPrompt.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      {sess.confidenceRating}/5
                    </span>
                    <span className="opacity-40">•</span>
                    <span>{new Date(sess.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-serif-display font-bold text-zinc-100">&ldquo;{sess.topicPrompt.topic}&rdquo;</h3>
                  <p className="text-xs text-zinc-400 font-normal mt-0.5">{sess.topicPrompt.challenge}</p>
                </div>

                {/* Audio player if recorded */}
                {sess.audioRecordingUrl && (
                  <div className="bg-white/[0.03] border border-white/10 p-3 rounded-2xl flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <audio controls src={sess.audioRecordingUrl} className="w-full h-7 text-xs" />
                  </div>
                )}

                {/* Skills tags */}
                {sess.skillsPracticed && sess.skillsPracticed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sess.skillsPracticed.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-white/5 border border-white/10 text-zinc-300 px-2.5 py-0.5 font-medium rounded-full">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}

                {sess.userNotes && (
                  <p className="text-xs text-zinc-300 font-medium italic bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                    &ldquo;{sess.userNotes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
