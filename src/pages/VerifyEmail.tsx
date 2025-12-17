// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useLanguage } from "@/context/LanguageContext";

type Status = "verifying" | "success" | "error";

/* ===================== COPY ===================== */
const COPY = {
  en: {
    title: "Email Verification",
    verifying: "Verifying your email...",
    pleaseWait: "Please wait a moment",
    successTitle: "Email Verified Successfully!",
    redirecting: "Redirecting to dashboard...",
    errorTitle: "Verification Failed",
    errorDesc: "The verification link is invalid or has expired.",
    backToSignIn: "Back to Sign In",
    toastTitle: "Email verified!",
    toastDesc: "Your account has been activated successfully.",
  },
  fr: {
    title: "Vérification de l’email",
    verifying: "Vérification de votre email...",
    pleaseWait: "Veuillez patienter un moment",
    successTitle: "Email vérifié avec succès !",
    redirecting: "Redirection vers le tableau de bord...",
    errorTitle: "Échec de la vérification",
    errorDesc: "Le lien de vérification est invalide ou expiré.",
    backToSignIn: "Retour à la connexion",
    toastTitle: "Email vérifié !",
    toastDesc: "Votre compte a été activé avec succès.",
  },
  es: {
    title: "Verificación de correo",
    verifying: "Verificando tu correo...",
    pleaseWait: "Por favor espera un momento",
    successTitle: "¡Correo verificado con éxito!",
    redirecting: "Redirigiendo al panel...",
    errorTitle: "Error de verificación",
    errorDesc: "El enlace es inválido o ha expirado.",
    backToSignIn: "Volver a iniciar sesión",
    toastTitle: "¡Correo verificado!",
    toastDesc: "Tu cuenta ha sido activada correctamente.",
  },
  ar: {
    title: "تأكيد البريد الإلكتروني",
    verifying: "جارٍ تأكيد بريدك الإلكتروني...",
    pleaseWait: "يرجى الانتظار قليلاً",
    successTitle: "تم تأكيد البريد الإلكتروني بنجاح!",
    redirecting: "جارٍ التحويل إلى لوحة التحكم...",
    errorTitle: "فشل التحقق",
    errorDesc: "رابط التحقق غير صالح أو منتهي الصلاحية.",
    backToSignIn: "العودة لتسجيل الدخول",
    toastTitle: "تم تأكيد البريد!",
    toastDesc: "تم تفعيل حسابك بنجاح.",
  },
} as const;
/* ================================================= */

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const copy = COPY[lang];

  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const typeParam = searchParams.get("type") as EmailOtpType | null;
    const legacyToken = searchParams.get("token");

    if (tokenHash && typeParam) {
      verifySupabaseTokenHash(tokenHash, typeParam);
    } else if (legacyToken) {
      verifySupabaseLegacyToken(legacyToken);
    } else {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifySupabaseTokenHash = async (
    tokenHash: string,
    type: EmailOtpType
  ) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("success");
      toast({
        title: copy.toastTitle,
        description: copy.toastDesc,
      });

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setStatus("error");
    }
  };

  const verifySupabaseLegacyToken = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: "email",
        token,
      } as any);

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("success");
      toast({
        title: copy.toastTitle,
        description: copy.toastDesc,
      });

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50
                 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
                 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Simulator
            </h1>
          </div>
        </div>

        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-center dark:text-gray-100">
              {copy.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center py-8">
            {status === "verifying" && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                <p className="text-lg font-medium dark:text-gray-100">
                  {copy.verifying}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {copy.pleaseWait}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-lg font-medium text-green-600">
                  {copy.successTitle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {copy.redirecting}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <p className="text-lg font-medium text-red-600">
                  {copy.errorTitle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {copy.errorDesc}
                </p>
                <Button onClick={() => navigate("/auth")} className="mt-4">
                  {copy.backToSignIn}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
