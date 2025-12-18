import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Video,
  Plus,
  Clock,
  TrendingUp,
  LogOut,
  Crown,
  Calendar,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { authService, type UserProfile } from "@/lib/authService";
import { interviewService, type Interview } from "@/lib/interviewService";

import { ThemeToggle } from "@/components/ThemeToggle";


export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);


  

  // Load current user + interviews (Supabase)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const profile = await authService.getCurrentUser();
        if (cancelled) return;

        setUser(profile);

        const allInterviews = await interviewService.getInterviewsByUser(
          profile.id
        );
        if (cancelled) return;

        setInterviews(
          allInterviews.sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          toast({
            title: "Not logged in",
            description: "Please sign in again.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleStartInterview = () => {
    const subscription = user?.subscription ?? "free";
    const remaining = user?.interviewsRemaining ?? 0;

    if (subscription === "free" && remaining <= 0) {
      toast({
        title: "No interviews remaining",
        description: "Upgrade to Premium for unlimited interviews",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    navigate("/setup");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getDifficultyColor = (type: string) => {
    const colors = {
      easy: "bg-green-100 text-green-700",
      medium: "bg-blue-100 text-blue-700",
      hard: "bg-red-100 text-red-700",
    };
    return colors[type as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) return null;

  const subscription = user.subscription;
  const interviewsRemaining = user.interviewsRemaining;
  const userName = user.name || "User";
  const streak = user.streak ?? 0;



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
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>
          </div>

        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-2">Ready to Practice?</h2>
                <p className="text-blue-100 mb-6">
                  Start a new interview session and improve your skills with AI-powered feedback
                </p>
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Interview
                </Button>
              </CardContent>
            </Card>

            {/* Previous Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Your Interview History</CardTitle>
                <CardDescription>
                  Review your past performance and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No interviews yet</p>
                    <Button onClick={handleStartInterview}>
                      Start Your First Interview
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <Card
                        key={interview.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {interview.jobTitle}
                                </h3>
                                <Badge
                                  className={getDifficultyColor(interview.avatarType)}
                                >
                                  {interview.avatarType}
                                </Badge>
                                <Badge variant="outline">
                                  {interview.language.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(interview.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDuration(interview.duration)}
                                </span>
                              </div>
                            </div>

                            {interview.status === "completed" && (
                              <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">
                                  {interview.score}%
                                </div>
                                <p className="text-xs text-gray-500">
                                  Overall Score
                                </p>
                              </div>
                            )}
                          </div>

                          {interview.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4 w-full"
                              onClick={async () => {
                                try {
                                  const reports =
                                    await interviewService.getReportsByUser(user.id);
                                  const report = reports.find(
                                    (r) => r.interviewId === interview.id
                                  );

                                  if (!report) {
                                    toast({
                                      title: "No report found",
                                      description: "This interview has no report yet.",
                                    });
                                    return;
                                  }

                                  toast({
                                    title: `Your Score: ${report.overallScore}%`,
                                    description: `Communication: ${report.communication}% | Confidence: ${report.confidence}% | Technical: ${report.technical}%`,
                                  });
                                } catch (err) {
                                  console.error(err);
                                  toast({
                                    title: "Error",
                                    description: "Failed to load report",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Detailed Report
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {subscription === "premium" && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                  {subscription === "premium" ? "Premium Plan" : "Free Plan"}
                </CardTitle>
                <CardDescription>
                  {subscription === "premium"
                    ? "Unlimited interviews and full AI reports"
                    : "Limited to 2 interviews"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscription === "free" ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Interviews Remaining</span>
                        <span className="font-semibold">
                          {interviewsRemaining} / 2
                        </span>
                      </div>
                      <Progress
                        value={(interviewsRemaining / 2) * 100}
                        className="h-2"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate("/pricing")}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Crown className="w-5 h-5" />
                      <span className="font-semibold">
                        Unlimited Interviews
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You have full access to all features including unlimited interviews and detailed AI reports.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    Total Interviews
                  </span>
                  <span className="font-semibold">{interviews.length}</span>
                </div>

                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    Average Score
                  </span>
                  <span className="font-semibold">
                    {interviews.length > 0
                      ? Math.round(
                          interviews.reduce((sum, i) => sum + i.score, 0) /
                            interviews.length
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold">
                    {interviews.filter((i) => i.status === "completed").length}
                  </span>
                </div> 



                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold">
                    {streak} {streak === 1 ? "" : "🔥"} 🔥
                  </span>
                </div>

    

                





              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                 💡 Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Practice regularly to build confidence</p>
                <p>• Review your reports after each session</p>
                <p>• Try different difficulty levels</p>
                <p>• Focus on your weak areas</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
