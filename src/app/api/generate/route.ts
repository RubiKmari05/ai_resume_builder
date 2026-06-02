import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const defaultKey = "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";
    let apiKey = openrouterKey || defaultKey;
    let model = "google/gemini-2.5-flash";

    if (openaiKey && openaiKey.startsWith("sk-proj-")) {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiKey = openaiKey;
      model = "gpt-4o-mini";
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing.' },
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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { "role": "system", "content": "You are an AI resume writer that outputs exact JSON." },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const jsonResp = await response.json();
    const output = jsonResp.choices[0]?.message?.content || '{}';
    const parsedResume = JSON.parse(output);

    return NextResponse.json({ success: true, resume: parsedResume });
  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
