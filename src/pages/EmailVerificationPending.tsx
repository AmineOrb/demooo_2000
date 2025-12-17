// src/pages/EmailVerificationPending.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/lib/authService";
import { Video, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

/* ===================== COPY ===================== */
const COPY = {
  en: {
    title: "Verify Your Email",
    subtitle: "We've sent a verification link to",
    step1: "Click the verification link in your email to activate your account.",
    step2: "Check your spam folder if you don't see the email.",
    step3: "The link may take a couple of minutes to arrive.",
    resend: "Resend Verification Email",
    sending: "Sending...",
    back: "Back to Sign In",
    toastSentTitle: "Verification email sent",
    toastSentDesc: "Please check your inbox and spam folder",
    toastErrorTitle: "Error",
    toastErrorDesc: "Failed to resend verification email",
  },
  fr: {
    title: "Vérifiez votre email",
    subtitle: "Nous avons envoyé un lien de vérification à",
    step1: "Cliquez sur le lien dans l’email pour activer votre compte.",
    step2: "Vérifiez votre dossier spam si vous ne voyez pas l’email.",
    step3: "Le lien peut prendre quelques minutes à arriver.",
    resend: "Renvoyer l’email de vérification",
    sending: "Envoi...",
    back: "Retour à la connexion",
    toastSentTitle: "Email de vérification envoyé",
    toastSentDesc: "Vérifiez votre boîte de réception et les spams",
    toastErrorTitle: "Erreur",
    toastErrorDesc: "Échec de l’envoi de l’email",
  },
  es: {
    title: "Verifica tu correo",
    subtitle: "Hemos enviado un enlace de verificación a",
    step1: "Haz clic en el enlace del correo para activar tu cuenta.",
    step2: "Revisa la carpeta de spam si no ves el correo.",
    step3: "El enlace puede tardar unos minutos en llegar.",
    resend: "Reenviar correo de verificación",
    sending: "Enviando...",
    back: "Volver a iniciar sesión",
    toastSentTitle: "Correo enviado",
    toastSentDesc: "Revisa tu bandeja de entrada y spam",
    toastErrorTitle: "Error",
    toastErrorDesc: "No se pudo reenviar el correo",
  },
  ar: {
    title: "تأكيد البريد الإلكتروني",
    subtitle: "لقد أرسلنا رابط التفعيل إلى",
    step1: "اضغط على رابط التفعيل في البريد لتفعيل حسابك.",
    step2: "تحقق من مجلد الرسائل غير المرغوب فيها.",
    step3: "قد يستغرق وصول الرسالة بضع دقائق.",
    resend: "إعادة إرسال رسالة التفعيل",
    sending: "جارٍ الإرسال...",
    back: "العودة لتسجيل الدخول",
    toastSentTitle: "تم إرسال رسالة التفعيل",
    toastSentDesc: "تحقق من البريد الوارد والرسائل غير المرغوب فيها",
    toastErrorTitle: "خطأ",
    toastErrorDesc: "فشل في إعادة إرسال رسالة التفعيل",
  },
} as const;
/* ================================================= */

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const copy = COPY[lang];

  const [isResending, setIsResending] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email);
      toast({
        title: copy.toastSentTitle,
        description: copy.toastSentDesc,
      });
    } catch {
      toast({
        title: copy.toastErrorTitle,
        description: copy.toastErrorDesc,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    navigate("/auth");
    return null;
  }

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
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center dark:text-gray-100">
              {copy.title}
            </CardTitle>
            <CardDescription className="text-center dark:text-gray-400">
              {copy.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="font-semibold text-lg dark:text-gray-100">
                {email}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
              {[copy.step1, copy.step2, copy.step3].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? copy.sending : copy.resend}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                {copy.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
