import { MatchStats, Post, Badge, SportType, FriendMatch, IPLPointsTableTeam, WatchPartyMember } from './types';

export const TEAMS_LIST = [
  { id: 'all', name: 'All Franchises', icon: '🏏', sport: 'All' },
  { id: 'CSK', name: 'Chennai Super Kings', icon: '🦁', color: 'from-yellow-400 to-amber-500', primaryColor: 'text-yellow-400', bannerBg: 'bg-yellow-500/10' },
  { id: 'MI', name: 'Mumbai Indians', icon: '🌀', color: 'from-blue-600 to-cyan-500', primaryColor: 'text-blue-400', bannerBg: 'bg-blue-500/10' },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', icon: '👑', color: 'from-red-600 to-amber-700', primaryColor: 'text-red-500', bannerBg: 'bg-red-500/10' },
  { id: 'KKR', name: 'Kolkata Knight Riders', icon: '🔮', color: 'from-purple-700 to-amber-600', primaryColor: 'text-purple-400', bannerBg: 'bg-purple-500/10' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', icon: '🧡', color: 'from-orange-500 to-red-600', primaryColor: 'text-orange-400', bannerBg: 'bg-orange-500/10' },
  { id: 'GT', name: 'Gujarat Titans', icon: '⚡', color: 'from-slate-800 to-indigo-950', primaryColor: 'text-teal-400', bannerBg: 'bg-slate-800/20' },
  { id: 'RR', name: 'Rajasthan Royals', icon: '💗', color: 'from-pink-500 to-blue-700', primaryColor: 'text-pink-400', bannerBg: 'bg-pink-500/10' },
  { id: 'PBKS', name: 'Punjab Kings', icon: '🦁', color: 'from-red-500 to-silver-500', primaryColor: 'text-red-400', bannerBg: 'bg-red-500/5' },
  { id: 'DC', name: 'Delhi Capitals', icon: '🐯', color: 'from-blue-700 to-red-600', primaryColor: 'text-blue-400', bannerBg: 'bg-blue-500/10' },
  { id: 'LSG', name: 'Lucknow Super Giants', icon: '🦅', color: 'from-teal-500 to-blue-900', primaryColor: 'text-teal-400', bannerBg: 'bg-teal-500/15' }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'Whistle Podu King',
    icon: '🦁',
    description: 'Shared an active prediction support post for your favorite franchise.',
    color: 'border-yellow-550 text-yellow-400 bg-yellow-500/5'
  },
  {
    id: 'badge-2',
    name: 'Oracle of Eden',
    icon: '🔮',
    description: 'Voted in a high-tension Live IPL Prediction Poll with over 80% confidence level.',
    color: 'border-purple-400/30 text-purple-400 bg-purple-500/10'
  },
  {
    id: 'badge-3',
    name: 'Cricket Brainiac',
    icon: '🧠',
    description: 'Calculated target scenarios using the IPL Connect AI Strategy Generator.',
    color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
  }
];

export const LOCKED_BADGES: Badge[] = [
  {
    id: 'badge-4',
    name: 'Meme Overlord',
    icon: '🌶️',
    description: 'Post 5 reactions in the Watch Rooms during wickets or sixes.',
    color: 'border-slate-800 text-slate-500 bg-slate-900/50'
  },
  {
    id: 'badge-5',
    name: 'Emotional Anchor',
    icon: '🤝',
    description: 'Successfully match and message with an IPL soulmate of the opposite sentiment.',
    color: 'border-slate-800 text-slate-500 bg-slate-900/50'
  }
];

