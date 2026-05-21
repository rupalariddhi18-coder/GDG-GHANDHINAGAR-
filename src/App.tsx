import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, MessageSquare, Bot, User, Award, Zap, LogOut, CheckCircle, Flame, Sparkles } from 'lucide-react';
import { UserProfile, Badge, SportType, MatchStats, Post } from './types';
import { INITIAL_POSTS, INITIAL_MATCHES, INITIAL_BADGES, LOCKED_BADGES } from './data';

import HomeSection from './components/HomeSection';
import CommunitySection from './components/CommunitySection';
import LiveMatchRoom from './components/LiveMatchRoom';
import AIChatbot from './components/AIChatbot';
import UserProfileSection from './components/UserProfileSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeSport, setActiveSport] = useState<SportType>('csk_mi');
  
  // Community Filter argument (e.g. filter to specific team when redirected from debate lists)
  const [communityFilter, setCommunityFilter] = useState<string>('all');

  // Gamified User state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Thala_Superfan',
    favoriteTeam: 'CSK',
    points: 15, // Starts with basic interaction currency
    badges: [INITIAL_BADGES[0]], // Starts with "First Blood"
    joinedDate: 'May 2026',
    level: 1402,
    cricketPersonality: 'Strategic 🧠',
    favoritePlayer: 'MS Dhoni'
  });

  // Dynamic Live Score state
  const [matches, setMatches] = useState<Record<SportType, MatchStats>>(INITIAL_MATCHES);

  // Community Posts state
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // Real-time floating Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Poll server for raw sports match telemetry (optional overlay check)
  useEffect(() => {
    async function fetchLiveScores() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(prev => ({
            csk_mi: {
              ...prev.csk_mi,
              score: data.csk_mi.score,
              time: data.csk_mi.time,
              details: data.csk_mi.details || prev.csk_mi.details
            },
            rcb_kkr: {
              ...prev.rcb_kkr,
              score: data.rcb_kkr.score,
              time: data.rcb_kkr.time,
              details: data.rcb_kkr.details || prev.rcb_kkr.details
            },
            srh_gt: {
              ...prev.srh_gt,
              score: data.srh_gt.score,
              time: data.srh_gt.time,
              details: data.srh_gt.details || prev.srh_gt.details
            }
          }));
        }
      } catch (err) {
        console.warn("Using offline state cache for active sports matches.", err);
      }
    }

    fetchLiveScores();
    const timer = setInterval(fetchLiveScores, 15000); // refresh matches every 15s
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. ADD gamified prestige points
  const handleAddPoints = (pts: number) => {
    setUserProfile(prev => {
      const newPoints = prev.points + pts;
      const prevLevel = Math.max(1, Math.floor(prev.points / 25) + 1);
      const nextLevel = Math.max(1, Math.floor(newPoints / 25) + 1);
      
      if (nextLevel > prevLevel) {
        // Trigger Level-Up Celebration!
        triggerToast(`🎉 PRESTIGE LEVEL UP! You reached Level ${nextLevel} Fan! Keep analyzing!`);
      }
      
      return {
        ...prev,
        points: newPoints
      };
    });
  };

  // 2. UNLOCK secret user badges
  const handleUnlockBadge = (badgeId: string) => {
    // Check if badge is already unlocked
    const isUnlocked = userProfile.badges.some(b => b.id === badgeId);
    if (isUnlocked) return;

    // Search inside INITIAL_BADGES or LOCKED_BADGES
    const found = INITIAL_BADGES.find(b => b.id === badgeId) || LOCKED_BADGES.find(b => b.id === badgeId);
    if (!found) return;

    setUserProfile(prev => ({
      ...prev,
      badges: [...prev.badges, found]
    }));

    triggerToast(`🏆 BADGE UNLOCKED: "${found.icon} ${found.name}" for completing fan milestones!`);
  };

  // 3. CAST vote in Live predicting polls
  const handleVotePrediction = (sport: SportType, option: 'teamA' | 'teamB' | 'draw') => {
    setMatches(prev => {
      const m = prev[sport];
      const votes = { ...m.predictions };
      
      // Increment chosen by 1
      votes[option] = votes[option] + 1;
      
      // Recount scale or make sure totals sum realistic percents
      const sum = votes.teamA + votes.teamB + votes.draw;
      
      return {
        ...prev,
        [sport]: {
          ...m,
          predictions: {
            teamA: Math.round((votes.teamA / sum) * 100),
            teamB: Math.round((votes.teamB / sum) * 100),
            draw: Math.round((votes.draw / sum) * 100)
          }
        }
      };
    });
  };

  // 4. ADD custom community circle post
  const handleAddPost = (postDetails: Omit<Post, 'id' | 'likes' | 'comments' | 'reactions' | 'timestamp'>) => {
    const newPost: Post = {
      id: `post-local-${Date.now()}`,
      team: postDetails.team,
      author: postDetails.author,
      avatar: postDetails.avatar,
      badge: postDetails.badge,
      content: postDetails.content,
      timestamp: 'Just Now',
      likes: 0,
      likedByUser: false,
      reactions: { fire: 0, heart: 0, clap: 0 },
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    handleAddPoints(10); // Reward for publish

    // Fast checklist trigger for first feedback post
    handleUnlockBadge('badge-1');
  };

  // 5. ADD comment inside a post circle
  const handleAddComment = (postId: string, commentContent: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const newComment = {
        id: `c-local-${Date.now()}`,
        author: userProfile.username || 'AnonymousFan',
        avatar: '🎖️',
        content: commentContent,
        timestamp: 'Just Now'
      };

      return {
        ...p,
        comments: [...p.comments, newComment]
      };
    }));

    handleAddPoints(5); // Comment reward
  };

  // 6. ADD reactions/Likes inside a post
  const handleAddReaction = (postId: string, type: 'fire' | 'heart' | 'clap' | 'like') => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      if (type === 'like') {
        const liked = !p.likedByUser;
        return {
          ...p,
          likedByUser: liked,
          likes: liked ? p.likes + 1 : p.likes - 1
        };
      } else {
        const reactions = { ...p.reactions };
        const previousReaction = p.userReaction;
        
        // If they click same emoji, toggle it off
        if (previousReaction === type) {
          reactions[type] = Math.max(0, reactions[type] - 1);
          return {
            ...p,
            userReaction: null,
            reactions
          };
        }

        // If they had a different reaction before, decrement it
        if (previousReaction) {
          reactions[previousReaction] = Math.max(0, reactions[previousReaction] - 1);
        }

        // Increment new reaction
        reactions[type] = reactions[type] + 1;
        handleAddPoints(2); // reaction points

        return {
          ...p,
          userReaction: type,
          reactions
        };
      }
    }));
  };

  // Helper coordinator for targeted navigation
  const handleNavigate = (tab: string, arg?: any) => {
    setActiveTab(tab);
    if (tab === 'community' && arg) {
      setCommunityFilter(arg); // filter posts
    } else if (tab === 'match' && arg) {
      setActiveSport(arg as SportType); // activate target arena
    }
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset helper
  const handleResetPoints = () => {
    setUserProfile(prev => ({
      ...prev,
      points: 10,
      badges: [INITIAL_BADGES[0]]
    }));
  };

  return (
    <div className="min-h-screen bg-[#070514] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* GLOBAL HUD GLOW ACCENTS */}
      <div className="pointer-events-none fixed top-0 left-1/4 h-[400px] w-[500px] -translate-x-1/2 bg-cyan-700/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 h-[450px] w-[500px] translate-x-1/2 bg-fuchsia-850/5 rounded-full blur-[140px]" />

      {/* CORE FRAMEWORK STREAK HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#070514]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* LOGO */}
          <div 
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            id="brand-logo"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-405 to-orange-500 shadow-md shadow-orange-550/10">
              <span className="text-sm font-black text-slate-950">IC</span>
            </div>
            <div>
              <span className="text-md sm:text-lg font-black tracking-tight text-white">
                IPL<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-black animate-pulse"> Connect</span>
              </span>
              <span className="text-[8px] font-bold block text-slate-500 tracking-wider">IPL REAL-TIME FAN CONVERSION</span>
            </div>
          </div>

          {/* DUST NAVIGATION LINKS LIST */}
          <nav className="hidden md:flex items-center gap-1.5" id="header-navbar">
            {[
              { id: 'home', label: '🏟️ Stadium Lobby', icon: null },
              { id: 'match', label: '🔥 Live Arena', icon: null },
              { id: 'community', label: '💬 Discussion Circles', icon: null },
              { id: 'ai', label: '🤖 AI Assist', icon: null }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'community') setCommunityFilter('all');
                    handleNavigate(tab.id);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border border-slate-800 text-cyan-400' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* GAMIFIED USER HEADER BADGE COUNTER */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleNavigate('profile')}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900 p-1.5 pr-3 transition cursor-pointer select-none"
              id="header-prestige-capsule"
            >
              <div className="h-6.5 w-6.5 rounded-lg bg-cyan-950 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shadow shadow-cyan-500/10">
                💎
              </div>
              <div className="text-left leading-none">
                <span className="text-[8px] text-slate-500 font-bold block">PRESTIGE PTS</span>
                <span className="text-xs font-mono font-black text-white">{userProfile.points}</span>
              </div>
            </div>

            <button 
              onClick={() => handleNavigate('profile')}
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
              title="View Fan Profile"
            >
              <User className="h-4.5 w-4.5 text-fuchsia-400" />
            </button>
          </div>

        </div>
      </header>

      {/* FLOATING ACTION NOTIFICATION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0e1628] p-4 text-xs shadow-2xl shadow-cyan-500/10 flex gap-3 items-center"
            id="floating-prestige-toast"
          >
            <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-spin" />
            </div>
            <p className="text-slate-100 font-bold leading-relaxed pr-2">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE BODY CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="min-h-[60vh]"
          >
            {activeTab === 'home' && (
              <HomeSection 
                matches={matches} 
                onNavigate={handleNavigate} 
                trendingTopics={[
                  { id: 'topic-1', category: '🦁 CSK Franchise', title: 'Will Dhoni continue his finish masterclass or take full coaching reins?', fansCount: 420, teamId: 'CSK' },
                  { id: 'topic-2', category: '👑 RCB Loyal', title: 'Can Travis Head handle KKR spin variations at Eden Gardens stadium?', fansCount: 280, teamId: 'SRH' },
                  { id: 'topic-3', category: '🔮 KKR Vibe', title: 'Will Sunil Narine open the batting alongside Salt under high chase pressures?', fansCount: 195, teamId: 'KKR' }
                ]}
              />
            )}

            {activeTab === 'community' && (
              <CommunitySection 
                posts={posts} 
                userProfile={userProfile} 
                initialFilter={communityFilter}
                onAddPost={handleAddPost} 
                onAddComment={handleAddComment} 
                onAddReaction={handleAddReaction} 
              />
            )}

            {activeTab === 'match' && (
              <LiveMatchRoom 
                matches={matches} 
                activeSport={activeSport} 
                setActiveSport={setActiveSport} 
                userProfile={userProfile}
                onAddPoints={handleAddPoints}
                onUnlockBadge={handleUnlockBadge}
                onVotePrediction={handleVotePrediction}
              />
            )}

            {activeTab === 'ai' && (
              <AIChatbot 
                userProfile={userProfile} 
                onAddPoints={handleAddPoints} 
                onUnlockBadge={handleUnlockBadge} 
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileSection 
                userProfile={userProfile} 
                badges={userProfile.badges}
                onUpdateProfile={(username, favTeam, favPlayer, personality) => {
                  setUserProfile(prev => ({ 
                    ...prev, 
                    username, 
                    favoriteTeam: favTeam,
                    favoritePlayer: favPlayer,
                    cricketPersonality: personality
                  }));
                  triggerToast("✓ Persona updated! Active feeds filtered successfully.");
                }} 
                onResetPoints={handleResetPoints} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE HUD FOOTER TAB NAVIGATION */}
      <footer className="md:hidden fixed bottom-0 inset-x-0 bg-[#070514]/90 backdrop-blur-lg border-t border-slate-900 z-40 py-2.5 px-4 flex justify-between items-center" id="mobile-tabs-bar">
        {[
          { id: 'home', label: 'Home', icon: '🏟️' },
          { id: 'match', label: 'Arena', icon: '🔥' },
          { id: 'community', label: 'Feed', icon: '💬' },
          { id: 'ai', label: 'Guru', icon: '🤖' },
          { id: 'profile', label: 'Fan', icon: '🏅' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'community') setCommunityFilter('all');
                handleNavigate(tab.id);
              }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <span className={`text-lg transition transform ${isActive ? 'scale-120' : 'opacity-60'}`}>{tab.icon}</span>
              <span className={`text-[9px] font-black tracking-wider ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </footer>

      {/* Clean Bottom spacing footer for desktop views */}
      <footer className="hidden md:block py-16 border-t border-slate-900 bg-slate-950/20 text-center text-[10px] text-slate-600 font-bold tracking-widest gap-2">
        <p>© 2026 IPL CONNECT REAL-TIME SPORTS INTEGRATED LOYALTY PLATFORM. ALL RIGHTS RESERVED.</p>
        <p className="mt-1 text-yellow-500/40">POWERED BY GEMINI COGNITIVE INTELLECT • CRICKET REAL-TIME PORTAL</p>
      </footer>

    </div>
  );
}
