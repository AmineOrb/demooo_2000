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

async function ensureProfile(userId: string, name: string, email: string) {
  // Check if profile exists
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  // If profile exists → return it
  if (data) return data;

  // Create profile if missing
  const { data: newProfile, error: insertError } = await supabase
    .from("users")
    .insert({
      id: userId,
      name,
      email,
      subscription: "free",
      interviews_remaining: 2,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newProfile;
}

export const authService = {
  // -----------------------------
  // Email + Password Sign Up
  // -----------------------------
  async signUp(email: string, password: string, name: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from signUp");

    // Create profile
    const profile = await ensureProfile(data.user.id, name, email);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      subscription: profile.subscription,
      interviewsRemaining: profile.interviews_remaining,
      emailVerified: !!data.user.email_confirmed_at,
    };
  },

  // -----------------------------
  // Email + Password Sign In
  // -----------------------------
  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (!data.user) throw new Error("No user returned");

    // Block until email verified
    if (!data.user.email_confirmed_at) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return await this.getCurrentUser();
  },

  // -----------------------------
  // Google OAuth Login
  // -----------------------------
  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) throw error;
  },

  // -----------------------------
  // Logout
  // -----------------------------
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // -----------------------------
  // Get Current User + Profile
  // -----------------------------
  async getCurrentUser(): Promise<UserProfile> {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) throw new Error("Not authenticated");

    // Ensure profile exists (handles Google first-time login)
    const profile = await ensureProfile(
      user.id,
      user.user_metadata?.name || "",
      user.email || ""
    );

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      subscription: profile.subscription,
      interviewsRemaining: profile.interviews_remaining,
      emailVerified: !!user.email_confirmed_at,
    };
  },

  // -----------------------------
  // Subscription upgrade
  // -----------------------------
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

  // -----------------------------
  // Use one free interview
  // -----------------------------
  async decrementFreeInterview() {
    const profile = await this.getCurrentUser();

    if (profile.subscription !== "free") return;
    if (profile.interviewsRemaining <= 0) return;

    const { error } = await supabase
      .from("users")
      .update({
        interviews_remaining: profile.interviewsRemaining - 1,
      })
      .eq("id", profile.id);

    if (error) throw error;
  },
};