export const INITIAL_MATCHES: Record<SportType, MatchStats> = {
  csk_mi: {
    title: "CSK vs MI",
    league: "IPL 2026 • El Clásico of Cricket",
    score: "CSK 186/4 (18.2 Ov)",
    rr: "CRR: 10.15 • RRR: 11.20",
    target: "Target: 205 (MI scored 204/6)",
    time: "CSK needs 19 runs in 10 balls",
    status: "LIVE",
    details: "MS Dhoni joins Jadeja at the crease! Jasprit Bumrah has 4 balls remaining in his final over.",
    predictions: { teamA: 64, teamB: 33, draw: 3 },
    wicketsTimelineList: ["4", "1", "W", "6", "W", "2", "6", "1", "4", "6", "W", "0", "6"],
    events: [
      { minute: "18.2 Ov", team: "CSK", player: "MS Dhoni", icon: "🏏", detail: "SMASHED! MS Dhoni steps out to Jasprit Bumrah and dispatches it over long-on for a gigantic 104m SIX!" },
      { minute: "17.5 Ov", team: "MI", player: "Jasprit Bumrah", icon: "☝️", detail: "OUT! Bumrah bowls a deadly blockhole yorker to knock out Ruturaj Gaikwad's middle stump for a well-made 78(41)." },
      { minute: "16.1 Ov", team: "CSK", player: "R. Jadeja", icon: "🏏", detail: "SLAPPED! Jadeja pulls Gerald Coetzee on the front-foot for a crisp four through mid-wicket." }
    ]
  },
  rcb_kkr: {
    title: "RCB vs KKR",
    league: "IPL 2026 • Chinnaswamy Stadium",
    score: "KKR 192/3 (15.4 Ov)",
    rr: "CRR: 12.25 • RRR: 7.20",
    target: "Target: 223",
    time: "KKR needs 31 runs in 26 balls",
    status: "LIVE",
    details: "Russell is looking absolute scary! Sunil Narine scored a rapid 62 from only 22 balls earlier.",
    predictions: { teamA: 38, teamB: 62, draw: 0 },
    wicketsTimelineList: ["6", "6", "4", "W", "1", "0", "6", "4", "W", "6", "2", "6"],
    events: [
      { minute: "15.4 Ov", team: "KKR", player: "A. Russell", icon: "🏏", detail: "FLICKED! Russell effortlessly hammers Alzarri Joseph over square leg for back-to-back sixes!" },
      { minute: "14.2 Ov", team: "RCB", player: "Mohammed Siraj", icon: "☝️", detail: "OUT! Siraj gets Shreyas Iyer caught behind! Brilliant diving catch by Dinesh Karthik." }
    ]
  },
  srh_gt: {
    title: "SRH vs GT",
    league: "IPL 2026 • Uppal Stadium",
    score: "GT 132/5 (16.2 Ov)",
    rr: "CRR: 8.13",
    time: "Innings Break approaching soon (GT won the toss)",
    status: "LIVE",
    details: "Rashid Khan and Shubman Gill guiding the rebuilding phase. Pat Cummins has been exceptionally tight.",
    predictions: { teamA: 55, teamB: 42, draw: 3 },
    wicketsTimelineList: ["W", "1", "1", "w", "4", "0", "0", "W", "2", "1", "0", "W"],
    events: [
      { minute: "15.5 Ov", team: "SRH", player: "Pat Cummins", icon: "☝️", detail: "CAUGHT! Miller attempts to pull Cummins' hard length delivery, but gets a leading edge cleanly caught at mid-off." },
      { minute: "14.1 Ov", team: "GT", player: "Shubman Gill", icon: "🏏", detail: "ELEGANT! Gill presents a magnificent high-elbow straight drive past the bowler for a boundary." }
    ]
  }
};

