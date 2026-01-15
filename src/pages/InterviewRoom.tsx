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
type LanguageType = "en" | "ar" | "fr" | "es";

type ChatMsg = { role: "ai" | "user"; text: string };

// -----------------------------------------------------
// LOCAL QUESTION GENERATOR (NOW WITH FR/ES)
// (later replaced by AI; for now it keeps your app working)
// -----------------------------------------------------
const getInterviewQuestions = (
  avatarType: AvatarType,
  language: LanguageType
): string[] => {
  const questions: Record<AvatarType, Record<LanguageType, string[]>> = {
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
      fr: [
        "Parlez-moi de vous.",
        "Pourquoi êtes-vous intéressé par ce poste ?",
        "Quelles sont vos plus grandes forces ?",
        "Où vous voyez-vous dans 5 ans ?",
      ],
      es: [
        "Háblame de ti.",
        "¿Por qué te interesa este puesto?",
        "¿Cuáles son tus mayores fortalezas?",
        "¿Dónde te ves en 5 años?",
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
      fr: [
        "Décrivez un projet difficile sur lequel vous avez travaillé.",
        "Comment gérez-vous un conflit dans une équipe ?",
        "Quelle est votre approche de résolution de problèmes ?",
        "Parlez-moi d’un échec et de ce que vous en avez appris.",
        "Comment priorisez-vous quand tout est urgent ?",
      ],
      es: [
        "Describe un proyecto difícil en el que trabajaste.",
        "¿Cómo manejas un conflicto en un equipo?",
        "¿Cuál es tu enfoque para resolver problemas?",
        "Cuéntame de un fracaso y lo que aprendiste.",
        "¿Cómo priorizas cuando todo es urgente?",
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
      fr: [
        "Expliquez une décision technique complexe que vous avez prise.",
        "Comment concevriez-vous un système pour des millions d’utilisateurs ?",
        "Décrivez une situation où vous avez influencé sans autorité.",
        "Que faites-vous si vous n’êtes pas d’accord avec votre manager sur une décision critique ?",
        "Comment restez-vous à jour sur les tendances et technologies ?",
        "Parlez-moi d’une décision prise avec des informations incomplètes.",
      ],
      es: [
        "Explica una decisión técnica compleja que tomaste.",
        "¿Cómo diseñarías un sistema para millones de usuarios?",
        "Describe una situación donde influiste sin autoridad.",
        "¿Qué harías si no estás de acuerdo con tu manager en una decisión crítica?",
        "¿Cómo te mantienes al día con tendencias y tecnologías?",
        "Cuéntame de una decisión con información incompleta.",
      ],
    },
  };

  return questions[avatarType][language];
};

// -----------------------------------------------------
// LOCAL DURATION MAP (UNCHANGED)
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

  // Chat + STT
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------------------------------
  // LOAD INTERVIEW FROM SUPABASE BY ID
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
  // INIT INTERVIEW AFTER LOADING
  // -----------------------------------------------------
  useEffect(() => {
    if (!interview || !roomId) return;

    const qs = getInterviewQuestions(interview.avatarType, interview.language);
    setQuestions(qs);

    const duration = getAvatarDuration(interview.avatarType);
    setTimeRemaining(duration);

    startCamera();

    // Load stored turns (Yoodli-like memory)
    (async () => {
      try {
        const turns = await interviewService.getTurnsByInterview(roomId);
        if (turns.length > 0) {
          setMessages(
            turns.map((t) => ({
              role: t.role,
              text: t.text,
            }))
          );
          // try to infer current question index by counting ai turns
          const aiTurns = turns.filter((t) => t.role === "ai").length;
          setCurrentQuestionIndex(Math.max(0, aiTurns - 1));
        } else {
          // If no turns exist (shouldn't happen because createInterview adds first AI turn)
          setMessages([{ role: "ai", text: qs[0] }]);
        }
      } catch (e) {
        // fallback to local
        setMessages([{ role: "ai", text: qs[0] }]);
      }
    })();

    setTimeout(() => startQuestion(), 1500);
    startListening(interview.language);

    return () => {
      stopListening();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [interview, roomId]); // eslint-disable-line

  // auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTranscript]);

  // -----------------------------------------------------
  // COUNTDOWN TIMER
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      toast({
        title: "Camera blocked",
        description: "Please allow camera access.",
        variant: "destructive",
      });
    }
  };

  const startQuestion = () => {
    setIsAvatarSpeaking(true);
    const speakDuration = Math.random() * 2000 + 3000;
    setTimeout(() => setIsAvatarSpeaking(false), speakDuration);
  };

  // -----------------------------------------------------
  // FREE STT (Web Speech API) - simple live transcript
  // -----------------------------------------------------
  const startListening = (lang: LanguageType) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLiveTranscript("Live transcript not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang; // "en" | "ar" | "fr" | "es"
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setLiveTranscript(text);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      // ignore repeated start errors
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  // -----------------------------------------------------
  // USER FINISHED ANSWERING (one control for now)
  // Saves user turn + advances to next AI question
  // -----------------------------------------------------
  const handleFinishAnswer = async () => {
    if (!roomId) return;

    stopListening();

    const answer = liveTranscript.trim();
    setLiveTranscript("");

    if (answer) {
      // save to DB
      try {
        await interviewService.addTurn(roomId, "user", answer);
      } catch (e) {
        console.error(e);
      }

      // update UI
      setMessages((prev) => [...prev, { role: "user", text: answer }]);
    }

    // Next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];

      try {
        await interviewService.addTurn(roomId, "ai", nextQ);
      } catch (e) {
        console.error(e);
      }

      setMessages((prev) => [...prev, { role: "ai", text: nextQ }]);
      setCurrentQuestionIndex(nextIndex);

      startQuestion();
      startListening(interview.language);
    } else {
      handleEndInterview();
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      track.enabled = !track.enabled;
      setIsVideoOn(track.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const track = stream.getAudioTracks()[0];
      track.enabled = !track.enabled;
      setIsAudioOn(track.enabled);
    }
  };

  // -----------------------------------------------------
  // FINISH INTERVIEW
  // -----------------------------------------------------
  const handleEndInterview = async () => {
    if (!interview) return;

    try {
      const totalDuration = getAvatarDuration(interview.avatarType);
      const actualDuration = totalDuration - timeRemaining;

      await interviewService.completeInterview(interview.id, actualDuration);

      toast({
        title: "Interview Complete 🎉",
        description: "Your AI performance report is ready.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to complete interview.",
        variant: "destructive",
      });
    }
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
              {String(interview.language).toUpperCase()}
            </Badge>
            <Badge className="bg-blue-600">{interview.avatarType}</Badge>
            <span className="text-sm text-gray-400">{interview.jobTitle}</span>
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

                {isAvatarSpeaking && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 animate-pulse">Speaking…</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHAT (replaces current question card content style) */}
        <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
          <CardContent className="p-6">
            <h3 className="text-sm text-blue-300 mb-4">Interview Chat</h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "ai" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "ai"
                        ? "bg-white/15 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {liveTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-blue-500/70 text-white">
                    {liveTranscript}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-300">
                {isAvatarSpeaking
                  ? "AI is asking..."
                  : "Speak your answer. Then click when finished."}
              </p>

              <Button
                onClick={handleFinishAnswer}
                disabled={isAvatarSpeaking}
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                I’ve finished answering
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            size="lg"
            variant={isVideoOn ? "secondary" : "destructive"}
            onClick={toggleVideo}
            className="w-16 h-16 rounded-full"
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            variant={isAudioOn ? "secondary" : "destructive"}
            onClick={toggleAudio}
            className="w-16 h-16 rounded-full"
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
