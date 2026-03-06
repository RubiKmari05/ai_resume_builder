import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return NextResponse.json(
                { error: 'GROQ_API_KEY environment variable is missing.' },
                { status: 500 }
            );
        }

        const groq = new Groq({ apiKey: groqApiKey });
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

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an AI resume writer that outputs exact JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama3-8b-8192', // Or another appropriate model like 'mixtral-8x7b-32768'
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const output = chatCompletion.choices[0]?.message?.content || '{}';
        const parsedResume = JSON.parse(output);

        return NextResponse.json({ success: true, resume: parsedResume });
    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
