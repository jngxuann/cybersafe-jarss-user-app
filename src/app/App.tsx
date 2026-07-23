import logo from "../assets/logo.jpeg";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./supabase";
import {
  Shield,
  Home,
  Gift,
  User,
  Flame,
  Star,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  Trophy,
  Bell,
  Camera,
  Link,
  MessageSquare,
  Upload,
  ArrowLeft,
  X,
  TrendingUp,
  Phone,
  ExternalLink,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  HelpCircle,
} from "lucide-react";




// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "home" | "jar" | "report" | "rewards" | "help";
type ReportStatus = "reviewing" | "safe" | "dangerous";
type ScrollContent =
  | { type: "tip"; title: string; body: string; icon: string }
  | { type: "lesson"; title: string; steps: string[]; icon: string }
  | { type: "quiz"; title: string; question: string; options: string[]; correct: number; icon: string; points: number };

interface Report {
  id: string;
  reportNumber: number;
  category: string;
  platform: string;
  desc: string;
  evidenceUrl?: string;
  evidenceFile?: string;
  evidenceType?: string;
  date: string;
  status: ReportStatus;
  aiSummary: string;
  riskLevel: number;
  rewardClaimed: boolean;

  evidenceLink?: string | null;
  screenshotPath?: string | null;
  screenshotName?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

interface Voucher {
  id: string;
  brand: string;
  value: string;
  code: string;
  expiry: string;
  logo: string;
  color: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SCROLL_POOL: ScrollContent[] = [
  {
    type: "tip",
    icon: "🔒",
    title: "2FA is Your Best Friend",
    body: "Enable two-factor authentication on all your accounts — banking, email, social media. Even if your password leaks, 2FA stops attackers cold. Takes 30 seconds to set up, saves you a lifetime of headaches.",
  },
  {
    type: "tip",
    icon: "🎣",
    title: "Spot a Phishing Link",
    body: "Hover over links before clicking. Scammers use subtle misspellings: 'starhub-sg.info', 'paypal-secure.net'. Legitimate services use their own domain — nothing extra before or after. When in doubt, go directly to the official website.",
  },
  {
    type: "tip",
    icon: "🤖",
    title: "Deepfakes Are Getting Real",
    body: "AI can now clone voices and faces convincingly. If a 'family member' calls asking for money urgently, hang up and call them back on a number you know. Agree on a secret family word for emergencies — something no AI dataset would have.",
  },
  {
    type: "lesson",
    icon: "📱",
    title: "How Scammers Target You on Carousell",
    steps: [
      "They offer to 'overpay' and send a fake payment screenshot.",
      "They ask you to ship first and 'claim the balance later'.",
      "The payment never arrives — your item and money are gone.",
      "✅ Always confirm funds in your bank app before releasing goods.",
    ],
  },
  {
    type: "lesson",
    icon: "💬",
    title: "The Romance Scam Playbook",
    steps: [
      "Scammer creates a fake profile with attractive photos (often stolen).",
      "Builds trust over weeks with daily messages and 'falling in love'.",
      "Introduces a 'great investment opportunity' or requests money for emergency.",
      "Once you send money, contact stops immediately.",
      "✅ Never send money to someone you have not met in person.",
    ],
  },
  {
    type: "quiz",
    icon: "🧠",
    title: "Quick Security Check",
    question: "You get an email from 'support@paypa1.com' saying your account is suspended. What should you do?",
    options: [
      "Click the link to reactivate your account",
      "Reply with your username and password",
      "Delete it — 'paypa1' is not PayPal",
      "Forward it to friends to warn them",
    ],
    correct: 2,
    points: 40,
  },
  {
    type: "quiz",
    icon: "🎯",
    title: "Spot the Red Flag",
    question: "A stranger on Instagram asks you to 'test their investment app' and promises 20% weekly returns. This is most likely:",
    options: [
      "A legitimate high-yield opportunity",
      "A pig butchering investment scam",
      "A government savings scheme",
      "A new MAS-approved product",
    ],
    correct: 1,
    points: 50,
  },
  {
    type: "quiz",
    icon: "🔑",
    title: "Password Power",
    question: "Which of these passwords is the strongest?",
    options: [
      "Password123!",
      "Alex1990Singapore",
      "c7#mK!2xQp$nL",
      "ilovemydog",
    ],
    correct: 2,
    points: 30,
  },
];

const REPORT_CATEGORIES = [
  { id: "scam", label: "Scam / Fraud", icon: "💰", color: "#EF4444" },
  { id: "cyberbullying", label: "Cyberbullying", icon: "😤", color: "#8B5CF6" },
  { id: "deepfake", label: "Deepfake", icon: "🤖", color: "#F59E0B" },
  { id: "giveaway", label: "Fake Giveaway", icon: "🎁", color: "#EC4899" },
  { id: "phishing", label: "Phishing Link", icon: "🎣", color: "#3B82F6" },
  { id: "suspicious_ad", label: "Suspicious Ad", icon: "📢", color: "#10B981" },
  { id: "other", label: "Other", icon: "❓", color: "#6B7280" },
];


const REWARDS_CATALOGUE = [
  { id: "fp", brand: "FairPrice", value: "$5", logo: "🛒", color: "#E8472F", bg: "#FFF5F5", points: 1500, desc: "FairPrice supermarket voucher" },
  { id: "cg", brand: "CHAGEE", value: "$3", logo: "🧋", color: "#4CAF8A", bg: "#F0FFF8", points: 1200, desc: "Any medium hot or iced drink" },
  { id: "gb", brand: "Grab", value: "$3", logo: "🚗", color: "#00B14F", bg: "#F0FFF5", points: 1200, desc: "GrabFood or GrabCar ride" },
  { id: "sb", brand: "Starbucks", value: "$3", logo: "☕", color: "#00704A", bg: "#F0FFF9", points: 1200, desc: "Any handcrafted beverage" },
  { id: "lk", brand: "Luckin Coffee", value: "$3", logo: "☕", color: "#1E88E5", bg: "#F0F7FF", points: 1200, desc: "Any hot or iced drink" },
];

const HELP_CARDS = [
  { name: "Lodge Police Report", full: "Singapore Police Force", desc: "Report scam losses, lodge official police report", icon: "👮", phone: "999", color: "#1D4ED8", bg: "#EFF6FF" },
  { name: "Mental Health", full: "Institute of Mental Health", desc: "24-hour hotline", icon: "💚", phone: "6389 2000", color: "#10B981", bg: "#F0FDF4" },
  { name: "Cyberbullying", full: "TOUCH Cyber Wellness", desc: "Support & counselling for online harassment victims", icon: "🤝", phone: "1800 377 2252", color: "#F59E0B", bg: "#FFFBEB" },
];



// ─── Helpers ──────────────────────────────────────────────────────────────────

function XPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#60A5FA,#3B82F6)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold text-blue-500 whitespace-nowrap">{current}/{max} XP</span>
    </div>
  );
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  const c: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    gray: "bg-slate-100 text-slate-500",
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c[color] ?? c.blue}`}>{children}</span>;
}

function StatusChip({ status }: { status: ReportStatus }) {
  if (status === "reviewing") return (
    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
      <Clock size={10} /> Under Review
    </span>
  );
  if (status === "safe") return (
    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
      <ShieldCheck size={10} /> Verified Safe
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
      <ShieldAlert size={10} /> Verified Dangerous
    </span>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onReport, points }: { onReport: () => void; points: number }) {
  const streakDays = [true, true, true, true, true, false, false];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-sm text-slate-500 font-semibold">Good afternoon,</p>
          <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>Alex Tan! 👋</h1>
        </div>
        <button className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
      </div>

      {/* XP Card */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 100%)" }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-100 text-sm font-semibold">Level 5 · Cyber Guardian</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black">{points.toLocaleString()}</span>
              <span className="text-blue-200 text-sm">pts</span>
            </div>
          </div>
         </div> 
        <XPBar current={340} max={500} />
        <p className="text-blue-100 text-xs mt-1.5">160 XP to Level 6</p>
      </div>

      {/* Streak */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Flame size={18} className="text-orange-500" /><span className="font-bold text-slate-800 text-sm">5-Day Streak</span></div>
          <Badge color="orange">🔥 On fire!</Badge>
        </div>
        <div className="flex gap-2">
          {dayLabels.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${streakDays[i] ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                {streakDays[i] ? "✓" : d}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="font-black text-slate-800 text-base" style={{ fontFamily: "Nunito" }}>Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 -mt-1">
        <motion.button whileTap={{ scale: 0.96 }} onClick={onReport}
          className="bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col gap-2 border border-blue-50">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><AlertTriangle size={18} className="text-red-500" /></div>
          <span className="font-bold text-slate-800 text-sm leading-tight">Report Harmful Content</span>
          <Badge color="orange">+50 pts</Badge>
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }}
          className="bg-white rounded-2xl p-4 shadow-sm text-left flex flex-col gap-2 border border-blue-50">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Zap size={18} className="text-blue-500" /></div>
          <span className="font-bold text-slate-800 text-sm leading-tight">Daily Challenge</span>
          <Badge color="blue">+? pts</Badge>
        </motion.button>
      </div>

      {/* Community stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-blue-500" />Community Impact This Week</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[{ val: "1,247", label: "Reports", color: "text-blue-600" }, { val: "89%", label: "Resolved", color: "text-green-600" }, { val: "3.2k", label: "Points Given", color: "text-orange-600" }].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily tip */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2"><Star size={14} className="text-purple-500" /><span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Today's Safety Tip</span></div>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">Never share your OTP with anyone — not even someone claiming to be from the bank, police, or government.</p>
      </div>
    </div>
  );
}

// ─── CyberSafe Jar ────────────────────────────────────────────────────────────
const JAR_SCROLLS: ScrollContent[] = [
  { type: "tip", icon: "🔒", title: "2FA is Your Best Friend", body: "Enable two-factor authentication on all your accounts — banking, email, social media. Even if your password leaks, 2FA stops attackers cold. Takes 30 seconds to set up, saves you a lifetime of headaches." },
  { type: "tip", icon: "🎣", title: "Spot a Phishing Link Instantly", body: "Scammers misspell domains to fool you: 'starhub-sg.info', 'paypaI.com' (capital i, not L). Always check the full URL before clicking. When in doubt, type the official address directly into your browser." },
  { type: "lesson", icon: "📱", title: "How Scammers Target You on Carousell", steps: ["They offer to overpay and send a fake payment screenshot.", "They ask you to ship first, promising the balance later.", "The payment never arrives — your item and money are both gone.", "✅ Always confirm funds have cleared in your bank app before releasing any goods."] },
  { type: "lesson", icon: "💬", title: "The Romance Scam Playbook", steps: ["Scammer creates a polished fake profile using stolen photos.", "Builds trust over weeks with daily messages and affection.", "Eventually introduces a 'great crypto investment' or claims a family emergency.", "Once money is sent, contact stops immediately.", "✅ Never send money to someone you have not met in person."] },
  { type: "quiz", icon: "🧠", title: "Quick Security Check", question: "You receive an email from 'support@paypa1.com' saying your account is suspended. What should you do?", options: ["Click the link to reactivate your account", "Reply with your username and password", "Delete it — 'paypa1' is not the real PayPal", "Forward it to friends as a warning"], correct: 2, points: 10 },
  { type: "quiz", icon: "🎯", title: "Spot the Red Flag", question: "A stranger on Instagram asks you to 'test their investment app' promising 20% weekly returns. This is most likely:", options: ["A legitimate high-yield opportunity", "A pig-butchering investment scam", "A new MAS-approved product", "A government savings scheme"], correct: 1, points: 10 },
  { type: "quiz", icon: "🔑", title: "Password Power", question: "Which of these passwords is the strongest?", options: ["Password123!", "Alex1990Singapore", "c7#mK!2xQp$nL", "ilovemydog2024"], correct: 2, points: 10 },
];

// Kraft paper scroll tones — all warm amber/parchment
const SCROLL_TINTS = ["#C8934A","#B87D3A","#D4A55A","#BF8B40","#CC9E50","#B5793A","#D0A248"];

// Scrolls sticking up out of the jar opening (y values are above the rim at y≈95)
const SCROLL_POS = [
  { x: 103, y: 205, r: -24, s: 1.4 },
  { x: 132, y: 180, r: -10, s: 1.5 },
  { x: 163, y: 190, r: 8, s: 1.4 },
  { x: 195, y: 210, r: 23, s: 1.5 },
  { x: 118, y: 248, r: -17, s: 1.4 },
  { x: 154, y: 238, r: 4, s: 1.4 },
  { x: 190, y: 250, r: 18, s: 1.4 },
];

function ApothecaryJar({ remaining, tapping }: { remaining: number; tapping: boolean }) {
  return (
    <svg viewBox="0 0 300 370" width="270" height="333" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Keeps every scroll physically inside the jar body */}
        <clipPath id="jarInteriorClip">
          <rect x="51" y="98" width="198" height="226" rx="22" />
        </clipPath>

        {/* Soft glass tint layered over the scrolls */}
        <linearGradient id="glassTint" x1="50" y1="96" x2="250" y2="325" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EAF6FF" stopOpacity="0.12" />
          <stop offset="0.52" stopColor="#FFFFFF" stopOpacity="0.03" />
          <stop offset="1" stopColor="#BEE3FF" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="150" cy="358" rx="80" ry="10" fill="rgba(0,0,0,0.1)" />

      {/* Back wall of jar */}
      <rect
        x="48"
        y="95"
        width="204"
        height="230"
        rx="24"
        fill="rgba(219,239,255,0.18)"
        stroke="rgba(147,197,253,0.8)"
        strokeWidth="3"
      />

      {/* Scroll pile — clipped so it remains behind the glass */}
      <g clipPath="url(#jarInteriorClip)">
        {SCROLL_POS.slice(0, remaining).map((pos, i) => {
          const c = SCROLL_TINTS[i % SCROLL_TINTS.length];
          const dark = SCROLL_TINTS[(i + 2) % SCROLL_TINTS.length];
          return (
            <g
              key={i}
              transform={`translate(${pos.x},${pos.y}) rotate(${pos.r}) scale(${pos.s})`}
            >
              {/* Main parchment body */}
              <rect x="-14" y="-48" width="28" height="96" rx="8" fill={c} />

              {/* Rolled parchment ends */}
              <ellipse cx="0" cy="-42" rx="14" ry="9.5" fill={dark} />
              <ellipse cx="0" cy="-42" rx="8" ry="5" fill={c} />
              <ellipse cx="0" cy="42" rx="14" ry="9.5" fill={dark} />
              <ellipse cx="0" cy="42" rx="8" ry="5" fill={c} />

              {/* Paper texture lines */}
              <line x1="-7" y1="-18" x2="7" y2="-18" stroke="rgba(70,38,10,0.14)" strokeWidth="1" />
              <line x1="-7" y1="-7" x2="7" y2="-7" stroke="rgba(70,38,10,0.11)" strokeWidth="1" />
              <line x1="-7" y1="4" x2="7" y2="4" stroke="rgba(70,38,10,0.09)" strokeWidth="1" />
              <line x1="-7" y1="15" x2="7" y2="15" stroke="rgba(70,38,10,0.08)" strokeWidth="1" />

              {/* Twine around the middle */}
              <line x1="14" y1="-1" x2="11" y2="-1" stroke="#7A4A20" strokeWidth="2" />
              <line x1="-14" y1="2" x2="11" y2="2" stroke="#A06A34" strokeWidth="1.2" />
              <path d="M 0 1 C -8 -7,-12 -1,-5 4 C -1 7,1 3,0 1" stroke="#7A4A20" strokeWidth="1.3" fill="none" />
              <path d="M 0 1 C 8 -7,12 -1,5 4 C 1 7,-1 3,0 1" stroke="#7A4A20" strokeWidth="1.3" fill="none" />
            </g>
          );
        })}

        {/* Warm shadow at the bottom of the scroll pile */}
        <ellipse cx="150" cy="304" rx="72" ry="13" fill="rgba(101,61,18,0.14)" />
      </g>

      {/* Glass tint over the scrolls */}
      <rect x="52" y="99" width="196" height="222" rx="21" fill="url(#glassTint)" pointerEvents="none" />

      {/* Inner glass depth */}
      <rect x="60" y="105" width="180" height="212" rx="18" fill="rgba(239,248,255,0.08)" pointerEvents="none" />

      {/* Front glass highlights */}
      <rect x="60" y="108" width="16" height="190" rx="8" fill="rgba(255,255,255,0.42)" pointerEvents="none" />
      <rect x="80" y="112" width="6" height="160" rx="3" fill="rgba(255,255,255,0.18)" pointerEvents="none" />
      <path d="M 226 122 C 238 160,238 257,224 290" stroke="rgba(255,255,255,0.2)" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />

      {/* Bottom reflection */}
      <ellipse cx="150" cy="318" rx="60" ry="6" fill="rgba(186,226,255,0.4)" pointerEvents="none" />

      {/* Jar rim rendered last so scrolls sit behind it */}
      <rect
        x="40"
        y="82"
        width="220"
        height="18"
        rx="6"
        fill="rgba(186,226,255,0.78)"
        stroke="rgba(147,197,253,0.95)"
        strokeWidth="2.5"
      />
      <path d="M 48 86 L 252 86" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 48 98 C 95 105 205 105 252 98" stroke="rgba(96,165,250,0.25)" strokeWidth="2" />
    </svg>
  );
}

function JarScreen({ onPoints }: { onPoints: (n: number) => void }) {
  const [remaining, setRemaining] = useState<ScrollContent[]>(() => [...JAR_SCROLLS]);
  const [active, setActive]       = useState<ScrollContent | null>(null);
  const [tapping, setTapping]     = useState(false);
  const [sealed, setSealed]       = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizDone, setQuizDone]   = useState(false);
  const [earnedPts, setEarnedPts] = useState<number | null>(null);

  const doneCount = JAR_SCROLLS.length - remaining.length;

  function tapJar() {
    if (tapping || active !== null || remaining.length === 0 || sealed) return;
    setTapping(true);
    setTimeout(() => {
      setTapping(false);
      const idx = Math.floor(Math.random() * remaining.length);
      setActive(remaining[idx]);
      setRemaining((prev) => prev.filter((_, i) => i !== idx));
    }, 720);
  }

  function closeScroll() {
    const nowEmpty = remaining.length === 0;
    setActive(null);
    setQuizSelected(null);
    setQuizDone(false);
    setEarnedPts(null);
    if (nowEmpty) setTimeout(() => setSealed(true), 420);
  }

  function submitQuiz(scroll: Extract<ScrollContent, { type: "quiz" }>) {
    if (quizSelected === null) return;
    setQuizDone(true);
    if (quizSelected === scroll.correct) {
      onPoints(scroll.points);
      setEarnedPts(scroll.points);
    }
  }

  return (
    // <div className="flex flex-col items-center relative" style={{ minHeight: "100%" }}>
    <div className = "relative flex h-full min-h-0 flex-col items-center">

      {/* ── Top strip ─────────────────────────────────────── */}
      <div className="w-full text-center pt-2 pb-1 shrink-0">
        <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>
          CyberSafe Jar ✨
        </h1>
        {!sealed && (
          <p className="text-slate-500 text-sm mt-0.5">
            {remaining.length > 0
              ? `${remaining.length} scroll${remaining.length !== 1 ? "s" : ""} left · tap to reveal`
              : "Last scroll read! Closing the jar…"}
          </p>
        )}
      </div>

      {/* ── Progress dots ──────────────────────────────────── */}
      {!sealed && (
        <div className="flex items-center gap-2 mt-2 shrink-0">
          {JAR_SCROLLS.map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ scale: i < doneCount ? 1 : 0.7, opacity: i < doneCount ? 1 : 0.35 }}
              className="w-2 h-2 rounded-full"
              style={{ background: i < doneCount ? "#3B82F6" : "#CBD5E1" }}
            />
          ))}
        </div>
      )}

      {/* ── Jar ────────────────────────────────────────────── */}
      <motion.button
        onClick={tapJar}
        disabled={sealed || tapping || active !== null || remaining.length === 0}
        animate={tapping ? { rotate: [-4, 4, -4, 4, -2, 2, 0], y: [0, -8, 0] } : {}}
        transition={{ duration: 0.65 }}
        className="relative focus:outline-none mt-2 shrink-0"
        aria-label="Tap jar to reveal a scroll"
      >
        <ApothecaryJar remaining={remaining.length} tapping={tapping} />

        {/* Tap pulse ring */}
        {!sealed && remaining.length > 0 && !tapping && !active && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400 pointer-events-none"
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        )}

        {/* Tapping sparkles */}
        {tapping && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.6 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl pointer-events-none"
          >
            ✨
          </motion.div>
        )}
      </motion.button>

      {/* ── Tap CTA ────────────────────────────────────────── */}
      {!sealed && remaining.length > 0 && !active && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-sm font-bold text-blue-500 mt-1 shrink-0"
        >
          👆 Tap the jar
        </motion.p>
      )
    }

      {/* ── Sealed / See you tomorrow ──────────────────────── */}
      <AnimatePresence>
        {sealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 z-40"
            style={{ background: "linear-gradient(180deg,#EEF3FF 0%,#E8F0FE 100%)" }}
          >
            {/* Wax seal animation */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="relative"
            >
              {/* Sealed jar — empty, lid dropped on top */}
              <svg viewBox="0 0 300 300" width="220" height="220" fill="none">
                {/* Jar body */}
                <rect x="48" y="95" width="204" height="185" rx="24"
                  fill="rgba(219,239,255,0.35)" stroke="rgba(147,197,253,0.8)" strokeWidth="3" />
                <rect x="60" y="105" width="180" height="167" rx="18" fill="rgba(239,248,255,0.3)" />
                <rect x="60" y="108" width="16" height="155" rx="8" fill="rgba(255,255,255,0.4)" />
                <ellipse cx="150" cy="273" rx="60" ry="6" fill="rgba(186,226,255,0.35)" />
                {/* Rim */}
                <rect x="40" y="82" width="220" height="18" rx="6"
                  fill="rgba(186,226,255,0.7)" stroke="rgba(147,197,253,0.9)" strokeWidth="2.5" />
                <path d="M 48 86 L 252 86" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
                {/* Lid descending */}
                <motion.g initial={{ y: -60 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 16 }}>
                  <rect x="36" y="55" width="228" height="28" rx="8"
                    fill="rgba(186,226,255,0.85)" stroke="rgba(147,197,253,1)" strokeWidth="2.5" />
                  <path d="M 44 62 L 256 62" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                  <rect x="88" y="38" width="124" height="20" rx="6"
                    fill="rgba(186,226,255,0.7)" stroke="rgba(147,197,253,0.9)" strokeWidth="2" />
                  {/* Wax seal stamp */}
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85, type: "spring", stiffness: 260 }}>
                    <circle cx="150" cy="47" r="16" fill="#3B82F6" />
                    <circle cx="150" cy="47" r="12" fill="#60A5FA" />
                    <text x="150" y="51" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">CS</text>
                  </motion.g>
                </motion.g>
                {/* Shadow */}
                <ellipse cx="150" cy="292" rx="76" ry="8" fill="rgba(0,0,0,0.1)" />
              </svg>
            </motion.div>

            {/* Floating stars */}
            {["✦","✧","✦","✧","✦"].map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: [0, 1, 0], y: -40 - i * 10, x: (i - 2) * 28 }}
                transition={{ delay: 0.9 + i * 0.12, duration: 1.4 }}
                className="absolute text-yellow-400 text-lg pointer-events-none"
                style={{ top: "40%", left: "50%" }}
              >
                {s}
              </motion.span>
            ))}

            {/* Message card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="w-full rounded-3xl p-6 text-center"
              style={{ background: "linear-gradient(135deg,#1E3A5F 0%,#2D4E8A 100%)" }}
            >
              <p className="text-4xl mb-2">🌙</p>
              <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "Nunito" }}>
                See You Tomorrow!
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-4">
                You've read all 7 scrolls. The jar will be refilled with fresh knowledge tomorrow. Come back and keep levelling up!
              </p>
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-white/10">
                <div className="text-center">
                  <p className="text-white font-black text-lg">{doneCount}</p>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wide">Scrolls Read</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-white font-black text-lg">7/7</p>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wide">Complete</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-yellow-300 font-black text-lg">🏅</p>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wide">Full Jar</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll reveal sheet ────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 x-50 flex h-full min-h-0 flex-col justify-end overflow-"
            style={{ background: "rgba(20,28,48,0.65)", backdropFilter: "blur(6px)" }}
            onClick={closeScroll}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 310, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg,#FEF3DC 0%,#FBE9C0 100%)",
                borderTop: "3px solid #D4A55A",
                borderRadius: "28px 28px 0 0",
                maxHeight: "80%",
                overflowY: "auto",
                scrollbarWidth: "none",
                boxShadow: "0 -8px 40px rgba(180,120,40,0.18)",
              }}
            >
              {/* Scroll decorative top */}
              <div className="flex flex-col items-center pt-4 pb-2 px-5">
                {/* Handle tab */}
                <div className="w-12 h-1.5 rounded-full mb-3" style={{ background: "#C4973A" }} />
                {/* Rolled scroll top edge decoration */}
                <div className="w-full h-5 rounded-xl mb-1 flex items-center justify-center"
                  style={{ background: "linear-gradient(90deg,#C4973A,#DDB870,#C4973A)", opacity: 0.7 }}>
                  <div className="w-4/5 h-px" style={{ background: "rgba(255,255,255,0.4)" }} />
                </div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.3 }}
                animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
                className="px-5 pb-6"
              >
                {/* Badge + close */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{active.icon}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      active.type === "tip" ? "bg-amber-700 text-amber-50"
                      : active.type === "lesson" ? "bg-green-700 text-green-50"
                      : "bg-purple-700 text-purple-50"
                    }`}>
                      {active.type === "tip" ? "💡 Safety Tip"
                       : active.type === "lesson" ? "📖 Lesson"
                       : `🧠 Quiz · +${(active as any).points} pts`}
                    </span>
                  </div>
                  <button onClick={closeScroll}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(180,120,40,0.2)" }}>
                    <X size={14} style={{ color: "#7D5022" }} />
                  </button>
                </div>

                <h2 className="text-xl font-black mb-4 leading-snug" style={{ fontFamily: "Nunito", color: "#3D2005" }}>
                  {active.title}
                </h2>

                {/* ── Tip ── */}
                {active.type === "tip" && (
                  <>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: "#5C3610" }}>{active.body}</p>
                    <button onClick={closeScroll}
                      className="w-full py-3.5 rounded-2xl font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg,#7D5022,#A06830)" }}>
                      Got it — seal this scroll ✓
                    </button>
                  </>
                )}

                {/* ── Lesson ── */}
                {active.type === "lesson" && (
                  <>
                    <div className="flex flex-col gap-2.5 mb-5">
                      {active.steps.map((step, i) => (
                        <div key={i} className={`flex gap-3 p-3 rounded-xl ${step.startsWith("✅") ? "" : ""}`}
                          style={{ background: step.startsWith("✅") ? "rgba(34,197,94,0.15)" : "rgba(180,120,40,0.12)" }}>
                          {!step.startsWith("✅") && (
                            <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 text-amber-50"
                              style={{ background: "#7D5022" }}>{i + 1}</span>
                          )}
                          <p className="text-sm leading-relaxed font-medium" style={{ color: "#3D2005" }}>{step}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={closeScroll}
                      className="w-full py-3.5 rounded-2xl font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg,#166534,#15803D)" }}>
                      Lesson complete ✓
                    </button>
                  </>
                )}

                {/* ── Quiz ── */}
                {active.type === "quiz" && (() => {
                  const scroll = active as Extract<ScrollContent, { type: "quiz" }>;
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="p-3.5 rounded-xl mb-1" style={{ background: "rgba(91,36,6,0.08)" }}>
                        <p className="text-sm font-bold leading-relaxed" style={{ color: "#3D2005" }}>{scroll.question}</p>
                      </div>
                      {scroll.options.map((opt, i) => {
                        let bg = "rgba(180,120,40,0.1)";
                        let border = "transparent";
                        if (quizDone) {
                          if (i === scroll.correct) { bg = "rgba(34,197,94,0.18)"; border = "#22C55E"; }
                          else if (i === quizSelected) { bg = "rgba(239,68,68,0.15)"; border = "#EF4444"; }
                        } else if (quizSelected === i) { bg = "rgba(59,130,246,0.15)"; border = "#3B82F6"; }
                        return (
                          <button key={i} onClick={() => !quizDone && setQuizSelected(i)}
                            className="w-full p-3.5 rounded-xl text-left text-sm font-semibold transition-all"
                            style={{ background: bg, border: `2px solid ${border}`, color: "#3D2005" }}>
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-lg text-xs font-black mr-2.5"
                              style={{ background: "rgba(125,80,34,0.2)", color: "#5C3610" }}>
                              {["A","B","C","D"][i]}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                      {!quizDone && quizSelected !== null && (
                        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          onClick={() => submitQuiz(scroll)}
                          className="w-full py-3.5 rounded-2xl font-black text-white text-sm mt-1"
                          style={{ background: "linear-gradient(135deg,#1D4ED8,#3B82F6)" }}>
                          Submit Answer
                        </motion.button>
                      )}
                      {quizDone && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl p-4"
                          style={{ background: quizSelected === scroll.correct ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.12)", border: `1.5px solid ${quizSelected === scroll.correct ? "#22C55E" : "#EF4444"}` }}>
                          <div className="flex items-center gap-2 mb-2">
                            {quizSelected === scroll.correct
                              ? <CheckCircle size={16} className="text-green-600" />
                              : <X size={16} className="text-red-500" />}
                            <span className={`font-black text-sm ${quizSelected === scroll.correct ? "text-green-700" : "text-red-600"}`}>
                              {quizSelected === scroll.correct ? `Correct! +${earnedPts} pts earned 🎉` : "Not quite — remember this one!"}
                            </span>
                          </div>
                          <button onClick={closeScroll}
                            className="w-full py-3 rounded-xl font-bold text-white text-sm"
                            style={{ background: "linear-gradient(135deg,#7D5022,#A06830)" }}>
                            Back to Jar
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>

              {/* Rolled scroll bottom edge */}
              <div className="px-5 pb-5">
                <div className="w-full h-5 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(90deg,#C4973A,#DDB870,#C4973A)", opacity: 0.6 }}>
                  <div className="w-4/5 h-px" style={{ background: "rgba(255,255,255,0.4)" }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Community Report Centre ───────────────────────────────────────────────────
function ReportScreen({ onPoints }: { onPoints: (n: number) => void }) {
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [desc, setDesc] = useState("");
  const [linkVal, setLinkVal] = useState("");
  const [attachType, setAttachType] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms = ["WhatsApp", "Telegram", "Instagram", "TikTok", "Carousell", "Facebook", "Email", "SMS", "Other"];

async function uploadReportEvidence(
  reportId: string,
  file: File,
  evidenceType: "screenshot" | "file"
): Promise<string> {
  const safeFileName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const uniqueFileName =
    `${evidenceType}-${Date.now()}-${safeFileName}`;

  const storagePath =
    `reports/${reportId}/${uniqueFileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("report-evidence")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

  if (uploadError) {
    throw uploadError;
  }

  return storagePath;
}

async function submitReport() {
  if (!category || !platform || isSubmitting) return;

  setIsSubmitting(true);
  const cat = REPORT_CATEGORIES.find((c) => c.id === category);

  try {
    // 1. Single database insert
    const { data, error } = await supabase
      .from("reports")
      .insert({
        category: cat?.label ?? category,
        platform,
        description: desc.trim() || "No description provided.",
        evidence_link: linkVal.trim() || null,
        status: "reviewing",
        ai_summary:
          "We are analysing your report. Pattern matching against known threat signatures and Singapore-specific scam databases. Results expected within 24 hours.",
        risk_level: Math.floor(Math.random() * 40) + 30,
        reward_claimed: false,
      })
      .select()
      .single();

    if (error) throw error;

    let screenshotPath: string | null = null;
    let uploadedFilePath: string | null = null;

    // 2. Upload screenshot if selected
    if (screenshotFile) {
      const safeScreenshotName = screenshotFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      screenshotPath = `reports/${data.id}/screenshot-${Date.now()}-${safeScreenshotName}`;
      const { error: ssError } = await supabase.storage
        .from("report-evidence")
        .upload(screenshotPath, screenshotFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: screenshotFile.type,
        });
      if (ssError) throw ssError;
    }

    // 3. Upload file if selected
    if (evidenceFile) {
      const safeFileName = evidenceFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      uploadedFilePath = `reports/${data.id}/file-${Date.now()}-${safeFileName}`;
      const { error: fError } = await supabase.storage
        .from("report-evidence")
        .upload(uploadedFilePath, evidenceFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: evidenceFile.type,
        });
      if (fError) throw fError;
    }

    // 4. Update the single existing record with paths (if files were attached)
    if (screenshotPath || uploadedFilePath) {
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          screenshot_path: screenshotPath,
          screenshot_name: screenshotFile?.name ?? null,
          file_path: uploadedFilePath,
          file_name: evidenceFile?.name ?? null,
          file_type: evidenceFile?.type ?? null,
        })
        .eq("id", data.id);

      if (updateError) throw updateError;
    }

    await loadReports();
    setSubmitted(true);
  } catch (err) {
    console.error("Unable to submit report:", err);
    alert("Unable to submit report. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
}

async function loadReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const reports: Report[] = data.map((r) => ({
    id: r.id,
    reportNumber: r.report_number,
    category: r.category,
    platform: r.platform,
    desc: r.description ?? "",
    date: new Date(r.created_at).toLocaleString(),
    status: r.status as ReportStatus,
    aiSummary: r.ai_summary ?? "",
    riskLevel: r.risk_level ?? 0,
    rewardClaimed: r.reward_claimed ?? false,
  }));

  setReports(reports);
}

useEffect(() => {
  loadReports();
}, []);

function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus
) {
  const reportToUpdate = reports.find(
    (report) => report.id === reportId
  );

  if (!reportToUpdate) return;

  const shouldAwardPoints =
    newStatus === "dangerous" &&
    !reportToUpdate.rewardClaimed;

  setReports((currentReports) =>
    currentReports.map((report) => {
      if (report.id !== reportId) {
        return report;
      }

      return {
        ...report,
        status: newStatus,
        rewardClaimed:
          report.rewardClaimed || shouldAwardPoints,
      };
    })
  );

  setSelectedReport((currentReport) => {
    if (
      !currentReport ||
      currentReport.id !== reportId
    ) {
      return currentReport;
    }

    return {
      ...currentReport,
      status: newStatus,
      rewardClaimed:
        currentReport.rewardClaimed ||
        shouldAwardPoints,
    };
  });

  if (shouldAwardPoints) {
    onPoints(50);
  }
}

if (submitted) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center pb-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          delay: 0.2,
        }}
        className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"
      >
        <Clock size={48} className="text-blue-500" />
      </motion.div>

      <div>
        <h2
          className="text-2xl font-black text-slate-800 mb-2"
          style={{ fontFamily: "Nunito" }}
        >
          Report Submitted!
        </h2>

        <p className="text-slate-500 text-sm leading-relaxed">
          We are reviewing your report and routing it to the
          relevant authorities.
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 w-full border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={16} className="text-blue-500" />

          <span className="font-black text-blue-600">
            Report Under Review
          </span>
        </div>

        <p className="text-xs text-blue-600/80">
          You will receive 50 points if your report is verified as
          dangerous.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => {
            setSubmitted(false);
            setView("list");
            setCategory("");
            setPlatform("");
            setDesc("");
            setLinkVal("");
            setAttachType(null);
            setScreenshotFile(null);
            setEvidenceFile(null);

          }}
          className="w-full py-3.5 rounded-2xl font-black text-white bg-blue-500 text-sm"
        >
          View My Reports
        </button>

        <button
          onClick={() => {
            setSubmitted(false);
            setView("new");
            setCategory("");
            setPlatform("");
            setDesc("");
            setLinkVal("");
            setAttachType(null);
            setScreenshotFile(null);
            setEvidenceFile(null);
          }}
          className="w-full py-3.5 rounded-2xl font-bold text-blue-600 bg-blue-50 text-sm"
        >
          Submit Another Report
        </button>
      </div>
    </motion.div>
  );
}


  // Report detail
  if (view === "detail" && selectedReport) {
    const r = selectedReport;
    return (
      <div className="flex flex-col gap-4 pb-4">
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <ArrowLeft size={16} /> My Reports
        </button>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-slate-800 text-sm">RPT-{String(r.reportNumber).padStart(6, "0")}</span>
            <StatusChip status={r.status} />
          </div>
          <p className="text-xs text-slate-400 mb-3">{r.date} · {r.platform}</p>
          <div className="flex items-center gap-2 mb-2">
            {(() => { const cat = REPORT_CATEGORIES.find((c) => c.label === r.category); return cat ? <span className="text-lg">{cat.icon}</span> : null; })()}
            <span className="font-bold text-slate-700 text-sm">{r.category}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Routed To</p>
          <div className="flex flex-wrap gap-2">
            {["MHA", "IMDA", "SPF Anti-Scam Centre"].map((agency) => (
              <span key={agency} className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">{agency}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Report list
  if (view === "list") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>Report Centre</h1>
            <p className="text-slate-500 text-sm mt-0.5">{reports.length} reports submitted</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView("new")}
            className="bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
            + New Report
          </motion.button>
        </div>

        {/* AI info bar */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-3 flex items-center gap-3 border border-indigo-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-black">❗</span></div>
          <p className="text-xs text-slate-600">Reports are automatically classified and routed them to IMDA, SPF, or MHA within 24 hours.</p>
        </div>

        {reports.map((r, i) => {
          const cat = REPORT_CATEGORIES.find((c) => c.label === r.category);
          return (
            <motion.button key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => { setSelectedReport(r); setView("detail"); }}
              className="bg-white rounded-2xl p-4 shadow-sm text-left flex items-start gap-3 border border-slate-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cat ? cat.color + "22" : "#F1F5FF" }}>
                {cat?.icon ?? "❓"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 text-sm">{r.category}</span>
                  <StatusChip status={r.status} />
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">{r.desc}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">RPT-{String(r.reportNumber).padStart(6, "0")}</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{r.date}</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{r.platform}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
            </motion.button>
          );
        })}
      </div>
    );
  }

  // New report form
  return (
    <div className="flex flex-col gap-4 pb-4">
      <button onClick={() => setView("list")} className="flex items-center gap-2 text-blue-600 font-bold text-sm">
        <ArrowLeft size={16} /> Back to Reports
      </button>
      <div>
        <h1 className="text-xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>New Report</h1>
        <p className="text-slate-500 text-sm">Earn 50 points for every valid report</p>
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700 mb-3 block">What type of content? *</label>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`p-3 rounded-xl text-left text-sm font-semibold transition-all flex items-center gap-2 ${category === c.id ? "text-white" : "bg-slate-50 text-slate-700"}`}
              style={category === c.id ? { background: c.color } : {}}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700 mb-3 block">Where did you see this? *</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${platform === p ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

        {/* Evidence */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm font-bold text-slate-700 mb-3 block">
            Add Evidence
          </label>

          <div className="flex gap-2 mb-3">
            {[
              {
                icon: <Camera size={16} />,
                label: "Screenshot",
                id: "screenshot",
              },
              {
                icon: <Link size={16} />,
                label: "Paste Link",
                id: "link",
              },
              {
                icon: <Upload size={16} />,
                label: "File",
                id: "file",
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setAttachType(attachType === item.id ? null : item.id)
                }
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  attachType === item.id
                    ? "bg-blue-500 text-white"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Link input */}
          {attachType === "link" && (
            <div className="space-y-2">
              <input
                type="url"
                value={linkVal}
                onChange={(event) => setLinkVal(event.target.value)}
                placeholder="https://suspicious-link.com"
                className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              />

              {linkVal && (
                <p className="text-xs text-green-600 font-medium">
                  Link added
                </p>
              )}
            </div>
          )}

          {/* Screenshot input */}
          {attachType === "screenshot" && (
            <div className="space-y-3">
              <label className="block cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    setScreenshotFile(event.target.files?.[0] ?? null)
                  }
                />

                <Camera
                  size={24}
                  className="text-slate-300 mx-auto mb-2"
                />

                <p className="text-xs text-slate-400 font-medium">
                  Tap to upload screenshot
                </p>

                <p className="text-[11px] text-slate-300 mt-1">
                  PNG, JPG, JPEG or WebP
                </p>
              </label>

              {screenshotFile && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <img
                    src={URL.createObjectURL(screenshotFile)}
                    alt="Screenshot preview"
                    className="w-14 h-14 rounded-lg object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {screenshotFile.name}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Screenshot selected
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScreenshotFile(null)}
                    className="text-red-500 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* File input */}
          {attachType === "file" && (
            <div className="space-y-3">
              <label className="block cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.zip"
                  className="hidden"
                  onChange={(event) =>
                    setEvidenceFile(event.target.files?.[0] ?? null)
                  }
                />

                <Upload
                  size={24}
                  className="text-slate-300 mx-auto mb-2"
                />

                <p className="text-xs text-slate-400 font-medium">
                  Tap to upload file
                </p>

                <p className="text-[11px] text-slate-300 mt-1">
                  PDF, Word, TXT or ZIP
                </p>
              </label>

              {evidenceFile && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <Upload size={20} className="text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {evidenceFile.name}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      File selected
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEvidenceFile(null)}
                    className="text-red-500 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

  {/* Evidence summary */}
  {(linkVal || screenshotFile || evidenceFile) && (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
      <p className="text-xs font-bold text-slate-500">
        Evidence added
      </p>

      {screenshotFile && (
        <p className="text-xs text-slate-600">
          📷 Screenshot: {screenshotFile.name}
        </p>
      )}

      {linkVal && (
        <p className="text-xs text-slate-600 truncate">
          🔗 Link: {linkVal}
        </p>
      )}

      {evidenceFile && (
        <p className="text-xs text-slate-600">
          📎 File: {evidenceFile.name}
        </p>
      )}
    </div>
  )}
</div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700 mb-2 block">Describe what happened</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. I received a WhatsApp message claiming I won a DBS prize draw and asking me to click a link to claim..."
          rows={4}
          className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-blue-300" />
        <p className="text-xs text-slate-400 mt-1 text-right">{desc.length}/500</p>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={submitReport}
        disabled={!category || !platform || isSubmitting}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
          category && platform && !isSubmitting
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </motion.button>
      <p className="text-center text-xs text-slate-400">Reports are submitted anonymously to MHA, IMDA & SPF.</p>
    </div>
  );
}

// ─── Rewards Marketplace ───────────────────────────────────────────────────────
function RewardsScreen({ points, onRedeem }: { points: number; onRedeem: (cost: number, voucher: Voucher) => void }) {
  const [tab, setTab] = useState<"shop" | "vouchers">("shop");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redeemTarget, setRedeemTarget] = useState<typeof REWARDS_CATALOGUE[0] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function confirmRedeem() {
    if (!redeemTarget || points < redeemTarget.points) return;
    const code = `${redeemTarget.id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const newV: Voucher = {
      id: code,
      brand: redeemTarget.brand,
      value: redeemTarget.value,
      code,
      expiry: "31 Dec 2026",
      logo: redeemTarget.logo,
      color: redeemTarget.color,
    };
    setVouchers((prev) => [newV, ...prev]);
    onRedeem(redeemTarget.points, newV);
    setRedeemTarget(null);
    setTab("vouchers");
  }

  function copyCode(id: string) {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Balance banner */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#FF6B35 0%,#F59E0B 100%)" }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <p className="text-orange-100 text-sm font-semibold mb-1">Points Balance</p>
        <div className="flex items-baseline gap-2 mb-1">
          <motion.span key={points} initial={{ scale: 1.3, color: "#fff" }} animate={{ scale: 1 }} className="text-5xl font-black">{points.toLocaleString()}</motion.span>
          <Zap size={20} className="text-orange-200 mb-1" />
        </div>
        <p className="text-orange-200 text-xs">Earn more by reporting & learning</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm gap-1">
        {(["shop", "vouchers"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${tab === t ? "bg-blue-500 text-white shadow-sm" : "text-slate-500"}`}>
            {t === "shop" ? "🛍️ Marketplace" : `🎟️ My Vouchers${vouchers.length ? ` (${vouchers.length})` : ""}`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "shop" ? (
          <motion.div key="shop" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-3">
            {REWARDS_CATALOGUE.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-slate-50">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: r.bg }}>
                  {r.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-slate-800 text-sm">{r.brand}</span>
                    <span className="font-black text-base" style={{ color: r.color }}>{r.value}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{r.desc}</p>
                  <div className="flex items-center gap-1">
                    <Zap size={11} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">{r.points} pts</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setRedeemTarget(r)}
                  disabled={points < r.points}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${points >= r.points ? "text-white shadow-sm" : "bg-slate-100 text-slate-400"}`}
                  style={points >= r.points ? { background: r.color } : {}}>
                  {points >= r.points ? "Redeem" : "Need more"}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="vouchers" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3">
            {vouchers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Ticket size={48} className="text-slate-200" />
                <p className="font-bold text-slate-400 text-sm">No vouchers yet</p>
                <p className="text-xs text-slate-400">Redeem from the Marketplace to see them here.</p>
                <button onClick={() => setTab("shop")} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold">Browse Rewards</button>
              </div>
            ) : vouchers.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex items-center gap-3" style={{ background: v.color + "18" }}>
                  <span className="text-3xl">{v.logo}</span>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{v.brand} <span style={{ color: v.color }}>{v.value} Voucher</span></p>
                    <p className="text-xs text-slate-500">Expires {v.expiry}</p>
                  </div>
                  <CheckCircle size={16} className="text-green-500 ml-auto shrink-0" />
                </div>
                <div className="px-4 py-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Voucher Code</p>
                    <p className="font-mono font-black text-sm text-slate-800 tracking-wider">{v.code}</p>
                  </div>
                  <button onClick={() => copyCode(v.id)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${copiedId === v.id ? "bg-green-500" : "bg-slate-100"}`}>
                    {copiedId === v.id ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-slate-500" />}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem confirm modal */}
      <AnimatePresence>
        {redeemTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end rounded-[36px]"
            onClick={() => setRedeemTarget(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl p-6 w-full">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: redeemTarget.bg }}>{redeemTarget.logo}</div>
                <div>
                  <p className="font-black text-slate-800 text-base">{redeemTarget.brand} {redeemTarget.value} Voucher</p>
                  <p className="text-xs text-slate-500">{redeemTarget.desc}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-5 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Cost</span>
                <span className="font-black text-orange-600 flex items-center gap-1"><Zap size={14} />{redeemTarget.points} pts</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-5 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Balance after</span>
                <span className="font-black text-slate-800">{(points - redeemTarget.points).toLocaleString()} pts</span>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={confirmRedeem}
                className="w-full py-4 rounded-2xl font-black text-white text-base mb-3"
                style={{ background: redeemTarget.color }}>
                Confirm Redeem
              </motion.button>
              <button onClick={() => setRedeemTarget(null)} className="w-full py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 text-sm">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Emergency Help Hub ────────────────────────────────────────────────────────
function HelpScreen() {
  const [calling, setCalling] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <h1 className="text-2xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>Emergency Help Hub</h1>
        <p className="text-slate-500 text-sm mt-0.5">Immediate support — you are never alone</p>
      </div>

      {/* SOS Banner */}
      <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#EF444422,#F59E0B22)", border: "1.5px solid #EF444440" }}>
        <p className="font-bold text-red-700 text-sm">🚨 In immediate danger? Call <span className="font-black">999</span> (Police) or <span className="font-black">995</span> (Ambulance)</p>
      </div>

      {HELP_CARDS.map((card, i) => (
        <motion.div key={card.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-800 text-sm">{card.name}</p>
              <p className="text-[11px] text-slate-400 font-medium mb-1">{card.full}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setCalling(card.name)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: card.color }}>
              <Phone size={14} /> Call {card.phone}
            </motion.button>
            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <ExternalLink size={14} className="text-slate-500" />
            </button>
          </div>
        </motion.div>
      ))}

      {/* Call confirm */}
      <AnimatePresence>
        {calling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[36px] p-6"
            onClick={() => setCalling(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full text-center">
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-black text-slate-800 text-lg mb-2" style={{ fontFamily: "Nunito" }}>Call {calling}?</h3>
              <p className="text-sm text-slate-500 mb-5">This will open your phone's dialler with the number pre-filled.</p>
              <button onClick={() => setCalling(null)} className="w-full py-3.5 rounded-2xl font-black text-white bg-blue-500 text-sm mb-2">Yes, call now</button>
              <button onClick={() => setCalling(null)} className="w-full py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 text-sm">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onNav }: { active: Tab; onNav: (t: Tab) => void }) {
  const items: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "jar", icon: <span className="text-xl leading-none">🫙</span>, label: "Jar" },
    { id: "report", icon: <AlertTriangle size={20} />, label: "Report" },
    { id: "rewards", icon: <Gift size={20} />, label: "Rewards" },
    { id: "help", icon: <HelpCircle size={20} />, label: "Help" },
  ];

  return (
    <nav className="flex bg-white border-t border-slate-100 px-1">
      {items.map((item) => {
        const isReport = item.id === "report";
        return (
          <button key={item.id} onClick={() => onNav(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-all ${active === item.id ? (isReport ? "text-white" : "text-blue-600") : "text-slate-400"}`}>
            {isReport ? (
              <>
                <div className={`absolute -top-4 w-13 h-13 rounded-full flex items-center justify-center shadow-lg w-12 h-12 ${active === "report" ? "ring-2 ring-blue-300" : ""}`}
                  style={{ background: "linear-gradient(135deg,#3B82F6,#6366F1)" }}>
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <span className="mt-7 text-[10px] font-bold text-blue-600">Report</span>
              </>
            ) : (
              <>
                {item.icon}
                <span className="text-[10px] font-bold">{item.label}</span>
                {active === item.id && (
                  <motion.span layoutId="nav-dot" className="w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);

  function handleSingpass() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1800);
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle,#93C5FD,transparent 70%)" }} />
      <div className="absolute top-40 -left-16 w-48 h-48 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle,#C4B5FD,transparent 70%)" }} />
      <div className="absolute bottom-32 right-0 w-56 h-56 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle,#6EE7B7,transparent 70%)" }} />

      {/* Top section */}
      <div className="flex flex-col items-center pt-16 px-6 gap-6 flex-1">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-200 bg-white overflow-hidden"
          >
            <img
              src={logo}
              alt="CyberSafe Jarss"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-2 -right-2 w-9 h-9 bg-orange-400 rounded-xl flex items-center justify-center shadow-md"
          >
            <span className="text-lg">🫙</span>
          </motion.div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800" style={{ fontFamily: "Nunito" }}>
            CyberSafe <span className="text-blue-600">Jarss</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Your online safety companion</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-2 w-full"
        >
          {[
            { icon: "🛡️", text: "Report harmful content & earn rewards" },
            { icon: "🫙", text: "Learn online safety through fun scrolls" },
            { icon: "🏆", text: "Climb the leaderboard with your community" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-blue-50">
              <span className="text-xl shrink-0">{f.icon}</span>
              <span className="text-sm text-slate-700 font-semibold">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Singpass button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full pb-6 flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSingpass}
            disabled={loading}
            className="w-full rounded-2xl font-black text-white text-base h-[50px] flex items-center justify-center"
            style={{ background: loading ? "#CBD5E1" : "linear-gradient(135deg,#C0392B 0%,#E74C3C 100%)" }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full gap-3"
                />
                <span>Verifying with Singpass…</span>
              </>
            ) : (
              <>
                Log in with Singpass
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-slate-400 leading-relaxed px-4">
            By continuing, you agree to our{" "}
            <span className="text-blue-500 font-semibold">Terms of Service</span> and{" "}
            <span className="text-blue-500 font-semibold">Privacy Policy</span>.
            Your data is protected under PDPA.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pb-4 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          A collaboration with IMDA
        </p>
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [points, setPoints] = useState(0);

  const [rewardPopupPoints, setRewardPopupPoints] =
  useState(0);

  const [showRewardPopup, setShowRewardPopup] =
  useState(false);

  // For prototype, use the ID of the user row in Supabase.
  const USER_ID = 1;

  async function loadUserPoints() {
    const { data, error } = await supabase
      .from("users")
      .select("points, pending_reward_points")
      .eq("id", USER_ID)
      .single();

    if (error) {
      console.error("Unable to load user points:", error);
      return;
    }

  setPoints(data.points ?? 0);

    const pendingPoints =
      data.pending_reward_points ?? 0;

    if (pendingPoints > 0) {
      setRewardPopupPoints(pendingPoints);
      setShowRewardPopup(true);
    }
  }

  useEffect(() => {
    if (loggedIn) {
      void loadUserPoints();
      }
    }, [loggedIn]);

  function addPoints(n: number) {
    setPoints((currentPoints) => currentPoints + n);
  }

  function spendPoints(n: number) {
    setPoints((currentPoints) =>
      Math.max(0, currentPoints - n)
    );
  }

  async function closeRewardPopup() {
  const { error } = await supabase
    .from("users")
    .update({
      pending_reward_points: 0,
    })
    .eq("id", USER_ID);

  if (error) {
    console.error(
      "Unable to clear reward notification:",
      error
    );

    return;
  }

  setShowRewardPopup(false);
  setRewardPopupPoints(0);
}


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <div className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{ width: "390px", height: "844px", borderRadius: "44px", background: "#EEF3FF", border: "8px solid #1A1D2E" }}>

        {/* Status bar — always visible */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 shrink-0">
          <span className="text-xs font-bold text-slate-600">9:41</span>
          <div className="w-24 h-5 bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <div className="w-4 h-2.5 border border-slate-400 rounded-sm relative">
              <div className="absolute inset-[1px] bg-slate-600 rounded-[1px]" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!loggedIn ? (
            /* ── Login ── */
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }} className="flex-1 overflow-hidden">
              <LoginScreen onLogin={() => setLoggedIn(true)} />
            </motion.div>
          ) : (
            /* ── Main app ── */
            <motion.div key="app" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }} className="flex flex-col flex-1 overflow-hidden">

              {/* App header */}
              <div className="flex items-center justify-between px-5 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden">
                  <img
                      src={logo}
                      alt="CyberSafe Jarss"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-black text-slate-800 text-base" style={{ fontFamily: "Nunito" }}>
                    CyberSafe <span className="text-blue-600">Jarss</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-orange-50 rounded-xl px-2 py-1">
                    <Flame size={13} className="text-orange-500" />
                    <span className="text-xs font-black text-orange-600">5</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 rounded-xl px-2 py-1">
                    <Zap size={12} className="text-blue-500" />
                    <span className="text-xs font-black text-blue-600">{points.toLocaleString()}</span>
                  </div>
                </div>
              </div>

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto px-4 relative" style={{ scrollbarWidth: "none" }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }} className="h-full">
              {tab === "home" && <HomeScreen onReport={() => setTab("report")} points={points} />}
              {tab === "jar" && <JarScreen onPoints={addPoints} />}
              {tab === "report" && <ReportScreen onPoints={addPoints} />}
              {tab === "rewards" && <RewardsScreen points={points} onRedeem={(cost) => spendPoints(cost)} />}
              {tab === "help" && <HelpScreen />}
            </motion.div>
          </AnimatePresence>
        </div>

            {/* Bottom nav */}
            <div className="shrink-0"><BottomNav active={tab} onNav={setTab} /></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRewardPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center px-6"
              style={{
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(5px)",
              }}
              >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 20,
                }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
              >
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                  }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100"
                >
                  <Trophy
                    size={38}
                    className="text-orange-500"
                  />
                </motion.div>

                <p className="mb-1 text-xs font-black uppercase tracking-wider text-blue-600">
                  Community Report Verified
                </p>

                <h2
                  className="mb-2 text-2xl font-black text-slate-800"
                  style={{ fontFamily: "Nunito" }}
                >
                  Points Awarded! 🎉
                </h2>

                <p className="mb-5 text-sm leading-relaxed text-slate-500">
                  One or more of your submitted reports have been verified as dangerous. Thank you for helping to make the online community safer! 
                </p>

                <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Zap
                      size={20}
                      className="text-orange-500"
                    />

                    <span className="text-2xl font-black text-orange-600">
                      +{rewardPopupPoints} points
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => void closeRewardPopup()}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200"
                >
                  Awesome, thank you!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