export const TRENDING_TOPICS = [
  {
    id: 'topic-1',
    category: '🦁 CSK',
    title: 'Can MS Dhoni pull off a miracle chase against Bumrah\'s death overs today?',
    fansCount: 428,
    teamId: 'CSK'
  },
  {
    id: 'topic-2',
    category: '👑 RCB',
    title: '#ViratKohli 82* vs KKR debate: Was Chinnaswamy pitching too slow in the powerplay?',
    fansCount: 310,
    teamId: 'RCB'
  },
  {
    id: 'topic-3',
    category: '🧡 SRH',
    title: 'Pat Cummins\' field placement masterclass for Klaasen\'s spin counter-attack',
    fansCount: 198,
    teamId: 'SRH'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    team: 'CSK',
    author: 'Dhoni_Thala_Army',
    avatar: '🦁',
    badge: 'Anbuden Elder',
    content: "OH MY GOD MS DHONI INSIDE THE CRATER! That 104m six to Bumrah made the entire stadium blow up! 🤯 Literal tears in my eyes. I don't care how old he is, the aura is absolutely pristine! Can we win this? #WhistlePodu #IPL2026",
    timestamp: '2m ago',
    likes: 184,
    likedByUser: false,
    reactions: { fire: 142, heart: 98, clap: 36 },
    comments: [
      {
        id: 'c-1',
        author: 'Mumbai_Paltan_Boss',
        avatar: '🌀',
        content: "Outstanding strike, but Bumrah still has the final say! MI has an absolute fortress defense over the next 4 balls. Don't speak too early!",
        timestamp: '1m ago'
      },
      {
        id: 'c-2',
        author: 'YellowLove_Raina',
        avatar: '💛',
        content: 'Jadeja on the other end is critical too. We need 19 runs. If anyone can, MS can!',
        timestamp: '45s ago'
      }
    ]
  },
  {
    id: 'post-2',
    team: 'RCB',
    author: 'EeSalaCupNamde_18',
    avatar: '👑',
    badge: 'Chinnaswamy Loyal',
    content: "Russell is literally terrifying us. Chinnaswamy boundaries feel too short, Sunil Narine has already done the damage. We need Siraj to fire in yorkers. This relationship of trust with RCB is a heavy burden, but we stand tall! 😭❤️ #RCBvsKKR",
    timestamp: '15m ago',
    likes: 95,
    likedByUser: false,
    reactions: { fire: 22, heart: 18, clap: 44 },
    comments: [
      {
        id: 'c-3',
        author: 'KorboLorboJeetbo_Sea',
        avatar: '🔮',
        content: "Sunil Narine has RCB's number! That's absolute devastation in the powerplay. Enjoy the Russell-mania guys!",
        timestamp: '12m ago'
      }
    ]
  },
  {
    id: 'post-3',
    team: 'KKR',
    author: 'SRK_Fan_Club',
    avatar: '💜',
    badge: 'Purple Knight',
    content: 'Sunil Narine opened like a bullet with 62(22)! KKR is dominating. Gambhir is smiling in the dugout, you know something massive is cooking this season! #AmiKKR',
    timestamp: '45m ago',
    likes: 120,
    likedByUser: false,
    reactions: { fire: 62, heart: 44, clap: 24 },
    comments: []
  }
];

export const MOCK_CHATTER_USERS = [
  { username: "DhoniFan_Anbuden", team: "CSK", avatar: "🦁" },
  { username: "RohitHitman_45", team: "MI", avatar: "🌀" },
  { username: "KohliKingdom_18", team: "RCB", avatar: "👑" },
  { username: "Narine_SpinWizard", team: "KKR", avatar: "🔮" },
  { username: "OrangeArmy_Riser", team: "SRH", avatar: "🧡" },
  { username: "Gill_Titan_Power", team: "GT", avatar: "⚡" }
];

export const LIVE_CHAT_MESSAGES_TEMPLATES: Record<SportType, string[]> = {
  csk_mi: [
    "DHONI OH MY GOD! MASSIVE SIX!!!",
    "Bumrah looks so intense right now. York is loading!",
    "MI fans, tell me if Rohit can chase down Dhoni's aura in discussions!",
    "CSK deserves to win this! What a fightback after 12 Overs!",
    "This is why IPL is the best sports league on Earth 🌍!",
    "Can MS do a repeat of 2016? 10 runs in 3 balls?",
    "Jadeja needs to give the strike back to Thala!",
    "Mumbai Indians bowling under absolute pressure."
  ],
  rcb_kkr: [
    "Sunil Narine's bat sweep is incredible! 🤩",
    "Kohli's reaction from the boundary was absolute heart-break.",
    "Russell's bat speed is basically supersonic speed. 🚀",
    "Where is Siraj's reverse swing? Chinnaswamy is too flat!",
    "KKR is winning this easily, RCB matches are always heart attacks.",
    "Banter is amazing today in Chinnaswamy live rooms!",
    "KKR fans let's loud match!",
    "We need King Kohli to motivate the bowlers right now!"
  ],
  srh_gt: [
    "Pat Cummins has GT in a spider-web constraint!",
    "Shubman Gill's drives are pure elegance as always.",
    "Klaasen is going to destroy the spin in the second innings.",
    "GT's middle order looks very fragile after Miller got out.",
    "Rashid Khan can hit some massive sixes, don't write them off.",
    "Such tactical fielding adjustments by Hyderabad today.",
    "132/5... GT needs at least 160 to fight back.",
    "Love the orange crowd vibe at Uppal स्टेडियम!"
  ]
};

