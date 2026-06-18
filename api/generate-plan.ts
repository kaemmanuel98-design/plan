import { buildAiPrompt, generateSmartPlanMap, getCascadePathsForInput, type VisionPlanInput } from './planShared';

export const config = {
  maxDuration: 60,
};

interface VercelRequest {
  method?: string;
  body?: VisionPlanInput | string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const input = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as VisionPlanInput;
  if (!input?.title?.trim()) {
    return res.status(400).json({ error: 'Missing vision title' });
  }

  const paths = getCascadePathsForInput(input);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      plans: generateSmartPlanMap(input),
      source: 'smart',
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: "Tu génères des plans d'objectifs en français. JSON uniquement.",
          },
          { role: 'user', content: buildAiPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      return res.status(200).json({ plans: generateSmartPlanMap(input), source: 'smart' });
    }

    const completion = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content) as {
      plans?: Record<string, { title: string; description: string; startTime?: string; endTime?: string }>;
    };
    const plans = parsed.plans ?? {};
    const fallback = generateSmartPlanMap(input);

    for (const path of paths) {
      if (!plans[path.path]?.title?.trim()) {
        plans[path.path] = fallback[path.path];
      }
    }

    return res.status(200).json({ plans, source: 'ai' });
  } catch (err) {
    console.error('generate-plan error:', err);
    return res.status(200).json({ plans: generateSmartPlanMap(input), source: 'smart' });
  }
}
