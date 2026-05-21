import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Play, MessageSquare, ArrowRight, Zap, Target, Shield, Users, Sparkles, Heart, Check, Gamepad2, ChevronRight, UserPlus, HeartHandshake, Eye, Star, Sparkle, RefreshCw } from 'lucide-react';
import { MatchStats, SportType, FriendMatch, UserProfile } from '../types';
import { SUGGESTED_FRIENDS, IPL_POINTS_TABLE, TEAMS_LIST } from '../data';
import StoryReelsLounge from './StoryReelsLounge';

interface HomeSectionProps {
  matches: Record<SportType, MatchStats>;
  onNavigate: (tab: string, arg?: any) => void;
  onAddPoints: (pts: number) => void;
  onTriggerToast: (msg: string) => void;
  trendingTopics: Array<{
    id: string;
    category: string;
    title: string;
    fansCount: number;
    teamId: string;
  }>;
  userProfile: UserProfile;
}

export default function HomeSection({ matches, onNavigate, onAddPoints, onTriggerToast, trendingTopics, userProfile }: HomeSectionProps) {
  // Local state for friendships trigger
  const [friendsList, setFriendsList] = useState<FriendMatch[]>(SUGGESTED_FRIENDS);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Home Page Personalized State
  const [overrideTeam, setOverrideTeam] = useState<string>(userProfile.favoriteTeam || 'CSK');
  const [overridePlayer, setOverridePlayer] = useState<string>(userProfile.favoritePlayer || 'MS Dhoni');
  const [personalization, setPersonalization] = useState<{
    welcomeHeading: string;
    specialAnalysis: string;
    favoriteTeamStats: string;
    recommendedVibe: string;
    customQuote: string;
  } | null>(null);
  const [isPersonalizing, setIsPersonalizing] = useState<boolean>(false);

  // Call the server personalization endpoint
  const loadPersonalization = async (team: string, player: string) => {
    setIsPersonalizing(true);
    try {
      const response = await fetch('/api/personalize-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteTeam: team,
          favoritePlayer: player,
          cricketPersonality: userProfile.cricketPersonality || 'Strategic 🧠'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPersonalization(data);
      }
    } catch (err) {
      console.warn("Personalization lookup error:", err);
    } finally {
      setIsPersonalizing(false);
    }
  };

  useEffect(() => {
    loadPersonalization(overrideTeam, overridePlayer);
  }, [overrideTeam, overridePlayer, userProfile.cricketPersonality]);

  const handleSendFriendRequest = (id: string, name: string) => {
    setFriendsList(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, isFriendRequested: true };
      }
      return f;
    }));
    
    setSuccessToast(`🏏 Friendship request sent to ${name}! Your IPL loyalties matched at ${friendsList.find(f => f.id === id)?.matchPercentage}%!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const getTeamLogoAndColor = (teamCode: string) => {
    const found = TEAMS_LIST.find(t => t.id === teamCode);
    return {
      icon: found?.icon || '🏏',
      color: found?.color || 'from-yellow-400 to-amber-500',
      pColor: found?.primaryColor || 'text-yellow-400',
      name: found?.name || teamCode
    };
  };

  return (
    <div className="space-y-10" id="home-view-wrapper">
      
      {/* SUCCESS POPUP FOR RELATIONSHIP MATCH */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-slate-950/95 border border-emerald-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3.5"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">IPL Soulmates Linked</h4>
              <p className="text-[11px] text-emerald-300 font-medium leading-relaxed">{successToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO BANNER WITH STADIUM ATMOSPHERE */}
      <section className="relative overflow-hidden rounded-3xl border border-yellow-500/10 bg-gradient-to-br from-[#0b071a] via-[#100c28] to-[#1a1340] p-8 sm:p-12 shadow-2xl" id="ipl-bond-hero">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-10 left-10 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl animate-pulse" />

        <div className="relative max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-yellow-400 capitalize"
          >
            <Sparkles className="h-3.5 w-3.5 fill-yellow-400" /> Share the IPL Hype with True Cricket Soulmates
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Connect, Vibe & Cheer on <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-fuchsia-500 hover:brightness-110 transition duration-300">IPLVerse</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-md leading-relaxed max-w-2xl"
          >
            Watch your matching team battle, share raw feelings, sync webcam watch parties, predict balls together, and find buddies who have the same cricket heartbeat! 
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <button 
              onClick={() => onNavigate('community')}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:brightness-110 transition duration-300 cursor-pointer"
              id="hero-join-groups"
            >
              Discuss with circles
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('match')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur px-6 py-3.5 text-sm font-bold text-slate-250 hover:bg-slate-800 hover:border-slate-600 transition duration-300 cursor-pointer"
              id="hero-go-arena"
            >
              <Trophy className="h-4 w-4 text-yellow-400 animate-spin" />
              Live Fan Zone Arena
            </button>
          </motion.div>
        </div>
      </section>

      {/* 1B. AI PERSONALIZATION COMMAND HUB */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/10 p-6 md:p-8 relative overflow-hidden backdrop-blur-md shadow-xl" id="ai-personalization-dashboard">
        {/* Neon Team Branding Glow Effects */}
        <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ${
          overrideTeam === 'CSK' ? 'bg-yellow-400' :
          overrideTeam === 'RCB' ? 'bg-red-500' :
          overrideTeam === 'MI' ? 'bg-blue-600' :
          overrideTeam === 'KKR' ? 'bg-purple-600' :
          overrideTeam === 'SRH' ? 'bg-orange-600' : 'bg-teal-500'
        }`} />

        <div className="relative mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
          <div className="space-y-1.5Col">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#facc15] uppercase bg-yellow-500/10 px-3.5 py-1 rounded-full border border-yellow-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-yellow-400" />
              AI HYPER-PERSONALIZED MATCH ENGINE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1.5">
              Your Unique IPL Hub Vibe
            </h2>
            <p className="text-xs text-slate-400">
              Your favorite franchise, key player feeds, and cricket personality analysis synchronized in real-time.
            </p>
          </div>

          {/* Quick Team Shifter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 mr-1 uppercase">Switch Vibe:</span>
            {['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'GT'].map((teamCode) => {
              const teamInfo = getTeamLogoAndColor(teamCode);
              return (
                <button
                  key={teamCode}
                  onClick={() => {
                    setOverrideTeam(teamCode);
                    onAddPoints(2);
                    onTriggerToast(`⚡ Switched homepage simulation to ${teamCode} franchise focus!`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-tight border transition cursor-pointer ${
                    overrideTeam === teamCode
                      ? 'bg-gradient-to-tr from-slate-900 to-slate-950 border-yellow-500/40 text-yellow-400 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{teamInfo.icon}</span>
                  {teamCode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Display of personalized layouts */}
        <div className="grid gap-6 md:grid-cols-12 items-stretch">
          
          {/* LEFT COLUMN: Custom Franchise Jersey & Slogan banner */}
          <div className="md:col-span-4 rounded-2xl bg-slate-950/60 border border-slate-850 p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
            {/* Visual background logo watermark */}
            <div className="absolute -bottom-6 -right-6 text-7xl opacity-15 select-none transition group-hover:scale-110 duration-500">
              {getTeamLogoAndColor(overrideTeam).icon}
            </div>

            <div className="space-y-3.5">
              <span className="text-[9px] font-mono font-black text-fuchsia-400 uppercase tracking-widest">
                🏆 CHAMPIONS CREED
              </span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                  {getTeamLogoAndColor(overrideTeam).icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {getTeamLogoAndColor(overrideTeam).name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold">ACTIVE WATCHER AREA</p>
                </div>
              </div>

              {/* Input for Player customizing focus */}
              <div className="pt-2">
                <label className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Focus Star Player:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={overridePlayer}
                    onChange={(e) => setOverridePlayer(e.target.value)}
                    placeholder="Enter Player (e.g. Virat Kohli)"
                    className="flex-grow rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 font-semibold"
                  />
                  <button
                    onClick={() => {
                      loadPersonalization(overrideTeam, overridePlayer);
                      onAddPoints(3);
                      onTriggerToast(`✨ AI matches updated to track ${overridePlayer}!`);
                    }}
                    className="rounded-lg bg-yellow-500 hover:brightness-110 px-2.5 flex items-center justify-center text-slate-950 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isPersonalizing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900">
              <p className="text-xs uppercase font-mono font-extrabold text-white tracking-widest text-[#10b981]">
                "{personalization?.customQuote || 'Whistle Podu!'}"
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Dynamic Franchise Slogan</p>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Live Personalization Pointers & Analytical Oracle response */}
          <div className={`md:col-span-8 rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition ${
            overrideTeam === 'CSK' ? 'bg-[#facc15]/3 border-yellow-500/10' :
            overrideTeam === 'RCB' ? 'bg-[#f43f5e]/3 border-rose-500/10' :
            overrideTeam === 'MI' ? 'bg-[#2563eb]/3 border-blue-500/10' :
            overrideTeam === 'KKR' ? 'bg-[#9333ea]/3 border-purple-500/10' :
            overrideTeam === 'SRH' ? 'bg-[#ea580c]/3 border-orange-500/10' : 'bg-[#0f766e]/3 border-teal-500/10'
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-yellow-500 font-extrabold uppercase">
                    🔮 AI PERSONALIZED STRATEGY BRIEF
                  </span>
                  <h4 className="text-md font-black text-white">
                    {isPersonalizing ? (
                      <span className="flex items-center gap-2 text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin text-yellow-400" /> Connecting to AI Ground Stadiums...
                      </span>
                    ) : (
                      personalization?.welcomeHeading || `Welcome back to the Crew!`
                    )}
                  </h4>
                </div>
                <div className="rounded-lg bg-black px-3 py-1 text-[10px] font-mono font-bold text-slate-400 border border-slate-850 flex items-center gap-1 shrink-0">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  Fans: {Math.floor(Math.random() * 5 + 4)} active matching you
                </div>
              </div>

              {/* Special Analysis text body */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-900">
                {isPersonalizing ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-3.5 bg-slate-850 rounded w-5/6" />
                    <div className="h-3.5 bg-slate-850 rounded w-full" />
                    <div className="h-3.5 bg-slate-850 rounded w-3/4" />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                    {personalization?.specialAnalysis}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-900/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Personalized Playoff Standing Outlook</span>
                <p className="font-extrabold text-[#facc15] mt-1 font-mono">
                  {personalization?.favoriteTeamStats || `${overrideTeam} playoffs probability looks high with a tough opponent upcoming.`}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Synchronized Acoustics Theme</span>
                <p className="font-bold text-slate-350 mt-1 flex items-center gap-1 bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-lg w-fit">
                  🎵 {personalization?.recommendedVibe || 'Ambient Horns & Stadium Vuvuzelas'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* REELS & STORIES PLATFORM LOUNGE */}
      <StoryReelsLounge onAddPoints={onAddPoints} onTriggerToast={onTriggerToast} />

      {/* 2. CHAT FEED & ACTIVE LIVE MATCH FLOATS */}
      <section className="space-y-4" id="live-ipl-matches-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Active IPL Live Duels</h2>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-yellow-400 uppercase bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            🏟️ Stadium Commentary Online
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(matches) as SportType[]).map((sport) => {
            const match = matches[sport];
            const isCSKMI = sport === 'csk_mi';
            const isRCBKKR = sport === 'rcb_kkr';
            
            let colorGradient = 'from-yellow-500 to-blue-500';
            if (isCSKMI) {
              colorGradient = 'from-yellow-400 to-blue-600';
            } else if (isRCBKKR) {
              colorGradient = 'from-red-600 to-purple-800';
            } else {
              colorGradient = 'from-orange-500 to-slate-750';
            }

            return (
              <motion.div
                whileHover={{ y: -6, borderColor: 'rgba(234, 179, 8, 0.35)' }}
                key={sport}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-lg p-5 shadow-xl relative cursor-pointer group"
                onClick={() => onNavigate('match', sport)}
                id={`match-card-${sport}`}
              >
                {/* Visual border edge strip indicating competing teams code */}
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${colorGradient}`} />
                
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="rounded-full border border-slate-800 px-3 py-0.5 text-[10px] font-bold text-slate-300 font-mono">
                      🔥 {match.league}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black tracking-widest text-[#f43f5e] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/25">
                      LIVE
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white tracking-tight group-hover:text-yellow-400 transition mb-2">
                    {match.title}
                  </h3>
                  
                  {/* Digital Scoreboard Frame */}
                  <div className="my-3 p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">SCOREBOARD</span>
                      <span className="text-[10px] font-mono font-bold text-[#10b981]">{match.rr}</span>
                    </div>
                    <div className="text-md sm:text-lg font-black text-white font-mono tracking-tight flex items-center justify-between">
                      <span>{match.score}</span>
                    </div>
                    {match.target && (
                      <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                        🎯 {match.target}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    {match.time}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-yellow-400 font-bold">
                    💬 {match.predictions ? `${Math.max(match.predictions.teamA, match.predictions.teamB)}% support` : "Open prediction"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 group-hover:translate-x-1 transition-transform">
                    Enter Stadium <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. AI SOULMATE FRIENDSHIP MATCHING SECTION */}
      <section className="bg-gradient-to-br from-[#110e2b] via-[#150a24] to-[#070514] border border-fuchsia-500/10 rounded-2xl p-6 shadow-xl" id="ai-matching-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-fuchsia-400 uppercase">AI-powered Matchmaking algorithm</span>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-fuchsia-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">IPL Cricket Soulmates</h2>
            </div>
            <p className="text-xs text-slate-400">Fans with matching teams, similar moods, and overlapping live game emotions.</p>
          </div>
          <p className="text-xs font-mono text-slate-500 font-bold">Algorithms: Gemini Sentiment Matrix</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {friendsList.map((friend) => {
            const team = getTeamLogoAndColor(friend.favoriteTeam);
            
            return (
              <div 
                key={friend.id}
                className="relative rounded-xl border border-slate-800 bg-slate-900/20 p-4 flex flex-col justify-between hover:border-slate-700/60 transition"
              >
                {/* Loyalty compatibility score badge float */}
                <div className="absolute top-3 right-3 text-[10px] font-mono font-black text-fuchsia-400 bg-fuchsia-400/10 px-2 py-0.5 rounded-full border border-fuchsia-500/20">
                  ⚡ {friend.matchPercentage}% Vibe
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    {/* Big emoji user avatar */}
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${team.color} p-0.5 shrink-0 flex items-center justify-center text-xl`}>
                      <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center select-none">
                        {friend.avatar}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-200">{friend.username}</h4>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                        👑 Fav: {friend.favoritePlayer}
                      </span>
                    </div>
                  </div>

                  {/* Team affinity and mood badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-yellow-500/5 border border-yellow-500/10 text-[9px] font-bold py-0.5 px-2 text-yellow-500">
                      {friend.favoriteTeam} Fanatic
                    </span>
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold py-0.5 px-2 text-cyan-400">
                      🎭 Mood: {friend.mood || "Excited"}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    {friend.matchReason}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-850">
                  {friend.isFriendRequested ? (
                    <button className="w-full rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2 text-[10px] font-extrabold text-emerald-400 flex items-center justify-center gap-1 cursor-default">
                      <Check className="h-3 w-3" /> Friends Requested! Sent
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSendFriendRequest(friend.id, friend.username)}
                      className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 py-2 text-[10px] font-extrabold text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Bind Friendship
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. IPL POINTS TABLE & TRENDING DISCUSSIONS */}
      <div className="grid gap-6 md:grid-cols-12 items-start">
        
        {/* IPL STANDINGS TABLE - Col 5 */}
        <section className="md:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/15 p-5 space-y-4" id="ipl- standings">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">IPL Standing Ladder</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">WEEK 7</span>
          </div>

          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-[11px] font-semibold text-left border-collapse">
              <thead>
                <tr className="text-[8px] text-slate-500 tracking-wider uppercase font-bold border-b border-slate-850/40">
                  <th className="py-2 pl-1">FRANCHISE</th>
                  <th className="py-2 text-center">PL</th>
                  <th className="py-2 text-center">W</th>
                  <th className="py-2 text-center">PTS</th>
                  <th className="py-2 text-right pr-1">NRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40">
                {IPL_POINTS_TABLE.map((team, idx) => (
                  <tr 
                    key={team.code} 
                    className={`hover:bg-slate-900/30 transition ${idx < 4 ? 'bg-emerald-500/2 leading-none' : ''}`}
                  >
                    <td className="py-2.5 pl-1 flex items-center gap-1.5">
                      <span className="font-bold text-slate-400 font-mono">{idx + 1}</span>
                      <span className="text-sm select-none">{team.icon}</span>
                      <span className="text-slate-100 font-extrabold">{team.code}</span>
                    </td>
                    <td className="py-2.5 text-center text-slate-350 font-mono">{team.played}</td>
                    <td className="py-2.5 text-center text-slate-350 font-mono">{team.won}</td>
                    <td className="py-2.5 text-center text-yellow-400 font-mono font-bold">{team.pts}</td>
                    <td className={`py-2.5 text-right font-mono pr-1 font-bold ${team.nrr.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{team.nrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 leading-relaxed font-medium">
            💡 **Championship Criteria**: Top 4 sports franchises qualify directly for high-tension IPL playoffs! Post in community circles to build support streaks (+10 Points!).
          </div>
        </section>

        {/* TRENDING DEBATES & MEME DISCUSSIONS - Col 7 */}
        <section className="md:col-span-7 rounded-2xl border border-slate-800 bg-[#0c0a1a]/30 p-5 space-y-4" id="trending-debates">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <Flame className="h-4.5 w-4.5 text-orange-500 fill-orange-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Trending Stadium Debates</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 animate-pulse uppercase">🔥 VERY HIGH HYPE</span>
          </div>

          <div className="space-y-3.5">
            {trendingTopics.map((topic) => {
              const info = getTeamLogoAndColor(topic.teamId);
              
              return (
                <div 
                  key={topic.id}
                  onClick={() => onNavigate('community', topic.teamId)}
                  className="group flex gap-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 transition duration-200 cursor-pointer hover:bg-slate-900/40 hover:border-yellow-500/20"
                >
                  <div className={`h-11 w-11 shrink-0 rounded-lg bg-gradient-to-tr ${info.color} p-0.5 flex items-center justify-center text-xl`}>
                    <div className="h-full w-full bg-slate-950 rounded-[6px] flex items-center justify-center select-none">
                      {info.icon}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                      {info.name} Circle
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-yellow-400 transition">
                      {topic.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[10px] pt-1.5 font-bold">
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <MessageSquare className="h-3 w-3 text-yellow-500" /> {topic.fansCount} discussers
                      </span>
                      <span className="text-[#f43f5e]">Join chat lobby</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WATCH PARTY TELEVISION CALLOUT */}
          <div className="relative overflow-hidden rounded-xl border border-yellow-500/10 bg-gradient-to-r from-[#201509] to-[#12082b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-md">
              <span className="text-[9px] font-black tracking-widest text-[#f59e0b] uppercase block">Virtual Watch Party Lobby</span>
              <h4 className="text-xs font-black text-white">Join CSK vs MI Virtual Watch Lounge!</h4>
              <p className="text-[10px] text-slate-300 font-medium">Toggle webcams, audio stream live with friends, and drop emotional screen overlays!</p>
            </div>
            <button 
              onClick={() => onNavigate('match', 'csk_mi')}
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-[10px] font-extrabold text-slate-950 hover:brightness-110 shrink-0 transition cursor-pointer"
            >
              🎤 Join Watch Room
            </button>
          </div>
        </section>

      </div>

    </div>
  );
}
