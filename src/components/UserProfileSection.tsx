import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Award, Shield, Target, HelpCircle, Trophy, Sparkles, Activity, FileText, Check, AlertCircle } from 'lucide-react';
import { UserProfile, Badge } from '../types';
import { TEAMS_LIST, INITIAL_BADGES, LOCKED_BADGES } from '../data';

interface UserProfileSectionProps {
  userProfile: UserProfile;
  badges: Badge[];
  onUpdateProfile: (username: string, favoriteTeam: string, favoritePlayer?: string, cricketPersonality?: string) => void;
  onResetPoints: () => void;
}

export default function UserProfileSection({
  userProfile,
  badges,
  onUpdateProfile,
  onResetPoints
}: UserProfileSectionProps) {
  const [username, setUsername] = useState(userProfile.username);
  const [favoriteTeam, setFavoriteTeam] = useState(userProfile.favoriteTeam);
  const [favoritePlayer, setFavoritePlayer] = useState(userProfile.favoritePlayer || 'MS Dhoni');
  const [cricketPersonality, setCricketPersonality] = useState(userProfile.cricketPersonality || 'Strategic 🧠');
  
  const [isSaved, setIsSaved] = useState(false);

  // Quiz Personality State
  const [activeQuizStep, setActiveQuizStep] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // Dynamic Level generator based on points
  const points = userProfile.points;
  const currentLevel = Math.max(1, Math.floor(points / 25) + 1);
  const levelProgress = Math.min(100, Math.floor((points % 25) / 25 * 100));

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    onUpdateProfile(username, favoriteTeam, favoritePlayer, cricketPersonality);
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const getTeamLabel = (id: string) => {
    const found = TEAMS_LIST.find(t => t.id === id);
    return found ? `${found.icon} ${found.name}` : id;
  };

  // Quizzes for cricket personality finder
  const startQuiz = () => {
    setActiveQuizStep(0);
    setQuizResult(null);
    setQuizAnswers({});
  };

  const quizQuestions = [
    {
      title: "When your team needs 12 runs in the final over, you feel...",
      options: [
        { label: "Relaxed. We have tactical strategists at crease.", value: "S" },
        { label: "Intense. I want a massive boundary on ball 1!", value: "A" },
        { label: "Extremely Nervous, checking run rate calculations.", value: "N" },
        { label: "Deeply emotional, praying with fingers crossed.", value: "E" }
      ]
    },
    {
      title: "Your favorite part of an IPL cricket match is...",
      options: [
        { label: "Captain field shifts and defensive bowling blocks.", value: "S" },
        { label: "Supersonic sixes flying straight out of stadium roofs.", value: "A" },
        { label: "Slower yorkers and dot ball progressions.", value: "N" },
        { label: "The wholesome team dance in jersey afterward.", value: "E" }
      ]
    },
    {
      title: "If your rival team drops an easy crucial catch, you...",
      options: [
        { label: "Laugh and recalculate victory percentages.", value: "S" },
        { label: "Write a cheeky banter post in community forums immediately.", value: "A" },
        { label: "Sigh of relief, analyzing how it affects batter rate.", value: "N" },
        { label: "Cheer wildly with my watch party camera companions!", value: "E" }
      ]
    }
  ];

  const selectQuizOption = (value: string) => {
    if (activeQuizStep === null) return;
    
    const nextAnswers = { ...quizAnswers, [activeQuizStep]: value };
    setQuizAnswers(nextAnswers);

    if (activeQuizStep < quizQuestions.length - 1) {
      setActiveQuizStep(activeQuizStep + 1);
    } else {
      // Calculate final computed result
      const counts: Record<string, number> = { S: 0, A: 0, N: 0, E: 0 };
      Object.keys(nextAnswers).forEach(stepKey => {
        const val = nextAnswers[Number(stepKey)];
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      
      let greatestKey = "S";
      let highestVal = 0;
      Object.keys(counts).forEach(k => {
        if (counts[k] > highestVal) {
          highestVal = counts[k];
          greatestKey = k;
        }
      });

      let personalityComputed = "Strategic 🧠";
      if (greatestKey === "A") personalityComputed = "Aggressive 💥";
      if (greatestKey === "N") personalityComputed = "Analytical 📊";
      if (greatestKey === "E") personalityComputed = "Emotional 🤝";

      setQuizResult(personalityComputed);
      setCricketPersonality(personalityComputed);
      onUpdateProfile(username, favoriteTeam, favoritePlayer, personalityComputed);
      setActiveQuizStep(null);
    }
  };

  return (
    <div className="space-y-8" id="profile-section-view">
      
      {/* 1. VISUAL PRESTIGE SUMMARY CARD WITH IPL EMOTIONS */}
      <section className="relative overflow-hidden rounded-3xl border border-yellow-500/10 bg-gradient-to-br from-[#120a26] via-slate-950 to-[#060412] p-6 sm:p-8" id="prestige-card">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fuchsia-600/10 blur-3xl animate-pulse" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5 w-full md:w-auto">
            {/* Big avatar ring */}
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600 p-1 flex items-center justify-center shrink-0 shadow-lg">
              <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center text-4xl select-none">
                🥋
              </div>
            </div>

            <div className="space-y-1 flex-grow">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-yellow-405 uppercase">Stadium Prestige Superfan</span>
                <span className="rounded bg-fuchsia-500/15 text-fuchsia-400 font-mono text-[9px] py-0.5 px-2 font-bold uppercase tracking-wide border border-fuchsia-550/20">
                  {cricketPersonality} Personality
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-white leading-tight">{userProfile.username}</h2>
              
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="rounded bg-yellow-500/10 text-yellow-500 font-mono text-[10px] py-1 px-3.5 font-bold uppercase border border-yellow-500/10 animate-pulse">
                  🏰 Loop: {getTeamLabel(userProfile.favoriteTeam)}
                </span>
                <span className="rounded bg-fuchsia-500/10 text-fuchsia-400 font-mono text-[10px] py-1 px-3.5 font-bold uppercase">
                  Level {currentLevel} Fan
                </span>
              </div>
            </div>
          </div>

          {/* Prestige points details stats */}
          <div className="flex gap-4 sm:gap-6 bg-slate-950/70 border border-slate-850 p-4 rounded-2xl shrink-0 w-full md:w-auto">
            <div className="text-center flex-1 sm:flex-initial">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-mono">
                {userProfile.points}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Loyalty Pts</div>
            </div>
            
            <div className="border-r border-slate-850" />

            <div className="text-center flex-1 sm:flex-initial">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-450 to-rose-400 font-mono font-bold">
                {badges.length}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trophies</div>
            </div>

            <div className="border-r border-slate-850" />

            <div className="text-center flex-1 sm:flex-initial">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-420 to-teal-300 font-mono">
                {userProfile.level}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Pos</div>
            </div>
          </div>
        </div>

        {/* Level PROGRESS SLIDER */}
        <div className="mt-8 pt-4 border-t border-slate-900 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Stadium Prestige Progression ({userProfile.points % 25}/25 Pts)</span>
            <span className="font-mono text-yellow-400 font-bold">Next level chest rewards!</span>
          </div>
          <div className="h-2 rounded-full bg-slate-950 border border-slate-850 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-fuchsia-500 transition-all duration-500 ease-out"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. CONFIGURATION PERSONA & CRICKET FINDER QUIZ */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        
        {/* CONFIGURE PERSONA & CHAT FLAGS (Col 5) */}
        <div className="md:col-span-5 rounded-2xl border border-slate-800 bg-[#0a071c]/65 backdrop-blur-md p-5 space-y-5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-850">
            <User className="h-4.5 w-4.5 text-yellow-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Configure Stadium Cards</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Stadium Display Nickname</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick your arena nickname"
                className="w-full bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-450/40 font-semibold"
                maxLength={20}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Pledged Franchise Loop</label>
              <select
                value={favoriteTeam}
                onChange={(e) => setFavoriteTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-450/40 font-bold"
              >
                {TEAMS_LIST.filter(t => t.id !== 'all').map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Favorite Player</label>
              <input
                type="text"
                value={favoritePlayer}
                onChange={(e) => setFavoritePlayer(e.target.value)}
                placeholder="e.g. MS Dhoni, Virat Kohli"
                className="w-full bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-450/40 font-semibold"
                maxLength={20}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Manual Personality State</label>
              <select
                value={cricketPersonality}
                onChange={(e) => setCricketPersonality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-450/40 font-semibold"
              >
                <option value="Strategic 🧠">Strategic 🧠</option>
                <option value="Aggressive 💥">Aggressive 💥</option>
                <option value="Analytical 📊">Analytical 📊</option>
                <option value="Emotional 🤝">Emotional 🤝</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-550 hover:brightness-110 py-3 text-xs font-black text-slate-950 transition cursor-pointer"
            >
              Update Franchise Persona
            </button>

            {isSaved && (
              <p className="text-center text-[10px] text-emerald-400 font-extrabold bg-emerald-950/20 py-2 rounded-lg border border-emerald-500/20">
                ✓ Persona updated! Active feeds filtered to {favoriteTeam}.
              </p>
            )}
          </form>

          {/* SANBOX POINT RECYCLING */}
          <div className="pt-4 border-t border-slate-850 space-y-2.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Testing Controls</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Recalibration shifts points to lock/unlock levels:</p>
            <button
              onClick={() => {
                onResetPoints();
              }}
              className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              ♻ Reset Points to 10 Pts
            </button>
          </div>
        </div>

        {/* ROW 2: TROPHY CABINET AND PERSONALITY QUIZ (Col 7) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* PERSONALITY QUIZ FINDER WIDGET */}
          <div className="rounded-2xl border border-fuchsia-500/10 bg-gradient-to-br from-[#120a22] to-slate-950 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-850">
              <Sparkles className="h-4.5 w-4.5 text-fuchsia-400 animate-spin" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Interactive personality locator quiz</h3>
            </div>

            {activeQuizStep === null ? (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Unsure of your cricket style? Take a quick 3-question analytical quiz to discover your true IPL Soulmate style tag (Strategic, Aggressive, Analytical, or Emotional!).
                </p>
                {quizResult && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 text-center">
                    ✓ Quiz Complete! Your computed personality is: <span className="text-white uppercase font-black tracking-wider">{quizResult}</span>! Auto-saved.
                  </div>
                )}
                <button
                  onClick={startQuiz}
                  className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 py-2.5 px-4 text-xs font-black text-white cursor-pointer"
                >
                  🚀 Spin Cricket Style Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-fuchsia-400 uppercase">
                  <span>Question {activeQuizStep + 1} of {quizQuestions.length}</span>
                  <span>Interactive style finder</span>
                </div>

                <h4 className="text-xs font-black text-white">{quizQuestions[activeQuizStep].title}</h4>

                <div className="space-y-2">
                  {quizQuestions[activeQuizStep].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => selectQuizOption(opt.value)}
                      className="w-full text-left p-3 rounded-xl border border-slate-850 bg-slate-950/40 text-[11px] font-semibold text-slate-300 hover:border-fuchsia-550/30 hover:bg-slate-900/40 transition cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REWARDS STATUS LIST */}
          <div className="rounded-2xl border border-slate-805 bg-slate-900/15 p-5 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <div className="flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-yellow-405" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">IPL Prestige Trophy Cabinet</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                UNLOCKED: {badges.length} / {INITIAL_BADGES.length + LOCKED_BADGES.length}
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {INITIAL_BADGES.map((b) => {
                const isUnlocked = badges.some(it => it.id === b.id);
                
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3.5 space-y-1.5 text-left transition ${
                      isUnlocked 
                        ? 'border-yellow-500/20 bg-slate-900/30' 
                        : 'border-slate-850 bg-slate-950/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl filter drop-shadow select-none">{b.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-100">{b.name}</h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          isUnlocked ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      {b.description}
                    </p>
                  </div>
                );
              })}

              {LOCKED_BADGES.map((b) => {
                const isUnlocked = badges.some(it => it.id === b.id);
                
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3.5 space-y-1.5 text-left transition ${
                      isUnlocked 
                        ? b.color + ' border-fuchsia-500/30 shadow' 
                        : 'border-slate-850 bg-slate-950/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl filter drop-shadow select-none">{isUnlocked ? b.icon : '🔒'}</span>
                      <div>
                        <h4 className={`text-xs font-black ${isUnlocked ? 'text-fuchsia-300' : 'text-slate-550'}`}>{b.name}</h4>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 bg-slate-900 text-slate-500 rounded font-mono">
                          {isUnlocked ? 'UNLOCKED' : 'STREAK LOCK'}
                        </span>
                      </div>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-semibold ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-3">
              <Activity className="h-5 w-5 text-yellow-405 shrink-0" />
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                🚀 **Level Up Milestone**: Rise to level indices by interacting with Opposing fans in Live Match rooms (+5 prestige points per action).
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
