import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { authService } from '@/lib/api';
import { Video, Check, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const user = authService.getCurrentUser();

  const handleSubscribe = (plan: 'free' | 'premium') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (plan === 'premium') {
      // Mock Stripe integration
      toast({
        title: 'Redirecting to payment...',
        description: 'This is a demo. In production, you would be redirected to Stripe.',
      });

      // Simulate successful payment
      setTimeout(() => {
        authService.updateSubscription('premium');
        toast({
          title: 'Subscription activated!',
          description: 'You now have unlimited access to all features',
        });
        navigate('/dashboard');
      }, 2000);
    } else {
      navigate('/dashboard');
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: '',
      description: 'Perfect for trying out the platform',
      features: [
        '2 interview sessions',
        'Basic AI analysis',
        'Email reports',
        'English & Arabic support',
        'Basic avatar selection',
      ],
      limitations: [
        'Limited interviews',
        'Basic feedback only',
      ],
      cta: 'Get Started',
      popular: false,
      plan: 'free' as const,
    },
    {
      name: 'Premium',
      price: isYearly ? '£49.9' : '£7.9',
      period: isYearly ? '/year' : '/month',
      description: 'For serious interview preparation',
      features: [
        'Unlimited interviews',
        'Advanced AI analysis',
        'Detailed performance reports',
        'All avatar types',
        'Priority support',
        'Progress tracking',
        'Custom interview scenarios',
        'Export reports as PDF',
      ],
      limitations: [],
      cta: 'Upgrade to Premium',
      popular: true,
      plan: 'premium' as const,
      savings: isYearly ? 'Save £45/year' : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Simulator
            </h1>
          </div>
          <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/')}>
            ← Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Flexible Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start with our free plan or upgrade to Premium for unlimited access
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-700">Save 47%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-blue-500 shadow-xl scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-lg">{plan.period}</span>
                  {plan.savings && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {plan.savings}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : ''
                  }`}
                  size="lg"
                  onClick={() => handleSubscribe(plan.plan)}
                  disabled={user?.subscription === plan.plan}
                >
                  {user?.subscription === plan.plan ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Early Access Offer */}
        <Card className="max-w-3xl mx-auto mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Early Access Special Offer</h3>
            <p className="text-purple-100 mb-6">
              Be among the first users and get 50% off the yearly Premium plan - only £24.95/year!
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-purple-50"
              onClick={() => handleSubscribe('premium')}
            >
              Claim Early Access Deal
            </Button>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Our Free plan gives you 2 complete interview sessions with AI analysis, so you can try the platform before upgrading.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 AI Interview Simulator. All rights reserved.</p>
          <p className="mt-2 text-sm">Secure payments powered by Stripe</p>
        </div>
      </footer>
    </div>
  );
}