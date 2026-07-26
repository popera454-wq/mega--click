'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  Trophy,
  ChevronDown,
  BarChart,
  Image as ImageIcon,
  Zap,
  Brain,
  Share2,
  Shield,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Command,
  Loader2,
  Layout,
  Gamepad2,
  FileText,
  Play,
  Music,
  Mic,
  Lock,
  Languages,
} from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lang, setLang] = useState<'he' | 'en'>('he');

  // States for Interactive Demos
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<Array<{
    q: string;
    a: string;
  }> | null>(null);
  const [phoneDial, setPhoneDial] = useState('');
  const [phoneState, setPhoneState] = useState<
    'idle' | 'calling' | 'connected'
  >('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle Language
  const toggleLanguage = () => {
    setLang((prev) => (prev === 'he' ? 'en' : 'he'));
  };

  // Content Dictionary for Hebrew & English
  const t = {
    he: {
      navFeatures: 'יכולות',
      navAi: 'בינה מלאכותית',
      navPhone: 'טלפון כשר',
      navCert: 'אחזור תעודה',
      navFaq: 'שאלות',
      login: 'התחברות',
      join: 'הצטרף למשחק',
      badge: 'הדור הבא של אינטראקציה קבוצתית',
      heroTitle1: 'לשחק, להשתתף, להוביל.',
      heroTitle2: 'בלי גבולות.',
      heroDesc:
        'הפלטפורמה היחידה בעולם המשלבת משתתפי סמארטפון, מחשב וטלפונים כשרים (חיוג קולי) לאותה תחרות בזמן אמת, בשבריר שנייה.',
      startFree: 'התחל ליצור בחינם',
      certBtn: 'אחזור תעודה',
      livePlayers: '42 שחקנים מחוברים',
      gamePin: 'PIN משחק',
      questionNum: 'שאלה 4 מתוך 10',
      questionText: 'באיזו שנה הושק ה-iPhone הראשון?',
      featuresTitle: 'ארסנל של כלים מטורפים.',
      featuresSub: 'כל מה שצריך כדי לבנות את החוויה המושלמת, במקום אחד.',
      feat1Title: 'טריוויה וסקרים',
      feat1Desc:
        'בנה שאלות אמריקאיות, סקרים חיים, ותשובות מבוססות תמונות. הכל מתעדכן ב-Realtime ללא דיליי.',
      feat2Title: 'פודיום מנצחים',
      feat2Desc: 'חגגו את הניצחון עם לוח תוצאות חי ואנימציות מרהיבות.',
      feat3Title: 'מדיה מתקדמת',
      feat3Desc: 'שלבו סרטוני YouTube, קובצי שמע ותמונות HD ישירות בשאלות.',
      feat4Title: 'ייבוא מהיר מ-Excel',
      feat4Desc:
        'יש לכם מאגר שאלות קיים? העלו קובץ אקסל והמערכת תבנה עבורכם את המשחק באופן אוטומטי תוך שניות.',
      aiTitle1: 'אל תכתוב.',
      aiTitle2: 'תן ל-AI לעבוד.',
      aiDesc:
        'מנוע ה-AI שלנו, המבוסס על מודלים מתקדמים (Gemini), מייצר עבורך חידון מלא הכולל שאלות, תשובות נכונות ומסיחים – הכל מתוך טקסט פשוט. נסה עכשיו בעצמך.',
      aiPlaceholder: 'הקלד נושא (למשל: ההיסטוריה של האינטרנט)...',
      aiGenerate: 'חולל',
      aiThinking: 'המנוע חושב ויוצר שאלות...',
      aiResultTitle: 'נוצרו 3 שאלות לדוגמה עבור',
      phoneBadge: 'בלעדי: תמיכה קולית מובנית',
      phoneTitle1: 'בלי סמארטפון?',
      phoneTitle2: 'אין שום בעיה.',
      phoneDesc:
        'אנו מציעים את הפתרון המתקדם ביותר עבור המגזר החרדי וטלפונים כשרים. המשתתפים מחייגים למספר 077-2250449, מקישים את קוד המשחק, ומשתתפים בלייב באמצעות לחיצה על מקשי הטלפון.',
      phoneSync: 'סינכרון מלא עם שחקני ה-Web',
      phoneIvr: 'מערכת קריינות (IVR) המקריאה שאלות וניקוד',
      phoneCert: 'הפקת קוד אישי לתעודה בסיום המשחק',
      faqTitle: 'שאלות נפוצות',
      faq1q: 'איך המערכת מתמודדת עם מאות משתתפים במקביל?',
      faq1a:
        'MegaClick בנויה על ארכיטקטורת Serverless ומשתמשת בטכנולוגיית WebSockets המבטיחה עדכונים בזמן אמת עם אפס השהייה גם בעומסים כבדים.',
      faq2q: 'האם זה באמת חינם?',
      faq2a:
        'כן. ניתן ליצור משחקים, להשתמש במחולל ה-AI ולהפעיל אירועים ללא עלות. קיימות גם תוכניות פרימיום למשתמשים עסקיים הדורשים מיתוג אישי ואנליטיקה מתקדמת.',
      faq3q: 'איך שחקני טלפון כשר מקבלים תעודה?',
      faq3a:
        "בסיום המשחק, מערכת הקריינות מקריאה לשחקן הטלפוני קוד אישי ייחודי. את הקוד הזה ניתן להזין בעמוד 'אחזור תעודה' באתר ולהוריד קובץ PDF מעוצב אישית.",
      faq4q: 'האם ניתן לייצא את נתוני המשחק?',
      faq4a:
        'בהחלט. בסיום כל משחק תקבלו דוח מפורט באזור האישי הכולל ניתוח תשובות, דירוגים ומדדי מעורבות, הניתן לייצוא מלא ל-Excel.',
      ctaTitle: 'מוכנים להתחיל?',
      ctaDesc:
        'הירשמו עכשיו וצרו את המשחק האינטראקטיבי הראשון שלכם בתוך פחות מ-2 דקות.',
      ctaBtn1: 'צור חשבון חינם',
      ctaBtn2: 'הצטרף למשחק קיים',
      footerDesc:
        'הפלטפורמה המתקדמת בישראל ליצירת חוויות למידה ומשחק אינטראקטיביות, מותאמת לכל סוגי המשתתפים.',
      product: 'מוצר',
      resources: 'משאבים',
      legal: 'חוקי',
      rights: '© 2026 MegaClick. כל הזכויות שמורות.',
      status: 'מערכות תקינות ויציבות',
    },
    en: {
      navFeatures: 'Features',
      navAi: 'AI Generator',
      navPhone: 'Kosher Phone',
      navCert: 'Certificate',
      navFaq: 'FAQ',
      login: 'Login',
      join: 'Join Game',
      badge: 'The Next Generation of Group Interaction',
      heroTitle1: 'Play, Engage, Lead.',
      heroTitle2: 'Without Limits.',
      heroDesc:
        "The world's only platform seamlessly combining smartphone, PC, and kosher phone (voice dial) participants into the same real-time competition.",
      startFree: 'Start Creating Free',
      certBtn: 'Get Certificate',
      livePlayers: '42 Players Connected',
      gamePin: 'Game PIN',
      questionNum: 'Question 4 of 10',
      questionText: 'In what year was the first iPhone launched?',
      featuresTitle: 'An Arsenal of Amazing Tools.',
      featuresSub:
        'Everything you need to build the ultimate interactive experience in one place.',
      feat1Title: 'Trivia & Polls',
      feat1Desc:
        'Build multiple-choice questions, live polls, and image-based answers. Real-time synchronization with zero delay.',
      feat2Title: 'Winner Podiums',
      feat2Desc:
        'Celebrate victory with a live scoreboard and spectacular animations.',
      feat3Title: 'Advanced Media',
      feat3Desc:
        'Embed YouTube videos, audio files, and HD images directly into questions.',
      feat4Title: 'Quick Excel Import',
      feat4Desc:
        'Already have a question bank? Upload an Excel file and the system will automatically build your game within seconds.',
      aiTitle1: "Don't Write.",
      aiTitle2: 'Let AI Do the Work.',
      aiDesc:
        'Our AI engine, powered by advanced models (Gemini), generates a complete quiz with questions, correct answers, and distractors from simple text prompts.',
      aiPlaceholder: 'Type a topic (e.g., History of the Internet)...',
      aiGenerate: 'Generate',
      aiThinking: 'Engine is thinking and creating questions...',
      aiResultTitle: 'Generated 3 sample questions for',
      phoneBadge: 'Exclusive: Built-in Voice Support',
      phoneTitle1: 'No Smartphone?',
      phoneTitle2: 'No Problem.',
      phoneDesc:
        'We offer the most advanced solution for kosher phones. Participants dial 077-2250449, enter the game PIN, and play live using phone keypad buttons.',
      phoneSync: 'Full sync with Web players',
      phoneIvr: 'IVR narration system reading questions & scores',
      phoneCert: 'Personal code generation for certificate at the end',
      faqTitle: 'Frequently Asked Questions',
      faq1q: 'How does the system handle hundreds of concurrent players?',
      faq2q: 'Is it really free?',
      faq3q: 'How do kosher phone players get certificates?',
      faq4q: 'Can game data be exported?',
      faq1a:
        'MegaClick is built on Serverless architecture and uses WebSockets to ensure real-time updates with zero latency under heavy loads.',
      faq2a:
        'Yes. You can create games, use the AI generator, and run events at no cost. Premium plans are available for enterprise branding and advanced analytics.',
      faq3a:
        "At the end of the game, the voice narration reads a unique personal code. You can enter this code in the 'Certificate' section to download a custom PDF.",
      faq4a:
        'Absolutely. At the end of every game, you get a detailed report in your dashboard with answers, rankings, and exportable to Excel.',
      ctaTitle: 'Ready to Get Started?',
      ctaDesc:
        'Sign up now and create your first interactive game in under 2 minutes.',
      ctaBtn1: 'Create Free Account',
      ctaBtn2: 'Join Existing Game',
      footerDesc:
        "Israel's most advanced platform for interactive learning and gaming experiences, tailored for all participant types.",
      product: 'Product',
      resources: 'Resources',
      legal: 'Legal',
      rights: '© 2026 MegaClick. All rights reserved.',
      status: 'All Systems Operational',
    },
  };

  const current = t[lang];

  // AI Demo Logic
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiGenerating) return;
    setIsAiGenerating(true);
    setAiResult(null);
    setTimeout(() => {
      setIsAiGenerating(false);
      setAiResult([
        {
          q:
            lang === 'he'
              ? `מתי הומצא/ה ${aiInput}?`
              : `When was ${aiInput} invented?`,
          a: lang === 'he' ? 'לפנים משורה / לפני שנים' : 'Many years ago',
        },
        {
          q:
            lang === 'he'
              ? `מי הדמות המרכזית הקשורה ל-${aiInput}?`
              : `Who is the central figure related to ${aiInput}?`,
          a: lang === 'he' ? 'אישיות מוכרת' : 'Well known personality',
        },
        {
          q:
            lang === 'he'
              ? `מה העובדה המעניינת ביותר על ${aiInput}?`
              : `What is the most interesting fact about ${aiInput}?`,
          a: lang === 'he' ? 'עובדה מפתיעה' : 'Surprising fact',
        },
      ]);
    }, 2500);
  };

  // Phone Demo Logic
  const handleKeyClick = (key: string) => {
    if (phoneState === 'connected') return;
    if (phoneDial.length < 6) {
      const newVal = phoneDial + key;
      setPhoneDial(newVal);
      if (newVal.length === 6) {
        setPhoneState('calling');
        setTimeout(() => setPhoneState('connected'), 1500);
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#090b10] text-[#EDEDED] font-sans ${
        lang === 'he' ? 'rtl' : 'ltr'
      } overflow-x-hidden selection:bg-indigo-500/30`}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --glass-border: rgba(255, 255, 255, 0.12);
          --glass-bg: rgba(255, 255, 255, 0.05);
          --accent: #6366f1;
        }
        
        .bg-grid {
          background-size: 35px 35px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black, transparent 85%);
        }

        .shimmer-button {
          position: relative;
          overflow: hidden;
        }
        .shimmer-button::after {
          content: '';
          position: absolute;
          top: -50%; right: -50%; bottom: -50%; left: -50%;
          background: linear-gradient(to bottom, rgba(229, 231, 235, 0), rgba(255, 255, 255, 0.6) 50%, rgba(229, 231, 235, 0));
          transform: rotateZ(60deg) translate(-5em, 7.5em);
          animation: shimmer 3s infinite;
          opacity: 0.3;
        }
        @keyframes shimmer {
          100% { transform: rotateZ(60deg) translate(1em, -9em); }
        }

        .glow-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(16px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glow-card:hover {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .gradient-text {
          background: linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-text-accent {
          background: linear-gradient(135deg, #818CF8 0%, #E879F9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .spotlight {
          position: absolute;
          width: 70vw;
          height: 70vw;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%);
          top: -25vw;
          left: 15vw;
          pointer-events: none;
          z-index: 0;
        }
      `,
        }}
      />

      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-60"></div>
      <div className="spotlight"></div>

      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-50 transition-all duration-500 px-4">
        <div
          className={`max-w-[1100px] mx-auto rounded-full transition-all duration-500 flex items-center justify-between px-6 py-3 ${
            isScrolled
              ? 'bg-[#111318]/90 backdrop-blur-xl border border-white/15 shadow-2xl'
              : 'bg-white/[0.03] backdrop-blur-md border border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              MegaClick
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#C5C7D0]">
            <a href="#features" className="hover:text-white transition-colors">
              {current.navFeatures}
            </a>
            <a href="#ai-demo" className="hover:text-white transition-colors">
              {current.navAi}
            </a>
            <a href="#ivr-demo" className="hover:text-white transition-colors">
              {current.navPhone}
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              {current.navFaq}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 text-white"
              title="Change Language / החלף שפה"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'he' ? 'EN' : 'עב'}</span>
            </button>

            {/* Certificate Link - Placed right next to login/actions */}
            <Link
              href="/certificate"
              className="text-sm font-medium text-indigo-400 hover:text-white transition-colors hidden sm:block"
            >
              {current.navCert}
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-[#C5C7D0] hover:text-white transition-colors hidden sm:block"
            >
              {current.login}
            </Link>

            <Link
              href="/join"
              className="shimmer-button bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
              {current.join}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-44 pb-20 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
        <div className="fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{current.badge}</span>
          </div>
        </div>

        <h1
          className="fade-up text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.1] mb-6 max-w-5xl"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="gradient-text block">{current.heroTitle1}</span>
          <span className="gradient-text-accent block mt-2">
            {current.heroTitle2}
          </span>
        </h1>

        <p
          className="fade-up text-lg md:text-xl text-[#C5C7D0] max-w-2xl font-normal leading-relaxed mb-10"
          style={{ animationDelay: '0.3s' }}
        >
          {current.heroDesc}
        </p>

        <div
          className="fade-up flex flex-col sm:flex-row items-center gap-4 mb-20"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            href="/login"
            className="shimmer-button bg-white text-black px-8 py-4 rounded-full text-base font-bold transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            {current.startFree}{' '}
            <ArrowLeft
              className={`w-4 h-4 ${
                lang === 'en' ? 'transform rotate-180' : ''
              }`}
            />
          </Link>
          <Link
            href="/certificate"
            className="px-8 py-4 rounded-full text-base font-medium text-white border border-white/15 bg-white/10 hover:bg-white/15 backdrop-blur-md transition-all flex items-center gap-2 shadow-lg"
          >
            <FileText className="w-4 h-4 text-indigo-400" /> {current.certBtn}
          </Link>
        </div>

        {/* Hero Dashboard Mockup */}
        <div
          className="fade-up w-full max-w-5xl relative"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-transparent blur-3xl -z-10 rounded-full"></div>

          <div className="rounded-[24px] border border-white/15 bg-[#12151C]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-[#181B24]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <div className="flex bg-[#1E222D] rounded-md px-3 py-1 border border-white/10 text-xs text-[#C5C7D0] font-mono items-center gap-2">
                <Lock className="w-3 h-3 text-indigo-400" />{' '}
                megaclick.co.il/host/live
              </div>
              <div className="w-16"></div>
            </div>

            <div className="p-8 md:p-12 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-bold text-white">
                  {current.livePlayers}
                </span>
              </div>

              <div className="absolute top-6 left-6 bg-[#1A1E29] border border-white/15 px-4 py-2 rounded-xl text-center shadow-lg">
                <p className="text-[10px] text-[#C5C7D0] mb-0.5">
                  {current.gamePin}
                </p>
                <p className="text-xl font-mono font-bold text-white tracking-widest">
                  837-291
                </p>
              </div>

              <div className="max-w-2xl mx-auto mt-12 text-center">
                <span className="text-indigo-400 font-bold text-sm mb-4 block">
                  {current.questionNum}
                </span>
                <h3 className="text-3xl font-bold text-white mb-10">
                  {current.questionText}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      text: '2005',
                      val: 12,
                      color: 'bg-red-500/10 border-red-500/30 text-red-200',
                    },
                    {
                      text: '2007',
                      val: 85,
                      color:
                        'bg-green-500/20 border-green-500/50 text-green-300 ring-2 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.25)]',
                      correct: true,
                    },
                    {
                      text: '2009',
                      val: 3,
                      color: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
                    },
                    {
                      text: '2010',
                      val: 0,
                      color:
                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
                    },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`relative p-5 rounded-xl border text-right overflow-hidden ${opt.color}`}
                    >
                      <div className="relative z-10 flex justify-between items-center font-bold text-lg">
                        <span>{opt.text}</span>
                        {opt.correct && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all duration-1000 ease-out"
                        style={{ width: `${opt.val}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section
        id="features"
        className="relative z-10 py-24 px-4 max-w-[1200px] mx-auto"
      >
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {current.featuresTitle}
          </h2>
          <p className="text-[#C5C7D0] text-lg">{current.featuresSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[290px]">
          <div className="glow-card rounded-3xl p-8 col-span-1 md:col-span-2 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40 mb-4 shadow-lg">
                <Gamepad2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {current.feat1Title}
              </h3>
              <p className="text-[#C5C7D0] text-sm max-w-sm leading-relaxed">
                {current.feat1Desc}
              </p>
            </div>
            <div className="absolute left-0 bottom-0 w-2/3 h-32 bg-gradient-to-t from-[#151822] to-transparent border-t border-r border-white/10 rounded-tr-3xl flex items-end p-4 group-hover:border-indigo-500/40 transition-colors">
              <div className="w-full flex gap-2 items-end">
                <div className="w-1/4 h-8 bg-white/10 rounded-t-md"></div>
                <div className="w-1/4 h-16 bg-indigo-500/50 rounded-t-md shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <div className="w-1/4 h-12 bg-white/10 rounded-t-md"></div>
                <div className="w-1/4 h-4 bg-white/10 rounded-t-md"></div>
              </div>
            </div>
          </div>

          <div className="glow-card rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40 mb-4 shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {current.feat2Title}
              </h3>
              <p className="text-[#C5C7D0] text-sm leading-relaxed">
                {current.feat2Desc}
              </p>
            </div>
          </div>

          <div className="glow-card rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/40 mb-4 shadow-lg">
                <Play className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {current.feat3Title}
              </h3>
              <p className="text-[#C5C7D0] text-sm leading-relaxed">
                {current.feat3Desc}
              </p>
            </div>
          </div>

          <div className="glow-card rounded-3xl p-8 col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 mb-4 shadow-lg">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {current.feat4Title}
              </h3>
              <p className="text-[#C5C7D0] text-sm max-w-sm leading-relaxed">
                {current.feat4Desc}
              </p>
            </div>
            <div className="absolute left-8 bottom-8 flex gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/15 flex items-center justify-center font-bold text-emerald-400 text-xs shadow">
                XLSX
              </div>
              <ArrowLeft
                className={`w-5 h-5 text-white/50 self-center ${
                  lang === 'en' ? 'transform rotate-180' : ''
                }`}
              />
              <div className="w-12 h-12 bg-indigo-500/30 rounded-xl border border-indigo-500/40 flex items-center justify-center shadow">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Generator Section */}
      <section
        id="ai-demo"
        className="relative z-10 py-24 px-4 border-t border-white/10 bg-[#0C0E14]"
      >
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {current.aiTitle1}
              <br />
              <span className="gradient-text-accent">{current.aiTitle2}</span>
            </h2>
            <p className="text-[#C5C7D0] text-lg mb-8 leading-relaxed">
              {current.aiDesc}
            </p>
          </div>

          <div className="glow-card rounded-[24px] p-2 relative shadow-2xl min-h-[420px] flex flex-col bg-[#141722]/90 border-white/20">
            <form
              onSubmit={handleAiSubmit}
              className="relative flex items-center px-4 py-4 border-b border-white/15"
            >
              <Command className="w-5 h-5 text-[#C5C7D0] mr-2 shrink-0" />
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={current.aiPlaceholder}
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-[#C5C7D0]/50 text-sm px-2"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!aiInput || isAiGenerating}
                className="bg-white/15 hover:bg-white/25 text-white text-xs px-4 py-2 rounded-lg font-medium border border-white/20 transition-colors disabled:opacity-50 flex items-center gap-2 shadow"
              >
                {isAiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  current.aiGenerate
                )}
                <span className="hidden sm:inline font-mono text-[10px] text-[#C5C7D0]">
                  ⏎
                </span>
              </button>
            </form>

            <div className="p-6 flex-1 flex flex-col justify-center">
              {!isAiGenerating && !aiResult && (
                <div className="text-center text-[#C5C7D0]/50 flex flex-col items-center">
                  <Sparkles className="w-10 h-10 mb-3 opacity-30 text-indigo-400" />
                  <p className="text-sm">
                    {lang === 'he'
                      ? 'הקלד נושא למעלה ולחץ חולל כדי לראות את הקסם.'
                      : 'Type a topic above and click Generate to see the magic.'}
                  </p>
                </div>
              )}

              {isAiGenerating && (
                <div className="space-y-4 px-2 w-full max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-purple-400 text-sm font-medium mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />{' '}
                    {current.aiThinking}
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-12 bg-white/10 rounded-xl animate-pulse"></div>
                    <div className="w-5/6 h-12 bg-white/10 rounded-xl animate-pulse delay-75"></div>
                    <div className="w-4/6 h-12 bg-white/10 rounded-xl animate-pulse delay-150"></div>
                  </div>
                </div>
              )}

              {aiResult && !isAiGenerating && (
                <div className="space-y-3 animate-fadeIn px-2">
                  <div className="text-xs text-[#C5C7D0] mb-4">
                    {current.aiResultTitle} "{aiInput}":
                  </div>
                  {aiResult.map((res, i) => (
                    <div
                      key={i}
                      className="bg-white/10 border border-white/10 p-3.5 rounded-xl shadow-inner"
                    >
                      <p className="font-bold text-sm text-white mb-1">
                        {res.q}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {res.a}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* IVR / Kosher Phone Section */}
      <section
        id="ivr-demo"
        className="relative z-10 py-24 px-4 max-w-[1200px] mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 flex justify-center">
            <div className="w-[320px] bg-[#12151C] rounded-[3rem] p-4 border-[8px] border-[#1E222D] shadow-2xl relative">
              <div className="bg-[#090B10] rounded-[2rem] h-[560px] overflow-hidden border border-white/15 flex flex-col relative">
                <div className="h-7 w-full flex justify-between items-center px-5 text-[10px] text-white/60 pt-2">
                  <span>15:42</span>
                  <div className="flex gap-1">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col p-6 pt-8">
                  <div className="text-center mb-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors duration-500 shadow-lg ${
                        phoneState === 'connected'
                          ? 'bg-green-500/25 text-green-400 border border-green-500/50'
                          : 'bg-[#1E222D] text-[#A1A5B7] border border-white/10'
                      }`}
                    >
                      <Phone
                        className={`w-6 h-6 ${
                          phoneState === 'calling' ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                    <p className="text-[#C5C7D0] text-[11px] uppercase tracking-widest font-semibold">
                      {phoneState === 'idle'
                        ? 'Enter Game PIN'
                        : phoneState === 'calling'
                        ? 'Connecting...'
                        : 'Connected to Game!'}
                    </p>
                    <div className="text-3xl font-mono font-bold mt-2 tracking-widest text-white min-h-[40px] flex items-center justify-center">
                      {phoneDial || (
                        <span className="text-white/20">------</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-3 gap-y-3 gap-x-5 px-4 mt-auto mb-8 transition-opacity duration-300 ${
                      phoneState === 'connected'
                        ? 'opacity-20 pointer-events-none'
                        : 'opacity-100'
                    }`}
                  >
                    {[
                      '1',
                      '2',
                      '3',
                      '4',
                      '5',
                      '6',
                      '7',
                      '8',
                      '9',
                      '*',
                      '0',
                      '#',
                    ].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyClick(key)}
                        className="w-14 h-14 rounded-full bg-[#1A1E29] hover:bg-[#252A38] active:bg-[#303646] border border-white/10 text-white font-bold text-xl flex items-center justify-center transition-colors shadow"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {phoneState === 'connected' && (
                    <div className="absolute inset-x-0 bottom-10 flex justify-center animate-fadeIn">
                      <button
                        onClick={() => {
                          setPhoneState('idle');
                          setPhoneDial('');
                        }}
                        className="w-16 h-16 rounded-full bg-red-500/25 text-red-400 flex items-center justify-center border border-red-500/40 hover:bg-red-500/35 transition-colors shadow-lg"
                      >
                        <Phone className="w-6 h-6 transform rotate-[135deg]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs font-medium mb-6 shadow-inner">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>{current.phoneBadge}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {current.phoneTitle1}
              <br />
              <span className="gradient-text">{current.phoneTitle2}</span>
            </h2>
            <p className="text-[#C5C7D0] text-lg mb-8 leading-relaxed">
              {current.phoneDesc}{' '}
              <span className="text-white font-mono dir-ltr bg-white/10 px-2 py-0.5 rounded border border-white/15">
                077-2250449
              </span>
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-[#C5C7D0]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />{' '}
                {current.phoneSync}
              </li>
              <li className="flex items-center gap-3 text-sm text-[#C5C7D0]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />{' '}
                {current.phoneIvr}
              </li>
              <li className="flex items-center gap-3 text-sm text-[#C5C7D0]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />{' '}
                {current.phoneCert}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="relative z-10 py-24 px-4 max-w-[850px] mx-auto border-t border-white/10"
      >
        <h2 className="text-3xl font-bold mb-12 text-center text-white">
          {current.faqTitle}
        </h2>

        <div className="space-y-3">
          {[
            { q: current.faq1q, a: current.faq1a },
            { q: current.faq2q, a: current.faq2a },
            { q: current.faq3q, a: current.faq3a },
            { q: current.faq4q, a: current.faq4a },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="glow-card rounded-2xl overflow-hidden border border-white/10"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full py-5 px-6 text-right font-medium text-base flex items-center justify-between text-white hover:text-indigo-400 transition-colors focus:outline-none"
              >
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openFaq === idx
                      ? 'rotate-180 text-indigo-400'
                      : 'text-[#C5C7D0]'
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out px-6 ${
                  openFaq === idx
                    ? 'max-h-40 opacity-100 pb-6'
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-[#C5C7D0] text-sm leading-relaxed pr-2 border-r-2 border-indigo-500/60">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 pb-32">
        <div className="max-w-[1000px] mx-auto bg-gradient-to-br from-indigo-900/60 via-purple-950/40 to-[#12151C] border border-white/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg bg-indigo-500/30 blur-[120px] pointer-events-none"></div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 tracking-tight">
            {current.ctaTitle}
          </h2>
          <p className="text-lg text-[#C5C7D0] mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
            {current.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/login"
              className="bg-white text-black px-8 py-4 rounded-full text-base font-bold hover:scale-105 transition-transform shadow-[0_0_35px_rgba(255,255,255,0.3)]"
            >
              {current.ctaBtn1}
            </Link>
            <Link
              href="/join"
              className="text-white hover:text-indigo-400 px-8 py-4 font-medium transition-colors border border-white/15 bg-white/5 rounded-full backdrop-blur"
            >
              {current.ctaBtn2}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#06080D] pt-16 pb-8 text-sm">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 text-[#C5C7D0]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
              <span className="font-bold text-lg">MegaClick</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              {current.footerDesc}
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">{current.product}</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  {current.navFeatures}
                </a>
              </li>
              <li>
                <a
                  href="#ai-demo"
                  className="hover:text-white transition-colors"
                >
                  {current.navAi}
                </a>
              </li>
              <li>
                <a
                  href="#ivr-demo"
                  className="hover:text-white transition-colors"
                >
                  {current.navPhone}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">{current.resources}</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/certificate"
                  className="hover:text-white transition-colors"
                >
                  {current.navCert}
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  {current.navFaq}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">{current.legal}</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#C5C7D0]/70">
          <p>{current.rights}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{' '}
            {current.status}
          </div>
        </div>
      </footer>
    </div>
  );
}
