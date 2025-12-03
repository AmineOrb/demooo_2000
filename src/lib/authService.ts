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
}

export const authService = {
  // Sign up with email + password
  async signUp(email: string, password: string, name: string): Promise<UserProfile> {
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
    });

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      name,
      email,
      subscription: "free",
      interviewsRemaining: 2,
      emailVerified: !!data.user.email_confirmed_at,
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

  // Get current user profile (or throw if not logged in)
  async getCurrentUser(): Promise<UserProfile> {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw new Error("Not authenticated");

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) throw error ?? new Error("Profile not found");

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      subscription: profile.subscription,
      interviewsRemaining: profile.interviews_remaining,
      emailVerified: !!user.email_confirmed_at,
    };
  },

  // 📧 NEW: resend verification email
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
};
