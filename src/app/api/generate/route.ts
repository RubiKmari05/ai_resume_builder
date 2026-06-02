import { NextResponse } from 'next/server';

interface ProviderConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  model: string;
}

export async function POST(request: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    // Build provider priority list: Groq → OpenAI → OpenRouter
    const providers: ProviderConfig[] = [];

    if (groqKey && groqKey.startsWith("gsk_")) {
      providers.push({
        name: "Groq",
        apiUrl: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model: "llama-3.3-70b-versatile",
      });
    }

    if (openaiKey && openaiKey.startsWith("sk-proj-")) {
      providers.push({
        name: "OpenAI",
        apiUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: openaiKey,
        model: "gpt-4o-mini",
      });
    }

    if (openrouterKey) {
      providers.push({
        name: "OpenRouter",
        apiUrl: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: openrouterKey,
        model: "google/gemini-2.5-flash",
      });
    }

    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'No API keys configured. Please set GROQ_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const userInputs = await request.json();

    const prompt = `
You are an expert resume writer and ATS optimizer. Take the following rough notes about a user and generate a polished, highly professional resume in JSON format.

ROUGH NOTES:
Name: ${userInputs.fullName || 'Not provided'}
Job Title: ${userInputs.jobTitle || 'Not provided'}
Email: ${userInputs.email || 'Not provided'}
Phone: ${userInputs.phone || 'Not provided'}
Location: ${userInputs.location || 'Not provided'}
Summary: ${userInputs.summary || 'Not provided'}
Experience: ${userInputs.experience || 'Not provided'}
Education: ${userInputs.education || 'Not provided'}
Skills: ${userInputs.skills || 'Not provided'}
Projects: ${userInputs.projects || 'Not provided'}

REQUIREMENTS:
1. Improve the phrasing to be highly professional and action-oriented.
2. For Experience and Projects, generate strong bullet points (3-4 points each) focusing on impact and metrics if possible.
3. If information is missing but implied, leave it blank (do not make up false facts).
4. Strictly return your response as a valid JSON object matching the exact schema below, DO NOT wrap it in Markdown or return extra text.

JSON SCHEMA:
{
  "fullName": "...",
  "jobTitle": "...",
  "email": "...",
  "phone": "...",
  "location": "...",
  "summary": "...",
  "experience": [
    {
      "company": "...",
      "role": "...",
      "dates": "...",
      "bulletPoints": ["...", "..."]
    }
  ],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "dates": "..."
    }
  ],
  "skills": ["...", "..."],
  "projects": [
    {
      "name": "...",
      "description": "...",
      "bulletPoints": ["...", "..."]
    }
  ]
}
`;

    // Try each provider in order until one succeeds
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name}...`);

        const response = await fetch(provider.apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: "You are an AI resume writer that outputs exact JSON." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`${provider.name} API error (${response.status}): ${errorBody}`);
        }

        const jsonResp = await response.json();
        const output = jsonResp.choices[0]?.message?.content || '{}';
        const parsedResume = JSON.parse(output);

        console.log(`✅ Resume generated successfully via ${provider.name}`);
        return NextResponse.json({ success: true, resume: parsedResume });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`${provider.name} failed:`, lastError.message);
      }
    }

    // All providers failed
    throw lastError || new Error('All API providers failed');
  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

