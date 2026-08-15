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

// Helper to safely clean and parse JSON responses from AI models
function safeParseJSON<T>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned.trim()) as T;
  } catch {
    // Attempt regex match for first valid JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error(`Failed to extract JSON from model output: ${cleaned.substring(0, 120)}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for OpenRouter API Key retrieval
  const getOpenRouterKey = () => {
    return process.env.OPENROUTER_API_KEY || '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';
  };

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

  // Helper for OpenRouter API integration with multi-model fallback
  const callOpenRouter = async (promptText: string) => {
    const apiKey = getOpenRouterKey();
    if (!apiKey) return null;

    const candidateModels = [
      'google/gemini-2.0-flash-001',
      'google/gemini-2.5-flash',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.3-70b-instruct',
    ];

    for (const model of candidateModels) {
      try {
        console.log(`Calling OpenRouter with model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://off-the-cuff.app',
            'X-Title': 'Off The Cuff Spontaneous Speaking Gym',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert public speaking coach, debate judge, and spontaneous thinking trainer. Return strict, valid raw JSON only with no markdown wrapping or conversational commentary.',
              },
              {
                role: 'user',
                content: promptText,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            console.log(`OpenRouter model ${model} succeeded!`);
            return content;
          }
        } else {
          const errText = await response.text();
          console.warn(`OpenRouter model ${model} failed (status ${response.status}):`, errText);
        }
      } catch (err) {
        console.warn(`OpenRouter fetch error with model ${model}:`, err);
      }
    }

    return null;
  };

  // API Route: AI Provider Status
  app.get('/api/ai-provider', (_req, res) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasOpenRouter = Boolean(getOpenRouterKey());
    res.json({
      hasGemini,
      hasOpenRouter,
      activeProvider: hasGemini ? 'Gemini AI' : hasOpenRouter ? 'OpenRouter AI (Active)' : 'Smart Offline Generator',
    });
  });

  // API Route: Generate Topic
  app.post('/api/generate-topic', async (req, res) => {
    const { category, customNiche, difficulty, practiceMode, previousTopics } = req.body;
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

Return JSON with structure:
{
  "type": "word|question|scenario|debate|problem",
  "topic": "Short headline or topic name",
  "challenge": "Clear actionable challenge statement for the speaker",
  "context": "Optional situational context",
  "angles": ["Point 1", "Point 2", "Point 3"],
  "difficulty": "${difficulty}"
}
`;

    let rawResponseText: string | null = null;

    // 1. Try Gemini first if available
    const ai = getGeminiAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                topic: { type: Type.STRING },
                challenge: { type: Type.STRING },
                context: { type: Type.STRING },
                angles: { type: Type.ARRAY, items: { type: Type.STRING } },
                difficulty: { type: Type.STRING },
              },
              required: ['type', 'topic', 'challenge', 'difficulty'],
            },
          },
        });
        rawResponseText = response.text || null;
      } catch (geminiErr) {
        console.warn('Gemini API call failed, trying OpenRouter fallback...', geminiErr);
      }
    }

    // 2. Try OpenRouter if Gemini wasn't available or failed
    if (!rawResponseText) {
      console.log('Generating topic via OpenRouter API...');
      rawResponseText = await callOpenRouter(promptText);
    }

    // 3. Process raw response if available
    if (rawResponseText) {
      try {
        const parsed = safeParseJSON<any>(rawResponseText);
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
        console.warn('Failed to parse topic response, using fallback generator:', parseErr);
      }
    }

    // 4. Offline Fallback
    console.log('Using intelligent fallback topic generator');
    const fallback = getRandomFallbackTopic(category, customNiche, difficulty, practiceMode);
    return res.json(fallback);
  });

  // API Route: Generate Content Ideas for Creators
  app.post('/api/generate-content-ideas', async (req, res) => {
    const { niche } = req.body;
    const promptText = `
You are a top social media content strategist for creators, developers, entrepreneurs, and thinkers.

Generate 5 high-converting, highly engaging content ideas for someone in the niche: "${niche || 'General Productivity'}".

Each content idea must break the "curse of knowledge" by turning existing industry knowledge into an engaging spoken video concept, hot take, breakdown, or storytelling script.

Return a JSON object containing an array "ideas" or direct JSON array of 5 objects with:
- headline: Catchy title
- hook: The opening line that grabs attention
- angles: Array of 3-4 key bullet points to cover
- suggestedMode: One of (speak, explain, debate, hottake, story, solve, content, teach, devils_advocate)
`;

    let rawResponseText: string | null = null;

    // 1. Try Gemini
    const ai = getGeminiAI();
    if (ai) {
      try {
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
        rawResponseText = response.text || null;
      } catch (geminiErr) {
        console.warn('Gemini API failed for content ideas, trying OpenRouter fallback...', geminiErr);
      }
    }

    // 2. Try OpenRouter
    if (!rawResponseText) {
      console.log('Generating content ideas via OpenRouter API...');
      rawResponseText = await callOpenRouter(promptText);
    }

    // 3. Parse response
    if (rawResponseText) {
      try {
        const parsed = safeParseJSON<any>(rawResponseText);
        const list = Array.isArray(parsed) ? parsed : parsed.ideas || parsed.contentIdeas || [];
        if (list.length > 0) {
          const formatted = list.map((item: any, idx: number) => ({
            id: `idea-${Date.now()}-${idx}`,
            headline: item.headline,
            hook: item.hook,
            angles: item.angles || [],
            suggestedMode: item.suggestedMode || 'content',
          }));
          return res.json(formatted);
        }
      } catch (parseErr) {
        console.warn('Failed to parse content ideas AI response, using fallback:', parseErr);
      }
    }

    // 4. Fallback
    const fallback = getFallbackContentIdeas(niche);
    return res.json(fallback);
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

    // Filter by matching category first
    let pool = FALLBACK_TOPICS.filter(
      (t) => t.category.toLowerCase() === activeCategory.toLowerCase() && t.difficulty === difficulty
    );
    if (pool.length === 0) {
      pool = FALLBACK_TOPICS.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (pool.length === 0) {
      pool = FALLBACK_TOPICS.filter((t) => t.difficulty === difficulty);
    }
    if (pool.length === 0) {
      pool = FALLBACK_TOPICS;
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];

    return {
      ...selected,
      id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
