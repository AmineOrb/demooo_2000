import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { authService, type UserProfile } from "@/lib/authService";
import { interviewService } from "@/lib/interviewService";
import { getCapabilities } from "@/lib/planRules";

import { Upload, Video, ArrowRight, User, Briefcase, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Only one useLanguage call
  const { lang, setLang } = useLanguage();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [realisticMode, setRealisticMode] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const [formData, setFormData] = useState({
    cvFile: null as File | null,
    jobTitle: "",
    jobDescription: "",
    avatarType: "medium" as "easy" | "medium" | "hard",
    language: "en" as "en" | "ar" | "fr" | "es",
  });

  // Load logged-in user from Supabase
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const u = await authService.getCurrentUser();
        if (cancelled) return;

        if (!u) {
          navigate("/auth");
          return;
        }

        setUser(u);
      } catch {
        navigate("/auth");
      } finally {
        if (!cancelled) setCheckingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cvFile: e.target.files[0] });
    }
  };

  const handleToggleRealisticMode = (checked: boolean) => {
    if (!user) return;

    if (user.subscription !== "premium") {
      setShowPremiumDialog(true);
      return;
    }

    setRealisticMode(checked);
  };

  const handleStartInterview = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!formData.jobTitle || !formData.jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (user.subscription === "free" && user.interviewsRemaining <= 0) {
      toast({
        title: "No interviews remaining",
        description: "Upgrade to Premium for unlimited interviews.",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    try {
      const interview = await interviewService.createInterview({
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        avatarType: formData.avatarType,
        language: formData.language,




       realisticMode,
      });

      toast({
        title: "Interview Created",
        description: "Starting your interview session...",
      });

      navigate(`/room/${interview.id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create interview. Try again.",
        variant: "destructive",
      });
    }
  };

  const avatarOptions = [
    {
      type: "easy" as const,
      title: "Easy Level",
      description: "Young Professional",
      duration: "5 minutes",
      color: "border-green-300 hover:border-green-500",
      icon: "👨‍💼",
    },
    {
      type: "medium" as const,
      title: "Medium Level",
      description: "Experienced Manager",
      duration: "10 minutes",
      color: "border-blue-300 hover:border-blue-500",
      icon: "👩‍💼",
    },
    {
      type: "hard" as const,
      title: "Hard Level",
      description: "Senior Executive",
      duration: "15 minutes",
      color: "border-red-300 hover:border-red-500",
      icon: "👨‍💼",
    },
  ];

  if (checkingUser) return null;
  if (!user) return null;

  const capabilities = getCapabilities(user.subscription);
  console.log("Plan capabilities:", capabilities);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600 dark:text-primary-foreground" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Simulator
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageToggle value={lang} onChange={setLang} />
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              {t[lang].backToDashboard}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{t[lang].setupTitle}</h2>
          <p className="text-muted-foreground">{t[lang].setupSubtitle}</p>
        </div>

        <div className="space-y-6">
          {/* CV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your CV (Optional)
              </CardTitle>
              <CardDescription>
                Upload your resume to help tailor the interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-border rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  {formData.cvFile ? (
                    <p className="text-sm font-medium text-blue-600">
                      {formData.cvFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-1 text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, or DOCX (Max 10MB)
                      </p>
                    </>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </CardTitle>
              <CardDescription>
                Tell us about the position you're interviewing for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description or key requirements..."
                  rows={6}
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Choose Your Interviewer
              </CardTitle>
              <CardDescription>
                Select the difficulty level and interviewer type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.avatarType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    avatarType: value as "easy" | "medium" | "hard",
                  })
                }
                className="grid md:grid-cols-3 gap-4"
              >
                {avatarOptions.map((option) => (
                  <div key={option.type}>
                    <RadioGroupItem
                      value={option.type}
                      id={option.type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.type}
                      className={`flex flex-col items-center justify-between rounded-lg border-2 ${option.color} bg-white dark:bg-card p-6 hover:bg-gray-50 dark:hover:bg-gray-800 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900 cursor-pointer transition-all`}
                    >
                      <div className="text-5xl mb-3">{option.icon}</div>
                      <div className="text-center">
                        <p className="font-semibold mb-1">{option.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {option.duration}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Language Selection (Free includes all 4 now) */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Language</CardTitle>
              <CardDescription>
                Choose your preferred language for the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    language: value as "en" | "ar" | "fr" | "es",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="ar">🇸🇦 Arabic (العربية)</SelectItem>
                  <SelectItem value="fr">🇫🇷 French (Français)</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish (Español)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Interview Mode (Premium gated) */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Mode</CardTitle>
              <CardDescription>
                Choose how close the interview feels to a real one.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">Realistic mode</p>
                <p className="text-sm text-muted-foreground">
                  Stronger follow-up pressure, stricter evaluation, and more realistic pacing.
                </p>

                {user.subscription !== "premium" && (
                  <p className="text-sm text-blue-600 mt-2">Premium feature</p>
                )}
              </div>

              <Switch
                checked={realisticMode}
                onCheckedChange={handleToggleRealisticMode}
              />
            </CardContent>
          </Card>

          {/* Start Button */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">Ready to Start?</h3>
                  <p className="text-blue-100 text-sm">
                    Your interview will begin once you click the button
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Start Interview
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium Feature Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium Feature</DialogTitle>
            <DialogDescription>
              Realistic mode is available on Premium. Upgrade to unlock a more realistic interview
              experience with stronger follow-ups and deeper scoring.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPremiumDialog(false)}
            >
              Not now
            </Button>
            <Button onClick={() => navigate("/pricing")}>Upgrade to Premium</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

//
