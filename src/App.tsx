// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import InterviewSetup from "@/pages/InterviewSetup";
import InterviewRoom from "@/pages/InterviewRoom";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import VerifyEmail from "@/pages/VerifyEmail";
import EmailVerificationPending from "@/pages/EmailVerificationPending";
import NotFound from "@/pages/NotFound";

import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LanguageProvider } from "@/context/LanguageContext";

import { t, type Lang } from "@/lib/i18n";

// --- Navbar Component ---
const Navbar = ({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Video className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Interview Simulator
          </h1>
        </div>

        {/* RIGHT SIDE OF HEADER */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle value={lang} onChange={setLang} />
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            {t[lang].signIn}
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {t[lang].getStarted}
          </Button>
        </div>
      </div>
    </header>
  );
};

// --- Layout Component ---
const Layout = ({
  children,
  lang,
  setLang,
}: {
  children: React.ReactNode;
  lang: Lang;
  setLang: (l: Lang) => void;
}) => {
  const location = useLocation();

  const hideNavbarPaths = [
    "/auth",
    "/verify-email",
    "/email-pending",
    "/room",
    "/setup",
    "/dashboard",
    "/pricing",
  ];

  const shouldHideNavbar = hideNavbarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar lang={lang} setLang={setLang} />}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [lang, setLang] = useState<Lang>("en");

  // load language once
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "fr" || stored === "es" || stored === "ar") {
      setLang(stored);
    }
  }, []);

  // apply lang + RTL on change
  useEffect(() => {
    localStorage.setItem("lang", lang);

    // Arabic is RTL
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Provide lang to pages later (we'll do Index/Dashboard next)
  const routes = useMemo(
    () => (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-pending" element={<EmailVerificationPending />} />

        {/* Authenticated/Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setup/:jobId?" element={<InterviewSetup />} />
        <Route path="/room/:roomId" element={<InterviewRoom />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    ),
    []
  );

  return (
  <LanguageProvider lang={lang} setLang={setLang}>
    <Layout lang={lang} setLang={setLang}>
      {routes}
    </Layout>
  </LanguageProvider>
);

};

export default App;



