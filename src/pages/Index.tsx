import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Video, Brain, TrendingUp, Globe, CheckCircle, Sparkles } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Powered Interview Training
        </Badge>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          Master Your Job Interviews
          <br />
          with AI Avatars
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice realistic job interviews with lifelike 3D avatars. Get detailed AI-powered feedback to improve your performance and land your dream job.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/pricing')} className="text-lg px-8">
            View Pricing
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">2 free interviews • No credit card required</p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg">
            <CardHeader>
              <Video className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Realistic Interview Experience</CardTitle>
              <CardDescription>
                Practice with 3D AI avatars that simulate real interview scenarios with different difficulty levels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-lg">
            <CardHeader>
              <Brain className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Receive detailed performance reports analyzing your communication, confidence, technical knowledge, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-300 transition-all hover:shadow-lg">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-pink-600 mb-4" />
              <CardTitle>Personalized Feedback</CardTitle>
              <CardDescription>
                Get customized improvement suggestions based on your performance to help you excel in real interviews
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl my-16">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Upload Your CV', desc: 'Share your resume and job details' },
            { step: '2', title: 'Choose Avatar', desc: 'Select difficulty level and language' },
            { step: '3', title: 'Practice Interview', desc: 'Answer questions in real-time' },
            { step: '4', title: 'Get Feedback', desc: 'Receive detailed AI analysis' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Language Support */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-3xl font-bold mb-4">Multi-Language Support</h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice interviews in English or Arabic with AI avatars that adapt to your language preference
        </p>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold mb-8 text-center">What You'll Get</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Unlimited practice sessions (Premium)',
                'Detailed performance analytics',
                'Personalized improvement tips',
                'Multiple difficulty levels',
                'Real-time video feedback',
                'Email performance reports',
                'English & Arabic support',
                'Track your progress over time',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-4xl font-bold mb-6">Ready to Ace Your Next Interview?</h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of job seekers who have improved their interview skills with our AI-powered platform
        </p>
        <Button size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-12">
          Start Practicing Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 AI Interview Simulator. All rights reserved.</p>
          <p className="mt-2 text-sm">Practice makes perfect. Start your journey today.</p>
        </div>
      </footer>
    </div>
  );
}
