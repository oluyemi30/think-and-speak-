import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import { FALLBACK_TOPICS, FALLBACK_CONTENT_IDEAS } from './src/data/fallbackTopics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safely clean and parse JSON responses from Gemini
function safeParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned.trim()) as T;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily/safely
  const getGeminiAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: Generate Topic
  app.post('/api/generate-topic', async (req, res) => {
    const { category, customNiche, difficulty, practiceMode, previousTopics } = req.body;

    const ai = getGeminiAI();

    if (!ai) {
      console.log('No GEMINI_API_KEY found, using intelligent fallback topic');
      const fallback = getRandomFallbackTopic(category, customNiche, difficulty, practiceMode);
      return res.json(fallback);
    }

    try {
      const activeCategory = category === 'Custom' && customNiche ? customNiche : category;
      const promptText = `
You are an expert public speaking coach, content creation mentor, and spontaneous thinking trainer for the THINK & SPEAK platform.

Generate a unique, engaging practice prompt for a user training their speaking and thinking skills.

User Preferences:
- Category / Niche: ${activeCategory}
- Practice Difficulty: ${difficulty} (basic = fast spontaneous thinking; intermediate = structured reasoning; advanced = deep multi-angle analysis)
- Practice Mode: ${practiceMode} (e.g. speak, explain, debate, hottake, story, solve, content, teach, devils_advocate)
${previousTopics?.length ? `- Avoid repeating these recent topics: ${previousTopics.join(', ')}` : ''}

Rules:
1. Do NOT always generate a question. Sometimes generate a single powerful word/concept (e.g. "Freedom" or "Technical Debt"), sometimes a scenario, sometimes a direct prompt.
2. Ensure the prompt strictly matches the selected difficulty:
   - Basic: 15s think time. Accessible, spontaneous.
   - Intermediate: 2m think time. Requires structure, argument, or story flow.
   - Advanced: 10m think time. Deep debate or multi-faceted problem with several angles.
3. The prompt must feel empowering, thought-provoking, and practical.
4. Avoid generic "Define X" or "Explain X". Make it feel like a real speech, debate, or video recording challenge.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: 'One of: word, question, scenario, debate, problem',
              },
              topic: {
                type: Type.STRING,
                description: 'Short headline or topic name',
              },
              challenge: {
                type: Type.STRING,
                description: 'Clear, actionable challenge statement for the speaker',
              },
              context: {
                type: Type.STRING,
                description: 'Optional situational context or scenario setting',
              },
              angles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key angles or points to consider (especially for intermediate/advanced)',
              },
              difficulty: {
                type: Type.STRING,
                description: 'basic, intermediate, or advanced',
              },
            },
            required: ['type', 'topic', 'challenge', 'difficulty'],
          },
        },
      });

      if (response.text) {
        try {
          const parsed = safeParseJSON<any>(response.text);
          const thinkTimeSeconds = difficulty === 'basic' ? 15 : difficulty === 'intermediate' ? 120 : 600;
          const speakTimeSeconds = difficulty === 'basic' ? 60 : difficulty === 'intermediate' ? 180 : 300;

          return res.json({
            id: `gen-${Date.now()}`,
            type: parsed.type || 'question',
            topic: parsed.topic || `${activeCategory} Practice Topic`,
            challenge: parsed.challenge || `Speak spontaneously about ${activeCategory}.`,
            context: parsed.context || '',
            angles: parsed.angles || [],
            difficulty: parsed.difficulty || difficulty,
            category: activeCategory,
            practiceMode: practiceMode || 'speak',
            thinkTimeSeconds,
            speakTimeSeconds,
          });
        } catch (parseErr) {
          console.warn('Failed to parse topic response from Gemini, using fallback:', parseErr);
          const fallback = getRandomFallbackTopic(category, customNiche, difficulty, practiceMode);
          return res.json(fallback);
        }
      }

      throw new Error('Empty response from Gemini');
    } catch (err) {
      console.error('Error in topic endpoint:', err);
      const fallback = getRandomFallbackTopic(category, customNiche, difficulty, practiceMode);
      return res.json(fallback);
    }
  });

  // API Route: Generate Content Ideas for Creators
  app.post('/api/generate-content-ideas', async (req, res) => {
    const { niche } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      console.log('No GEMINI_API_KEY found, returning fallback content ideas');
      const fallback = getFallbackContentIdeas(niche);
      return res.json(fallback);
    }

    try {
      const promptText = `
You are a top social media content strategist for creators, developers, entrepreneurs, and thinkers.

Generate 5 high-converting, highly engaging content ideas for someone in the niche: "${niche || 'General Productivity'}".

Each content idea must break the "curse of knowledge" by turning existing industry knowledge into an engaging spoken video concept, hot take, breakdown, or storytelling script.

Return JSON array of 5 objects with:
- headline: Catchy title
- hook: The opening line that grabs attention
- angles: Array of 3-4 key bullet points to cover
- suggestedMode: One of (speak, explain, debate, hottake, story, solve, content, teach, devils_advocate)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                hook: { type: Type.STRING },
                angles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedMode: { type: Type.STRING },
              },
              required: ['headline', 'hook', 'angles', 'suggestedMode'],
            },
          },
        },
      });

      if (response.text) {
        try {
          const parsed = safeParseJSON<any[]>(response.text);
          const formatted = parsed.map((item: any, idx: number) => ({
            id: `idea-${Date.now()}-${idx}`,
            headline: item.headline,
            hook: item.hook,
            angles: item.angles || [],
            suggestedMode: item.suggestedMode || 'content',
          }));
          return res.json(formatted);
        } catch (parseErr) {
          console.warn('Failed to parse content ideas response from Gemini, using fallback:', parseErr);
          const fallback = getFallbackContentIdeas(niche);
          return res.json(fallback);
        }
      }

      throw new Error('Empty response from Gemini');
    } catch (err) {
      console.error('Error generating content ideas:', err);
      const fallback = getFallbackContentIdeas(niche);
      return res.json(fallback);
    }
  });

  // Helper Fallback Selectors
  function getRandomFallbackTopic(
    category: string,
    customNiche: string,
    difficulty: string,
    practiceMode: string
  ) {
    const thinkTimeSeconds = difficulty === 'basic' ? 15 : difficulty === 'intermediate' ? 120 : 600;
    const speakTimeSeconds = difficulty === 'basic' ? 60 : difficulty === 'intermediate' ? 180 : 300;
    const activeCategory = category === 'Custom' && customNiche ? customNiche : category;

    // Filter fallback list if matching difficulty
    const matched = FALLBACK_TOPICS.filter((t) => t.difficulty === difficulty);
    const selected = matched.length > 0 ? matched[Math.floor(Math.random() * matched.length)] : FALLBACK_TOPICS[0];

    return {
      ...selected,
      id: `fallback-${Date.now()}`,
      category: activeCategory,
      practiceMode: practiceMode || selected.practiceMode,
      thinkTimeSeconds,
      speakTimeSeconds,
    };
  }

  function getFallbackContentIdeas(niche?: string) {
    const key = (niche || '').toLowerCase().trim();
    if (FALLBACK_CONTENT_IDEAS[key]) {
      return FALLBACK_CONTENT_IDEAS[key];
    }
    return FALLBACK_CONTENT_IDEAS.default;
  }

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
