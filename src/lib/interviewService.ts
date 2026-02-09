import { supabase } from "@/lib/supabase";
import { authService } from "@/lib/authService";

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- */

export type InterviewStatus = "in-progress" | "completed" | "aborted";

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
  status: InterviewStatus;
  cvText?: string;
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

/* ----------------------------------------------------
   SERVICE
---------------------------------------------------- */

export const interviewService = {
  /* --------------------------------------------------
     CREATE INTERVIEW
  -------------------------------------------------- */
  async createInterview(data: {
    jobTitle: string;
    jobDescription: string;
    avatarType: "easy" | "medium" | "hard";
    language: "en" | "ar" | "fr" | "es";
    cvText?: string;
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
        cv_text: data.cvText ?? null,
        status: "in-progress",
        date: new Date().toISOString(),
        duration: 0,
        score: 0,
      })
      .select()
      .single();

    if (error || !created) {
      throw error ?? new Error("INTERVIEW_CREATION_FAILED");
    }

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
      cvText: created.cv_text ?? undefined,
    };

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

  /* --------------------------------------------------
     ADD INTERVIEW TURN
  -------------------------------------------------- */
  async addTurn(
    interviewId: string,
    role: TurnRole,
    text: string
  ): Promise<void> {
    const user = await authService.getCurrentUser();

    const { error } = await supabase.from("interview_turns").insert({
      interview_id: interviewId,
      user_id: user.id,
      role,
      text,
    });

    if (error) throw error;
  },

  /* --------------------------------------------------
     GET TURNS FOR INTERVIEW
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     COMPLETE INTERVIEW (SAFE)
  -------------------------------------------------- */
  async completeInterview(
    interviewId: string,
    duration: number
  ): Promise<InterviewReport> {
    const user = await authService.getCurrentUser();

    // 1️⃣ Fetch interview + ownership check
    const { data: interview, error } = await supabase
      .from("interviews")
      .select("status, user_id")
      .eq("id", interviewId)
      .single();

    if (error || !interview) {
      throw new Error("INTERVIEW_NOT_FOUND");
    }

    if (interview.user_id !== user.id) {
      throw new Error("UNAUTHORIZED");
    }

    if (interview.status === "completed") {
      throw new Error("INTERVIEW_ALREADY_COMPLETED");
    }

    // 2️⃣ Generate mock report (replace later with AI)
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

    // 3️⃣ Update interview
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        duration,
        score: report.overallScore,
      })
      .eq("id", interviewId);

    if (updateError) throw updateError;

    // 4️⃣ Insert report
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

    // 5️⃣ Decrement free interview count
    await authService.decrementFreeInterview();

    return report;
  },

  /* --------------------------------------------------
     GET INTERVIEWS BY USER
  -------------------------------------------------- */
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
      cvText: i.cv_text ?? undefined,
    }));
  },

  /* --------------------------------------------------
     GET REPORTS BY USER
  -------------------------------------------------- */
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

  /* --------------------------------------------------
     GET INTERVIEW BY ID
  -------------------------------------------------- */
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
      cvText: data.cv_text ?? undefined,
    };
  },
};
