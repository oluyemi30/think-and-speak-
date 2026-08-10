export type Category =
  | 'General'
  | 'Technology'
  | 'Programming'
  | 'AI'
  | 'Web3'
  | 'Finance'
  | 'Business'
  | 'Entrepreneurship'
  | 'Marketing'
  | 'Content Creation'
  | 'Storytelling'
  | 'Personal Development'
  | 'Relationships'
  | 'Society'
  | 'Education'
  | 'Science'
  | 'Christian'
  | 'Custom';

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export type PracticeMode =
  | 'speak'
  | 'explain'
  | 'debate'
  | 'hottake'
  | 'story'
  | 'solve'
  | 'content'
  | 'teach'
  | 'devils_advocate';

export interface TopicPrompt {
  id: string;
  type: 'word' | 'question' | 'scenario' | 'debate' | 'problem';
  topic: string;
  challenge: string;
  context?: string;
  angles?: string[];
  difficulty: Difficulty;
  category: string;
  practiceMode: PracticeMode;
  thinkTimeSeconds: number;
  speakTimeSeconds: number;
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  topicPrompt: TopicPrompt;
  thinkDurationSeconds: number;
  speakDurationSeconds: number;
  actualSpeakDurationSeconds?: number;
  confidenceRating: number; // 1 to 5
  difficultyRating: 'easy' | 'medium' | 'hard';
  wouldSpeakAgain: boolean;
  skillsPracticed: string[];
  userNotes?: string;
  audioRecordingUrl?: string;
}

export interface ContentIdea {
  id: string;
  headline: string;
  hook: string;
  angles: string[];
  suggestedMode: PracticeMode;
}

export interface UserStats {
  sessionsCompleted: number;
  topicsPracticed: number;
  totalSpeakSeconds: number;
  totalThinkSeconds: number;
  streakDays: number;
  lastSessionDate: string; // YYYY-MM-DD
  averageConfidence: number;
  categoryCounts: Record<string, number>;
}

export interface GroupPlayer {
  id: string;
  name: string;
  isHost: boolean;
  hasFinished: boolean;
  votes: Record<string, number>; // e.g. { bestArgument: 2, bestDelivery: 1 }
}

export interface GroupRoom {
  code: string;
  topic?: TopicPrompt;
  players: GroupPlayer[];
  status: 'lobby' | 'thinking' | 'speaking' | 'voting' | 'finished';
}
