// src/pages/Index.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Video, Brain, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";



import { askAIInterviewer } from "@/lib/aiInterviewer";

import { useState } from "react";


type Lang = "en" | "fr" | "es" | "ar";

const COPY: Record<
  Lang,
  {
    badge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    startFreeTrial: string;
    viewPricing: string;
    freeNote: string;

    whyTitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;

    howTitle: string;
    how1Title: string;
    how1Desc: string;
    how2Title: string;
    how2Desc: string;
    how3Title: string;
    how3Desc: string;
    how4Title: string;
    how4Desc: string;

    benefitsTitle: string;
    benefits: string[];

    ctaTitle: string;
    ctaDesc: string;
    startNow: string;

    footer1: string;
    footer2: string;
  }
> = {
  en: {
    badge: "AI-Powered Interview Training",
    heroTitle1: "Master Your Job Interviews",
    heroTitle2: "with AI Avatars",
    heroDesc:
      "Practice realistic job interviews with lifelike 3D avatars. Get detailed AI-powered feedback to improve your performance and land your dream job.",
    startFreeTrial: "Start Free Trial",
    viewPricing: "View Pricing",
    freeNote: "2 free interviews • No credit card required",

    whyTitle: "Why Choose Our Platform?",
    feature1Title: "Realistic Interview Experience",
    feature1Desc:
      "Practice with 3D AI avatars that simulate real interview scenarios with different difficulty levels",
    feature2Title: "AI-Powered Analysis",
    feature2Desc:
      "Receive detailed performance reports analyzing your communication, confidence, technical knowledge, and more",
    feature3Title: "Personalized Feedback",
    feature3Desc:
      "Get customized improvement suggestions based on your performance to help you excel in real interviews",

    howTitle: "How It Works",
    how1Title: "Upload Your CV",
    how1Desc: "Share your resume and job details",
    how2Title: "Choose Avatar",
    how2Desc: "Select difficulty level and language",
    how3Title: "Practice Interview",
    how3Desc: "Answer questions in real-time",
    how4Title: "Get Feedback",
    how4Desc: "Receive detailed AI analysis",

    benefitsTitle: "What You'll Get",
    benefits: [
      "Unlimited practice sessions (Premium)",
      "Detailed performance analytics",
      "Personalized improvement tips",
      "Multiple difficulty levels",
      "Real-time interview simulation",
      "Email performance reports",
      "English, French, Spanish & Arabic support",
      "Track your progress over time",
    ],

    ctaTitle: "Ready to Ace Your Next Interview?",
    ctaDesc:
      "Join thousands of job seekers who have improved their interview skills with our AI-powered platform",
    startNow: "Start Practicing Now",

    footer1: "© 2025 AI Interview Simulator. All rights reserved.",
    footer2: "Practice makes perfect. Start your journey today.",
  },

  fr: {
    badge: "Entraînement aux entretiens avec l’IA",
    heroTitle1: "Réussissez vos entretiens",
    heroTitle2: "avec des avatars IA",
    heroDesc:
      "Entraînez-vous à des entretiens réalistes avec des avatars 3D. Recevez des retours détaillés générés par l’IA pour améliorer vos performances et décrocher votre poste idéal.",
    startFreeTrial: "Essai gratuit",
    viewPricing: "Voir les tarifs",
    freeNote: "2 entretiens gratuits • Aucune carte requise",

    whyTitle: "Pourquoi choisir notre plateforme ?",
    feature1Title: "Expérience réaliste",
    feature1Desc:
      "Entraînez-vous avec des avatars IA 3D qui simulent de vrais scénarios d’entretien avec plusieurs niveaux de difficulté",
    feature2Title: "Analyse par IA",
    feature2Desc:
      "Recevez des rapports détaillés sur votre communication, votre confiance, vos compétences techniques, et plus",
    feature3Title: "Retour personnalisé",
    feature3Desc:
      "Obtenez des conseils d’amélioration adaptés à vos réponses pour réussir en entretien réel",

    howTitle: "Comment ça marche",
    how1Title: "Téléversez votre CV",
    how1Desc: "Partagez votre CV et les détails du poste",
    how2Title: "Choisissez l’avatar",
    how2Desc: "Sélectionnez la difficulté et la langue",
    how3Title: "Entraînez-vous",
    how3Desc: "Répondez aux questions en temps réel",
    how4Title: "Recevez un feedback",
    how4Desc: "Analyse IA détaillée de vos réponses",

    benefitsTitle: "Ce que vous obtenez",
    benefits: [
      "Sessions illimitées (Premium)",
      "Analyses détaillées de performance",
      "Conseils personnalisés",
      "Plusieurs niveaux de difficulté",
      "Simulation d’entretien en temps réel",
      "Rapports envoyés par e-mail",
      "Anglais, français, espagnol & arabe",
      "Suivez vos progrès dans le temps",
    ],

    ctaTitle: "Prêt à réussir votre prochain entretien ?",
    ctaDesc:
      "Rejoignez des milliers de candidats qui améliorent leurs compétences grâce à notre plateforme IA",
    startNow: "Commencer maintenant",

    footer1: "© 2025 AI Interview Simulator. Tous droits réservés.",
    footer2: "L’entraînement fait la différence. Commencez aujourd’hui.",
  },

  es: {
    badge: "Entrenamiento de entrevistas con IA",
    heroTitle1: "Domina tus entrevistas",
    heroTitle2: "con avatares de IA",
    heroDesc:
      "Practica entrevistas realistas con avatares 3D. Recibe feedback detallado generado por IA para mejorar tu desempeño y conseguir el trabajo que quieres.",
    startFreeTrial: "Prueba gratis",
    viewPricing: "Ver precios",
    freeNote: "2 entrevistas gratis • Sin tarjeta",

    whyTitle: "¿Por qué elegir nuestra plataforma?",
    feature1Title: "Experiencia realista",
    feature1Desc:
      "Practica con avatares 3D que simulan entrevistas reales con distintos niveles de dificultad",
    feature2Title: "Análisis con IA",
    feature2Desc:
      "Recibe reportes detallados sobre comunicación, confianza, conocimientos técnicos y más",
    feature3Title: "Feedback personalizado",
    feature3Desc:
      "Obtén sugerencias personalizadas para mejorar y destacar en entrevistas reales",

    howTitle: "Cómo funciona",
    how1Title: "Sube tu CV",
    how1Desc: "Comparte tu CV y los detalles del puesto",
    how2Title: "Elige avatar",
    how2Desc: "Selecciona dificultad e idioma",
    how3Title: "Practica la entrevista",
    how3Desc: "Responde preguntas en tiempo real",
    how4Title: "Recibe feedback",
    how4Desc: "Análisis detallado con IA",

    benefitsTitle: "Lo que obtendrás",
    benefits: [
      "Sesiones ilimitadas (Premium)",
      "Analítica de rendimiento",
      "Consejos personalizados",
      "Varios niveles de dificultad",
      "Simulación en tiempo real",
      "Reportes por correo",
      "Inglés, francés, español y árabe",
      "Seguimiento de tu progreso",
    ],

    ctaTitle: "¿Listo para tu próxima entrevista?",
    ctaDesc:
      "Únete a miles de personas que mejoraron sus habilidades con nuestra plataforma impulsada por IA",
    startNow: "Empezar ahora",

    footer1: "© 2025 AI Interview Simulator. Todos los derechos reservados.",
    footer2: "La práctica hace al maestro. Empieza hoy.",
  },

  ar: {
    badge: "تدريب مقابلات مدعوم بالذكاء الاصطناعي",
    heroTitle1: "أتقِن مقابلات العمل",
    heroTitle2: "مع أفاتارات ذكاء اصطناعي",
    heroDesc:
      "تدرّب على مقابلات واقعية مع أفاتارات ثلاثية الأبعاد. احصل على تقييم وتحليل مفصل لتحسين أدائك وتحقيق وظيفة أحلامك.",
    startFreeTrial: "ابدأ مجاناً",
    viewPricing: "عرض الأسعار",
    freeNote: "مقابلتان مجاناً • بدون بطاقة",

    whyTitle: "لماذا تختار منصتنا؟",
    feature1Title: "تجربة مقابلة واقعية",
    feature1Desc:
      "تدرّب مع أفاتارات ثلاثية الأبعاد تحاكي مقابلات حقيقية مع مستويات صعوبة مختلفة",
    feature2Title: "تحليل بالذكاء الاصطناعي",
    feature2Desc:
      "تقارير أداء مفصلة تشمل التواصل، الثقة، المعرفة التقنية، وأكثر",
    feature3Title: "ملاحظات مخصصة",
    feature3Desc:
      "اقتراحات تحسين مخصصة بناءً على أدائك لمساعدتك على التفوق في المقابلات الحقيقية",

    howTitle: "كيف تعمل",
    how1Title: "ارفع سيرتك الذاتية",
    how1Desc: "شارك سيرتك الذاتية وتفاصيل الوظيفة",
    how2Title: "اختر الأفاتار",
    how2Desc: "حدد مستوى الصعوبة واللغة",
    how3Title: "تدرّب على المقابلة",
    how3Desc: "أجب عن الأسئلة في الوقت الحقيقي",
    how4Title: "احصل على تقييم",
    how4Desc: "تحليل مفصل بالذكاء الاصطناعي",

    benefitsTitle: "ماذا ستحصل عليه",
    benefits: [
      "جلسات غير محدودة (Premium)",
      "تحليلات أداء مفصلة",
      "نصائح تحسين مخصصة",
      "مستويات صعوبة متعددة",
      "محاكاة مقابلة في الوقت الحقيقي",
      "تقارير عبر البريد الإلكتروني",
      "دعم الإنجليزية والفرنسية والإسبانية والعربية",
      "تتبع تقدمك مع الوقت",
    ],

    ctaTitle: "جاهز لتتفوق في مقابلة عملك القادمة؟",
    ctaDesc:
      "انضم إلى آلاف الباحثين عن عمل الذين طوروا مهاراتهم عبر منصتنا المدعومة بالذكاء الاصطناعي",
    startNow: "ابدأ التدريب الآن",

    footer1: "© 2025 AI Interview Simulator. جميع الحقوق محفوظة.",
    footer2: "التدريب يصنع الفرق. ابدأ رحلتك اليوم.",
  },
};

