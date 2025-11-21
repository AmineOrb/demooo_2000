import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AvatarViewer from '@/components/AvatarViewer';
import { interviewService, getInterviewQuestions, getAvatarDuration } from '@/lib/api';

import { Video, VideoOff, Mic, MicOff, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InterviewRoom() {
  // Route uses `roomId` as the param key (see App.tsx). Use the correct param name here.
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Look up interview directly (no setter required here)
  const interview = interviewService.getInterviews().find((i) => i.id === roomId);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (!interview) {
      navigate('/dashboard');
      return;
    }

    // Initialize interview
    const interviewQuestions = getInterviewQuestions(interview.avatarType, interview.language);
    setQuestions(interviewQuestions);
    setTimeRemaining(getAvatarDuration(interview.avatarType));

    // Start camera
    startCamera();

    // Start interview after 2 seconds
    setTimeout(() => {
      startQuestion();
    }, 2000);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interview]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
    } catch (error) {
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to continue',
        variant: 'destructive',
      });
    }
  };

  const startQuestion = () => {
    setIsAvatarSpeaking(true);
    // Simulate avatar speaking for 3-5 seconds
    const speakDuration = Math.random() * 2000 + 3000;
    setTimeout(() => {
      setIsAvatarSpeaking(false);
    }, speakDuration);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      startQuestion();
    } else {
      handleEndInterview();
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleEndInterview = async () => {
    if (!interview) return;

    const totalDuration = getAvatarDuration(interview.avatarType);
    const actualDuration = totalDuration - timeRemaining;

    try {
      const report = await interviewService.completeInterview(interview.id, actualDuration);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      toast({
        title: 'Interview Completed!',
        description: 'Your performance report is ready',
      });

      // Show report in a toast (in real app, this would be emailed)
      setTimeout(() => {
        toast({
          title: `Your Score: ${report.overallScore}%`,
          description: `Communication: ${report.communication}% | Confidence: ${report.confidence}% | Technical: ${report.technical}%`,
        });
      }, 1000);

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete interview',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!interview) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white">
              {interview.language.toUpperCase()}
            </Badge>
            <Badge className="bg-blue-600">{interview.avatarType}</Badge>
            <span className="text-sm text-gray-400">{interview.jobTitle}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleEndInterview}>
              <X className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Video Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* User Camera */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 backdrop-blur">You</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <AvatarViewer avatarType={interview.avatarType} isActive={isAvatarSpeaking} />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 backdrop-blur">AI Interviewer</Badge>
                </div>
                {isAvatarSpeaking && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 animate-pulse">Speaking...</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Display */}
        <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
          <CardContent className="p-8">
            <h3 className="text-sm text-blue-300 mb-2">Current Question:</h3>
            <p className="text-2xl font-medium mb-6">{questions[currentQuestionIndex]}</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">
                {isAvatarSpeaking
                  ? 'The interviewer is asking a question...'
                  : 'Your turn to answer. Take your time.'}
              </p>
              <Button
                onClick={handleNextQuestion}
                disabled={isAvatarSpeaking}
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            size="lg"
            variant={isVideoOn ? 'secondary' : 'destructive'}
            onClick={toggleVideo}
            className="w-16 h-16 rounded-full"
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          <Button
            size="lg"
            variant={isAudioOn ? 'secondary' : 'destructive'}
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