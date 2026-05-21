import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Send, Share2, Bookmark, UserPlus, Plus, X, ChevronLeft, ChevronRight, Sparkles, Clock, Flame, Shield, Check } from 'lucide-react';
import { TEAMS_LIST } from '../data';

// Stories & Reels data structures
export interface FanStory {
  id: string;
  author: string;
  avatar: string;
  team: string; // e.g. CSK, MI, RCB etc.
  type: 'story' | 'reel';
  caption: string;
  gradientFrom: string;
  gradientTo: string;
  sticker: string;
  likes: number;
  likedByUser: boolean;
  shares: number;
  comments: Array<{ id: string; author: string; avatar: string; text: string; time: string }>;
  isSaved: boolean;
  isFollowing: boolean;
  viewCount: number;
}

interface StoryReelsLoungeProps {
  onAddPoints: (pts: number) => void;
  onTriggerToast: (msg: string) => void;
}

export default function StoryReelsLounge({ onAddPoints, onTriggerToast }: StoryReelsLoungeProps) {
  // Local list state for stories/reels in the lounge
  const [storiesList, setStoriesList] = useState<FanStory[]>([
    {
      id: 'story-1',
      author: 'Dhoni_Thala_Army',
      avatar: '🦁',
      team: 'CSK',
      type: 'story',
      caption: 'The signature Helicopter shot in Chepauk tonight! MS Dhoni warming up at 11:30 PM under stadium beams. ABSOLUTELY MAGNIFICENT SIGHT! 🚁💛 #ThalaAura #IPL2026',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-amber-600',
      sticker: '🚁',
      likes: 420,
      likedByUser: false,
      shares: 88,
      comments: [
        { id: 'sc-1', author: 'Virat_King_18', avatar: '👑', text: 'Classic Thala stance! Absolute power!', time: '12m' },
        { id: 'sc-2', author: 'MI_Stalker', avatar: '🌀', text: 'Scary sight for our death overs today', time: '8m' },
        { id: 'sc-3', author: 'Lila_Fan', avatar: '🎀', text: 'Dhoni finishes in style!', time: '2m' }
      ],
      isSaved: false,
      isFollowing: false,
      viewCount: 1420
    },
    {
      id: 'story-2',
      author: 'KingKohli_Loyal',
      avatar: '👑',
      team: 'RCB',
      type: 'reel',
      caption: 'Unbelievable high-intensity net progression! King Kohli hitting 8 sixes in 10 deliveries against high pace releases. CHINNASWAMY WILL BREATHE FIRE! 🔥🎤 #EeSalaCupNamde',
      gradientFrom: 'from-red-600',
      gradientTo: 'to-amber-850',
      sticker: '🔱',
      likes: 689,
      likedByUser: false,
      shares: 145,
      comments: [
        { id: 'sc-4', author: 'Pat_Cummins_FC', avatar: '🧡', text: 'We have a bowling strategy ready for this!', time: '25m' },
        { id: 'sc-5', author: 'RCB_Forever', avatar: '👑', text: 'Prestige looking totally royal this week', time: '18m' }
      ],
      isSaved: false,
      isFollowing: false,
      viewCount: 2201
    },
    {
      id: 'story-3',
      author: 'MI_Paltan_Hub',
      avatar: '🌀',
      team: 'MI',
      type: 'reel',
      caption: 'Jasprit Bumrah yorker telemetry footage! Watch the late swing at 146.8 km/h right onto the base of blockholes. Batter had zero time! 🌪️🎳 #MumbaiPaltan #BoomYorkers',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-cyan-600',
      sticker: '🌀',
      likes: 512,
      likedByUser: false,
      shares: 94,
      comments: [
        { id: 'sc-6', author: 'YellowArmyCSK', avatar: '🦁', text: 'Thala will block this smoothly', time: '40m' },
        { id: 'sc-7', author: 'GullyCricketer', avatar: '🏏', text: 'That releasing hyperextension angle is pure science', time: '30m' }
      ],
      isSaved: false,
      isFollowing: false,
      viewCount: 1845
    },
    {
      id: 'story-4',
      author: 'SRH_SunRisers_Lounge',
      avatar: '🧡',
      team: 'SRH',
      type: 'story',
      caption: 'Heinrich Klaasen reverse sweeping spin outside the stadium boundary! 108 meters hit during team rehearsals in Uppal. Boundary lines are too short! ⚡🔥 #OrangeArmy #KlaasenStorm',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-red-600',
      sticker: '💥',
      likes: 340,
      likedByUser: false,
      shares: 41,
      comments: [
        { id: 'sc-8', author: 'KKR_HypeEngine', avatar: '🔮', text: 'Wait until Narine puts the squeeze on this over', time: '1h' }
      ],
      isSaved: false,
      isFollowing: false,
      viewCount: 910
    },
    {
      id: 'story-5',
      author: 'Ami_KKR_Loyalists',
      avatar: '🔮',
      team: 'KKR',
      type: 'story',
      caption: 'Sunil Narine casual masterclass! Maintains a completely stoic face, does not wear a smile or drop sweat, and delivers 4 wickets back-to-back. ICE COOL THREAT! 😑🌪️ #AmiKKR',
      gradientFrom: 'from-indigo-650',
      gradientTo: 'to-purple-800',
      sticker: '🔮',
      likes: 295,
      likedByUser: false,
      shares: 52,
      comments: [
        { id: 'sc-9', author: 'RCB_Vibe', avatar: '👑', text: 'Cheat code opening spinner batsman!', time: '1h' }
      ],
      isSaved: false,
      isFollowing: false,
      viewCount: 742
    }
  ]);

  // View state managers
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [storyCommentText, setStoryCommentText] = useState<string>('');
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; left: number }>>([]);
  const heartCounter = useRef<number>(0);

  // Story Creator form state
  const [formUsername, setFormUsername] = useState<string>('');
  const [formTeam, setFormTeam] = useState<string>('CSK');
  const [formCaption, setFormCaption] = useState<string>('');
  const [formSticker, setFormSticker] = useState<string>('🔥');
  const [formType, setFormType] = useState<'story' | 'reel'>('story');

  // Story progress timer
  useEffect(() => {
    if (activeStoryIdx === null) return;
    
    // Auto-advance story after 6 seconds of static viewing
    const autoAdvanceTimer = setTimeout(() => {
      handleNextStory();
    }, 6000);

    return () => clearTimeout(autoAdvanceTimer);
  }, [activeStoryIdx]);

  const handleNextStory = () => {
    setActiveStoryIdx(prev => {
      if (prev === null) return null;
      if (prev < storiesList.length - 1) {
        return prev + 1;
      } else {
        return null; // Close at the end
      }
    });
  };

  const handlePrevStory = () => {
    setActiveStoryIdx(prev => {
      if (prev === null) return null;
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  // Interactions Inside Reel
  const toggleLikeReel = (id: string) => {
    setStoriesList(prev => prev.map(s => {
      if (s.id === id) {
        const liked = !s.likedByUser;
        if (liked) {
          onAddPoints(2);
          // Trigger heart float physics
          triggerFloatingHearts();
        }
        return {
          ...s,
          likedByUser: liked,
          likes: liked ? s.likes + 1 : s.likes - 1
        };
      }
      return s;
    }));
  };

  const triggerFloatingHearts = () => {
    const newHearts = Array.from({ length: 6 }).map(() => ({
      id: heartCounter.current++,
      left: Math.random() * 80 + 10 // percentage left
    }));
    setFloatingHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1500);
  };

  const handlePostStoryComment = (e: React.FormEvent, storyId: string) => {
    e.preventDefault();
    if (!storyCommentText.trim()) return;

    setStoriesList(prev => prev.map(s => {
      if (s.id === storyId) {
        onAddPoints(5);
        return {
          ...s,
          comments: [
            ...s.comments,
            {
              id: `storycomment-${Date.now()}`,
              author: 'Me (SuperFan)',
              avatar: '🥋',
              text: storyCommentText,
              time: 'Just Now'
            }
          ]
        };
      }
      return s;
    }));
    setStoryCommentText('');
  };

  const toggleSaveReel = (id: string) => {
    setStoriesList(prev => prev.map(s => {
      if (s.id === id) {
        const saved = !s.isSaved;
        if (saved) {
          onAddPoints(3);
          onTriggerToast("✓ Reel saved securely into your Fan Profile Lounge!");
        }
        return { ...s, isSaved: saved };
      }
      return s;
    }));
  };

  const toggleFollowReelUser = (id: string, authorName: string) => {
    setStoriesList(prev => prev.map(s => {
      if (s.id === id) {
        const following = !s.isFollowing;
        if (following) {
          onAddPoints(5);
          onTriggerToast(`✓ Now following ${authorName}! Filtering active feed multipliers.`);
        }
        return { ...s, isFollowing: following };
      }
      return s;
    }));
  };

  const handleShareReel = (id: string, author: string) => {
    setStoriesList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, shares: s.shares + 1 };
      }
      return s;
    }));
    
    // Copy simulated invite link to user
    const simulatedLink = `https://iplverse.com/stadium-rooms/csk_mi?invite=${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(simulatedLink).catch(() => {});
    }
    onTriggerToast(`🔗 Copied invite link for ${author}'s feed status! Send to WhatsApp/Discord.`);
  };

  // Submit story creator
  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCaption.trim()) return;

    const authorNick = formUsername.trim() || 'Verse_Rookie';
    const chosenTeam = TEAMS_LIST.find(t => t.id === formTeam);
    const gradFrom = chosenTeam?.color?.split(' ')[0] || 'from-yellow-400';
    const gradTo = chosenTeam?.color?.split(' ')[1] || 'to-orange-550';

    const newStory: FanStory = {
      id: `story-custom-${Date.now()}`,
      author: authorNick,
      avatar: chosenTeam?.icon || '🏅',
      team: formTeam,
      type: formType,
      caption: formCaption,
      gradientFrom: gradFrom,
      gradientTo: gradTo,
      sticker: formSticker,
      likes: 0,
      likedByUser: false,
      shares: 0,
      comments: [],
      isSaved: false,
      isFollowing: false,
      viewCount: 1
    };

    setStoriesList(prev => [newStory, ...prev]);
    setIsCreatorOpen(false);
    setFormCaption('');
    onAddPoints(20); // Massive prestige boost for story contributions!
    onTriggerToast(`🔥 Status story uploaded successfully to the ${formTeam} Hype feed! +20 Prestige Pts!`);
  };

  return (
    <div className="rounded-2xl border border-slate-900 bg-[#0a071d]/30 p-4 space-y-4" id="stories-lounge-sector">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">IPLVerse Live Stories & Reels</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Stadium web feeds & match reactions</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreatorOpen(true)}
          className="rounded-xl flex items-center gap-1.5 border border-dashed border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/15 py-1.5 px-3 text-[10.5px] font-black text-yellow-405 uppercase tracking-wide cursor-pointer transition"
        >
          <Plus className="h-3.5 w-3.5" /> Publish Story
        </button>
      </div>

      {/* HORIZONTAL CAROUSEL OF STORY CIRCLES */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x" id="stories-carousel">
        {/* Creator Story Trigger Circle */}
        <div 
          onClick={() => setIsCreatorOpen(true)}
          className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start"
        >
          <div className="h-14 w-14 rounded-full bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center hover:border-yellow-500/50 transition">
            <Plus className="h-6 w-6 text-slate-500 hover:text-yellow-405 transition" />
          </div>
          <span className="text-[9.5px] font-bold text-slate-400">My Action</span>
        </div>

        {/* Stories mapping */}
        {storiesList.map((story, idx) => {
          // Pulse halo colors based on supported franchise
          let teamHalo = 'border-yellow-500 bg-yellow-500/10';
          if (story.team === 'RCB') teamHalo = 'border-red-500 bg-red-500/10';
          if (story.team === 'MI') teamHalo = 'border-blue-500 bg-blue-500/10';
          if (story.team === 'SRH') teamHalo = 'border-orange-500 bg-orange-500/10';
          if (story.team === 'KKR') teamHalo = 'border-purple-500 bg-purple-500/10';

          return (
            <div 
              key={story.id}
              onClick={() => setActiveStoryIdx(idx)}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start group"
              id={`story-item-${story.id}`}
            >
              <div className={`h-14 w-14 rounded-full border-2 p-0.5 transition transform group-hover:scale-105 duration-200 ${teamHalo} animate-pulse`}>
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-xl relative select-none">
                  <span>{story.sticker}</span>
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-slate-900 border border-slate-800 text-[8px] flex items-center justify-center font-black text-white leading-none">
                    {story.avatar}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-350 truncate max-w-[65px] leading-tight font-sans">
                {story.author}
              </span>
            </div>
          );
        })}
      </div>

      {/* IMMERSIVE VERTICAL REELS SCREEN SIMULATOR MODAL */}
      <AnimatePresence>
        {activeStoryIdx !== null && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            {/* Click outside to close wrapper */}
            <div className="absolute inset-0" onClick={() => setActiveStoryIdx(null)} />

            {/* Simulated Mobile Frame Card Overlay */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[420px] h-[85vh] rounded-3xl overflow-hidden border border-slate-800 bg-[#060410] flex flex-col shadow-2xl shadow-yellow-500/5"
              id="active-reel-simulation-card"
            >
              {/* Dynamic Animated Gradient Background resembling match action colors */}
              <div className={`absolute inset-0 bg-gradient-to-br ${storiesList[activeStoryIdx].gradientFrom} ${storiesList[activeStoryIdx].gradientTo} opacity-20 pointer-events-none`} />
              
              {/* Mesh dotted stadium layout pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black opacity-80 pointer-events-none" />

              {/* REEL HEADER: Timers, users, toggles */}
              <div className="relative z-10 p-4 space-y-3.5 bg-gradient-to-b from-black/80 to-transparent">
                {/* Simulated Segment Progressive Timeline Bar */}
                <div className="flex gap-1.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  {storiesList.map((_, sIdx) => {
                    const isPassed = sIdx < activeStoryIdx;
                    const isActive = sIdx === activeStoryIdx;
                    return (
                      <div key={sIdx} className="flex-1 h-full bg-white/10 rounded-full relative overflow-hidden">
                        {isPassed && <div className="absolute inset-0 bg-yellow-405" />}
                        {isActive && (
                          <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* User author detail and close option */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl h-10 w-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center select-none">
                      {storiesList[activeStoryIdx].avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-black text-white hover:underline">{storiesList[activeStoryIdx].author}</span>
                        <span className="rounded bg-yellow-450/15 text-yellow-405 font-black text-[7.5px] px-1 py-0.5 border border-yellow-550/20 uppercase">
                          {storiesList[activeStoryIdx].team} LOYAL
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[8.5px] text-slate-405 font-bold font-mono">
                        <Clock className="h-2.5 w-2.5 text-slate-500" /> {storiesList[activeStoryIdx].type === 'reel' ? 'VIRTUAL REEL' : 'STADIUM STORY STATUS'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFollowReelUser(storiesList[activeStoryIdx].id, storiesList[activeStoryIdx].author)}
                      className={`text-[9.5px] font-black uppercase py-1 px-3.5 rounded-full border transition ${
                        storiesList[activeStoryIdx].isFollowing 
                          ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' 
                          : 'bg-yellow-405 text-slate-950 border-yellow-500 font-extrabold hover:brightness-105'
                      }`}
                    >
                      {storiesList[activeStoryIdx].isFollowing ? '✓ Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => setActiveStoryIdx(null)}
                      className="text-slate-400 hover:text-white bg-slate-950/60 p-1.5 rounded-full"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* REEL CORE BODY: Giant Sticker, Float Hearts & Captain Banner */}
              <div className="flex-1 relative z-10 flex flex-col justify-between p-4 min-h-0">
                {/* Previous/Next overlay touch sensors */}
                <button 
                  onClick={handlePrevStory}
                  disabled={activeStoryIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 border border-slate-850 hover:bg-black/75 cursor-pointer disabled:opacity-0 transition"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <button 
                  onClick={handleNextStory}
                  disabled={activeStoryIdx === storiesList.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 border border-slate-850 hover:bg-black/75 cursor-pointer disabled:opacity-0 transition"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>

                {/* Giant pulsing sticker/emoji representing live footage simulation */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <motion.div 
                    animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="text-7xl select-none filter drop-shadow-[0_15px_25px_rgba(234,179,8,0.25)]"
                  >
                    {storiesList[activeStoryIdx].sticker}
                  </motion.div>
                  
                  {/* Overlay text signaling "FOOTAGE REHEARSAL PLAYBACK" */}
                  <span className="mt-4 inline-block bg-black/75 border border-red-500/20 text-red-400 text-[8.5px] font-mono font-black tracking-widest uppercase px-3 py-1 rounded-full animate-pulse select-none">
                    📡 REPLAY ON SATELLITE LOOP
                  </span>

                  {/* Physics Heart Animation Floats */}
                  <AnimatePresence>
                    {floatingHearts.map(heart => (
                      <motion.span
                        key={heart.id}
                        initial={{ opacity: 1, scale: 0.5, y: 150, x: 0 }}
                        animate={{ 
                          opacity: 0, 
                          scale: 2, 
                          y: -350, 
                          x: (heart.left - 50) * 2 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute text-red-500 text-3xl pointer-events-none drop-shadow filter z-30 font-bold"
                        style={{ left: `${heart.left}%` }}
                      >
                        ❤️
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Left caption details wrapper & right interactive panel */}
                <div className="grid grid-cols-12 gap-3 items-end pt-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                  {/* CAPTION BLOCK */}
                  <div className="col-span-10 space-y-2">
                    <p className="text-xs sm:text-xs text-slate-100 leading-relaxed font-bold select-text pr-2 py-1 max-h-[120px] overflow-y-auto">
                      {storiesList[activeStoryIdx].caption}
                    </p>
                    
                    {/* View Counts */}
                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-mono font-black uppercase">
                      <Sparkles className="h-3 w-3 text-cyan-405" /> {storiesList[activeStoryIdx].viewCount} stadium views • Tap screen to interact
                    </div>
                  </div>

                  {/* RIGHT VERTICAL LAYOUT FEEDBACK BUTTONS */}
                  <div className="col-span-2 flex flex-col items-center gap-4 shrink-0 pb-1">
                    {/* HEART/LIKE BUTTON */}
                    <div className="text-center space-y-0.5">
                      <button 
                        onClick={() => toggleLikeReel(storiesList[activeStoryIdx].id)}
                        className={`p-2.5 rounded-full transition transform hover:scale-120 flex items-center justify-center ${
                          storiesList[activeStoryIdx].likedByUser 
                            ? 'bg-rose-600/35 border border-rose-500 text-rose-500' 
                            : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${storiesList[activeStoryIdx].likedByUser ? 'fill-rose-500' : ''}`} />
                      </button>
                      <span className="text-[9.5px] font-mono font-black text-slate-400">{storiesList[activeStoryIdx].likes}</span>
                    </div>

                    {/* SHARE BUTTON */}
                    <div className="text-center space-y-0.5">
                      <button 
                        onClick={() => handleShareReel(storiesList[activeStoryIdx].id, storiesList[activeStoryIdx].author)}
                        className="p-2.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 transition transform hover:scale-120 flex items-center justify-center"
                      >
                        <Share2 className="h-4.5 w-4.5" />
                      </button>
                      <span className="text-[9.5px] font-mono font-black text-slate-400">{storiesList[activeStoryIdx].shares}</span>
                    </div>

                    {/* BOOKMARK/SAVE BUTTON */}
                    <div className="text-center space-y-0.5">
                      <button 
                        onClick={() => toggleSaveReel(storiesList[activeStoryIdx].id)}
                        className={`p-2.5 rounded-full transition transform hover:scale-120 flex items-center justify-center ${
                          storiesList[activeStoryIdx].isSaved 
                            ? 'bg-cyan-500/25 border border-cyan-500 text-cyan-405' 
                            : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <Bookmark className={`h-4.5 w-4.5 ${storiesList[activeStoryIdx].isSaved ? 'fill-cyan-405' : ''}`} />
                      </button>
                      <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase">{storiesList[activeStoryIdx].isSaved ? 'SAVED' : 'SAVE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* REEL FOOTER COMMENT INPUT BOX DRAWER */}
              <div className="relative z-10 border-t border-slate-900 bg-slate-950 p-3 space-y-2">
                {/* Active comment counts */}
                <span className="text-[8.5px] font-black tracking-widest text-[#a855f7] uppercase block font-mono">
                  💬 Stadium Arena Comments ({storiesList[activeStoryIdx].comments.length})
                </span>

                {/* Miniature local comments list scroll */}
                <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1" id="reels-comments-scroller">
                  {storiesList[activeStoryIdx].comments.map(c => (
                    <div key={c.id} className="text-[10.5px] bg-[#070514]/65 p-2 rounded-xl border border-slate-900/50 flex gap-2 items-start font-semibold">
                      <span className="text-xs shrink-0 select-none">{c.avatar}</span>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <strong className="text-white font-extrabold">{c.author}</strong>
                          <span className="font-bold">{c.time} ago</span>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed font-sans">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {storiesList[activeStoryIdx].comments.length === 0 && (
                    <p className="text-center text-[9px] text-slate-500 italic py-2">No comments at strike yet. Play first shot!</p>
                  )}
                </div>

                {/* Typing container */}
                <form 
                  onSubmit={(e) => handlePostStoryComment(e, storiesList[activeStoryIdx].id)}
                  className="flex gap-2 pt-1"
                >
                  <input 
                    type="text"
                    value={storyCommentText}
                    onChange={(e) => setStoryCommentText(e.target.value)}
                    placeholder="Type stadium chat banter..."
                    className="flex-1 bg-[#090616] border border-slate-850 rounded-xl px-3 py-2 text-[10.5px] text-white focus:outline-none focus:border-yellow-450/30 font-semibold"
                    maxLength={100}
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-[#2e1065] border border-purple-950 hover:bg-purple-900 text-purple-300 p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STORY CREATOR FLOW MODAL */}
      <AnimatePresence>
        {isCreatorOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
            <div className="absolute inset-0" onClick={() => setIsCreatorOpen(false)} />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#070514] p-5 space-y-4 shadow-2xl"
              id="story-creation-wizard"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-yellow-505" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Publish Live Fan status</h3>
                </div>
                <button onClick={() => setIsCreatorOpen(false)} className="text-slate-500 hover:text-white bg-slate-900 p-1 rounded-full">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStorySubmit} className="space-y-4 text-xs">
                
                {/* Nickname and Team Row */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nickname</label>
                    <input 
                      type="text" 
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="My name"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-semibold focus:outline-none"
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Franchise loyalty</label>
                    <select 
                      value={formTeam}
                      onChange={(e) => setFormTeam(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-bold h-[38px] focus:outline-none"
                    >
                      {TEAMS_LIST.filter(t => t.id !== 'all').map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.id}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Content Type and Sticker emoji */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content format</label>
                    <div className="flex gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setFormType('story')}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold font-mono text-[10px] border tracking-wider transition ${
                          formType === 'story' 
                            ? 'bg-yellow-405/10 border-yellow-500 text-yellow-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        STORY
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormType('reel')}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold font-mono text-[10px] border tracking-wider transition ${
                          formType === 'reel' 
                            ? 'bg-yellow-405/10 border-yellow-500 text-yellow-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        REEL
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highlight emoji</label>
                    <select 
                      value={formSticker}
                      onChange={(e) => setFormSticker(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white h-[38px] focus:outline-none"
                    >
                      <option value="🔥 border">🔥 Seething Fire</option>
                      <option value="🚁">🚁 Helicopter Strike</option>
                      <option value="👑 font-bold">👑 Royal King</option>
                      <option value="🌪️ and float">🌪️ Stoic Storm</option>
                      <option value="🤸 spin-all">🤸 Reverse Sweep</option>
                      <option value="⚡ lightning">⚡ Absolute Volt</option>
                      <option value="🤩 stars">🤩 Cheering Fans</option>
                    </select>
                  </div>
                </div>

                {/* Caption description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Story Description Caption</label>
                  <textarea 
                    value={formCaption}
                    onChange={(e) => setFormCaption(e.target.value)}
                    placeholder="Enter what's happening at Chepauk, net practice highlights or custom watch opinions..."
                    className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl p-3 text-white focus:outline-none placeholder-slate-600 font-semibold leading-relaxed"
                    maxLength={150}
                    required
                  />
                  <div className="text-right text-[9px] text-slate-505 font-mono font-bold">
                    {formCaption.length}/150 char limit
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-yellow-400 via-orange-505 to-fuchsia-600 hover:brightness-110 py-3 text-xs font-black text-slate-950 tracking-wider uppercase transition cursor-pointer"
                >
                  🚀 Upload to IPLVerse status stream
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
