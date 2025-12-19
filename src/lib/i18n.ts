// src/lib/i18n.ts
export type Lang = "en" | "fr" | "es" | "ar";

export const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
  { code: "ar", label: "AR" },
];

export const t = {
  en: {
    signIn: "Sign In",
    getStarted: "Get Started",

    // Interview Setup
    backToDashboard: "← Back to Dashboard",
    setupTitle: "Setup Your Interview",
    setupSubtitle: "Customize your interview experience",
  },
  fr: {
    signIn: "Se connecter",
    getStarted: "Commencer",

    backToDashboard: "← Retour au tableau de bord",
    setupTitle: "Configurer votre entretien",
    setupSubtitle: "Personnalisez votre expérience d’entretien",
  },
  es: {
    signIn: "Iniciar sesión",
    getStarted: "Empezar",

    backToDashboard: "← Volver al panel",
    setupTitle: "Configura tu entrevista",
    setupSubtitle: "Personaliza tu experiencia de entrevista",
  },
  ar: {
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",

    backToDashboard: "← الرجوع إلى لوحة التحكم",
    setupTitle: "إعداد المقابلة",
    setupSubtitle: "خصّص تجربة المقابلة الخاصة بك",
  },
} as const;