export default function Index() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const copy = COPY[lang];

  // Optional: better RTL layout for Arabic
  const isRTL = lang === "ar";





const [messages, setMessages] = useState<
  { role: "system" | "user" | "assistant"; content: string }[]
>([
  {
    role: "system",
    content: "You are a professional job interviewer.",
  },
]);

const [aiReply, setAiReply] = useState<string | null>(null);
const [loading, setLoading] = useState(false);









async function testAI() {
  setLoading(true);

  const updatedMessages = [
    ...messages,
    {
      role: "user",
      content: "Hello, I am ready for my interview.",
    },
  ];

  try {
    const reply = await askAIInterviewer(updatedMessages);

    setMessages([
      ...updatedMessages,
      { role: "assistant", content: reply },
    ]);

    setAiReply(reply);
  } catch (err) {
    console.error(err);
    alert("AI interview failed");
  } finally {
    setLoading(false);
  }
}











  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-200">
          <Sparkles className="w-3 h-3 mr-1" />
          {copy.badge}
        </Badge>

        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          {copy.heroTitle1}
          <br />
          {copy.heroTitle2}
        </h2>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          {copy.heroDesc}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8"
          >
            {copy.startFreeTrial}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="text-lg px-8"
          >
            {copy.viewPricing}
          </Button>



        

        <button
  onClick={testAI}
  className="mt-4 px-4 py-2 bg-black text-white rounded"