export const IPL_POINTS_TABLE: IPLPointsTableTeam[] = [
  { position: 1, name: "Kolkata Knight Riders", code: "KKR", played: 11, won: 8, lost: 3, pts: 16, nrr: "+1.350", icon: "🔮" },
  { position: 2, name: "Chennai Super Kings", code: "CSK", played: 11, won: 7, lost: 4, pts: 14, nrr: "+0.820", icon: "🦁" },
  { position: 3, name: "Sunrisers Hyderabad", code: "SRH", played: 11, won: 7, lost: 4, pts: 14, nrr: "+0.612", icon: "🧡" },
  { position: 4, name: "Mumbai Indians", code: "MI", played: 11, won: 6, lost: 5, pts: 12, nrr: "+0.115", icon: "🌀" },
  { position: 5, name: "Gujarat Titans", code: "GT", played: 11, won: 5, lost: 6, pts: 10, nrr: "-0.245", icon: "⚡" },
  { position: 6, name: "Royal Challengers Bengaluru", code: "RCB", played: 11, won: 4, lost: 7, pts: 8, nrr: "+0.035", icon: "👑" }
];

export const SUGGESTED_FRIENDS: FriendMatch[] = [
  {
    id: "fm-1",
    username: "Rahul_RCB_Heart",
    favoriteTeam: "RCB",
    favoritePlayer: "Virat Kohli",
    personality: "Strategic & Deeply Emotional",
    matchReason: "Both you and Rahul support RCB, support Kohli's cover drives, and express identical 'Nervous' 😰 & 'Excited' 🤩 reactions during close chases.",
    loyaltyScore: 98,
    matchPercentage: 96,
    avatar: "👑",
    mood: "Nervous"
  },
  {
    id: "fm-2",
    username: "Meera_Whistle🦁",
    favoriteTeam: "CSK",
    favoritePlayer: "MS Dhoni",
    personality: "Analytical & Calm under Pressure",
    matchReason: "Meera shares your soft corner for veteran strategies. She reacted with 'Celebrating' 🥳 exactly when Dhoni hit Bumrah for a six.",
    loyaltyScore: 92,
    matchPercentage: 89,
    avatar: "🦁",
    mood: "Celebrating"
  },
  {
    id: "fm-3",
    username: "Kabir_MI_Hitman",
    favoriteTeam: "MI",
    favoritePlayer: "Rohit Sharma",
    personality: "Intense & Aggressive Banterist",
    matchReason: "An ideal friendly-rival bond! Kabir lives for MI winning yorkers while your posts show CSK loyalty. Banter compatibility: 100%.",
    loyaltyScore: 85,
    matchPercentage: 81,
    avatar: "🌀",
    mood: "Excited"
  },
  {
    id: "fm-4",
    username: "Siddharth_NarineFan",
    favoriteTeam: "KKR",
    favoritePlayer: "Sunil Narine",
    personality: "Silent Calculative Genius",
    matchReason: "Siddharth analyzed the run-rate graph just like you in the KKR Live Room, tracking optimal powerplay projections closely.",
    loyaltyScore: 78,
    matchPercentage: 74,
    avatar: "🔮",
    mood: "Excited"
  }
];

export const WATCH_PARTY_MEMBERS_TEMPLATES: WatchPartyMember[] = [
  { id: "wp-1", username: "Aravind_CSK", avatar: "🦁", team: "CSK", micActive: true, videoActive: true, videoFeedMockSeed: "Aravind doing the yellow jersey dance" },
  { id: "wp-2", username: "Pooja_RCB", avatar: "👑", team: "RCB", micActive: false, videoActive: true, videoFeedMockSeed: "Pooja holding her RCB flag next to a mug" },
  { id: "wp-3", username: "Karan_Mumbai", avatar: "🌀", team: "MI", micActive: true, videoActive: false, videoFeedMockSeed: "Karan talking live into a gaming mic" },
  { id: "wp-4", username: "Diya_SRH", avatar: "🧡", team: "SRH", micActive: true, videoActive: true, videoFeedMockSeed: "Diya cheering wildly with orange facepaint" }
];
