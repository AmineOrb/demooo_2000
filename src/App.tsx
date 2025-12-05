import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

// --- Import All Your Pages ---
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import InterviewSetup from '@/pages/InterviewSetup';
import InterviewRoom from '@/pages/InterviewRoom';
import Dashboard from '@/pages/Dashboard';
import Pricing from '@/pages/Pricing';
import VerifyEmail from '@/pages/VerifyEmail';
import EmailVerificationPending from '@/pages/EmailVerificationPending';
import NotFound from '@/pages/NotFound';
import { ThemeToggle } from "@/components/ThemeToggle";


// --- Navbar Component ---
const Navbar = () => {
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
      <Button variant="ghost" onClick={() => navigate("/auth")}>
        Sign In
      </Button>
      <Button
        onClick={() => navigate("/auth")}
        className="bg-gradient-to-r from-blue-600 to-purple-600"
      >
        Get Started
      </Button>
    </div>
  </div>
</header>

  );
};

// --- Layout Component ---
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // List of paths where we HIDE the navbar
  const hideNavbarPaths = [
    '/auth',
    '/verify-email',
    '/email-pending',
    '/room',
    '/setup',
    '/dashboard',
    '/pricing',
  ];

  // Check if current route starts with any of the above
  const shouldHideNavbar = hideNavbarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  return (
    <Layout>
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
    </Layout>
  );
};

export default App;