>
  Test AI Interviewer
</button>



{loading && (
  <p className="mt-4 text-gray-500">AI is thinking...</p>
)}

{aiReply && (
  <Card className="mt-6 max-w-2xl mx-auto">
    <CardContent className="p-6">
      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">
        {aiReply}
      </p>
    </CardContent>
  </Card>
)}






        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {copy.freeNote}
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          {copy.whyTitle}
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <Video className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle className="dark:text-gray-100">
                {copy.feature1Title}
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {copy.feature1Desc}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <Brain className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle className="dark:text-gray-100">
                {copy.feature2Title}
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {copy.feature2Desc}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-300 transition-all hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-pink-600 mb-4" />
              <CardTitle className="dark:text-gray-100">
                {copy.feature3Title}
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {copy.feature3Desc}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="container mx-auto px-4 py-16 rounded-3xl my-16
                   bg-gradient-to-r from-blue-50 to-purple-50
                   dark:from-slate-900 dark:to-slate-900"
      >
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          {copy.howTitle}
        </h3>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "1", title: copy.how1Title, desc: copy.how1Desc },
            { step: "2", title: copy.how2Title, desc: copy.how2Desc },
            { step: "3", title: copy.how3Title, desc: copy.how3Desc },
            { step: "4", title: copy.how4Title, desc: copy.how4Desc },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                {item.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold mb-8 text-center">
              {copy.benefitsTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {copy.benefits.map((benefit) => (
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
        <h3 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {copy.ctaTitle}
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          {copy.ctaDesc}
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-12"
        >
          {copy.startNow}
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-slate-950 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>{copy.footer1}</p>
          <p className="mt-2 text-sm">{copy.footer2}</p>
        </div>
      </footer>
    </div>
  );
}
