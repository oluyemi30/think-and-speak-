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
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-tight">
            YOUR PRACTICE DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-bold uppercase tracking-wider mt-1">
            Consistency over perfection. Track your growing confidence and speaking volume.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-black text-black hover:text-[#FF4F00] flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white hover:bg-gray-100 uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#FF4F00]" /> Clear History
          </button>
        )}
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sessions Completed */}
        <div className="bg-white border-2 border-black p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">SESSIONS</span>
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div className="text-4xl font-black text-black leading-none">{stats.sessionsCompleted}</div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 block">TOPICS PRACTICED</span>
        </div>

        {/* Total Speaking Time */}
        <div className="bg-white border-2 border-black p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">SPEAKING TIME</span>
            <Clock className="w-4 h-4 text-black" />
          </div>
          <div className="text-4xl font-black text-black leading-none">{formatTime(stats.totalSpeakSeconds)}</div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 block">VOCAL PRACTICE</span>
        </div>

        {/* Current Streak */}
        <div className="bg-white border-2 border-black p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">STREAK</span>
            <Flame className="w-4 h-4 text-[#FF4F00] fill-[#FF4F00]" />
          </div>
          <div className="text-4xl font-black text-black leading-none">{stats.streakDays} {stats.streakDays === 1 ? 'DAY' : 'DAYS'}</div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 block">CONSISTENCY</span>
        </div>

        {/* Average Confidence */}
        <div className="bg-white border-2 border-black p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between text-black mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">AVG CONFIDENCE</span>
            <Star className="w-4 h-4 text-black fill-black" />
          </div>
          <div className="text-4xl font-black text-black leading-none">
            {stats.averageConfidence > 0 ? `${stats.averageConfidence}/5` : 'N/A'}
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 block">SELF-RATED</span>
        </div>
      </div>

      {/* Strongest Areas / Category Breakdown */}
      {Object.keys(stats.categoryCounts).length > 0 && (
        <div className="bg-white border-2 border-black p-6 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em] flex items-center gap-2">
            <Compass className="w-4 h-4" /> YOUR PRACTICED CATEGORIES
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.categoryCounts).map(([cat, count]) => (
              <div key={cat} className="bg-gray-100 border-2 border-black p-3 flex items-center justify-between">
                <span className="text-xs font-black text-black uppercase tracking-tight">{cat}</span>
                <span className="px-2 py-0.5 bg-black text-white text-xs font-black">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History Log */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em]">
          PRACTICE HISTORY LOG ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-white border-2 border-black p-8 text-center text-black text-xs font-bold uppercase tracking-wider space-y-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p>NO PRACTICE SESSIONS RECORDED YET.</p>
            <p className="text-[#FF4F00]">HEAD TO THE PRACTICE TAB AND SPIN YOUR FIRST TOPIC!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white border-2 border-black p-6 space-y-3 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#FF4F00] text-white text-[10px] font-black uppercase tracking-widest">
                      {sess.topicPrompt.category}
                    </span>
                    <span className="px-2.5 py-1 border-2 border-black bg-gray-100 text-black text-[10px] font-black uppercase tracking-widest">
                      {sess.topicPrompt.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-black">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#FF4F00] fill-[#FF4F00]" />
                      {sess.confidenceRating}/5
                    </span>
                    <span className="opacity-40">•</span>
                    <span>{new Date(sess.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-black italic uppercase">&ldquo;{sess.topicPrompt.topic}&rdquo;</h3>
                  <p className="text-xs text-gray-700 font-bold mt-0.5">{sess.topicPrompt.challenge}</p>
                </div>

                {/* Audio player if recorded */}
                {sess.audioRecordingUrl && (
                  <div className="bg-gray-100 border-2 border-black p-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#FF4F00] shrink-0" />
                    <audio controls src={sess.audioRecordingUrl} className="w-full h-7 text-xs" />
                  </div>
                )}

                {/* Skills tags */}
                {sess.skillsPracticed && sess.skillsPracticed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sess.skillsPracticed.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-black text-white px-2 py-0.5 font-black uppercase tracking-widest">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}

                {sess.userNotes && (
                  <p className="text-xs text-gray-800 font-extrabold italic bg-gray-100 p-2.5 border-2 border-black">
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
