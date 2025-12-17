import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, Mail, AlertCircle } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";


import { authService } from "@/lib/authService";


const COPY = {
  en: {
    subtitle: "Practice interviews and improve your skills",
    welcome: "Welcome",
    welcomeDesc: "Sign in to your account or create a new one",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    createAccount: "Create Account",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    verifyEmailInfo: "You must verify your email before logging in.",
    orContinue: "Or continue with",
    backHome: "← Back to Home",
    tos: "By signing up, you agree to our Terms of Service and Privacy Policy",
  },

  fr: {
    subtitle: "Entraînez-vous et améliorez vos compétences",
    welcome: "Bienvenue",
    welcomeDesc: "Connectez-vous ou créez un nouveau compte",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    email: "Email",
    password: "Mot de passe",
    fullName: "Nom complet",
    createAccount: "Créer un compte",
    signingIn: "Connexion...",
    creatingAccount: "Création du compte...",
    verifyEmailInfo: "Vous devez vérifier votre email avant de vous connecter.",
    orContinue: "Ou continuer avec",
    backHome: "← Retour à l'accueil",
    tos: "En créant un compte, vous acceptez nos conditions et notre politique de confidentialité",
  },

  es: {
    subtitle: "Practica entrevistas y mejora tus habilidades",
    welcome: "Bienvenido",
    welcomeDesc: "Inicia sesión o crea una nueva cuenta",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    fullName: "Nombre completo",
    createAccount: "Crear cuenta",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    verifyEmailInfo: "Debes verificar tu correo antes de iniciar sesión.",
    orContinue: "O continuar con",
    backHome: "← Volver al inicio",
    tos: "Al registrarte aceptas los términos y la política de privacidad",
  },

  ar: {
    subtitle: "تدرّب على المقابلات وطوّر مهاراتك",
    welcome: "مرحباً",
    welcomeDesc: "سجّل الدخول أو أنشئ حساباً جديداً",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    fullName: "الاسم الكامل",
    createAccount: "إنشاء حساب",
    signingIn: "جارٍ تسجيل الدخول...",
    creatingAccount: "جارٍ إنشاء الحساب...",
    verifyEmailInfo: "يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.",
    orContinue: "أو المتابعة باستخدام",
    backHome: "← العودة للرئيسية",
    tos: "بإنشاء حساب، أنت توافق على الشروط وسياسة الخصوصية",
  },
} as const;






export default function Auth() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang];


  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });


  



  // ----------------------------
  //   SIGN UP
  // ----------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      await authService.signUp(
        signUpData.email,
        signUpData.password,
        signUpData.name
      );

      // Supabase sends verification email automatically
      setAuthError(
        "Account created! Please check your email to verify your account."
      );
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------
  //   SIGN IN
  // ----------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const user = await authService.signIn(
        signInData.email,
        signInData.password
      );

      if (!user.emailVerified) {
        setAuthError("Please verify your email before logging in.");
        return;
      }

      navigate("/dashboard");
    } catch (error: any) {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        setAuthError("Please verify your email before logging in.");
      } else {
        setAuthError(error.message || "Failed to sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------
  //   GOOGLE SIGN IN
  // ----------------------------
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError("");

    try {
      await authService.signInWithGoogle();
      // Supabase redirects to /dashboard
    } catch (error: any) {
      setAuthError(error.message || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------
  //   UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="w-10 h-10 text-blue-600 dark:text-primary-foreground" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Simulator
            </h1>
          </div>
          <p className="text-muted-foreground">
             {copy.subtitle}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{copy.welcome}</CardTitle>
            <CardDescription>
              {copy.welcomeDesc}
            </CardDescription>

          </CardHeader>

          <CardContent>
            {authError && (
              <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {authError}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{copy.signIn}</TabsTrigger>
                <TabsTrigger value="signup">{copy.signUp}</TabsTrigger>
              </TabsList>

              {/* SIGN IN */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{copy.email}</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{copy.password}</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({
                          ...signInData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? copy.signingIn : copy.signIn}

                  </Button>
                </form>
              </TabsContent>

              {/* SIGN UP */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{copy.fullName}</Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{copy.email}</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{copy.password}</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      {copy.verifyEmailInfo}
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? copy.creatingAccount : copy.createAccount}

                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {copy.orContinue}
                </span>
              </div>
            </div>

            {/* GOOGLE LOGIN */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              {copy.tos}
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" className="dark:text-white" onClick={() => navigate("/") }>
            {copy.backHome}
          </Button>
        </div>
      </div>
    </div>
  );
}
