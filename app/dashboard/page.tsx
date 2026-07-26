"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Zap,
  Search,
  Plus,
  Edit3,
  Copy,
  Play,
  Trash2,
  LogOut,
  User,
  Settings,
  X,
  Calendar,
  HelpCircle,
  Filter,
  CheckCircle2,
  KeyRound,
  Mail,
  Loader2,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  coverImage?: string;
  questionCount: number;
  updatedAt: string;
  tags: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth & User state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "recent" | "questions">("all");

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Profile Form state
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Mock Quizzes Data (יוחלף בהמשך בקריאות ל-Supabase DB)
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: "1",
      title: "חידון טריוויה כללי - חנוכה 2026",
      coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
      questionCount: 15,
      updatedAt: "2026-07-20",
      tags: ["חגים", "טריוויה", "בתי ספר"],
    },
    {
      id: "2",
      title: "אתגר מדע וחלל למתקדמים",
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      questionCount: 22,
      updatedAt: "2026-07-15",
      tags: ["מדע", "חלל"],
    },
    {
      id: "3",
      title: "משחק גיבוש לצוות - קיץ 2026",
      questionCount: 10,
      updatedAt: "2026-07-02",
      tags: ["גיבוש", "חברה"],
    },
  ]);

  // טעינת פרטי משתמש
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error || !currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setFullName(currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "");
      setLoading(false);
    };
    fetchUser();
  }, [router, supabase]);

  // התנתקות מלאה
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // יצירת חידון חדש
  const handleCreateQuiz = () => {
    const newId = Date.now().toString();
    router.push(`/editor/${newId}`);
  };

  // שכפול חידון
  const handleDuplicate = (quiz: Quiz) => {
    const duplicated: Quiz = {
      ...quiz,
      id: Date.now().toString(),
      title: `${quiz.title} (עותק)`,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setQuizzes([duplicated, ...quizzes]);
  };

  // מחיקת חידון
  const confirmDelete = () => {
    if (deleteTargetId) {
      setQuizzes(quizzes.filter((q) => q.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  // עדכון פרופיל
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      if (fullName !== user?.user_metadata?.full_name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        if (error) throw error;
      }

      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      setProfileMsg({ type: "success", text: "הפרטים עודכנו בהצלחה!" });
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "אירעה שגיאה בעדכון" });
    } finally {
      setSavingProfile(false);
    }
  };

  // סינון וחיפוש בזמן אמת
  const filteredQuizzes = quizzes
    .filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      if (filterBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (filterBy === "questions") return b.questionCount - a.questionCount;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-white" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const isGoogleUser = user?.app_metadata?.provider === "google";

  return (
    <div className="min-h-screen bg-[#090b10] text-[#EDEDED] font-sans relative overflow-x-hidden" dir="rtl">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* 1. תפריט עליון (Header & Navigation) */}
      <header className="sticky top-0 z-40 bg-[#090b10]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">MegaClick</span>
          </Link>

          {/* Smart Search */}
          <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-[#141822] border border-white/10 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition-colors">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש בזמן אמת לפי שם חידון או תגית..."
              className="bg-transparent text-sm text-white placeholder-white/40 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white text-xs">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 bg-[#141822] border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all"
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  {fullName[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-white/90 hidden sm:inline">{fullName}</span>
              <Settings className="w-4 h-4 text-white/40" />
            </button>

            <button
              onClick={handleLogout}
              title="התנתקות"
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">החידונים שלי</h1>
            <p className="text-xs text-white/50">נהל, ערוך והפעל את המשחקים שיצרת</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>מיון:</span>
              <select
                value={filterBy}
                onChange={(e: any) => setFilterBy(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#141822]">הכל</option>
                <option value="recent" className="bg-[#141822]">עודכן לאחרונה</option>
                <option value="questions" className="bg-[#141822]">לפי כמות שאלות</option>
              </select>
            </div>

            {/* 2. כפתור יצירת חידון חדש */}
            <button
              onClick={handleCreateQuiz}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>צור משחק חדש</span>
            </button>
          </div>
        </div>

        {/* Search bar for Mobile */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-2 bg-[#141822] border border-white/10 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש בזמן אמת..."
              className="bg-transparent text-sm text-white focus:outline-none w-full"
            />
          </div>
        </div>

        {/* 3. תצוגת החידונים (Quiz Cards Grid) */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-[#12151C]/60 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-bold text-white mb-2">לא נמצאו חידונים</h3>
            <p className="text-xs text-white/50 mb-6">לא מצאנו חידונים התואמים לחיפוש שלך, או שעדיין לא יצרת משחק ראשון.</p>
            <button
              onClick={handleCreateQuiz}
              className="bg-white text-black font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              צור את החידון הראשון שלך
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-[#12151C] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
              >
                {/* Cover Image */}
                <div className="h-40 bg-[#1A1E29] relative overflow-hidden flex items-center justify-center">
                  {quiz.coverImage ? (
                    <img
                      src={quiz.coverImage}
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Zap className="w-10 h-10 text-white/10 group-hover:text-indigo-400/30 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151C] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-indigo-400" />
                    {quiz.questionCount} שאלות
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {quiz.title}
                    </h3>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {quiz.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-white/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      עודכן: {quiz.updatedAt}
                    </span>
                  </div>

                  {/* 4 כפתורי פעולה מהירים */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => router.push(`/editor/${quiz.id}`)}
                      title="עריכה"
                      className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-white/80 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(quiz)}
                      title="שכפול"
                      className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-white/80 hover:text-purple-300 border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => router.push(`/host/${quiz.id}`)}
                      title="הפעלה"
                      className="flex items-center justify-center p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all"
                    >
                      <Play className="w-4 h-4 fill-green-400" />
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(quiz.id)}
                      title="מחיקה"
                      className="flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. מודאל פרופיל משתמש (User Profile Settings) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151C] border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-5 left-5 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">הגדרות פרופיל</h2>
                <p className="text-xs text-white/50">עדכן את הפרטים האישיים של החשבון</p>
              </div>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-xl text-xs mb-4 border ${profileMsg.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">שם מלא / שם משתמש</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#181B24] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">כתובת אימייל</label>
                <div className="relative opacity-60">
                  <Mail className="w-4 h-4 absolute right-3.5 top-3 text-white/40" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-[#181B24] border border-white/10 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-white cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  {isGoogleUser ? "יצירת סיסמה לחשבון" : "שינוי סיסמה"}
                </h4>

                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="סיסמה חדשה"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#181B24] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  שמור שינויים
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* מחיקת חידון - Modal האישור */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#12151C] border border-red-500/30 rounded-3xl p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">למחוק את החידון?</h3>
            <p className="text-xs text-white/50 mb-6">פעולה זו היא לצמיתות ולא ניתן יהיה לשחזר את המשחק.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-medium transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                כן, מחק
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}