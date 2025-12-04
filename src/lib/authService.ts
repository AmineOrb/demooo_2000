// src/lib/authService.ts
import { supabase } from "@/lib/supabase";

export type SubscriptionType = "free" | "premium";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscription: SubscriptionType;
  interviewsRemaining: number;
  emailVerified: boolean;
  streak: number;
  lastPracticeDate: string | null; // "YYYY-MM-DD" or null
}

export const authService = {
  // Sign up with email + password
  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned");

    // create profile row
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      name,
      email,
      subscription: "free",
      interviews_remaining: 2,
      streak: 0,
      last_practice_date: null,
    });

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      name,
      email,
      subscription: "free",
      interviewsRemaining: 2,
      emailVerified: !!data.user.email_confirmed_at,
      streak: 0,
      lastPracticeDate: null,
    };
  },

  // Sign in with email + password
  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned");

    // If you want to *enforce* email verification, keep this
    if (!data.user.email_confirmed_at) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return await this.getCurrentUser();
  },

  // Google sign-in
  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) throw error;
  },

  // Sign out
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Get current user profile (or create it if missing)
  async getCurrentUser(): Promise<UserProfile> {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw new Error("Not authenticated");

    // 1) Try to load existing profile
    let { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2) If no profile yet, create one (this happens for Google users)
    if (error || !profile) {
      const defaultProfile = {
        id: user.id,
        name:
          (user.user_metadata as any)?.name ||
          (user.user_metadata as any)?.full_name ||
          (user.email?.split("@")[0] ?? "User"),
        email: user.email as string,
        subscription: "free",
        interviews_remaining: 2,
        streak: 0,
        last_practice_date: null,
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(defaultProfile);

      if (insertError) {
        console.error("Failed to create profile", insertError);
        throw insertError;
      }

      // refetch the profile to be sure
      const { data: newProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError || !newProfile) {
        throw fetchError ?? new Error("Profile not found after creation");
      }

      profile = newProfile;
    }

    // 3) Return in the format the rest of the app expects
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      subscription: profile.subscription,
      interviewsRemaining: profile.interviews_remaining,
      emailVerified: !!sessionData.session?.user?.email_confirmed_at,
      streak: profile.streak ?? 0,
      lastPracticeDate: profile.last_practice_date ?? null,
    };
  },

  // 📧 resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) throw error;
  },

  // Update subscription (free / premium)
  async updateSubscription(subscription: SubscriptionType) {
    const profile = await this.getCurrentUser();

    const { error } = await supabase
      .from("users")
      .update({
        subscription,
        interviews_remaining: subscription === "premium" ? 999 : 2,
      })
      .eq("id", profile.id);

    if (error) throw error;
  },

  // Decrement remaining interviews for free users after a completed interview
  async decrementFreeInterview() {
    const profile = await this.getCurrentUser();
    if (profile.subscription !== "free") return;
    if (profile.interviewsRemaining <= 0) return;

    const { error } = await supabase
      .from("users")
      .update({ interviews_remaining: profile.interviewsRemaining - 1 })
      .eq("id", profile.id);

    if (error) throw error;
  },

  // 🔥 NEW: update streak after a completed interview
  async updateStreakAfterInterview(userId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // 1) Get current streak + last_practice_date
    const { data, error } = await supabase
      .from("users")
      .select("streak, last_practice_date")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Failed to load streak data", error);
      return;
    }

    const last = data.last_practice_date as string | null;
    let newStreak = 1;

    if (last === today) {
      // Already practiced today → streak stays the same
      newStreak = data.streak ?? 1;
    } else if (last) {
      // Check if last practice was yesterday
      const lastDate = new Date(last);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        lastDate.getFullYear() === yesterday.getFullYear() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getDate() === yesterday.getDate();

      if (isYesterday) {
        newStreak = (data.streak ?? 0) + 1;
      } else {
        newStreak = 1; // streak reset
      }
    } else {
      // No last date → first ever practice
      newStreak = 1;
    }

    // 2) Update in DB
    const { error: updateError } = await supabase
      .from("users")
      .update({
        streak: newStreak,
        last_practice_date: today,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update streak", updateError);
    }
  },
};
