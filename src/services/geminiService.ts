import { TopicPrompt, Category, Difficulty, PracticeMode, ContentIdea } from '../types';

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
      console.error('Failed to generate topic via API, using fallback:', error);
      // Client-side quick fallback if server fetch completely fails
      const thinkTimeSeconds = params.difficulty === 'basic' ? 15 : params.difficulty === 'intermediate' ? 120 : 600;
      const speakTimeSeconds = params.difficulty === 'basic' ? 60 : params.difficulty === 'intermediate' ? 180 : 300;
      const activeCat = params.category === 'Custom' && params.customNiche ? params.customNiche : params.category;

      return {
        id: `fallback-client-${Date.now()}`,
        type: 'question',
        topic: `${activeCat} Perspective`,
        challenge: `Share your top insight or a personal story about ${activeCat}. What is something most people overlook?`,
        difficulty: params.difficulty,
        category: activeCat,
        practiceMode: params.practiceMode,
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
      return [
        {
          id: `idea-${Date.now()}-1`,
          headline: `The biggest misconception about ${niche || 'your industry'}`,
          hook: `Everyone gets this wrong when they first start learning about ${niche || 'this field'}.`,
          angles: ['Common belief', 'Why it fails', 'Practical advice'],
          suggestedMode: 'hottake',
        },
        {
          id: `idea-${Date.now()}-2`,
          headline: `How I explain ${niche || 'my field'} to non-technical people`,
          hook: `If you want people to respect your knowledge, stop using confusing buzzwords.`,
          angles: ['Simple analogy', 'Core benefit', 'Real-world example'],
          suggestedMode: 'explain',
        },
      ];
    }
  },
};
