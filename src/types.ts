export interface UserProfile {
  username: string;
  favoriteTeam: string;
  points: number;
  badges: Badge[];
  joinedDate: string;
  level: number;
  cricketPersonality?: string;
  favoritePlayer?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type SportType = 'csk_mi' | 'rcb_kkr' | 'srh_gt';

export interface MatchEvent {
  minute: string; // e.g., "14.2 Ov" for Cricket overs
  team: string; // CSK, MI, etc.
  player: string;
  icon: string;
  detail: string;
}

export interface MatchStats {
  score: string;
  rr: string; // Run Rate
  target?: string;
  time: string; // Status description e.g. "MI needs 34 runs in 18 balls"
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  league: string; // "IPL 2026"
  title: string; // "CSK vs MI"
  events?: MatchEvent[];
  stats?: {
    teamA: { name: string; score: string; leaders: string };
    teamB: { name: string; score: string; leaders: string };
  };
  details?: string;
  predictions: {
    teamA: number; // Percentage
    teamB: number;
    draw: number; // Draw or No Result
  };
  wicketsTimelineList?: string[]; // e.g. ["W", "6", "1", "4", "W", "0"]
}

export interface Post {
  id: string;
  team: string;
  author: string;
  avatar: string;
  badge: string;
  content: string;
  timestamp: string;
  likes: number;
  likedByUser?: boolean;
  reactions: {
    fire: number;
    heart: number;
    clap: number;
  };
  userReaction?: 'fire' | 'heart' | 'clap' | null;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  team: string;
  isAI?: boolean;
  avatar?: string;
  reaction?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface FriendMatch {
  id: string;
  username: string;
  favoriteTeam: string;
  favoritePlayer: string;
  personality: string;
  matchReason: string;
  loyaltyScore: number;
  matchPercentage: number;
  avatar: string;
  isFriendRequested?: boolean;
  isFriend?: boolean;
  mood?: string;
}

export interface IPLPointsTableTeam {
  position: number;
  name: string;
  code: string;
  played: number;
  won: number;
  lost: number;
  pts: number;
  nrr: string;
  icon: string;
}

export interface WatchPartyMember {
  id: string;
  username: string;
  avatar: string;
  team: string;
  micActive: boolean;
  videoActive: boolean;
  videoFeedMockSeed: string; // description for avatar
  reaction?: string;
}
