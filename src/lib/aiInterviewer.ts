import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateNextQuestion(params: {
  jobTitle: string;
  jobDescription: string;
  difficulty: "easy" | "medium" | "hard";
  language: "en" | "ar" | "fr" | "es";
  previousTurns: { role: "ai" | "user"; text: string }[];
}) {
  const systemPrompt = `
You are a professional job interviewer.
Ask ONE clear interview question at a time.
Adjust difficulty: ${params.difficulty}.
Language: ${params.language}.
Do not explain.
Do not give feedback.
Only ask the next question.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...params.previousTurns.map((t) => ({
      role: t.role === "ai" ? "assistant" : "user",
      content: t.text,
    })),
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 120,
  });

  return response.choices[0].message.content?.trim();
}
