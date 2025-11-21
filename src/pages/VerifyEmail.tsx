import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/api';
import { Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const success = await authService.verifyEmail(token);
      if (success) {
        setStatus('success');
        toast({
          title: 'Email verified!',
          description: 'Your account has been activated successfully',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

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
            <CardTitle className="text-center">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {status === 'verifying' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                <p className="text-lg font-medium">Verifying your email...</p>
                <p className="text-sm text-gray-600">Please wait a moment</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-lg font-medium text-green-600">Email Verified Successfully!</p>
                <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-lg font-medium text-red-600">Verification Failed</p>
                <p className="text-sm text-gray-600">
                  The verification link is invalid or has expired
                </p>
                <Button onClick={() => navigate('/auth')} className="mt-4">
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}