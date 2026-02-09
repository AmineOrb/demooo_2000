// supabase/functions/ai-interviewer/index.ts

import OpenAI from "openai";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY")!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional job interviewer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
    });

    return new Response(
      JSON.stringify({
        reply: completion.choices[0].message.content,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "AI error", details: String(error) }),
      { status: 500 }
    );
  }
}
//
