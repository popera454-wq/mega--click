"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Mail, Lock, ArrowLeft, Loader2, KeyRound } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // בדיקה מהירה בטעינה אם המשתמש כבר מחובר
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  // התחברות / הרשמה / איפוס סיסמה
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage({ type: "success", text: "נשלח אליך מייל לאישור ההרשמה!" });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "הוראות לאיפוס הסיסמה נשלחו אל המייל שלך." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "אירעה שגיאה, אנא נסה שוב." });
    } finally {
      setLoading(false);
    }
  };

  // התחברות באמצעות Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-[#EDEDED] font-sans flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#12151C]/90 border border-white/15 backdrop-blur-2xl rounded-[28px] p-8 shadow-2xl relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">MegaClick</span>
          </Link>
          <p className="text-xs text-[#C5C7D0]">
            {mode === "login" && "התחבר לחשבון שלך כדי להמשיך"}
            {mode === "signup" && "צור חשבון חדש בחינם"}
            {mode === "forgot" && "איפוס סיסמה לחשבון"}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-3.5 rounded-xl text-xs mb-6 border ${message.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#C5C7D0] mb-1">דוא"ל</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3.5 top-3.5 text-[#C5C7D0]/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#181B24] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-[#C5C7D0]">סיסמה</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    שכחת סיסמה?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-[#C5C7D0]/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181B24] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" && "התחבר"}
            {mode === "signup" && "צור חשבון"}
            {mode === "forgot" && "שלח קישור לאיפוס"}
          </button>
        </form>

        {/* Divider */}
        {mode !== "forgot" && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#12151C] px-3 text-[11px] text-[#C5C7D0]/60 font-medium">או</span>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#181B24] hover:bg-[#202430] border border-white/10 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              המשך עם Google
            </button>
          </>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-8 text-center text-xs text-[#C5C7D0]">
          {mode === "login" && (
            <p>
              אין לך חשבוןעדיין?{" "}
              <button onClick={() => setMode("signup")} className="text-indigo-400 font-bold hover:underline">
                הרשם עכשיו
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              כבר יש לך חשבון?{" "}
              <button onClick={() => setMode("login")} className="text-indigo-400 font-bold hover:underline">
                התחבר
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-indigo-400 font-bold hover:underline flex items-center gap-1 mx-auto">
              <ArrowLeft className="w-3 h-3 transform rotate-180" /> חזרה להתוודעות
            </button>
          )}
        </div>

      </div>
    </div>
  );
}