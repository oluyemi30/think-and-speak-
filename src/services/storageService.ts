import { SessionRecord, UserStats } from '../types';

const STORAGE_KEY_SESSIONS = 'think_speak_sessions_v1';
const STORAGE_KEY_STATS = 'think_speak_stats_v1';

export const storageService = {
  getSessions(): SessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
      return [];
    }
  },

  saveSession(session: SessionRecord): SessionRecord[] {
    const sessions = this.getSessions();
    const updated = [session, ...sessions];
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      this.updateStatsWithSession(session);
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
    return updated;
  },

  getStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }

    // Default initial stats
    return {
      sessionsCompleted: 0,
      topicsPracticed: 0,
      totalSpeakSeconds: 0,
      totalThinkSeconds: 0,
      streakDays: 0,
      lastSessionDate: '',
      averageConfidence: 0,
      categoryCounts: {},
    };
  },

  updateStatsWithSession(session: SessionRecord): UserStats {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];

    // Calculate streak
    let streak = stats.streakDays;
    if (stats.lastSessionDate) {
      const lastDate = new Date(stats.lastSessionDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1; // Reset streak if missed days
      }
    } else {
      streak = 1;
    }

    const sessionsCount = stats.sessionsCompleted + 1;
    const newTotalSpeak = stats.totalSpeakSeconds + (session.actualSpeakDurationSeconds || session.speakDurationSeconds);
    const newTotalThink = stats.totalThinkSeconds + session.thinkDurationSeconds;

    // Recalculate average confidence
    const prevSumConfidence = stats.averageConfidence * stats.sessionsCompleted;
    const newAvgConfidence = Number(((prevSumConfidence + session.confidenceRating) / sessionsCount).toFixed(1));

    // Category count
    const cat = session.topicPrompt.category || 'General';
    const categoryCounts = {
      ...stats.categoryCounts,
      [cat]: (stats.categoryCounts[cat] || 0) + 1,
    };

    const newStats: UserStats = {
      sessionsCompleted: sessionsCount,
      topicsPracticed: sessionsCount,
      totalSpeakSeconds: newTotalSpeak,
      totalThinkSeconds: newTotalThink,
      streakDays: streak,
      lastSessionDate: today,
      averageConfidence: newAvgConfidence,
      categoryCounts,
    };

    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }

    return newStats;
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      localStorage.removeItem(STORAGE_KEY_STATS);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
