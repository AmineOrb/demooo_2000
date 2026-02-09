// src/lib/aiInterviewer.ts

import { supabase } from "./supabase";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function askAIInterviewer(messages: Message[]) {
  const { data, error } = await supabase.functions.invoke("ai-interviewer", {
    body: { messages },
  });

  if (error) {
    console.error("AI interviewer error:", error);
    throw new Error("AI interviewer failed");
  }

  // ✅ SAFELY extract the AI message
  const reply =
    data?.choices?.[0]?.message?.content ??
    data?.reply ??
    null;

  if (!reply) {
    console.error("Unexpected AI response shape:", data);
    throw new Error("AI response was empty");
  }

  return reply as string;
}
