import { supabase } from "@/lib/supabase";
import { authService } from "@/lib/authService";

export interface Interview {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  avatarType: "easy" | "medium" | "hard";
  language: "en" | "ar" | "fr" | "es";
  date: string;
  duration: number;
  score: number;
  status: "completed" | "in-progress";
}

export interface InterviewReport {
  interviewId: string;
  overallScore: number;
  communication: number;
  confidence: number;
  technical: number;
  structure: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export type TurnRole = "ai" | "user";

export interface InterviewTurn {
  id: string;
  interviewId: string;
  userId: string;
  role: TurnRole;
  text: string;
  createdAt: string;
}

export const interviewService = {
  // ----------------------------------------------------
  // CREATE INTERVIEW
  // ----------------------------------------------------
  async createInterview(data: {
    jobTitle: string;
    jobDescription: string;
    avatarType: "easy" | "medium" | "hard";
    language: "en" | "ar" | "fr" | "es";
  }): Promise<Interview> {
    const user = await authService.getCurrentUser();

    if (user.subscription === "free" && user.interviewsRemaining <= 0) {
      throw new Error("OUT_OF_INTERVIEWS");
    }

    const { data: created, error } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        job_title: data.jobTitle,
        job_description: data.jobDescription,
        avatar_type: data.avatarType,
        language: data.language,
        status: "in-progress",
        date: new Date().toISOString(),
        duration: 0,
        score: 0,
      })
      .select()
      .single();

    if (error || !created) throw error ?? new Error("Interview not created");

    const interview: Interview = {
      id: created.id,
      userId: created.user_id,
      jobTitle: created.job_title,
      jobDescription: created.job_description,
      avatarType: created.avatar_type,
      language: created.language,
      date: created.date,
      duration: created.duration,
      score: created.score,
      status: created.status,
    };

    // ✅ Store first AI turn (placeholder for now; later replaced by AI generation)
    const firstQuestion =
      data.language === "ar"
        ? "أخبرني عن نفسك."
        : data.language === "fr"
        ? "Parlez-moi de vous."
        : data.language === "es"
        ? "Háblame de ti."
        : "Tell me about yourself.";

    await this.addTurn(interview.id, "ai", firstQuestion);

    return interview;
  },

  // ----------------------------------------------------
  // TURNS: ADD ONE TURN
  // ----------------------------------------------------
  async addTurn(interviewId: string, role: TurnRole, text: string): Promise<void> {
    const user = await authService.getCurrentUser();

    const { error } = await supabase.from("interview_turns").insert({
      interview_id: interviewId,
      user_id: user.id,
      role,
      text,
    });

    if (error) throw error;
  },

  // ----------------------------------------------------
  // TURNS: GET ALL TURNS FOR AN INTERVIEW
  // ----------------------------------------------------
  async getTurnsByInterview(interviewId: string): Promise<InterviewTurn[]> {
    const { data, error } = await supabase
      .from("interview_turns")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((t: any) => ({
      id: t.id,
      interviewId: t.interview_id,
      userId: t.user_id,
      role: t.role as TurnRole,
      text: t.text,
      createdAt: t.created_at,
    }));
  },

  // ----------------------------------------------------
  // COMPLETE INTERVIEW + GENERATE REPORT (mock for now)
  // ----------------------------------------------------
  async completeInterview(interviewId: string, duration: number): Promise<InterviewReport> {
    const user = await authService.getCurrentUser();

    const report: InterviewReport = {
      interviewId,
      overallScore: Math.floor(Math.random() * 30 + 65),
      communication: Math.floor(Math.random() * 30 + 65),
      confidence: Math.floor(Math.random() * 30 + 65),
      technical: Math.floor(Math.random() * 30 + 65),
      structure: Math.floor(Math.random() * 30 + 65),
      strengths: ["Clear communication", "Good role understanding"],
      weaknesses: ["Need more examples", "Some answers too short"],
      suggestions: ["Use STAR method", "Prepare technical examples"],
    };

    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        duration,
        score: report.overallScore,
      })
      .eq("id", interviewId);

    if (updateError) throw updateError;

    const { error: reportError } = await supabase.from("reports").insert({
      interview_id: interviewId,
      user_id: user.id,
      overall_score: report.overallScore,
      communication: report.communication,
      confidence: report.confidence,
      technical: report.technical,
      structure: report.structure,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      suggestions: report.suggestions,
    });

    if (reportError) throw reportError;

    await authService.decrementFreeInterview();
    return report;
  },

  // ----------------------------------------------------
  // GET ALL INTERVIEWS FOR USER
  // ----------------------------------------------------
  async getInterviewsByUser(uid: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((i: any) => ({
      id: i.id,
      userId: i.user_id,
      jobTitle: i.job_title,
      jobDescription: i.job_description,
      avatarType: i.avatar_type,
      language: i.language,
      date: i.date,
      duration: i.duration,
      score: i.score,
      status: i.status,
    }));
  },

  // ----------------------------------------------------
  // GET REPORTS BY USER
  // ----------------------------------------------------
  async getReportsByUser(uid: string): Promise<InterviewReport[]> {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", uid);

    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      interviewId: r.interview_id,
      overallScore: r.overall_score,
      communication: r.communication,
      confidence: r.confidence,
      technical: r.technical,
      structure: r.structure,
      strengths: r.strengths ?? [],
      weaknesses: r.weaknesses ?? [],
      suggestions: r.suggestions ?? [],
    }));
  },

  // ----------------------------------------------------
  // GET INTERVIEW BY ID
  // ----------------------------------------------------
  async getInterviewById(id: string): Promise<Interview | null> {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      jobTitle: data.job_title,
      jobDescription: data.job_description,
      avatarType: data.avatar_type,
      language: data.language,
      date: data.date,
      duration: data.duration,
      score: data.score,
      status: data.status,
    };
  },
};
