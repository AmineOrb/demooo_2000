// supabase/functions/next-question/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Plan = "free" | "premium";
type Lang = "en" | "ar" | "fr" | "es";
type Avatar = "easy" | "medium" | "hard";
type Turn = { role: "ai" | "user"; text: string };

function languageName(lang: Lang) {
  switch (lang) {
    case "ar":
      return "Arabic";
    case "fr":
      return "French";
    case "es":
      return "Spanish";
    default:
      return "English";
  }
}

function buildPrompt(params: {
  jobTitle: string;
  jobDescription: string;
  avatarType: Avatar;
  language: Lang;
  turns: Turn[];
  // free plan rule
  plan: Plan;
  followUpsUsed: number;
  followUpsLimit: number;
}) {
  const {
    jobTitle,
    jobDescription,
    avatarType,
    language,
    turns,
    plan,
    followUpsUsed,
    followUpsLimit,
  } = params;

  const difficulty =
    avatarType === "easy"
      ? "Junior / friendly"
      : avatarType === "medium"
      ? "Mid-level / professional"
      : "Senior / challenging";

  const langName = languageName(language);

  const transcript = turns
    .slice(-10)
    .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`)
    .join("\n");

  // Free plan rule: only allow 2 follow-up questions total.
  // Definition: a follow-up is a question that references the user's last answer or asks to clarify/expand.
  // Once free plan uses the limit, the assistant must move on to a NEW main question topic.
  const followUpRule =
    plan === "free"
      ? `Free plan rule: You may ask a follow-up ONLY if followUpsUsed < followUpsLimit (currently ${followUpsUsed}/${followUpsLimit}). If followUpsUsed >= followUpsLimit, you MUST ask a NEW main interview question (not a follow-up).`
      : `Premium plan: You may ask follow-ups as needed.`;

  return `
You are a realistic job interviewer conducting a structured interview.

Role: ${jobTitle}
Difficulty: ${difficulty}
Language: ${langName}

Job Description:
${jobDescription}

Recent transcript:
${transcript}

${followUpRule}

Task:
Ask ONE single next interview question.
- Output MUST be only the question text (no quotes, no bullets, no explanations).
- Must be in ${langName}.
- Must feel natural and realistic.
- If last answer is weak/short and follow-ups are allowed, ask one probing follow-up.
- If follow-ups are NOT allowed, move to a new topic/question relevant to the job.
`.trim();
}

async function callOpenAI(prompt: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 120,
      messages: [
        { role: "system", content: "You are a professional interviewer." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("No question returned");
  return text;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();

    const jobTitle = body.jobTitle as string;
    const jobDescription = body.jobDescription as string;
    const avatarType = body.avatarType as Avatar;
    const language = body.language as Lang;
    const turns = (body.turns ?? []) as Turn[];

    // Pass plan info from client (temporary).
    // Later we will verify from DB server-side.
    const plan = (body.plan ?? "free") as Plan;

    // Server rule: Free = 2 follow-ups total
    const followUpsLimit = 2;

    // We count follow-ups used based on AI questions stored so far that look like follow-ups.
    // Simple heuristic for now: if an AI question contains "you said" / "you mentioned" / "can you elaborate"
    // OR ends with "?" after a short user answer..
    // We'll improve later, but this is enough to enforce the "2 follow-ups" experience.
    const aiQuestions = turns.filter((t) => t.role === "ai").map((t) => t.text.toLowerCase());
    const followUpsUsed = aiQuestions.filter((q) =>
      q.includes("you said") ||
      q.includes("you mentioned") ||
      q.includes("elaborate") ||
      q.includes("clarify") ||
      q.includes("can you explain") ||
      q.includes("pourquoi") || // small multilingual hints (not perfect)
      q.includes("pouvez-vous") ||
      q.includes("¿puedes") ||
      q.includes("¿podrías") ||
      q.includes("لماذا") ||
      q.includes("هل يمكنك")
    ).length;

    if (!jobTitle || !jobDescription || !avatarType || !language) {
      return new Response("Missing required fields", { status: 400 });
    }

    const prompt = buildPrompt({
      jobTitle,
      jobDescription,
      avatarType,
      language,
      turns,
      plan,
      followUpsUsed,
      followUpsLimit,
    });

    const question = await callOpenAI(prompt);

    return new Response(JSON.stringify({ question }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(`Server error: ${String(e)}`, { status: 500 });
  }
});
