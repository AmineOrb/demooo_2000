// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
// If you have @supabase/supabase-js types installed, you can import this type:
import type { EmailOtpType } from "@supabase/supabase-js";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    // Supabase confirmation links normally send:
    //   ?token_hash=...&type=email
    const tokenHash = searchParams.get("token_hash");
    const typeParam = searchParams.get("type") as EmailOtpType | null;

    // Old demo-style links might just send ?token=...
    const legacyToken = searchParams.get("token");

    if (tokenHash && typeParam) {
      // Real Supabase flow
      verifySupabaseTokenHash(tokenHash, typeParam);
    } else if (legacyToken) {
      // Fallback: treat legacy token as an email OTP (demo only)
      verifySupabaseLegacyToken(legacyToken);
    } else {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifySupabaseTokenHash = async (tokenHash: string, type: EmailOtpType) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (error) {
        console.error("verifyOtp error:", error);
        setStatus("error");
        return;
      }

      setStatus("success");
      toast({
        title: "Email verified!",
        description: "Your account has been activated successfully.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // Optional fallback if you ever send raw OTP codes instead of token_hash links
  const verifySupabaseLegacyToken = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: "email",
        token,
        // You would also pass `email` here if you use OTP codes sent as {{ .Token }}
        // email,
      } as any);

      if (error) {
        console.error("verifyOtp (legacy) error:", error);
        setStatus("error");
        return;
      }

      setStatus("success");
      toast({
        title: "Email verified!",
        description: "Your account has been activated successfully.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
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
            {status === "verifying" && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                <p className="text-lg font-medium">Verifying your email...</p>
                <p className="text-sm text-gray-600">Please wait a moment</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-lg font-medium text-green-600">
                  Email Verified Successfully!
                </p>
                <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-lg font-medium text-red-600">Verification Failed</p>
                <p className="text-sm text-gray-600">
                  The verification link is invalid or has expired.
                </p>
                <Button onClick={() => navigate("/auth")} className="mt-4">
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
