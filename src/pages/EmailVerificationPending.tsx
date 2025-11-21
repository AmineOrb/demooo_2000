import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/api';
import { Video, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const pendingUser = authService.getPendingUser();

  const handleResendEmail = async () => {
    if (!pendingUser) return;
    
    setIsResending(true);
    try {
      await authService.resendVerificationEmail(pendingUser.email);
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox and spam folder',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!pendingUser) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Simulator
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="font-semibold text-lg">{pendingUser.email}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Click the verification link in your email to activate your account
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Check your spam folder if you don't see the email
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  The link will expire in 24 hours
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                Back to Sign In
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>For demo purposes, use this verification link:</p>
              <Button
                variant="link"
                className="text-blue-600"
                onClick={() => navigate(`/verify-email?token=${pendingUser.verificationToken}`)}
              >
                Click here to verify
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}