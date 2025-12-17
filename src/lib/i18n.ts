// src/lib/i18n.ts
export type Lang = "en" | "fr" | "es" | "ar";

export const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
  { code: "ar", label: "AR" },
];

// Minimal translations for the Navbar right now.
// We'll add more strings later in Index/Dashboard/Setup.
export const t = {
  en: {
    signIn: "Sign In",
    getStarted: "Get Started",
  },
  fr: {
    signIn: "Se connecter",
    getStarted: "Commencer",
  },
  es: {
    signIn: "Iniciar sesión",
    getStarted: "Empezar",
  },
  ar: {
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
  },
} as const;
