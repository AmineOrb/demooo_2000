import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AvatarViewer from "@/components/AvatarViewer";

import { interviewService } from "@/lib/interviewService";
import { Video, VideoOff, Mic, MicOff, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AvatarType = "easy" | "medium" | "hard";
type LanguageType = "en" | "ar";

// -----------------------------------------------------
// QUESTIONS (UNCHANGED)
// -----------------------------------------------------
const getInterviewQuestions = (
  avatarType: AvatarType,
  language: LanguageType
): string[] => {
  const questions = {
    easy: {
      en: [
        "Tell me about yourself.",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "Where do you see yourself in 5 years?",
      ],
      ar: [
        "أخبرني عن نفسك.",
        "لماذا أنت مهتم بهذا المنصب؟",
        "ما هي أعظم نقاط قوتك؟",
        "أين ترى نفسك بعد 5 سنوات؟",
      ],
    },
    medium: {
      en: [
        "Describe a challenging project you worked on.",
        "How do you handle conflict in a team?",
        "What is your approach to problem-solving?",
        "Tell me about a time you failed and what you learned.",
        "How do you prioritize tasks when everything is urgent?",
      ],
      ar: [
        "صف مشروعًا صعبًا عملت عليه.",
        "كيف تتعامل مع الصراع في الفريق؟",
        "ما هو نهجك في حل المشكلات؟",
        "أخبرني عن وقت فشلت فيه وماذا تعلمت.",
        "كيف تحدد أولويات المهام عندما يكون كل شيء عاجلاً؟",
      ],
    },
    hard: {
      en: [
        "Walk me through a complex technical decision you made.",
        "How would you design a system to handle millions of users?",
        "Describe a situation where you had to influence without authority.",
        "What would you do if you disagreed with your manager on a critical decision?",
        "How do you stay current with industry trends and technologies?",
        "Tell me about a time when you had to make a decision with incomplete information.",
      ],
      ar: [
        "اشرح لي قرارًا تقنيًا معقدًا اتخذته.",
        "كيف ستصمم نظامًا للتعامل مع ملايين المستخدمين؟",
        "صف موقفًا كان عليك فيه التأثير بدون سلطة.",
        "ماذا ستفعل إذا اختلفت مع مديرك في قرار حاسم؟",
        "كيف تبقى على اطلاع دائم باتجاهات الصناعة والتقنيات؟",
        "أخبرني عن وقت كان عليك فيه اتخاذ قرار بمعلومات غير كاملة.",
      ],
    },
  };

  return questions[avatarType][language];
};

// -----------------------------------------------------
// DURATION MAP (UNCHANGED)
// -----------------------------------------------------
const getAvatarDuration = (avatarType: AvatarType): number => {
  const durations: Record<AvatarType, number> = {
    easy: 5 * 60,
    medium: 10 * 60,
    hard: 15 * 60,
  };
  return durations[avatarType];
};

export default function InterviewRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [interview, setInterview] = useState<any | null>(null);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);

  // 🔥 CHAT + TRANSCRIPT
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string }[]
  >([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // -----------------------------------------------------
  // LOAD INTERVIEW
  // -----------------------------------------------------
  useEffect(() => {
    if (!roomId) return;

    (async () => {
      const found = await interviewService.getInterviewById(roomId);

      if (!found) {
        toast({ title: "Interview not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setInterview(found);
    })();
  }, [roomId, navigate, toast]);

  // -----------------------------------------------------
  // INIT INTERVIEW
  // -----------------------------------------------------
  useEffect(() => {
    if (!interview) return;

    const qs = getInterviewQuestions(interview.avatarType, interview.language);
    setQuestions(qs);
    setTimeRemaining(getAvatarDuration(interview.avatarType));

    setMessages([{ role: "ai", text: qs[0] }]);

    startCamera();
    startListening();
    startQuestion();

    return () => {
      stopListening();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [interview]);

  // -----------------------------------------------------
  // TIMER
  // -----------------------------------------------------
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // -----------------------------------------------------
  // CAMERA
  // -----------------------------------------------------
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      toast({
        title: "Camera blocked",
        description: "Please allow camera access.",
        variant: "destructive",
      });
    }
  };

  // -----------------------------------------------------
  // SPEECH TO TEXT (FREE)
  // -----------------------------------------------------
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLiveTranscript("Live transcript not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = interview.language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setLiveTranscript(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  // -----------------------------------------------------
  // QUESTION FLOW
  // -----------------------------------------------------
  const startQuestion = () => {
    setIsAvatarSpeaking(true);
    setTimeout(() => setIsAvatarSpeaking(false), 3000);
  };

  const handleFinishAnswer = () => {
    stopListening();

    if (liveTranscript.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: liveTranscript },
      ]);
    }

    setLiveTranscript("");

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      const nextQ = questions[nextIndex];
      setMessages((prev) => [...prev, { role: "ai", text: nextQ }]);

      startListening();
      startQuestion();
    } else {
      handleEndInterview();
    }
  };

  // -----------------------------------------------------
  // END
  // -----------------------------------------------------
  const handleEndInterview = async () => {
    if (!interview) return;

    await interviewService.completeInterview(
      interview.id,
      getAvatarDuration(interview.avatarType) - timeRemaining
    );

    toast({
      title: "Interview Complete 🎉",
      description: "Your AI performance report is ready.",
    });

    navigate("/dashboard");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!interview) return null;

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white">
              {interview.language.toUpperCase()}
            </Badge>
            <Badge className="bg-blue-600">{interview.avatarType}</Badge>
            <span className="text-sm text-gray-400">
              {interview.jobTitle}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-mono font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>

            <Button variant="destructive" size="sm" onClick={handleEndInterview}>
              <X className="w-4 h-4 mr-2" />
              End
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="container mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-gray-400">{Math.round(progress)}% Done</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* VIDEO GRID */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* USER CAMERA */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 backdrop-blur">You</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI AVATAR */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <AvatarViewer
                  avatarType={interview.avatarType}
                  isActive={isAvatarSpeaking}
                />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 backdrop-blur">
                    AI Interviewer
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHAT (REPLACES CURRENT QUESTION) */}
        <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
          <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  m.role === "ai"
                    ? "bg-white/20 text-white self-start"
                    : "bg-blue-600 text-white self-end ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}

            {/* LIVE TRANSCRIPT */}
            {liveTranscript && (
              <div className="max-w-[80%] p-3 rounded-lg text-sm bg-blue-500 text-white self-end ml-auto opacity-80">
                {liveTranscript}
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleFinishAnswer}
                className="bg-white text-blue-900 hover:bg-blue-50 w-full"
              >
                I’ve finished answering
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CONTROLS */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            size="lg"
            variant={isVideoOn ? "secondary" : "destructive"}
            onClick={() => {
              if (stream) {
                const track = stream.getVideoTracks()[0];
                track.enabled = !track.enabled;
                setIsVideoOn(track.enabled);
              }
            }}
            className="w-16 h-16 rounded-full"
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            variant={isAudioOn ? "secondary" : "destructive"}
            onClick={() => {
              if (stream) {
                const track = stream.getAudioTracks()[0];
                track.enabled = !track.enabled;
                setIsAudioOn(track.enabled);
              }
            }}
            className="w-16 h-16 rounded-full"
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
