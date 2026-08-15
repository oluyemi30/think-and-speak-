import { TopicPrompt, Category, Difficulty, PracticeMode, ContentIdea } from '../types';
import { FALLBACK_TOPICS, FALLBACK_CONTENT_IDEAS } from '../data/fallbackTopics';

export const geminiService = {
  async generateTopic(params: {
    category: Category;
    customNiche?: string;
    difficulty: Difficulty;
    practiceMode: PracticeMode;
    previousTopics?: string[];
  }): Promise<TopicPrompt> {
    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate topic via API, using rich local fallback:', error);
      const thinkTimeSeconds = params.difficulty === 'basic' ? 15 : params.difficulty === 'intermediate' ? 120 : 600;
      const speakTimeSeconds = params.difficulty === 'basic' ? 60 : params.difficulty === 'intermediate' ? 180 : 300;
      const activeCat = params.category === 'Custom' && params.customNiche ? params.customNiche : params.category;

      // Find matching fallback topic from pool
      let pool = FALLBACK_TOPICS.filter(
        (t) => t.category.toLowerCase() === activeCat.toLowerCase() && t.difficulty === params.difficulty
      );
      if (pool.length === 0) {
        pool = FALLBACK_TOPICS.filter((t) => t.category.toLowerCase() === activeCat.toLowerCase());
      }
      if (pool.length === 0) {
        pool = FALLBACK_TOPICS.filter((t) => t.difficulty === params.difficulty);
      }
      if (pool.length === 0) {
        pool = FALLBACK_TOPICS;
      }

      const selected = pool[Math.floor(Math.random() * pool.length)];

      return {
        ...selected,
        id: `fallback-client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: activeCat,
        practiceMode: params.practiceMode || selected.practiceMode,
        thinkTimeSeconds,
        speakTimeSeconds,
      };
    }
  },

  async generateContentIdeas(niche: string): Promise<ContentIdea[]> {
    try {
      const response = await fetch('/api/generate-content-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate content ideas:', error);
      const key = (niche || '').toLowerCase().trim();
      if (FALLBACK_CONTENT_IDEAS[key]) {
        return FALLBACK_CONTENT_IDEAS[key];
      }
      return FALLBACK_CONTENT_IDEAS.default;
    }
  },
};

