"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  Zap,
  ArrowRight,
  Play,
  Settings,
  Plus,
  Trash2,
  Copy,
  Upload,
  Download,
  Sparkles,
  Database,
  HelpCircle,
  BarChart2,
  Image as ImageIcon,
  FileText,
  Video,
  Check,
  X,
  Share2,
  Users,
  Trophy,
  Sliders,
  Layers,
  Loader2,
  Link as LinkIcon,
  Wand2,
  Grid,
  MonitorPlay,
  Clock,
  Palette,
  Music
} from "lucide-react";

// טיפוסי הנתונים
export interface SlideOption {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface Slide {
  id: string;
  game_id?: string;
  title: string;
  slide_type: "trivia" | "poll" | "image_answer" | "text_slide" | "media_slide";
  options: SlideOption[];
  points: number;
  time_limit: number;
  media_before?: string;
  media_after?: string;
  question_image?: string;
  custom_bg?: string;
  media_config?: {
    videoUrl?: string;
    autoAdvanceSec?: number;
    textBody?: string;
  };
  multiple_answers?: boolean;
}

const supabase = createClient();

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameTitle, setGameTitle] = useState("חידון חדש");

  // Slides State
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);

  // Modals & Panels State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "design" | "flow" | "winners" | "tools" | "participants" | "teams" | "results">("general");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPublicBankOpen, setIsPublicBankOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCategory, setPublishCategory] = useState("כללי");

  // Media Picker Modal State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    type: "question_image" | "custom_bg" | "option_image" | "settings_bg" | "settings_sound" | "media_before" | "media_after" | "cover_image";
    optionId?: string;
    settingKey?: string;
  } | null>(null);
  const [mediaPickerTab, setMediaPickerTab] = useState<"upload" | "stock" | "youtube" | "ai">("upload");
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [aiImageLoading, setAiImageLoading] = useState(false);

  // AI Generator Modal State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSlideType, setAiSlideType] = useState<Slide["slide_type"]>("trivia");
  const [aiCount, setAiCount] = useState(3);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Game Settings State
  const [generalSettings, setGeneralSettings] = useState({
    title: "",
    cover_image: "",
    header_text: "",
  });
  const [designSettings, setDesignSettings] = useState({
    main_bg: "",
    question_bg: "",
    winners_bg: "",
    leaderboard_bg: "",
    bg_color: "#090b10",
    text_color: "#EDEDED",
    sounds: { global_bg: "", question_show: "", timer: "", correct_reveal: "", leaderboard: "", winners: "", join: "" }
  });
  const [flowSettings, setFlowSettings] = useState({
    allow_fix_answer: true,
    auto_show_answers: true,
    auto_start_timer: true,
    auto_show_correct: true,
    auto_next_slide_sec: 5,
    auto_media_display_sec: 5
  });
  const [leaderboardSettings, setLeaderboardSettings] = useState({
    winners_count: 3,
    leaderboard_count: 5,
    auto_show_leaderboard: true
  });

  // Teams & Participants State
  const [teams, setTeams] = useState<{ id?: string; name: string; color: string }[]>([]);
  const [participants, setParticipants] = useState<{ id?: string; full_name: string; phone: string; team_id?: string }[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantPhone, setNewParticipantPhone] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#6366f1");

  // Load Data
  useEffect(() => {
    let isMounted = true;

    const fetchGameData = async () => {
      setLoading(true);
      const { data: game, error: gameErr } = await supabase.from("games").select("*").eq("id", gameId).single();

      if (gameErr || !game) {
        router.push("/dashboard");
        return;
      }

      if (!isMounted) return;

      setGameTitle(game.title || "חידון ללא שם");
      setGeneralSettings(game.general_settings || { title: game.title, cover_image: game.cover_image || "", header_text: game.header_text || "" });
      if (game.design_settings) setDesignSettings(game.design_settings);
      if (game.flow_settings) setFlowSettings(game.flow_settings);
      if (game.leaderboard_settings) setLeaderboardSettings(game.leaderboard_settings);

      const { data: slidesData } = await supabase.from("slides").select("*").eq("game_id", gameId).order("created_at", { ascending: true });

      if (slidesData && slidesData.length > 0) {
        const loadedSlides: Slide[] = slidesData.map((s) => ({
          id: s.id,
          game_id: s.game_id,
          title: String(s.title || "שאלה חדשה"),
          slide_type: s.slide_type || "trivia",
          options: Array.isArray(s.options) ? s.options : [],
          points: s.points ?? 100,
          time_limit: s.time_limit ?? 20,
          media_before: s.media_before || "",
          media_after: s.media_after || "",
          question_image: s.question_image || "",
          custom_bg: s.custom_bg || "",
          media_config: s.media_config || {},
          multiple_answers: s.multiple_answers || false
        }));
        setSlides(loadedSlides);
        setActiveSlideId(loadedSlides[0].id);
      } else {
        await createNewSlide("trivia");
      }

      const { data: teamsData } = await supabase.from("teams").select("*").eq("game_id", gameId);
      if (teamsData && isMounted) setTeams(teamsData);

      const { data: participantsData } = await supabase.from("participants").select("*").eq("game_id", gameId);
      if (participantsData && isMounted) setParticipants(participantsData);

      setLoading(false);
    };

    fetchGameData();
    return () => { isMounted = false; };
  }, [gameId, router]);

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  const saveAllChanges = async (updatedSlides = slides, updatedTitle = gameTitle) => {
    setSaving(true);
    try {
      await supabase.from("games").update({
        title: updatedTitle,
        header_text: generalSettings.header_text,
        general_settings: generalSettings,
        design_settings: designSettings,
        flow_settings: flowSettings,
        leaderboard_settings: leaderboardSettings,
        updated_at: new Date().toISOString(),
      }).eq("id", gameId);

      if (updatedSlides.length > 0) {
        const slidesToUpsert = updatedSlides.map((slide) => ({
          id: slide.id,
          game_id: gameId,
          title: slide.title,
          slide_type: slide.slide_type,
          options: slide.options,
          points: slide.points,
          time_limit: slide.time_limit,
          media_before: slide.media_before,
          media_after: slide.media_after,
          question_image: slide.question_image,
          custom_bg: slide.custom_bg,
          media_config: slide.media_config,
          multiple_answers: slide.multiple_answers
        }));
        await supabase.from("slides").upsert(slidesToUpsert);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const createNewSlide = async (type: Slide["slide_type"] = "trivia") => {
    const newSlideId = crypto.randomUUID();
    const newSlide: Slide = {
      id: newSlideId,
      game_id: gameId,
      title: "שאלה חדשה",
      slide_type: type,
      options: [
        { id: "1", text: "תשובה 1", isCorrect: true },
        { id: "2", text: "תשובה 2", isCorrect: false },
        { id: "3", text: "תשובה 3", isCorrect: false },
        { id: "4", text: "תשובה 4", isCorrect: false },
      ],
      points: 100,
      time_limit: 20,
    };
    const nextSlides = [...slides, newSlide];
    setSlides(nextSlides);
    setActiveSlideId(newSlideId);
    await saveAllChanges(nextSlides);
  };

  const updateActiveSlide = async (field: keyof Slide, value: any) => {
    if (!activeSlideId) return;
    const nextSlides = slides.map((s) => (s.id === activeSlideId ? { ...s, [field]: value } : s));
    setSlides(nextSlides);
    await saveAllChanges(nextSlides);
  };

  const duplicateSlide = async (slide: Slide) => {
    const newId = crypto.randomUUID();
    const dupSlide = { ...slide, id: newId, title: `${slide.title} (עותק)` };
    const nextSlides = [...slides, dupSlide];
    setSlides(nextSlides);
    setActiveSlideId(newId);
    await saveAllChanges(nextSlides);
  };

  const deleteSlide = async (slideId: string) => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((s) => s.id !== slideId);
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0].id);
    await supabase.from("slides").delete().eq("id", slideId);
  };

  // Quick Tools Actions
  const applySettingToAll = (field: "time_limit" | "points", value: number) => {
    if (confirm(`האם אתה בטוח שברצונך להחיל ${value} על כל השאלות?`)) {
      const nextSlides = slides.map(s => ({ ...s, [field]: value }));
      setSlides(nextSlides);
      saveAllChanges(nextSlides);
    }
  };

  const downloadExcelTemplate = () => {
    const templateData = [{
      "נוסח השאלה": "מהי בירת צרפת?",
      "סוג שקופית": "trivia",
      "תשובה 1": "פריז", "נכונה 1 (כן/לא)": "כן",
      "תשובה 2": "לונדון", "נכונה 2 (כן/לא)": "לא",
      "תשובה 3": "רומא", "נכונה 3 (כן/לא)": "לא",
      "תשובה 4": "ברלין", "נכונה 4 (כן/לא)": "לא",
      "זמן מענה (שניות)": 20,
      "ניקוד": 100,
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "תבנית שאלות");
    XLSX.writeFile(workbook, "MegaClick_Quiz_Template.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (!buffer) return;
      const wb = XLSX.read(buffer, { type: "array" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      const importedSlides: Slide[] = data.map((row, index) => {
        const opts: SlideOption[] = [];
        if (row["תשובה 1"]) opts.push({ id: "1", text: String(row["תשובה 1"]), isCorrect: String(row["נכונה 1 (כן/לא)"]).trim() === "כן" });
        if (row["תשובה 2"]) opts.push({ id: "2", text: String(row["תשובה 2"]), isCorrect: String(row["נכונה 2 (כן/לא)"]).trim() === "כן" });
        if (row["תשובה 3"]) opts.push({ id: "3", text: String(row["תשובה 3"]), isCorrect: String(row["נכונה 3 (כן/לא)"]).trim() === "כן" });
        if (row["תשובה 4"]) opts.push({ id: "4", text: String(row["תשובה 4"]), isCorrect: String(row["נכונה 4 (כן/לא)"]).trim() === "כן" });

        return {
          id: crypto.randomUUID(),
          game_id: gameId,
          title: String(row["נוסח השאלה"] || `שאלה מיובאת ${index + 1}`),
          slide_type: (row["סוג שקופית"] as any) || "trivia",
          options: opts.length > 0 ? opts : [{ id: "1", text: "תשובה 1", isCorrect: true }],
          points: Number(row["ניקוד"]) || 100,
          time_limit: Number(row["זמן מענה (שניות)"]) || 20,
        };
      });

      if (importedSlides.length > 0) {
        const nextSlides = [...slides, ...importedSlides];
        setSlides(nextSlides);
        setActiveSlideId(importedSlides[0].id);
        await saveAllChanges(nextSlides);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Quiz Export - Game ID: ${gameId}`, 20, 20);
    let y = 35;
    slides.forEach((slide, index) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text(`${index + 1}. [${slide.slide_type}] ${slide.title}`, 20, y);
      y += 8;
      slide.options.forEach((opt, oIdx) => {
        doc.setFontSize(10);
        doc.text(`   ${oIdx + 1}) ${opt.text} ${opt.isCorrect && slide.slide_type !== 'poll' ? "(Correct)" : ""}`, 25, y);
        y += 6;
      });
      y += 6;
    });
    doc.save(`Quiz_${gameId}.pdf`);
  };

  const uploadSlideToPublicBank = async () => {
    if (!activeSlide) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("public_question_bank").insert([{
      user_id: user?.id,
      category: publishCategory,
      slide_type: activeSlide.slide_type,
      question_data: activeSlide,
    }]);
    setIsPublishModalOpen(false);
    alert("השאלה הועלתה בהצלחה למאגר הציבורי!");
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, slideType: aiSlideType, count: aiCount }),
      });
      const data = await res.json();
      if (data.success && data.slides) {
        const createdSlides: Slide[] = data.slides.map((s: any) => ({
          id: crypto.randomUUID(),
          game_id: gameId,
          title: String(s.title || "שאלה מחוללת"),
          slide_type: s.type || aiSlideType,
          options: s.options || [],
          points: s.points || 100,
          time_limit: s.timeLimit || 20,
        }));
        const nextSlides = [...slides, ...createdSlides];
        setSlides(nextSlides);
        setActiveSlideId(createdSlides[0].id);
        await saveAllChanges(nextSlides);
        setIsAiModalOpen(false);
        setAiPrompt("");
      }
    } catch (err) { console.error(err); } 
    finally { setAiGenerating(false); }
  };

  const handleAiAssistSlide = async (action: "rephrase" | "generate_wrong" | "generate_text") => {
    if (!activeSlide) return;
    setSaving(true);
    setTimeout(async () => {
      let updatedSlide = { ...activeSlide };
      if (action === "rephrase") {
        updatedSlide.title = `${activeSlide.title} (מנוסח מחדש ע"י AI)`;
      } else if (action === "generate_wrong") {
        updatedSlide.options = [
          ...activeSlide.options,
          { id: crypto.randomUUID(), text: "תשובה מוטעית (AI)", isCorrect: false },
          { id: crypto.randomUUID(), text: "עוד טעות (AI)", isCorrect: false },
        ];
      } else if (action === "generate_text") {
        updatedSlide.media_config = { ...activeSlide.media_config, textBody: "טקסט זה חולל אוטומטית על ידי העוזר החכם בהתאם לכותרת השקופית." };
      }
      
      const nextSlides = slides.map((s) => (s.id === activeSlideId ? updatedSlide : s));
      setSlides(nextSlides);
      await saveAllChanges(nextSlides);
      setSaving(false);
    }, 1000);
  };

  const handleSelectMedia = async (url: string) => {
    if (!mediaPickerTarget) return;

    let updatedSlide = activeSlide ? { ...activeSlide } : null;
    let nextSlides = [...slides];

    if (mediaPickerTarget.type === "question_image" && updatedSlide) {
      updatedSlide.question_image = url;
    } else if (mediaPickerTarget.type === "custom_bg" && updatedSlide) {
      updatedSlide.custom_bg = url;
    } else if (mediaPickerTarget.type === "media_before" && updatedSlide) {
      updatedSlide.media_before = url;
    } else if (mediaPickerTarget.type === "media_after" && updatedSlide) {
      updatedSlide.media_after = url;
    } else if (mediaPickerTarget.type === "cover_image") {
      const newGen = { ...generalSettings, cover_image: url };
      setGeneralSettings(newGen);
      setMediaPickerTarget(null);
      await saveAllChanges(slides, gameTitle);
      return;
    } else if (mediaPickerTarget.type === "option_image" && mediaPickerTarget.optionId && updatedSlide) {
      updatedSlide.options = updatedSlide.options.map((o) => (o.id === mediaPickerTarget.optionId ? { ...o, imageUrl: url } : o));
    } else if (mediaPickerTarget.type === "settings_bg" && mediaPickerTarget.settingKey) {
      const newDesign = { ...designSettings, [mediaPickerTarget.settingKey]: url };
      setDesignSettings(newDesign);
      setMediaPickerTarget(null);
      await saveAllChanges(slides, gameTitle);
      return;
    } else if (mediaPickerTarget.type === "settings_sound" && mediaPickerTarget.settingKey) {
      const newDesign = { ...designSettings, sounds: { ...designSettings.sounds, [mediaPickerTarget.settingKey]: url } };
      setDesignSettings(newDesign);
      setMediaPickerTarget(null);
      await saveAllChanges(slides, gameTitle);
      return;
    }

    if (updatedSlide && activeSlideId) {
      nextSlides = slides.map((s) => (s.id === activeSlideId ? updatedSlide! : s));
      setSlides(nextSlides);
      await saveAllChanges(nextSlides);
    }

    setMediaPickerTarget(null);
  };

  const handleGenerateAiImage = () => {
    if (!aiImagePrompt) return;
    setAiImageLoading(true);
    const encodedPrompt = encodeURIComponent(aiImagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;
    setTimeout(() => {
      handleSelectMedia(imageUrl);
      setAiImageLoading(false);
      setAiImagePrompt("");
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-white" dir="rtl">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090b10] text-[#EDEDED] font-sans relative flex flex-col h-screen overflow-hidden" dir="rtl">
      {/* 1. הסרגל העליון (Top Bar) */}
      <header className="h-16 bg-[#0d1017] border-b border-white/10 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs transition-all text-white/80 hover:text-white">
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לדשבורד</span>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => { setGameTitle(e.target.value); setGeneralSettings({ ...generalSettings, title: e.target.value }); }}
              onBlur={() => saveAllChanges(slides, gameTitle)}
              className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-indigo-500 px-1 py-0.5"
            />
            {saving && <span className="text-[10px] text-white/40 animate-pulse">שומר...</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>הגדרות</span>
          </button>
          <button onClick={() => router.push(`/preview/${gameId}`)} className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-4 py-2 rounded-xl text-xs transition-all">
            <MonitorPlay className="w-4 h-4" />
            <span>תצוגה מקדימה</span>
          </button>
          <button onClick={() => router.push(`/host/${gameId}`)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>הפעלת משחק בלייב</span>
          </button>
        </div>
      </header>

      {/* 2. חלק א' של העריכה (Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-[#0d1017]/90 border-l border-white/10 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-white/10 grid grid-cols-3 gap-2 bg-[#12151c]">
            <label className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-center transition-all">
              <Upload className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] font-medium text-white/80">ייבוא Excel</span>
              <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
            </label>
            <button onClick={() => setIsPublicBankOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-all">
              <Database className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-[10px] font-medium text-white/80">משיכה ממאגר</span>
            </button>
            <button onClick={() => setIsAiModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-center transition-all group">
              <Sparkles className="w-4 h-4 text-purple-400 mb-1 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold text-purple-300">מחולל AI</span>
            </button>
          </div>

          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>שקופיות ({slides.length})</span>
            <button onClick={downloadExcelTemplate} className="text-emerald-400 hover:underline flex items-center gap-1">
              <Download className="w-3 h-3" /> תבנית XL
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {slides.map((slide, index) => {
              const isActive = slide.id === activeSlideId;
              return (
                <div key={slide.id} onClick={() => setActiveSlideId(slide.id)} className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isActive ? "bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10" : "bg-[#141822] border-white/5 hover:border-white/20"}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">{index + 1}</span>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold mb-0.5 uppercase">
                        {slide.slide_type === "trivia" && <HelpCircle className="w-3 h-3" />}
                        {slide.slide_type === "poll" && <BarChart2 className="w-3 h-3" />}
                        {slide.slide_type === "image_answer" && <ImageIcon className="w-3 h-3" />}
                        {slide.slide_type === "text_slide" && <FileText className="w-3 h-3" />}
                        {slide.slide_type === "media_slide" && <Video className="w-3 h-3" />}
                        <span>{slide.slide_type}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-[140px]">{slide.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setActiveSlideId(slide.id); setIsPublishModalOpen(true); }} title="העלאה למאגר" className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-indigo-400">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateSlide(slide); }} title="שכפול" className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-purple-400">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {slides.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }} title="מחיקה" className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/10 bg-[#0d1017]">
            <button onClick={() => createNewSlide(activeSlide?.slide_type || "trivia")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span>הוסף שקופית חדשה</span>
            </button>
          </div>
        </aside>

        {/* 3. חלק ב' של העריכה: עורך השקופיות (Main Canvas) */}
        <main className="flex-1 bg-[#090b10] flex flex-col overflow-y-auto p-6 relative">
          <div className="max-w-4xl mx-auto w-full mb-6 bg-[#12151c] border border-white/10 p-1.5 rounded-2xl grid grid-cols-5 gap-1.5 shadow-xl">
            {[
              { id: "trivia", label: "טריוויה", icon: HelpCircle },
              { id: "poll", label: "סקר", icon: BarChart2 },
              { id: "image_answer", label: "תשובה בתמונה", icon: ImageIcon },
              { id: "text_slide", label: "שקופית טקסט", icon: FileText },
              { id: "media_slide", label: "שקופית מדיה", icon: Video },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = activeSlide?.slide_type === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => updateActiveSlide("slide_type", st.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${isSelected ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{st.label}</span>
                </button>
              );
            })}
          </div>

          {activeSlide && (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* כרטיסייה ראשית - תוכן השאלה */}
              <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white/70">
                      {activeSlide.slide_type === 'text_slide' ? 'שם השקופית' : 'נוסח השאלה'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAiAssistSlide("rephrase")} className="flex items-center gap-1.5 text-[11px] bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-lg transition-all">
                        <Sparkles className="w-3 h-3" />
                        <span>נסח מחדש ב-AI</span>
                      </button>
                      {activeSlide.slide_type === "trivia" && (
                        <button onClick={() => handleAiAssistSlide("generate_wrong")} className="flex items-center gap-1.5 text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg transition-all">
                          <Wand2 className="w-3 h-3" />
                          <span>הצע תשובות מוטעות</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => updateActiveSlide("title", e.target.value)}
                    placeholder="הכנס את הטקסט כאן..."
                    className="w-full bg-[#181d29] border border-white/10 rounded-2xl p-4 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {activeSlide.slide_type === "text_slide" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-white/70">תוכן השקופית (הסברים)</label>
                      <button onClick={() => handleAiAssistSlide("generate_text")} className="flex items-center gap-1.5 text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg">
                        <Wand2 className="w-3 h-3" /> עזור לי לנסח
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={activeSlide.media_config?.textBody || ""}
                      onChange={(e) => updateActiveSlide("media_config", { ...activeSlide.media_config, textBody: e.target.value })}
                      placeholder="הכנס כאן תוכן מפורט..."
                      className="w-full bg-[#181d29] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {activeSlide.slide_type === "media_slide" && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-white/70">קובץ / קישור מדיה</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={activeSlide.media_config?.videoUrl || ""}
                        onChange={(e) => updateActiveSlide("media_config", { ...activeSlide.media_config, videoUrl: e.target.value })}
                        placeholder="הדבק קישור YouTube או בחר מדיה..."
                        className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                      <button onClick={() => setMediaPickerTarget({ type: "question_image" })} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                        בחר מדיה
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">השהייה לאחר סרטון / זמן תצוגת תמונה (בשניות)</label>
                      <input 
                        type="number" 
                        value={activeSlide.media_config?.autoAdvanceSec || 5} 
                        onChange={(e) => updateActiveSlide("media_config", { ...activeSlide.media_config, autoAdvanceSec: Number(e.target.value) })}
                        className="w-full md:w-1/3 bg-[#181d29] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {["trivia", "poll", "image_answer"].includes(activeSlide.slide_type) && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-white/70">
                        {activeSlide.slide_type === "poll" ? "אפשרויות הצבעה (ללא נכון/לא נכון)" : "תשובות המשחק"}
                      </label>
                      {activeSlide.slide_type === "trivia" && (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                          <input type="checkbox" checked={activeSlide.multiple_answers || false} onChange={(e) => updateActiveSlide("multiple_answers", e.target.checked)} className="rounded border-white/20 bg-[#181d29] text-indigo-500 focus:ring-0" />
                          <span>תשובות מרובות נכונות</span>
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeSlide.options.map((option, index) => {
                        const bgColors = ["bg-red-500/10 border-red-500/30", "bg-blue-500/10 border-blue-500/30", "bg-amber-500/10 border-amber-500/30", "bg-emerald-500/10 border-emerald-500/30"];
                        return (
                          <div key={option.id} className={`p-3 rounded-2xl border flex items-center gap-3 relative ${bgColors[index % 4]}`}>
                            {activeSlide.slide_type !== "poll" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const isMultiple = activeSlide.multiple_answers;
                                  const opts = activeSlide.options.map((o) => {
                                    if (o.id === option.id) return { ...o, isCorrect: !o.isCorrect };
                                    return isMultiple ? o : { ...o, isCorrect: false };
                                  });
                                  updateActiveSlide("options", opts);
                                }}
                                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${option.isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white/10 hover:bg-white/20 text-white/40"}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {activeSlide.slide_type === "image_answer" ? (
                              <div className="flex-1 flex items-center gap-2">
                                {option.imageUrl ? (
                                  <img src={option.imageUrl} alt="תשובה" className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/40"><ImageIcon className="w-5 h-5" /></div>
                                )}
                                <button onClick={() => setMediaPickerTarget({ type: "option_image", optionId: option.id })} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg">
                                  {option.imageUrl ? "החלף תמונה" : "בחר תמונה"}
                                </button>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const opts = activeSlide.options.map((o) => o.id === option.id ? { ...o, text: e.target.value } : o);
                                  updateActiveSlide("options", opts);
                                }}
                                placeholder={`תשובה ${index + 1}...`}
                                className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            )}

                            {activeSlide.options.length > 2 && (
                              <button onClick={() => { updateActiveSlide("options", activeSlide.options.filter((o) => o.id !== option.id)); }} className="text-white/40 hover:text-red-400 p-1 shrink-0">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {activeSlide.options.length < 6 && (
                      <button onClick={() => { updateActiveSlide("options", [...activeSlide.options, { id: crypto.randomUUID(), text: `תשובה ${activeSlide.options.length + 1}`, isCorrect: false }]); }} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> <span>הוסף תשובה נוספת</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeSlide.slide_type !== "media_slide" && (
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        {activeSlide.slide_type === 'text_slide' ? 'זמן תצוגה (שניות)' : 'זמן מענה (שניות)'}
                      </label>
                      <select value={activeSlide.time_limit} onChange={(e) => updateActiveSlide("time_limit", Number(e.target.value))} className="w-full bg-[#181d29] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer">
                        {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((t) => (
                          <option key={t} value={t} className="bg-[#12151c]">{t} שניות</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {["trivia", "image_answer"].includes(activeSlide.slide_type) && (
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">ניקוד לשאלה זו</label>
                      <select value={activeSlide.points} onChange={(e) => updateActiveSlide("points", Number(e.target.value))} className="w-full bg-[#181d29] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer">
                        {[0, 50, 100, 200, 500, 1000].map((p) => (
                          <option key={p} value={p} className="bg-[#12151c]">{p} נקודות</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeSlide.slide_type !== "media_slide" && (
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">תמונת שאלה מלווה</label>
                      <button onClick={() => setMediaPickerTarget({ type: "question_image" })} className="w-full bg-[#181d29] border border-white/10 hover:border-white/20 text-white/80 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-between">
                        <span className="truncate">{activeSlide.question_image ? "תמונה נבחרה" : "בחר תמונה"}</span>
                        <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* כרטיסייה משנית - מדיה ורקעים */}
              <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  הגדרות מדיה ורקע לשקופית
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">רקע ייחודי לשקופית</label>
                    <button onClick={() => setMediaPickerTarget({ type: "custom_bg" })} className="w-full bg-[#181d29] border border-white/10 text-white/80 py-2 px-3 rounded-xl text-xs font-medium flex justify-between">
                      <span>{activeSlide.custom_bg ? "רקע נבחר" : "ללא (ברירת מחדל)"}</span>
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">מדיה לפני השאלה</label>
                    <button onClick={() => setMediaPickerTarget({ type: "media_before" })} className="w-full bg-[#181d29] border border-white/10 text-white/80 py-2 px-3 rounded-xl text-xs font-medium flex justify-between">
                      <span>{activeSlide.media_before ? "מדיה נבחרה" : "הוסף מדיה מקדימה"}</span>
                      <Video className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">מדיה אחרי השאלה</label>
                    <button onClick={() => setMediaPickerTarget({ type: "media_after" })} className="w-full bg-[#181d29] border border-white/10 text-white/80 py-2 px-3 rounded-xl text-xs font-medium flex justify-between">
                      <span>{activeSlide.media_after ? "מדיה נבחרה" : "הוסף מדיה מסכמת"}</span>
                      <Video className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* פאנל ההגדרות (Settings Panel) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-[#12151c] border border-white/15 rounded-3xl flex overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 left-4 text-white/40 hover:text-white z-10"><X className="w-5 h-5" /></button>

            <div className="w-64 bg-[#0d1017] border-l border-white/10 p-4 space-y-1 shrink-0 overflow-y-auto">
              <h3 className="text-sm font-bold text-white mb-4 px-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>הגדרות החידון</span>
              </h3>
              {[
                { id: "general", label: "1. כללי", icon: Sliders },
                { id: "design", label: "2. עיצוב, צלילים ומדיה", icon: Palette },
                { id: "flow", label: "3. מהלך המשחק", icon: Layers },
                { id: "winners", label: "4. זוכים ומובילים", icon: Trophy },
                { id: "tools", label: "5. כלים מהירים", icon: Wand2 },
                { id: "participants", label: "6. משתתפים/XL", icon: Users },
                { id: "teams", label: "7. יצירת קבוצות", icon: Grid },
                { id: "results", label: "8. תוצאות והיסטוריה", icon: BarChart2 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setSettingsTab(tab.id as any)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${settingsTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                    <Icon className="w-4 h-4" /> <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-[#090b10]">
              {settingsTab === "general" && (
                <div className="space-y-6 max-w-2xl">
                  <h4 className="text-lg font-bold text-white mb-2">הגדרות כלליות</h4>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">שם החידון</label>
                    <input type="text" value={generalSettings.title} onChange={(e) => setGeneralSettings({ ...generalSettings, title: e.target.value })} className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">כותרת גלובלית (מופיעה למעלה במהלך המשחק)</label>
                    <input type="text" value={generalSettings.header_text} onChange={(e) => setGeneralSettings({ ...generalSettings, header_text: e.target.value })} placeholder="לדוגמה: אירוע חברה 2026" className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">תמונת נושא / סמל לחידון</label>
                    <button onClick={() => setMediaPickerTarget({ type: "cover_image" })} className="w-full h-32 bg-[#181d29] border border-dashed border-white/20 hover:border-indigo-500 rounded-xl flex items-center justify-center text-white/50 transition-all">
                       {generalSettings.cover_image ? <img src={generalSettings.cover_image} className="h-full w-full object-cover rounded-xl opacity-80" alt="cover"/> : <span>לחץ לבחירת תמונה ממאגר/העלאה</span>}
                    </button>
                  </div>
                </div>
              )}

              {settingsTab === "design" && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-base font-bold text-white mb-4">א. צבעים ורקעים</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#181d29] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                         <span className="text-xs text-white/80">צבע רקע יסוד</span>
                         <input type="color" value={designSettings.bg_color} onChange={e => setDesignSettings({...designSettings, bg_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                      <div className="bg-[#181d29] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                         <span className="text-xs text-white/80">צבע טקסט ראשי</span>
                         <input type="color" value={designSettings.text_color} onChange={e => setDesignSettings({...designSettings, text_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: "main_bg", label: "רקע מסך ראשי" },
                        { key: "question_bg", label: "רקע מסך שאלה" },
                        { key: "winners_bg", label: "רקע מסך זוכים" },
                        { key: "leaderboard_bg", label: "רקע לוח תוצאות" },
                      ].map((item) => (
                        <div key={item.key} className="bg-[#181d29] p-3 rounded-xl border border-white/5 text-center">
                          <label className="block text-[11px] font-medium text-white/80 mb-2">{item.label}</label>
                          <button onClick={() => setMediaPickerTarget({ type: "settings_bg", settingKey: item.key })} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 py-2 rounded-lg truncate px-1">
                            {(designSettings as any)[item.key] ? "החלף" : "בחר"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white mb-4">ב. צלילים ומוזיקה</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: "global_bg", label: "צליל רקע גלובלי" },
                        { key: "question_show", label: "צליל הצגת שאלה" },
                        { key: "timer", label: "צליל טיימר" },
                        { key: "correct_reveal", label: "צליל חשיפת תשובה" },
                        { key: "leaderboard", label: "צליל לוח תוצאות" },
                        { key: "winners", label: "צליל זוכים" },
                        { key: "join", label: "צליל התחברות שחקן" },
                      ].map((item) => (
                        <div key={item.key} className="bg-[#181d29] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Music className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[11px] text-white/80">{item.label}</span>
                          </div>
                          <button onClick={() => setMediaPickerTarget({ type: "settings_sound", settingKey: item.key })} className="text-[10px] bg-white/10 px-2 py-1 rounded">
                             {(designSettings.sounds as any)[item.key] ? "נבחר" : "בחר"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "flow" && (
                <div className="space-y-6 max-w-2xl">
                  <h4 className="text-lg font-bold text-white mb-2">אוטומציות ומהלך המשחק</h4>
                  <div className="space-y-3">
                    {[
                      { key: "allow_fix_answer", label: "תיקון תשובה (כל עוד הטיימר רץ)" },
                      { key: "auto_show_answers", label: "תצוגת תשובות אוטומטית (לאחר השאלה)" },
                      { key: "auto_start_timer", label: "התחלת טיימר אוטומטית (לאחר הצגת תשובות)" },
                      { key: "auto_show_correct", label: "הצגת התשובה הנכונה אוטומטית (בסיום טיימר)" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 bg-[#181d29] p-4 rounded-xl cursor-pointer border border-white/5">
                        <input type="checkbox" checked={(flowSettings as any)[item.key]} onChange={(e) => setFlowSettings({ ...flowSettings, [item.key]: e.target.checked })} className="rounded border-white/20 bg-black text-indigo-500 focus:ring-0 w-4 h-4" />
                        <span className="text-sm text-white/90">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#181d29] p-4 rounded-xl border border-white/5">
                      <label className="block text-xs font-medium text-white/70 mb-2">מעבר אוטומטי לשקופית הבאה (שניות)</label>
                      <input type="number" value={flowSettings.auto_next_slide_sec} onChange={(e) => setFlowSettings({ ...flowSettings, auto_next_slide_sec: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" />
                    </div>
                    <div className="bg-[#181d29] p-4 rounded-xl border border-white/5">
                      <label className="block text-xs font-medium text-white/70 mb-2">זמן תצוגת מדיה אוטומטי (שניות)</label>
                      <input type="number" value={flowSettings.auto_media_display_sec} onChange={(e) => setFlowSettings({ ...flowSettings, auto_media_display_sec: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "winners" && (
                <div className="space-y-6 max-w-xl">
                  <h4 className="text-lg font-bold text-white mb-2">הגדרות זוכים ולוח תוצאות</h4>
                  <div className="bg-[#181d29] p-4 rounded-xl border border-white/5 space-y-4">
                     <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input type="checkbox" checked={leaderboardSettings.auto_show_leaderboard} onChange={(e) => setLeaderboardSettings({ ...leaderboardSettings, auto_show_leaderboard: e.target.checked })} className="rounded border-white/20 bg-black text-indigo-500 w-4 h-4" />
                        <span className="text-sm text-white/90">הצגת לוח תוצאות אוטומטית בתום כל שאלה</span>
                      </label>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-2">מספר זוכים להצגה בסיום (מסך מנצחים)</label>
                      <input type="number" min={1} max={10} value={leaderboardSettings.winners_count} onChange={(e) => setLeaderboardSettings({ ...leaderboardSettings, winners_count: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-2">כמות מובילים בטבלה במהלך המשחק</label>
                      <input type="number" min={3} max={20} value={leaderboardSettings.leaderboard_count} onChange={(e) => setLeaderboardSettings({ ...leaderboardSettings, leaderboard_count: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "tools" && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-white mb-2">כלים מהירים</h4>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <button onClick={() => { const shuffled = [...slides].sort(() => Math.random() - 0.5); setSlides(shuffled); saveAllChanges(shuffled); }} className="bg-[#181d29] hover:bg-[#202636] border border-white/10 p-5 rounded-xl text-right text-sm font-bold text-white flex flex-col gap-3 transition-colors">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <span>ערבוב אקראי של סדר השאלות</span>
                    </button>
                    <button onClick={exportToPDF} className="bg-[#181d29] hover:bg-[#202636] border border-white/10 p-5 rounded-xl text-right text-sm font-bold text-white flex flex-col gap-3 transition-colors">
                      <Download className="w-6 h-6 text-emerald-400" />
                      <span>הורדת כל השאלות ל-PDF</span>
                    </button>
                  </div>
                  
                  <h5 className="text-sm font-bold text-white mt-8 mb-4">החלת הגדרות על כל השקופיות</h5>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <div className="bg-[#181d29] border border-white/10 p-4 rounded-xl flex gap-3 items-end">
                       <div className="flex-1">
                          <label className="block text-xs text-white/70 mb-1">זמן מענה אחיד לכולם</label>
                          <select id="quick-time" className="w-full bg-black/40 rounded p-2 text-xs text-white border border-white/10">
                            {[5,10,15,20,30,45,60,90].map(t => <option key={t} value={t}>{t} שניות</option>)}
                          </select>
                       </div>
                       <button onClick={() => { const val = (document.getElementById('quick-time') as HTMLSelectElement).value; applySettingToAll('time_limit', Number(val)); }} className="bg-indigo-600 text-white px-3 py-2 rounded text-xs font-bold">החל על הכל</button>
                    </div>
                    <div className="bg-[#181d29] border border-white/10 p-4 rounded-xl flex gap-3 items-end">
                       <div className="flex-1">
                          <label className="block text-xs text-white/70 mb-1">ניקוד אחיד לכולם</label>
                          <select id="quick-points" className="w-full bg-black/40 rounded p-2 text-xs text-white border border-white/10">
                            {[0,50,100,200,500,1000].map(p => <option key={p} value={p}>{p} נקודות</option>)}
                          </select>
                       </div>
                       <button onClick={() => { const val = (document.getElementById('quick-points') as HTMLSelectElement).value; applySettingToAll('points', Number(val)); }} className="bg-indigo-600 text-white px-3 py-2 rounded text-xs font-bold">החל על הכל</button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "participants" && (
                <div className="space-y-6 max-w-3xl">
                  <h4 className="text-lg font-bold text-white mb-2 flex justify-between items-center">
                    <span>משתתפים (הרשמה מראש)</span>
                    <div className="flex gap-2">
                       <button className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1"><Download className="w-3 h-3"/> תבנית XL</button>
                       <label className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"><Upload className="w-3 h-3"/> העלאת קובץ <input type="file" className="hidden" /></label>
                    </div>
                  </h4>
                  <div className="flex gap-2 bg-[#181d29] p-3 rounded-xl border border-white/10">
                    <input type="text" placeholder="שם מלא" value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                    <input type="text" placeholder="טלפון" value={newParticipantPhone} onChange={(e) => setNewParticipantPhone(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                    <button onClick={async () => {
                        if (!newParticipantName) return;
                        const { data } = await supabase.from("participants").insert([{ game_id: gameId, full_name: newParticipantName, phone: newParticipantPhone }]).select().single();
                        if (data) setParticipants([...participants, data]);
                        setNewParticipantName(""); setNewParticipantPhone("");
                      }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold">הוסף ידנית</button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-[#181d29] p-3 rounded-xl border border-white/5 text-sm">
                        <span>{p.full_name} <span className="text-white/40 ml-2">({p.phone || "ללא טלפון"})</span></span>
                        <button onClick={async () => { await supabase.from("participants").delete().eq("id", p.id); setParticipants(participants.filter((item) => item.id !== p.id)); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === "teams" && (
                <div className="space-y-6 max-w-2xl">
                  <h4 className="text-lg font-bold text-white mb-2">ניהול קבוצות משחק</h4>
                  <div className="flex gap-2 bg-[#181d29] p-3 rounded-xl border border-white/10">
                    <input type="text" placeholder="שם הקבוצה (למשל: צוות צפון)" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                    <input type="color" value={newTeamColor} onChange={(e) => setNewTeamColor(e.target.value)} className="w-12 h-10 rounded border-none cursor-pointer bg-transparent" />
                    <button onClick={async () => {
                        if (!newTeamName) return;
                        const { data } = await supabase.from("teams").insert([{ game_id: gameId, name: newTeamName, color: newTeamColor }]).select().single();
                        if (data) setTeams([...teams, data]);
                        setNewTeamName("");
                      }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">צור קבוצה</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {teams.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-[#181d29] border border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.color }} />
                          <span className="text-sm font-bold text-white">{t.name}</span>
                        </div>
                        <button onClick={async () => { await supabase.from("teams").delete().eq("id", t.id); setTeams(teams.filter((item) => item.id !== t.id)); }} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === "results" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white mb-2">תוצאות והיסטוריית הרצות</h4>
                  <div className="bg-[#181d29] border border-white/5 rounded-xl p-8 text-center">
                     <BarChart2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                     <p className="text-sm text-white/50">כאן יוצגו הדוחות והמדרגים של משחקים שהועברו בלייב על בסיס חידון זה.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-6">
               <button onClick={() => { saveAllChanges(); setIsSettingsOpen(false); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-transform active:scale-95">
                 שמור הגדרות והמשך
               </button>
            </div>
          </div>
        </div>
      )}

      {/* מודל העלאה למאגר הציבורי */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#12151c] border border-white/15 rounded-3xl p-6 relative shadow-2xl">
             <button onClick={() => setIsPublishModalOpen(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
             <h3 className="text-base font-bold text-white mb-4">העלאה למאגר ציבורי</h3>
             <label className="block text-xs text-white/70 mb-2">בחר קטגוריה לשאלה</label>
             <select value={publishCategory} onChange={e => setPublishCategory(e.target.value)} className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-sm text-white mb-6">
                {["כללי", "מדע", "היסטוריה", "ספורט", "גיאוגרפיה", "תרבות פופ"].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <button onClick={uploadSlideToPublicBank} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">שתף שאלה</button>
          </div>
        </div>
      )}

      {/* AI MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151c] border border-purple-500/30 rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400"><Sparkles className="w-6 h-6" /></div>
              <div>
                <h3 className="text-base font-bold text-white">מחולל שאלות AI מבית MegaClick</h3>
                <p className="text-xs text-white/50">מייצר שאלות ותשובות בחינם (Gemini/Groq)</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">נושא / הנחיה (Prompt)</label>
                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder='למשל: "יצר 3 שאלות בנושא חלל"' className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">סוג השקופית</label>
                  <select value={aiSlideType} onChange={(e) => setAiSlideType(e.target.value as any)} className="w-full bg-[#181d29] border border-white/10 rounded-xl p-2.5 text-sm text-white">
                    <option value="trivia">טריוויה (עם תשובה אחת)</option>
                    <option value="poll">סקר</option>
                    <option value="image_answer">תשובה בתמונה</option>
                    <option value="text_slide">שקופית טקסט</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">כמות שאלות</label>
                  <input type="number" min={1} max={10} value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} className="w-full bg-[#181d29] border border-white/10 rounded-xl p-2.5 text-sm text-white" />
                </div>
              </div>
              {aiSlideType === "image_answer" && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/70">
                   * ה-AI ייצר גם תיאורים לתמונות (Prompts) כדי שתוכל לחולל אותן בקלות לאחר מכן.
                </div>
              )}
              <button onClick={handleGenerateAI} disabled={aiGenerating || !aiPrompt} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all mt-4">
                {aiGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>יצר ב-AI עכשיו</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC BANK MODAL */}
      {isPublicBankOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#12151c] border border-white/15 rounded-3xl p-6 relative shadow-2xl max-h-[80vh] flex flex-col">
            <button onClick={() => setIsPublicBankOpen(false)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-base font-bold text-white mb-2">מאגר השאלות הציבורי</h3>
            <p className="text-xs text-white/50 mb-4">חפש וייבא שאלות שמשתמשים אחרים העלו וקטלגו</p>
            <div className="mb-4">
               <input type="text" placeholder="חפש לפי קטגוריה או טקסט..." className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {[
                { title: "מה המרחק של כדור הארץ מהשמש?", category: "מדע", type: "trivia" },
                { title: "איזו מדינה היא הגדולה ביותר בשטחה?", category: "גיאוגרפיה", type: "trivia" },
                { title: "מי לדעתך יזכה במונדיאל?", category: "ספורט", type: "poll" },
              ].map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#181d29] border border-white/10 hover:border-indigo-500/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">{q.category}</span>
                       <span className="text-[10px] text-white/40">{q.type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                  </div>
                  <button onClick={() => { createNewSlide("trivia"); setIsPublicBankOpen(false); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-transform active:scale-95">
                    ייבא בלחיצה אחת
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL (4 Options Rule) */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#12151c] border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setMediaPickerTarget(null)} className="absolute top-4 left-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-base font-bold text-white mb-4">מקורות המדיה (כלל הברזל)</h3>
            <div className="grid grid-cols-4 gap-2 bg-[#181d29] p-1.5 rounded-xl mb-6">
              {[
                { id: "upload", label: "קובץ אישי", icon: Upload },
                { id: "stock", label: "מאגר מובנה", icon: Grid },
                { id: "youtube", label: "YouTube", icon: LinkIcon },
                { id: "ai", label: "תמונת AI", icon: Wand2 },
              ].map((mTab) => {
                const Icon = mTab.icon;
                return (
                  <button key={mTab.id} onClick={() => setMediaPickerTab(mTab.id as any)} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-[11px] font-bold transition-all ${mediaPickerTab === mTab.id ? "bg-indigo-600 text-white shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                    <Icon className="w-4 h-4" /><span>{mTab.label}</span>
                  </button>
                );
              })}
            </div>

            {mediaPickerTab === "upload" && (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-[#181d29]">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-white/70 mb-4">גרור קובץ או לחץ להעלאה (Supabase Storage)</p>
                <input type="file" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const path = `media/${Date.now()}_${file.name}`;
                    const { data } = await supabase.storage.from("game-media").upload(path, file);
                    if (data) {
                      const publicUrl = supabase.storage.from("game-media").getPublicUrl(path).data.publicUrl;
                      handleSelectMedia(publicUrl);
                    }
                  }} className="hidden" id="media-upload-input" />
                <label htmlFor="media-upload-input" className="bg-white text-black font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-block transition-transform active:scale-95">בחר קובץ מהמחשב</label>
              </div>
            )}

            {mediaPickerTab === "stock" && (
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {["https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80"].map((url, i) => (
                  <img key={i} src={url} alt="Stock" onClick={() => handleSelectMedia(url)} className="w-full h-24 rounded-xl object-cover border border-white/10 hover:border-indigo-500 cursor-pointer transition-all" />
                ))}
              </div>
            )}

            {mediaPickerTab === "youtube" && (
              <div className="space-y-4">
                <input type="text" value={youtubeUrlInput} onChange={(e) => setYoutubeUrlInput(e.target.value)} placeholder="הדבק קישור YouTube מלא כאן..." className="w-full bg-[#181d29] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                <button onClick={() => handleSelectMedia(youtubeUrlInput)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">הדבק ואשר קישור</button>
              </div>
            )}

            {mediaPickerTab === "ai" && (
              <div className="space-y-4">
                <input type="text" value={aiImagePrompt} onChange={(e) => setAiImagePrompt(e.target.value)} placeholder="תאר את התמונה שברצונך ליצור..." className="w-full bg-[#181d29] border border-white/10 rounded-xl p-4 text-sm text-[#EDEDED] focus:border-purple-500 focus:outline-none" />
                <button onClick={handleGenerateAiImage} disabled={aiImageLoading || !aiImagePrompt} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                  {aiImageLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>צור תמונה ב-AI בחינם</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}