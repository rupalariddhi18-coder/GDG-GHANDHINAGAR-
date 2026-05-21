import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, Send, Flame, Heart, Award, Sparkles, Hash, Plus, Trash2, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Post, Comment, UserProfile } from '../types';
import { TEAMS_LIST } from '../data';
import StoryReelsLounge from './StoryReelsLounge';

interface CommunitySectionProps {
  posts: Post[];
  userProfile: UserProfile;
  initialFilter: string;
  onAddPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'reactions' | 'timestamp'>) => void;
  onAddComment: (postId: string, commentContent: string) => void;
  onAddReaction: (postId: string, reactionType: 'fire' | 'heart' | 'clap' | 'like') => void;
  onAddPoints: (pts: number) => void;
  onTriggerToast: (msg: string) => void;
}

export default function CommunitySection({ 
  posts, 
  userProfile, 
  initialFilter,
  onAddPost, 
  onAddComment, 
  onAddReaction,
  onAddPoints,
  onTriggerToast
}: CommunitySectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>(initialFilter || 'all');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTeam, setNewPostTeam] = useState('CSK');
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // AI assist state inside social feed
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  const hashtagPool = [
    { tag: "#WhistlePodu", team: "CSK" },
    { tag: "#EeSalaCupNamde", team: "RCB" },
    { tag: "#AmiKKR", team: "KKR" },
    { tag: "#MumbaiPaltan", team: "MI" },
    { tag: "#OrangeArmy", team: "SRH" },
    { tag: "#AavaDe", team: "GT" },
    { tag: "#MSDAura", team: "CSK" },
    { tag: "#KingKohli", team: "RCB" }
  ];

  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    onAddPost({
      team: newPostTeam,
      author: userProfile.username || 'Arena_Striker18',
      avatar: '🏅',
      badge: userProfile.favoriteTeam === newPostTeam ? 'Ultimate Supporter' : 'Verse Rookie',
      content: newPostContent
    });

    setNewPostContent('');
    setIsCreatingPost(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text);
    
    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  // Fun helper inside community: AI suggests funny banter according to draft team context
  const generateAIBanterForPost = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me a single-sentence witty or funny fan post content as a supporter of ${newPostTeam} team for IPL 2026. Keep it short, full of energy, under 120 char, and include hashtag: ${hashtagPool.find(h => h.team === newPostTeam)?.tag || '#IPL'}. Don't include any outer explanation.`,
          history: []
        })
      });
      if (response.ok) {
        const data = await response.json();
        setNewPostContent(data.text.replace(/^["']|["']$/g, ''));
      } else {
        throw new Error();
      }
    } catch {
      // Fallback sporty banter
      const fallbacks: Record<string, string> = {
        CSK: "MS Dhoni coming in at the 19th over to crush expectation is actual poetry! 🦁💛 #WhistlePodu #MSDAura",
        RCB: "We may build calculations of NRR, but the pure relationship of heart to RCB is eternal! ❤️👑 #EeSalaCupNamde",
        KKR: "Sunil Narine bowling 4 overs for 15 runs while casually hitting fifty is absolute cheat code. 🔮 #AmiKKR",
        MI: "Bumrah's yorkers should be preserved in the sports museum. MI defense mode is unreal! 🌀 #MumbaiPaltan",
        SRH: "Pat Cummins has built a boundaries-heavy highway at Hyderabad. Absolute power hitting! 🧡 #OrangeArmy",
        GT: "Silent assassins of Gujarat! Gill's cover drives are just pure aesthetic satisfaction. ⚡ #AavaDe"
      };
      setNewPostContent(fallbacks[newPostTeam] || "IPLVerse is our virtual stadium family! Vibe checks are matching! 🏏🔥");
    } finally {
      setAiGenerating(false);
    }
  };

  const generateAICommentBanter = async (postId: string, postObj: Post) => {
    setAiGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me a single-sentence witty, funny or cheeky banter reply to this fan post: "${postObj.content}". Write from an opposing team's perspective. Extremely short under 100 characters.`,
          history: []
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCommentInputs(prev => ({
          ...prev,
          [postId]: data.text.replace(/^["']|["']$/g, '')
        }));
      } else {
        throw new Error();
      }
    } catch {
      setCommentInputs(prev => ({
        ...prev,
        [postId]: `Hahaha outstanding take! But wait till next match, tables turn fast! 🏏🔥`
      }));
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedGroup === 'all') return true;
    return post.team === selectedGroup;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start" id="ipl-community-circles">
      
      {/* 1. LEFT CATEGORIES: TEAM CLICKS (Col 4) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-[#09071a]/60 backdrop-blur-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-850">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Franchise Lobbies</h2>
            </div>
            <span className="text-[9px] text-fuchsia-400 font-bold bg-fuchsia-400/10 py-0.5 px-2 rounded font-mono">
              REAL-TIME FEED
            </span>
          </div>
          
          <div className="space-y-2">
            {TEAMS_LIST.map((group) => {
              const isActive = selectedGroup === group.id;
              const count = posts.filter(p => group.id === 'all' || p.team === group.id).length;
              
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                    isActive 
                      ? 'border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-[#180a32] to-slate-900 text-white font-bold shadow-lg shadow-yellow-500/5' 
                      : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                  }`}
                  id={`lobby-tab-${group.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0 filter drop-shadow-sm">{group.icon}</span>
                    <div className="text-xs sm:text-sm font-semibold truncate leading-none">
                      {group.name}
                      <span className="text-[8px] text-slate-500 block uppercase tracking-wider mt-0.5">
                        {group.id === 'all' ? 'Universal Stadium' : `${group.id} Circle`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-950 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STADIUM CODE OF BINDING BARS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-yellow-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">stadium decorum</h3>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-3 font-semibold leading-relaxed">
            <li className="flex gap-2">
              <span className="text-yellow-400">⚡</span>
              <span><strong>Healthy Banter Allowed</strong>: Disagreements over LBW and catch controversies are fine, but keep it friendly!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-fuchsia-400">🏆</span>
              <span><strong>Earn Loyalty Score</strong>: Write posts (+10) and comment (+5) to trigger secret chest rewards.</span>
            </li>
          </ul>

          <div className="pt-2">
            <span className="text-[9px] font-mono text-slate-500 block uppercase">Trending stadium tags:</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hashtagPool.slice(0, 5).map((h) => (
                <span 
                  key={h.tag}
                  onClick={() => setSelectedGroup(h.team)}
                  className="cursor-pointer text-[9px] font-mono font-bold bg-slate-950 border border-slate-850 py-0.5 px-2 rounded text-slate-400 hover:text-yellow-400 hover:border-yellow-500/25 transition"
                >
                  {h.tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CONSOLE: DISCUSSIONS (Col 8) */}
      <div className="lg:col-span-8 space-y-6" id="discussion-circles-stream">
        
        {/* REELS & STORIES PLATFORM LOUNGE */}
        <StoryReelsLounge onAddPoints={onAddPoints} onTriggerToast={onTriggerToast} />

        {/* POST DRAFTS BOX WITH AI GENERATIVE ASSIST */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c0a1a]/40 backdrop-blur p-5">
          {!isCreatingPost ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-505/10 border border-yellow-500/30 flex items-center justify-center text-xl">
                🏏
              </div>
              <button
                onClick={() => setIsCreatingPost(true)}
                className="w-full text-left py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-850 text-slate-400 text-xs sm:text-sm hover:border-yellow-500/20 transition cursor-pointer font-semibold"
                id="trigger-create-post"
              >
                Assemble your IPL clan... Draft stadium vibes or ask AI to write banter...
              </button>
              <button
                onClick={() => setIsCreatingPost(true)}
                className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 p-3 text-slate-950 hover:brightness-110 transition shrink-0 cursor-pointer"
              >
                <Plus className="h-5 w-5 font-black" />
              </button>
            </div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePostSubmit} 
              className="space-y-4"
              id="draft-post-form"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-850/60">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Broadcast Stadium Emotion</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="text-xs text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  Close Draft
                </button>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What cricket situation is on your mind? Gaikwad yorked? Russell smashing Alzarri Joseph? Cummins field tactics? Draft here..."
                className="w-full min-h-[110px] bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-500/40 font-semibold"
                maxLength={400}
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">Affiliation:</span>
                    <select
                      value={newPostTeam}
                      onChange={(e) => setNewPostTeam(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-500/40 font-bold"
                    >
                      {TEAMS_LIST.filter(t => t.id !== 'all').map(t => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={generateAIBanterForPost}
                    className="flex items-center gap-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 py-1 px-2.5 text-[10px] font-black text-fuchsia-400 hover:bg-fuchsia-500/25 transition cursor-pointer"
                    title="Generate humorous banter post with Gemini AI assist"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{aiGenerating ? "Generating..." : "AI Banter Assist"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:brightness-110 px-5 py-2.5 text-xs font-black text-slate-950 font-bold transition shadow shadow-yellow-500/20 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Post Vibe (+10 Pts)
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* COMMUNITY VIBES TIMELINE STREAM */}
        <div className="space-y-5" id="stadium-activity-feed">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 space-y-3">
              <span className="text-4xl text-slate-600 block select-none">🏏</span>
              <p className="text-slate-350 text-sm font-black">No stadium vibes inside this franchise loop yet.</p>
              <p className="text-slate-500 text-xs">Be the very first superfan to trigger opinions and match matching hearts!</p>
              <button
                onClick={() => {
                  setIsCreatingPost(true);
                  setNewPostTeam(selectedGroup === 'all' ? 'CSK' : selectedGroup);
                }}
                className="mt-2 text-xs font-black text-yellow-400 hover:underline inline-flex items-center gap-1"
              >
                Trigger First Vibe Post <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const teamInfo = TEAMS_LIST.find(t => t.id === post.team);
              const isCommentsExpanded = expandedCommentsPostId === post.id;
              
              return (
                <motion.div
                  layout="position"
                  key={post.id}
                  className="rounded-2xl border border-slate-800 bg-[#090618]/30 backdrop-blur-md p-5 space-y-4 hover:border-slate-750 transition"
                  id={`post-${post.id}`}
                >
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-orange-600 p-0.5 shrink-0 select-none">
                        <div className="h-full w-full bg-slate-950 rounded-[8px] flex items-center justify-center text-xl">
                          {post.avatar || '🎖️'}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-slate-100 hover:text-yellow-400 transition cursor-pointer">
                            {post.author}
                          </span>
                          <span className="inline-flex items-center rounded bg-yellow-500/5 border border-yellow-500/20 px-2 py-0.2 text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-wide">
                            {post.badge || 'Stadium Supporter'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{post.timestamp}</span>
                      </div>
                    </div>

                    {teamInfo && (
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 bg-slate-950 border border-slate-800 rounded-full py-1.5 px-3 flex items-center gap-1">
                        <span>{teamInfo.icon}</span> <span>{teamInfo.id} Loop</span>
                      </span>
                    )}
                  </div>

                  {/* Message body */}
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Reaction panel triggers */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-850/60">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Thumbs up */}
                      <button
                        onClick={() => onAddReaction(post.id, 'like')}
                        className={`group flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          post.likedByUser 
                            ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5' 
                            : 'border-slate-800 text-slate-400 bg-slate-950/20 hover:text-yellow-400 hover:border-slate-700'
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${post.likedByUser ? 'fill-yellow-400' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      {/* Fire emoji reaction */}
                      <button
                        onClick={() => onAddReaction(post.id, 'fire')}
                        className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          post.userReaction === 'fire'
                            ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                            : 'border-slate-800/40 text-slate-505 bg-slate-950/20 hover:text-orange-400'
                        }`}
                      >
                        <span>🔥</span>
                        <span className="text-[10px] font-mono font-bold">{post.reactions.fire}</span>
                      </button>

                      {/* Heart emotion */}
                      <button
                        onClick={() => onAddReaction(post.id, 'heart')}
                        className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          post.userReaction === 'heart'
                            ? 'border-rose-500 text-rose-450 bg-rose-500/10'
                            : 'border-slate-800/40 text-slate-505 bg-slate-950/20 hover:text-rose-450'
                        }`}
                      >
                        <span>❤️</span>
                        <span className="text-[10px] font-mono font-bold">{post.reactions.heart}</span>
                      </button>

                      {/* Clap hand */}
                      <button
                        onClick={() => onAddReaction(post.id, 'clap')}
                        className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs border transition cursor-pointer ${
                          post.userReaction === 'clap'
                            ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10'
                            : 'border-slate-800/40 text-slate-505 bg-slate-950/20 hover:text-fuchsia-400'
                        }`}
                      >
                        <span>👏</span>
                        <span className="text-[10px] font-mono font-bold">{post.reactions.clap}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedCommentsPostId(isCommentsExpanded ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-yellow-400 py-1.5 px-3 rounded-lg border border-transparent hover:border-slate-800 transition cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-yellow-400" />
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>

                  {/* COMMENTS EXPANDED PANEL */}
                  <AnimatePresence>
                    {isCommentsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-slate-950/70 rounded-xl border border-slate-850 p-4 space-y-4"
                      >
                        {/* Feed comment triggers */}
                        <div className="flex gap-2.5">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            placeholder="Add your respectful banter here... (+5 Pts)"
                            className="w-full bg-slate-955 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-500/40 font-semibold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommentSubmit(post.id);
                            }}
                          />
                          
                          {/* AI Banter comment generator button */}
                          <button
                            type="button"
                            disabled={aiGenerating}
                            onClick={() => generateAICommentBanter(post.id, post)}
                            className="bg-fuchsia-950/40 border border-fuchsia-500/20 hover:bg-fuchsia-900/40 px-3.5 rounded-lg text-fuchsia-400 transition cursor-pointer shrink-0"
                            title="Generate opposing team AI reply"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 p-2 rounded-lg text-slate-950 transition cursor-pointer shrink-0"
                          >
                            <Send className="h-3.5 w-3.5 font-bold" />
                          </button>
                        </div>

                        {/* Existing list */}
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {post.comments.length === 0 ? (
                            <p className="text-center text-[10px] text-slate-500 font-bold py-3 uppercase tracking-wider">Be the first to comments on this duel!</p>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2.5 p-3 rounded-lg bg-[#0e0921]/40 border border-slate-850">
                                <div className="text-lg shrink-0 select-none">{comment.avatar || '👤'}</div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-slate-205">{comment.author}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
