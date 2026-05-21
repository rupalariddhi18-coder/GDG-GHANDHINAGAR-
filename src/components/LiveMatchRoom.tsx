import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, MessageSquare, Send, Zap, Award, Flame, Radio, 
  BarChart3, Users, Volume2, Camera, CameraOff, VolumeX, 
  Sparkles, Smile, TrendingUp, AlertTriangle, Eye, RefreshCw,
  Clock, Share2, Shield, Heart, Flag
} from 'lucide-react';
import { MatchStats, SportType, ChatMessage, UserProfile, WatchPartyMember } from '../types';
import { MOCK_CHATTER_USERS, LIVE_CHAT_MESSAGES_TEMPLATES, WATCH_PARTY_MEMBERS_TEMPLATES } from '../data';

interface LiveMatchRoomProps {
  matches: Record<SportType, MatchStats>;
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
  userProfile: UserProfile;
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  onVotePrediction: (sport: SportType, option: 'teamA' | 'teamB' | 'draw') => void;
  onTriggerToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
  senderId?: string; 
}

// Full simulation queue for the active matches representing live Cricbuzz updates
interface SimulatedBall {
  over: string;
  score: string;
  type: '0' | '1' | '2' | '4' | '6' | 'W' | 'NB' | 'DRS' | 'MILESTONE';
  desc: string;
  runs: number;
  isWicket: boolean;
  batsman: string;
  bowler: string;
}

const SUPER_OVER_BALLS = [
  { over: "0.1", score: "2/0", type: "2" as const, runs: 2, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "Bumrah fires a roaring cutter outside off. Dhoni punches robustly to deep backward point for a quick couple of runs! High intensity stadium start." },
  { over: "0.2", score: "8/0", type: "6" as const, runs: 6, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "CRACKED! Bumrah goes for the yorker but misses by inches. MS Dhoni unleashes a spectacular helicopter slap straight into the sight screen! 112 METERS SIX! Absolute euphoria in Chepauk!" },
  { over: "0.3", score: "9/0", type: "1" as const, runs: 1, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "Tight yorker on leg pole, Dhoni manages to squeeze it to fine leg to rotate strike. Fans screaming Dhoni's name in stadium-wide choruses!" },
  { over: "0.4", score: "9/1", type: "W" as const, runs: 0, isWicket: true, batsman: "Shivam Dube", bowler: "Jasprit Bumrah", desc: "OUT! Bumrah strikes back! A searing slow dipping yorker bowls Shivam Dube clean through the gate! Playoff tension at maximum limit! Bumrah celebrates with arms stretched high!" },
  { over: "0.5", score: "13/1", type: "4" as const, runs: 4, isWicket: false, batsman: "R. Jadeja", bowler: "Jasprit Bumrah", desc: "EDGED AND FOUR! Jadeja attempts a massive heave, gets a thick thick outside edge that flies over short third-man for a crucial boundary! Jadeja punches his glove." },
  { over: "0.6", score: "19/1", type: "6" as const, runs: 6, isWicket: false, batsman: "R. Jadeja", bowler: "Jasprit Bumrah", desc: "HAMMERED FOR SIX! CSK WINS THE COVETED SUPER OVER DUEL! Bumrah misses length slightly and Jadeja lofts it high over deep midwicket! Pure visual euphoria at Chepauk! Fans dancing in the rain!" }
];

const MATCH_BALLS_SIMULATION: Record<SportType, SimulatedBall[]> = {
  csk_mi: [
    { over: "19.1", score: "191/4", type: "1", runs: 1, isWicket: false, batsman: "R. Jadeja", bowler: "Gerald Coetzee", desc: "Coetzee bowls wide yorker, Jadeja squeezes it out to deep backward point for a single." },
    { over: "19.2", score: "197/4", type: "6", runs: 6, isWicket: false, batsman: "MS Dhoni", bowler: "Gerald Coetzee", desc: "SMASHED! MS Dhoni steps out with unparalleled aura and dispatches the half-volley over deep long-on for a gigantic 104m SIX! The stadium has erupted!" },
    { over: "19.3", score: "198/4", type: "1", runs: 1, isWicket: false, batsman: "MS Dhoni", bowler: "Gerald Coetzee", desc: "Bouncer high on chest, Dhoni pulls calmly through square leg to rotate strike. The crowd goes wild." },
    { over: "19.4", score: "198/5", type: "W", runs: 0, isWicket: true, batsman: "R. Jadeja", bowler: "Gerald Coetzee", desc: "OUT! Jadeja goes for the big heave, gets a top edge flying high into the night skies. Safely caught by Rohit Sharma at short third-man!" },
    { over: "19.5", score: "202/5", type: "4", runs: 4, isWicket: false, batsman: "Shivam Dube", bowler: "Gerald Coetzee", desc: "CRACKED! Shivam Dube walks in under extreme pressure, greets Coetzee with a mighty slap straight through extra cover for a spectacular boundary!" },
    { over: "19.6", score: "203/5", type: "1", runs: 1, isWicket: false, batsman: "Shivam Dube", bowler: "Gerald Coetzee", desc: "Excellent yorker on middle-stump. Dube can only dig it out for a single to keep the strike. CSK needs 11 off the final over!" },
    { over: "20.1", score: "204/5", type: "1", runs: 1, isWicket: false, batsman: "Shivam Dube", bowler: "Jasprit Bumrah", desc: "Bumrah bowls a searing toe-crusher at 145km/h! Dube manages to squeeze it to fine leg. Just one run." },
    { over: "20.2", score: "210/5", type: "6", runs: 6, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "UNBELIEVABLE! Dhoni waits, predicts the slower delivery, and lofts it back over Bumrah's head with majestic force for a MASSIVE SIX! Screen-wide glow active!" },
    { over: "20.3", score: "210/5", type: "DRS", runs: 0, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "Slower length ball, Dhoni misses. MI appeals for caught behind! Umpire says NOT OUT. Hardik Pandya signals for a DRS review. Suspense mode online!" },
    { over: "20.3", score: "210/5", type: "0", runs: 0, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "DRS DECISION: Snickometer shows flat line as ball passes the bat. Dhoni is safe! Decision upheld. Dot ball." },
    { over: "20.4", score: "211/5", type: "1", runs: 1, isWicket: false, batsman: "MS Dhoni", bowler: "Jasprit Bumrah", desc: "Quick single taken. Dhoni pushes it with soft hands to extra-cover. 3 runs needed in 2 balls!" },
    { over: "20.5", score: "212/5", type: "NB", runs: 1, isWicket: false, batsman: "Shivam Dube", bowler: "Jasprit Bumrah", desc: "NO BALL! Bumrah oversteps! Intense drama at Chepauk! Dube runs a single. CSK needs 1 from 2 balls, free hit loading!" },
    { over: "20.5", score: "218/5", type: "6", runs: 6, isWicket: false, batsman: "Shivam Dube", bowler: "Jasprit Bumrah", desc: "FINISHING BLOW! Shivam Dube hammers the free hit clean into the roof! CSK WINS THE EL CLÁSICO by 5 wickets! Chepauk goes absolutely bananas!" }
  ],
  rcb_kkr: [
    { over: "15.1", score: "184/3", type: "4", runs: 4, isWicket: false, batsman: "A. Russell", bowler: "Mohammed Siraj", desc: "Pitched up outside off, Andre Russell executes a brutal slice through point for a blistering boundary." },
    { over: "15.2", score: "190/3", type: "6", runs: 6, isWicket: false, batsman: "A. Russell", bowler: "Mohammed Siraj", desc: "MIGHTY LAUNCH! Siraj misses the yorker, Russell whips it off his chin deep into the deep mid-wicket stand! Majestic SIX!" },
    { over: "15.3", score: "190/3", type: "DRS", runs: 0, isWicket: false, batsman: "A. Russell", bowler: "Mohammed Siraj", desc: "LBW appeal! Siraj fires a 148km/h yorker into Russell's toe. RCB reviews immediately! Reviewing..." },
    { over: "15.3", score: "190/3", type: "0", runs: 0, isWicket: false, batsman: "A. Russell", bowler: "Mohammed Siraj", desc: "DRS VERDICT: Ball tracker shows the delivery was sliding down-leg. Original NOT OUT continues. Dot ball." },
    { over: "15.4", score: "190/4", type: "W", runs: 0, isWicket: true, batsman: "A. Russell", bowler: "Mohammed Siraj", desc: "OUT! Siraj bounces back! Russell pulls, gets a leading edge toward deep backward square. Virat Kohli slides down and completes a sensational diving catch!" },
    { over: "15.5", score: "191/4", type: "1", runs: 1, isWicket: false, batsman: "Shreyas Iyer", bowler: "Mohammed Siraj", desc: "Easy single down to third man. KKR rebuilding." },
    { over: "15.6", score: "192/4", type: "1", runs: 1, isWicket: false, batsman: "Sunil Narine", bowler: "Mohammed Siraj", desc: "Short pitch bowler-effort, angled down to long-on to end a highly eventful over." }
  ],
  srh_gt: [
    { over: "12.1", score: "135/2", type: "6", runs: 6, isWicket: false, batsman: "Nitish Reddy", bowler: "Rashid Khan", desc: "GIGANTIC! Nitish Reddy slog sweeps the champion leg-spinner Rashid Khan all the way over deep cow-corner for SIX!" },
    { over: "12.2", score: "135/3", type: "W", runs: 0, isWicket: true, batsman: "Nitish Reddy", bowler: "Rashid Khan", desc: "OUT! Caught! Rashid gets revenge immediately. A stunning googly, Reddy attempts another sweep but is caught cleanly at deep square leg by Shubman Gill." },
    { over: "12.3", score: "139/3", type: "4", runs: 4, isWicket: false, batsman: "H. Klaasen", bowler: "Rashid Khan", desc: "SWEEPING BEAUTY! Klaasen steps in, sweeps Rashid flat and hard past short fine leg for 4 runs." },
    { over: "12.4", score: "140/3", type: "1", runs: 1, isWicket: false, batsman: "H. Klaasen", bowler: "Rashid Khan", desc: "Soft wrist push down to sweep cover for a rotating single." },
    { over: "12.5", score: "140/3", type: "0", runs: 0, isWicket: false, batsman: "A. Samad", bowler: "Rashid Khan", desc: "Tight defense. Samad blocks the turning legbreak." }
  ]
};

export default function LiveMatchRoom({
  matches,
  activeSport,
  setActiveSport,
  userProfile,
  onAddPoints,
  onUnlockBadge,
  onVotePrediction,
  onTriggerToast
}: LiveMatchRoomProps) {
  // Real-time ticking scoreboard states
  const [currentBallIdx, setCurrentBallIdx] = useState<number>(0);
  const [timeToNextBall, setTimeToNextBall] = useState<number>(5);
  const [tickerScore, setTickerScore] = useState<string>('');
  const [tickerOver, setTickerOver] = useState<string>('');
  const [customCommentary, setCustomCommentary] = useState<SimulatedBall[]>([]);
  const [screenEffect, setScreenEffect] = useState<'six' | 'wicket' | 'normal'>('normal');

  // Interactive UI configurations
  const [activeTab, setActiveTab] = useState<'match' | 'commentary' | 'wagon' | 'party' | 'ai'>('match');
  const [selectedWagonAngle, setSelectedWagonAngle] = useState<string | null>(null);
  const [selectedHeatmapZone, setSelectedHeatmapZone] = useState<string | null>(null);

  // Chat message logs
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  
  // Watch party voice states
  const [watchPartyMembers, setWatchPartyMembers] = useState<WatchPartyMember[]>(WATCH_PARTY_MEMBERS_TEMPLATES);
  const [myMicActive, setMyMicActive] = useState(true);
  const [myVideoActive, setMyVideoActive] = useState(true);
  const [userInVoiceRoom, setUserInVoiceRoom] = useState<boolean>(true);

  // Community Predictions
  const [hasVoted, setHasVoted] = useState<Record<SportType, 'teamA' | 'teamB' | 'draw' | null>>({
    csk_mi: null,
    rcb_kkr: null,
    srh_gt: null
  });

  // AI predicted outputs
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    bestBatter: string;
    turningPoint: string;
    predictionReason: string;
  } | null>(null);
  const [aiPredicting, setAiPredicting] = useState<boolean>(false);
  const [currentSentimentMood, setCurrentSentimentMood] = useState<'Excited 🤩' | 'Nervous 😰' | 'Angry 😡' | 'Celebrating 🥳'>('Excited 🤩');
  const [hypeSpeedMode, setHypeSpeedMode] = useState<boolean>(false);
  const [voiceCommentaryEnabled, setVoiceCommentaryEnabled] = useState<boolean>(false);
  const [stadiumAmbientType, setStadiumAmbientType] = useState<string | null>(null);
  
  // Custom AI Experiencing states
  const [aiCommentatorLine, setAiCommentatorLine] = useState<string>('⚡ AI Commentator: Welcome to the supreme playoffs final stage! Every ball is a tactical heartbeat.');
  const [aiCommentatorPersona, setAiCommentatorPersona] = useState<'shastri' | 'harsha' | 'sidhu'>('shastri');
  const [aiCommentatorLoading, setAiCommentatorLoading] = useState<boolean>(false);
  const [aiCrowdData, setAiCrowdData] = useState<{
    teamAExcitement: number;
    teamBExcitement: number;
    overallExcitement: number;
    pressureLevel: number;
    emotionAlert: string;
    cskEmotion: string;
    miEmotion: string;
  } | null>({
    teamAExcitement: 50,
    teamBExcitement: 50,
    overallExcitement: 50,
    pressureLevel: 65,
    emotionAlert: "Stadium stands are fully synchronized in acoustic anticipation!",
    cskEmotion: "Chanting Dhoni's Name 🦁",
    miEmotion: "Strategizing Fielding Lanes 🌀"
  });
  const [aiMemeData, setAiMemeData] = useState<{
    moment: string;
    caption: string;
    punchline: string;
    imageUrl: string;
    templateName: string;
  } | null>({
    moment: "General Live",
    caption: "BOWLER REALIZES THE BATSMAN HAS HIGHER GRAPHIC DESIGN RESOLUTION",
    punchline: "MS Dhoni walks into the crease, the stadium boundaries physically expand! Aura level maximum! 🦁🚁",
    imageUrl: "🚁",
    templateName: "Dhoni Sledgehammer Helix"
  });

  const [customMemeText, setCustomMemeText] = useState<{
    moment: string;
    caption: string;
    punchline: string;
    imageUrl: string;
  } | null>(null);

  // Core API query syncing live events to commentator, emotions, and memes
  const fetchAIEventInsight = async (ball: SimulatedBall, customPersona?: 'shastri' | 'harsha' | 'sidhu') => {
    setAiCommentatorLoading(true);
    const personaToUse = customPersona || aiCommentatorPersona;
    try {
      // 1. Commentator Endpoint
      const response = await fetch('/api/commentator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBall: ball, activeSport, persona: personaToUse })
      });
      if (response.ok) {
        const data = await response.json();
        setAiCommentatorLine(data.text);

        // TTS read out loud if voice is configured and enabled
        if (voiceCommentaryEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(data.text.replace(/⚡|🎙️|🔥/g, ''));
            if (personaToUse === 'shastri') {
              utterance.pitch = 0.90;
              utterance.rate = 1.05;
            } else if (personaToUse === 'harsha') {
              utterance.pitch = 1.15;
              utterance.rate = 1.0;
            } else {
              utterance.pitch = 1.25;
              utterance.rate = 1.15;
            }
            window.speechSynthesis.speak(utterance);
          } catch(e) {}
        }
      }

      // 2. Crowd Emotion Telemetry Endpoint
      const emotionRes = await fetch('/api/crowd-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBall: ball, activeSport, chatMessages: chatMessages.slice(-5) })
      });
      if (emotionRes.ok) {
        const emoData = await emotionRes.json();
        setAiCrowdData(emoData);
      }

      // 3. Automated Cricket meme Endpoint
      const memeRes = await fetch('/api/auto-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBall: ball, activeSport })
      });
      if (memeRes.ok) {
        const mData = await memeRes.json();
        setAiMemeData(mData);
      }
    } catch (e) {
      console.warn("AI Insights query failed:", e);
    } finally {
      setAiCommentatorLoading(false);
    }
  };

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdCounter = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- STADIUM ADVANCED ANALYTICS STATES ---
  const [commentaryFilter, setCommentaryFilter] = useState<'all' | 'boundary' | 'wicket' | 'special'>('all');
  const [superOverActive, setSuperOverActive] = useState<boolean>(false);
  const [superOverBallIdx, setSuperOverBallIdx] = useState<number>(0);
  
  // DLS Calculator states
  const [dlsFirstInningsScore, setDlsFirstInningsScore] = useState<number>(195);
  const [dlsShortenedOvers, setDlsShortenedOvers] = useState<number>(15);
  const [dlsWicketsLost, setDlsWicketsLost] = useState<number>(3);
  const [dlsShowModal, setDlsShowModal] = useState<boolean>(false);

  // Handle super over ticker increments
  useEffect(() => {
    if (!superOverActive) return;
    const timer = setInterval(() => {
      setSuperOverBallIdx(prev => {
        const nextIdx = (prev + 1) % SUPER_OVER_BALLS.length;
        const currentBall = SUPER_OVER_BALLS[nextIdx];
        
        // Voice speech commentary
        if (voiceCommentaryEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
            const cleanSpeech = `Super Over. Ball ${currentBall.over}. ${currentBall.desc.replace(/[#*]/g, '')}`;
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(cleanSpeech));
          } catch (e) {}
        }
        
        // Custom screen vibration and special glows for big moments
        if (currentBall.type === '6') {
          setScreenEffect('six');
          setTimeout(() => setScreenEffect('normal'), 2500);
          onAddPoints(10);
        } else if (currentBall.type === 'W') {
          setScreenEffect('wicket');
          setTimeout(() => setScreenEffect('normal'), 2500);
          onAddPoints(5);
        }
        
        return nextIdx;
      });
    }, 6000); // Super over updates every 6 seconds!
    
    return () => clearInterval(timer);
  }, [superOverActive, voiceCommentaryEnabled]);

  // STADIUM ACOUSTICS SYNTHESIZER
  const playStadiumSynth = (type: 'horn' | 'cheer' | 'vuvuzela' | 'drum') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'horn') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(385, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'vuvuzela') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(233, ctx.currentTime);
        osc.frequency.setValueAtTime(245, ctx.currentTime + 0.35);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      } else if (type === 'cheer') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        type bqFilter = 'lowpass' | 'bandpass';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 1.8);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'drum') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        gain.gain.setValueAtTime(0.24, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
      setStadiumAmbientType(type);
      setTimeout(() => setStadiumAmbientType(null), 1000);
    } catch (e) {
      console.warn("Web Audio API not accessible or blocked by platform rules:", e);
    }
  };

  // DYNAMIC LIVE SENTIMENT ANALYSIS MATCH EMOTION GAUGE
  const getDynamicSentimentPercentages = () => {
    let excited = 45;
    let celebrating = 25;
    let nervous = 15;
    let shocked = 10;
    let angry = 5;

    const queue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
    const currentBall = queue[currentBallIdx];

    if (currentBall) {
      if (currentBall.type === '6') {
        excited = 55;
        celebrating = 36;
        nervous = 5;
        shocked = 3;
        angry = 1;
      } else if (currentBall.type === 'W') {
        excited = 11;
        celebrating = 4;
        nervous = 46;
        shocked = 28;
        angry = 11;
      } else if (currentBall.type === '4') {
        excited = 48;
        celebrating = 32;
        nervous = 12;
        shocked = 6;
        angry = 2;
      } else if (currentBall.type === 'DRS') {
        excited = 14;
        celebrating = 4;
        nervous = 52;
        shocked = 24;
        angry = 6;
      }
    }

    return { excited, celebrating, nervous, shocked, angry };
  };

  // STADIUM REAL-TIME MEME GENERATOR LOGIC
  const generateStadiumMeme = (momentId: string) => {
    const memesPool: Record<string, { caption: string, punchline: string, image: string }> = {
      dhoni_six: {
        caption: "BUMRAH DELIVERS A SEETHING 148 KM/H BLOCKHOLE YORKER",
        punchline: "Thala casually flies it 104 meters out of the stadium like it's a warm-up stroll! 🚲🔥 Aura +99999",
        image: "🚁"
      },
      virat_catch: {
        caption: "BATTER CHIPS A SEEMINGLY HOVERING BOUNDARY DEPICTING IMMENSE CONFIDENCE",
        punchline: "King Kohli flies 4 meters horizontally defying gravity to pluck the ball. Cinema is alive! 🦁👑",
        image: "🦅"
      },
      narine_storm: {
        caption: "BOWLERS PLOTTING SUPERCOMPUTED SWING THEORIES TO STIFLE SUNIL NARINE",
        punchline: "Narine takes zero backswing, maintains a completely blank face, and hits fifty off 16 balls! 😑🌪️",
        image: "🌪️"
      },
      pant_reverse: {
        caption: "BOWLER RELEASES A SPEED SHOCKER TARGETING PANT'S HEADSPACE",
        punchline: "Pant falls horizontal on his back and reverse sweeps it to the stadium ceiling. Physics has resigned! 🤸💯",
        image: "🤸"
      }
    };

    const choice = memesPool[momentId] || memesPool.dhoni_six;
    setCustomMemeText({
      moment: momentId,
      caption: choice.caption,
      punchline: choice.punchline,
      imageUrl: choice.image
    });
  };

  // ACTIVE MATCH REFERENCE
  const activeQueue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
  const match = matches[activeSport];

  // 1-SECOND DYNAMIC GLOBAL SYSTEM TICKER
  useEffect(() => {
    // Reset state on sport selection change
    setCurrentBallIdx(0);
    setTimeToNextBall(hypeSpeedMode ? 1 : 5);
    const queue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
    setTickerScore(queue[0].score);
    setTickerOver(queue[0].over);
    setCustomCommentary([queue[0]]);
    setScreenEffect('normal');
    
    // Initial fetch of AI stadium intelligence of the first ball
    fetchAIEventInsight(queue[0]);
  }, [activeSport]);

  // Handle core simulation increments
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeToNextBall(prev => {
        if (prev <= 1) {
          // Time to bowl a new ball!
          const queue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
          const nextIdx = (currentBallIdx + 1) % queue.length;
          const currentBall = queue[nextIdx];

          // Set scoreboard updates
          setTickerScore(currentBall.score);
          setTickerOver(currentBall.over);
          setCurrentBallIdx(nextIdx);

          // Append to dynamic commentary ticker feed (with caps to prevent memory issues)
          setCustomCommentary(old => [currentBall, ...old].slice(0, 45));

          // Real-time AI Event Insight Endpoint call - updates commentator, crowd emotion and meme
          fetchAIEventInsight(currentBall);

          // Trigger special screen effects (The Hype Engine Alert System)
          if (currentBall.type === '6') {
            setScreenEffect('six');
            setTimeout(() => setScreenEffect('normal'), 4000);
            onAddPoints(8);
          } else if (currentBall.type === 'W') {
            setScreenEffect('wicket');
            setTimeout(() => setScreenEffect('normal'), 4000);
            onAddPoints(12);
            if (navigator.vibrate) {
              navigator.vibrate([250, 100, 250]); // Dual pulse
            }
          } else if (currentBall.type === 'DRS') {
            setScreenEffect('drs_alert');
            setTimeout(() => setScreenEffect('normal'), 4000);
            onAddPoints(5);
          } else if (currentBall.type === 'NB' || parseFloat(currentBall.over) >= 20.4) {
            setScreenEffect('climax_pressure');
            setTimeout(() => setScreenEffect('normal'), 4500);
            onAddPoints(10);
          } else {
            setScreenEffect('normal');
          }

          // Trigger automated AI mood triggers
          if (currentBall.type === '6') {
            setCurrentSentimentMood('Celebrating 🥳');
          } else if (currentBall.type === 'W') {
            setCurrentSentimentMood('Nervous 😰');
          } else if (currentBall.type === 'DRS') {
            setCurrentSentimentMood('Nervous 😰');
          } else if (currentBall.type === 'NB') {
            setCurrentSentimentMood('Angry 😡');
          }

          return hypeSpeedMode ? 1 : 5; // Reset interval to 1 or 5 seconds countdown
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBallIdx, activeSport, hypeSpeedMode, voiceCommentaryEnabled, aiCommentatorPersona]);

  // Passive simulated chat integration
  useEffect(() => {
    const templates = LIVE_CHAT_MESSAGES_TEMPLATES[activeSport];
    const initialMsgs: ChatMessage[] = [];
    
    for (let i = 0; i < 4; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const randomUser = MOCK_CHATTER_USERS[Math.floor(Math.random() * MOCK_CHATTER_USERS.length)];
      initialMsgs.push({
        id: `start-${activeSport}-${i}`,
        user: randomUser.username,
        team: randomUser.team,
        content: template,
        timestamp: `${12 - i * 2.5}m ago`,
        avatar: randomUser.avatar
      });
    }

    setChatMessages(initialMsgs);
  }, [activeSport]);

  useEffect(() => {
    const interval = setInterval(() => {
      const templates = LIVE_CHAT_MESSAGES_TEMPLATES[activeSport];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const randomUser = MOCK_CHATTER_USERS[Math.floor(Math.random() * MOCK_CHATTER_USERS.length)];
      
      const newMsg: ChatMessage = {
        id: `sim-${Date.now()}`,
        user: randomUser.username,
        team: randomUser.team,
        content: template,
        avatar: randomUser.avatar,
        timestamp: "Just Now"
      };

      setChatMessages(prev => [...prev.slice(-25), newMsg]);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeSport]);

  // Scroll tracker
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const myMsg: ChatMessage = {
      id: `my-${Date.now()}`,
      user: userProfile.username || "ConnectSuperFan",
      team: userProfile.favoriteTeam || "CSK",
      avatar: "🏏",
      content: newMessageText,
      timestamp: "Just Now"
    };

    setChatMessages(prev => [...prev, myMsg]);
    setNewMessageText('');
    onAddPoints(5);

    // AI active banter multiplier triggers
    if (chatMessages.filter(m => m.id.startsWith('my-')).length >= 4) {
      onUnlockBadge('badge-1');
    }
  };

  const throwEmoji = (emoji: string, senderId?: string) => {
    const id = ++emojiIdCounter.current;
    const left = senderId ? 0 : 10 + Math.random() * 80;
    
    setFloatingEmojis(prev => [...prev, { id, emoji, left, senderId }]);
    onAddPoints(1);
    
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== id));
    }, 2800);
  };

  const handleVote = (option: 'teamA' | 'teamB' | 'draw') => {
    if (hasVoted[activeSport]) return;
    
    onVotePrediction(activeSport, option);
    setHasVoted(prev => ({ ...prev, [activeSport]: option }));
    onAddPoints(15);
    onUnlockBadge('badge-2');
  };

  // Perform Gemini AI prediction and sports wisdom extraction
  const triggerMatchAIPredictions = async () => {
    setAiPredicting(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me a realistic, highly analytical prediction for the match ${match.title} of IPL 2026. The current score: ${tickerScore} (${tickerOver} over detail). Provide a JSON response format representing predictions with these precise keys (and nothing else, no formatting outside raw JSON): {"bestBatter": "string predicted star performer", "turningPoint": "string predicted critical outcome event", "predictionReason": "string brief 15 words expert commentary"}`,
          history: []
        })
      });
      if (response.ok) {
        const json = await response.json();
        try {
          const parsed = JSON.parse(json.text.replace(/```json|```/g, '').trim());
          setAiAnalysisResult({
            bestBatter: parsed.bestBatter || "MS Dhoni",
            turningPoint: parsed.turningPoint || "Bumrah's final over yorker line",
            predictionReason: parsed.predictionReason || "Pressure factor favors the side that controls boundary clearances."
          });
        } catch {
          setAiAnalysisResult({
            bestBatter: activeSport === 'csk_mi' ? "Heinrich Klaasen" : "Sunil Narine",
            turningPoint: activeSport === 'csk_mi' ? "Winning the final Over pace transitions" : "Pace off deliveries in mid overs",
            predictionReason: "Slowing pitch increases the efficiency of high spinning wrist lockbreaks."
          });
        }
      } else {
        throw new Error();
      }
    } catch {
      setAiAnalysisResult({
        bestBatter: activeSport === 'csk_mi' ? "Shivam Dube (CSK)" : "Andre Russell (KKR)",
        turningPoint: activeSport === 'csk_mi' ? "The 20th Over yorker accuracy index" : "Targeting shorter leg-side boundaries at will",
        predictionReason: "Predictive index favors batting sides clearing pitch markers with higher leverage."
      });
    } finally {
      setAiPredicting(false);
    }
  };

  const getTeamNames = () => {
    if (activeSport === 'csk_mi') return { A: 'Chennai Super Kings 🦁', B: 'Mumbai Indians 🌀', draw: 'Super Over 🚀', codeA: 'CSK', codeB: 'MI' };
    if (activeSport === 'rcb_kkr') return { A: 'Royal Challengers Bengaluru 👑', B: 'Kolkata Knight Riders 🔮', draw: 'Super Over 🚀', codeA: 'RCB', codeB: 'KKR' };
    return { A: 'Sunrisers Hyderabad 🧡', B: 'Gujarat Titans ⚡', draw: 'Weather Abandoned 🌧️', codeA: 'SRH', codeB: 'GT' };
  };

  const teams = getTeamNames();

  // STREAK TIMELINE ARRAY GENERATOR (LAST 6 BALLS IN OVER)
  const lastBallsInOver = activeQueue.slice(Math.max(0, currentBallIdx - 5), currentBallIdx + 1);

  // WAGON WHEEL SHOT COMPOSITION DATA
  const WAGON_WHEEL_ZONES = [
    { name: "Off Side Cover", angles: "M 150 150 L 250 80", runs: 42, color: "#eab308", detail: "6 boundary shots, 18 singles. Key batsman: Shivam Dube." },
    { name: "Leg Side Mid-Wicket", angles: "M 150 150 L 50 100", runs: 68, color: "#f43f5e", detail: "10 massive sixes, including Dhoni's 104m hit. Prime attack zone." },
    { name: "Straight Down Stadium", angles: "M 150 150 L 150 20", runs: 34, color: "#10b981", detail: "Classic high-elbow lofted straight drives. Highly efficient." },
    { name: "Fine Leg / Third Man", angles: "M 150 150 L 250 220", runs: 28, color: "#3b82f6", detail: "Squeezed late cuts and fine paddles against extreme pace." },
    { name: "Backward Square", angles: "M 150 150 L 50 220", runs: 18, color: "#a855f7", detail: "Flick and pull sweeps against spin deliveries." }
  ];

  // PITCH HEATMAP DATA
  const PITCH_HEATMAP_ZONES = [
    { name: "Yorker Length (Blockhole)", x: 150, y: 120, density: "High Danger", count: "12 balls bowled", color: "rgba(239, 68, 68, 0.75)", desc: "Mainly targeted by Bumrah and Siraj at 145km/h+ to prevent leverage." },
    { name: "Good Length (Top of Off)", x: 150, y: 80, density: "Heavy Traffic", count: "25 balls bowled", color: "rgba(234, 179, 8, 0.75)", desc: "Hard length outside off-stump. Induces edge risks." },
    { name: "Short Pitch (Bouncer Zone)", x: 150, y: 40, density: "Aggressive Shock", count: "8 balls bowled", color: "rgba(168, 85, 247, 0.75)", desc: "Slower bumpers and chest-high short deliveries to target leg placements." }
  ];

  // PARTNERSHIP METRICS
  const activePartnership = activeSport === 'csk_mi' 
    ? { runs: 44, balls: 19, player1: "M.S. Dhoni", r1: 28, b1: 10, player2: "R. Jadeja", r2: 16, b2: 9 }
    : { runs: 32, balls: 14, player1: "Andre Russell", r1: 26, b1: 8, player2: "S. Iyer", r2: 6, b2: 6 };

  // Calculate dynamic winning probability percentage
  const calculatedWinPctA = activeSport === 'csk_mi' 
    ? Math.max(10, Math.min(90, 45 + (currentBallIdx * 4) - (activeQueue[currentBallIdx]?.isWicket ? 12 : 0)))
    : activeSport === 'rcb_kkr' ? 38 : 55;
  const calculatedWinPctB = 100 - calculatedWinPctA;

  return (
    <div className={`space-y-6 relative rounded-3xl p-1 transition-all duration-300 ${
      screenEffect === 'six' ? 'shadow-[0_0_50px_rgba(234,179,8,0.4)] border-yellow-500/60 ring-2 ring-yellow-500/20' : 
      screenEffect === 'wicket' ? 'shadow-[0_0_50px_rgba(244,63,94,0.4)] border-rose-500/60 ring-2 ring-rose-500/20 animate-shake' : 
      screenEffect === 'drs_alert' ? 'shadow-[0_0_50px_rgba(6,182,212,0.4)] border-cyan-550/60 ring-2 ring-cyan-500/20' : 
      screenEffect === 'climax_pressure' ? 'shadow-[0_0_50px_rgba(249,115,22,0.4)] border-orange-500/60 ring-2 ring-orange-500/20 animate-pulse' : 
      'border-transparent'
    }`} id="stadium-live-room-container">

      {/* 1. MATCH SELECTOR HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 backdrop-blur-md">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            IPLVerse Live Match Center
          </h2>
          <p className="text-xs text-slate-400">Automated second-by-second telemetry feed from stadium radar.</p>
        </div>

        {/* Action lobby switch buttons */}
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {([ 'csk_mi', 'rcb_kkr', 'srh_gt' ] as SportType[]).map((sport) => {
            const isActive = activeSport === sport;
            const text = sport === 'csk_mi' ? '🦁 CSK vs MI' : sport === 'rcb_kkr' ? '👑 RCB vs KKR' : '🧡 SRH vs GT';
            return (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`flex-1 sm:flex-none text-center py-2 px-4 rounded-lg text-xs font-black transition duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-black shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-950'
                }`}
                id={`switch-lobby-${sport}`}
              >
                {text}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPECIAL SCREEN GLOW BANNER PRESENTATION */}
      <AnimatePresence>
        {screenEffect === 'six' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-yellow-500/10 backdrop-blur-[1px]"
          >
            <div className="text-center bg-slate-950/95 border-2 border-yellow-400 px-10 py-6 rounded-3xl shadow-2xl animate-pulse">
              <span className="text-7xl font-sans font-black block text-yellow-400 tracking-tighter animate-bounce leading-none">⚡ SIX ⚡</span>
              <span className="text-xs font-mono font-black text-rose-300 uppercase tracking-widest mt-2 block">SCREEN GLOW PROTOCOL ACTIVE</span>
              <span className="text-[10px] text-slate-400 block mt-1">MS Dhoni sends it into orbit! +8 Loyalty Points!</span>
            </div>
          </motion.div>
        )}

        {screenEffect === 'wicket' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-rose-500/15 backdrop-blur-[1px]"
          >
            <div className="text-center bg-slate-950/95 border-2 border-rose-500 px-10 py-6 rounded-3xl shadow-2xl">
              <span className="text-7xl font-sans font-black block text-rose-500 tracking-tighter leading-none animate-bounce">☝️ WICKET! ☝️</span>
              <span className="text-xs font-mono font-black text-[#f43f5e] uppercase tracking-widest mt-2 block">STADIUM SENSOR VIBRATION</span>
              <span className="text-[10px] text-slate-400 block mt-1">Major turning point detected. Opponents celebrate! +12 Points.</span>
            </div>
          </motion.div>
        )}

        {screenEffect === 'drs_alert' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-cyan-500/10 backdrop-blur-[1px]"
          >
            <div className="text-center bg-slate-950/95 border-2 border-cyan-400 px-10 py-6 rounded-3xl shadow-2xl">
              <span className="text-4xl font-sans font-black block text-cyan-400 tracking-tighter leading-none animate-pulse">🧐 DRS DECISION ACTIVE 🧐</span>
              <span className="text-xs font-mono font-black text-[#06b6d4] uppercase tracking-widest mt-2.5 block">AI COHERENT REVIEW SCANNER</span>
              <span className="text-[10px] text-slate-400 block mt-1">Ultra-edge tracking is calibrating stadium acoustics frame-by-frame. Just wait... +5 Points.</span>
            </div>
          </motion.div>
        )}

        {screenEffect === 'climax_pressure' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-orange-600/15 backdrop-blur-[1.5px]"
          >
            <div className={`text-center bg-slate-950/95 border-2 border-orange-500 px-10 py-6 rounded-3xl shadow-2xl animate-spin-pulse`}>
              <span className="text-4xl font-sans font-black block text-orange-500 tracking-tighter leading-none animate-pulse">💥 CLIMAX PRESSURE MAX 💥</span>
              <span className="text-xs font-mono font-black text-orange-400 uppercase tracking-widest mt-2.5 block">STADIUM DECIBELS CRITICAL</span>
              <span className="text-[10px] text-slate-400 block mt-1">Playoff crunch moment detected! Crowd roar metrics passing 120 decibels. +10 Points!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WORKSPACE GRID */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COMPONENT: STADIUM SCOREBOARD OR COMMENTARY FEED */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* DIGITAL FUTURISTIC RADAR SCOREBOARD */}
          <div className="rounded-3xl border border-slate-900 bg-gradient-to-b from-slate-950 to-[#0b081c]/75 p-6 relative overflow-hidden" id="ipl-radar-scoreboard">
            {/* Pulsating live radar scanline */}
            <div className="absolute top-0 right-0 h-44 w-44 bg-yellow-400/5 rounded-full blur-[80px]" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-transparent animate-pulse" />

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-black text-rose-455 uppercase tracking-widest">
                  {superOverActive ? "🏆 COVETED IPL GOLD SUPER OVER DUEL" : match.league}
                </span>
              </div>
              
              <div className="rounded-full bg-slate-900 px-3 py-1 flex items-center gap-1.5 border border-slate-800 text-[10px] font-black text-slate-300">
                <Clock className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
                <span>BALL TICK IN: <strong className="text-yellow-400 font-mono font-black">{superOverActive ? 6 : timeToNextBall}S</strong></span>
              </div>
            </div>

            {/* Score layout */}
            <div className="grid grid-cols-12 gap-3 items-center py-4 rounded-2xl bg-black/60 border border-slate-900 px-4">
              {/* Home Team */}
              <div className="col-span-4 text-center space-y-1">
                <span className="text-3xl block select-none">
                  🦁
                </span>
                <span className="text-sm font-black text-white uppercase tracking-tight block">
                  CSK
                </span>
                <p className="text-[9px] text-yellow-500 font-extrabold uppercase tracking-widest">{superOverActive ? "BATTER" : "Home"}</p>
              </div>

              {/* Centered Score */}
              <div className="col-span-4 text-center space-y-2">
                <span className="text-[8px] font-mono font-bold text-slate-500 tracking-widest uppercase">
                  {superOverActive ? "🔥 SUPER OVER ACTION" : "RADAR SCOREBOARD"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter shrink-0 animate-pulse">
                  {superOverActive ? SUPER_OVER_BALLS[superOverBallIdx].score : tickerScore}
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-450 block">
                  {superOverActive ? `${SUPER_OVER_BALLS[superOverBallIdx].over} Overs` : `${tickerOver} Overs`}
                </span>
              </div>

              {/* Away Team */}
              <div className="col-span-4 text-center space-y-1">
                <span className="text-3xl block select-none">
                  🌀
                </span>
                <span className="text-sm font-black text-white uppercase tracking-tight block">
                  MI
                </span>
                <p className="text-[9px] text-[#3b82f6] font-extrabold uppercase tracking-widest">{superOverActive ? "BOWLER" : "Away"}</p>
              </div>
            </div>

            {/* Ball-by-ball micro history of the current over */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 py-3 border-t border-slate-900">
              <div className="flex items-center gap-2 select-none">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest">THIS OVER:</span>
                <div className="flex gap-1.5 animate-pulse">
                  {superOverActive ? (
                    SUPER_OVER_BALLS.map((ball, idx) => {
                      const isComplete = idx <= superOverBallIdx;
                      return (
                        <span 
                          key={idx}
                          className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow transition-all duration-300 ${
                            !isComplete 
                              ? 'bg-slate-950 text-slate-700 border border-slate-900'
                              : ball.type === 'W' 
                                ? 'bg-rose-500 text-white' 
                                : ball.type === '6' 
                                  ? 'bg-yellow-405 text-slate-950 font-black ring-4 ring-yellow-450/15' 
                                  : ball.type === '4' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-slate-800 text-slate-300'
                          }`}
                          title={ball.desc}
                        >
                          {ball.type}
                        </span>
                      );
                    })
                  ) : (
                    lastBallsInOver.map((ball, idx) => (
                      <span 
                        key={idx}
                        className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow ${
                          ball.type === 'W' 
                            ? 'bg-rose-500 text-white border border-rose-400' 
                            : ball.type === '6' 
                              ? 'bg-yellow-400 text-slate-950 font-black ring-4 ring-yellow-400/20' 
                              : ball.type === '4' 
                                ? 'bg-green-500 text-white font-extrabold' 
                                : ball.type === 'DRS'
                                  ? 'bg-orange-500 text-white animate-pulse'
                                  : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                        title={ball.desc}
                      >
                        {ball.type === 'DRS' ? 'D' : ball.type}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Advanced Controls & Toss Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSuperOverActive(!superOverActive);
                    if (!superOverActive) {
                      setSuperOverBallIdx(0);
                      onAddPoints(10);
                      playStadiumSynth('horn');
                    }
                  }}
                  className={`text-[9px] font-black uppercase tracking-wide border rounded px-2.5 py-1 transition transform hover:scale-105 cursor-pointer ${
                    superOverActive 
                      ? 'bg-gradient-to-r from-red-655 to-amber-500 border-yellow-500 text-slate-950 font-extrabold' 
                      : 'bg-[#1e1548] hover:bg-[#281c5d] border-fuchsia-500/25 text-fuchsia-300'
                  }`}
                >
                  ⚡ {superOverActive ? 'Return to 20-Over' : 'Trigger Super Over!'}
                </button>

                <button
                  onClick={() => setDlsShowModal(true)}
                  className="text-[9px] font-black uppercase tracking-wide border border-dashed border-cyan-550/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded px-2.5 py-1 cursor-pointer transition transform hover:scale-105"
                >
                  🌧️ DLS Calculator
                </button>

                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-slate-800 rounded px-2.5 py-1">
                  🏏 Toss: MI won toss • Dew: Heavy 🌧️
                </span>
              </div>
            </div>

            {/* Run Rate indices */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-2 rounded-xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400 uppercase tracking-wider font-bold">
                Current Run Rate: <strong className="text-yellow-400 font-mono font-black">{superOverActive ? 'CRR: 15.00' : 'CRR: 10.28'}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400 uppercase tracking-wider font-bold">
                Required Run Rate: <strong className="text-[#a855f7] font-mono font-black">{superOverActive ? `TARGET: 16 (Need ${Math.max(0, 16 - (SUPER_OVER_BALLS[superOverBallIdx].runs + (superOverBallIdx > 0 ? SUPER_OVER_BALLS.slice(0, superOverBallIdx).reduce((a, b) => a + b.runs, 0) : 0)))} off ${Math.max(0, 6 - superOverBallIdx)}b)` : 'RRR: 11.45'}</strong>
              </div>
            </div>
          </div>

          {/* TAB MULTIVIEWER */}
          <div className="flex gap-2 border-b border-slate-900">
            {([
              { id: 'match', label: '📊 Live Dashboard' },
              { id: 'commentary', label: '📢 Commentary Feed' },
              { id: 'wagon', label: '🏏 Wagon & Pitch Map' },
              { id: 'ai', label: '🔮 Predictions & Guru' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-4 text-xs font-black tracking-tight border-b-2 transition ${
                  activeTab === tab.id 
                    ? 'border-yellow-400 text-yellow-400' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ACTIVE TAB RENDERERS */}
          <div className="min-h-[300px]">
            {activeTab === 'match' && (
              <div className="space-y-6" id="match-live-dashboard">
                
                {/* DYNAMIC SHIFTING WINNING PROBABILITY COMPONENT */}
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                        Live Winning Probability Swing & Momentum Wave
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Real-time stadium swing calculated by ball-by-ball momentum indices</p>
                    </div>
                    <span className="text-[9px] font-mono bg-yellow-405/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-400/10">UPDATES EVERY SECOND</span>
                  </div>

                  {/* Swinger indicator bar */}
                  <div className="space-y-4">
                    <div className="h-6.5 w-full rounded-full bg-slate-900 overflow-hidden flex text-[10px] font-mono font-black relative border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-950 flex items-center justify-center transition-all duration-700 ease-out font-black"
                        style={{ width: `${calculatedWinPctA}%` }}
                      >
                        {calculatedWinPctA >= 15 ? `🦁 CSK: ${calculatedWinPctA}%` : ''}
                      </div>
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-[#3b82f6] text-white flex items-center justify-center transition-all duration-700 ease-out font-black"
                        style={{ width: `${calculatedWinPctB}%` }}
                      >
                        {calculatedWinPctB >= 15 ? `🌀 MI: ${calculatedWinPctB}%` : ''}
                      </div>
                    </div>

                    {/* SVG GRAPH EMBED */}
                    <div className="rounded-xl border border-slate-900 bg-black/80 p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-slate-500">
                        <span>🦁 CSK FAVORABLE</span>
                        <span>💎 EQUILIBRIUM (50/50)</span>
                        <span>🌀 MI FAVORABLE</span>
                      </div>

                      {/* Line chart */}
                      <div className="relative h-16 w-full flex items-center">
                        <div className="absolute inset-x-0 h-0.5 bg-dashed border-t border-slate-800/60 top-1/2 pointer-events-none" />
                        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Momentum Wave Curve */}
                          <polyline
                            fill="none"
                            stroke="url(#glow-grad)"
                            strokeWidth="1.5"
                            points={(() => {
                              const list = superOverActive 
                                ? SUPER_OVER_BALLS 
                                : customCommentary.length > 0 
                                  ? [...customCommentary].reverse()
                                  : [];
                              const pts = list.map((ball, i) => {
                                let val = 50;
                                if (ball.type === '6') val += 30;
                                else if (ball.type === '4') val += 15;
                                else if (ball.type === 'W') val -= 40;
                                else if (ball.type === '1') val += 4;
                                return Math.max(10, Math.min(90, val + Math.sin(i) * 8));
                              });
                              if (pts.length < 2) return "0,30 400,30";
                              return pts.map((val, idx) => {
                                const x = (idx / (pts.length - 1)) * 500;
                                const y = 64 - (val / 100) * 64;
                                return `${x},${y}`;
                              }).join(' ');
                            })()}
                            className="stroke-yellow-405"
                          />
                          {/* Polyfill stroke zone */}
                          <polyline
                            fill="url(#glow-grad)"
                            stroke="none"
                            points={(() => {
                              const list = superOverActive 
                                ? SUPER_OVER_BALLS 
                                : customCommentary.length > 0 
                                  ? [...customCommentary].reverse()
                                  : [];
                              const pts = list.map((ball, i) => {
                                let val = 50;
                                if (ball.type === '6') val += 30;
                                else if (ball.type === '4') val += 15;
                                else if (ball.type === 'W') val -= 40;
                                return Math.max(10, Math.min(90, val + Math.sin(i) * 8));
                              });
                              if (pts.length < 2) return "0,64 400,64";
                              const path = pts.map((val, idx) => {
                                const x = (idx / (pts.length - 1)) * 500;
                                const y = 64 - (val / 100) * 64;
                                return `${x},${y}`;
                              }).join(' ');
                              return `0,64 ${path} 500,64`;
                            })()}
                          />

                          {/* Glowing momentum indicator circles for large events */}
                          {(() => {
                            const list = superOverActive 
                              ? SUPER_OVER_BALLS 
                              : customCommentary.length > 0 
                                ? [...customCommentary].reverse()
                                : [];
                            return list.map((ball, idx) => {
                              let val = 50;
                              if (ball.type === '6') val += 30;
                              else if (ball.type === '4') val += 15;
                              else if (ball.type === 'W') val -= 40;
                              const yVal = Math.max(10, Math.min(90, val + Math.sin(idx) * 8));
                              const x = (idx / Math.max(1, list.length - 1)) * 500;
                              const y = 64 - (yVal / 100) * 64;
                              const isMajor = ball.type === '6' || ball.type === 'W';
                              if (!isMajor) return null;
                              return (
                                <g key={idx}>
                                  <circle cx={x} cy={y} r="5" className={ball.type === '6' ? 'fill-yellow-400 animate-ping' : 'fill-red-500 animate-ping'} />
                                  <circle cx={x} cy={y} r="3" className={ball.type === '6' ? 'fill-yellow-405' : 'fill-red-500'} />
                                </g>
                              );
                            });
                          })()}
                        </svg>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/60 text-slate-350 text-[10px] font-semibold leading-relaxed flex gap-2.5 items-center">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="font-bold text-white uppercase tracking-wider">stadium acoustics pressure</p>
                          <p className="text-slate-400">Chepauk decibel levels at <span className="text-orange-400 font-extrabold">118dB</span>! Cheering intensity peaks during boundaries.</p>
                        </div>
                      </div>

                      {/* Live Tension circle marker */}
                      <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/60 text-slate-350 text-[10px] font-semibold leading-relaxed flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white uppercase tracking-wider">match tension factor</p>
                          <p className="text-slate-400">{superOverActive ? "💥 Extreme Overtime State" : "⚡ High Leverage Death Overs"}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-red-500/20 flex items-center justify-center font-mono font-black text-rose-500 shadow-lg text-[9px] relative shrink-0">
                          <span className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                          {superOverActive ? "95%" : "74%"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI STADIUM CRICKET EXPERIENCE HUB */}
                <div className="rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-slate-950 via-[#0a0521] to-[#12052b] p-5 md:p-6 space-y-6 shadow-2xl relative overflow-hidden" id="ai-stadium-experience-hub">
                  {/* Visual background lights */}
                  <div className="absolute top-0 left-12 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 right-12 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-3 relative">
                    <div>
                      <span className="text-[10px] font-mono font-black text-yellow-405 tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                        ⚡ ULTIMATE AI FAN ENGINE ACTIVE
                      </span>
                      <h3 className="text-md sm:text-lg font-black text-white tracking-tight pt-2">
                        Virtual Stadium AI Oracle & Commentary Booth
                      </h3>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg">
                      DECIBELS: <span className="text-yellow-400 font-mono font-black">118dB</span>
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-12 items-start">
                    
                    {/* COLUMN 1: AI COMMENTATOR VOICE PORTAL (7 Columns) */}
                    <div className="md:col-span-7 bg-slate-950/80 border border-slate-900/60 rounded-xl p-4.5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                          </span>
                          <span className="text-xs font-black uppercase text-white tracking-wider">Configure Commentator Persona</span>
                        </div>
                        
                        {/* Selector Controls */}
                        <div className="flex gap-1 bg-black p-0.5 rounded-lg border border-slate-900">
                          {(['shastri', 'harsha', 'sidhu'] as const).map((pers) => (
                            <button
                              key={pers}
                              onClick={() => {
                                setAiCommentatorPersona(pers);
                                const queue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
                                fetchAIEventInsight(queue[currentBallIdx], pers);
                                onTriggerToast ? onTriggerToast(`🎙️ Switch to ${pers === 'shastri' ? 'Ravi Shastri Tracer' : pers === 'harsha' ? 'Harsha Poetic' : 'Navjot Shayari'} commentator!`, 'info') : onAddPoints(1);
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black rounded capitalize transition cursor-pointer ${
                                aiCommentatorPersona === pers
                                  ? 'bg-yellow-400 text-slate-950 font-black shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {pers === 'shastri' ? '⚡ शास्त्री' : pers === 'harsha' ? '📜 हर्ष' : '🔥 सिद्धू'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display commentary box */}
                      <div className="relative rounded-xl bg-slate-900/50 p-4 border border-slate-850/80 min-h-[90px] flex flex-col justify-between group">
                        {aiCommentatorLoading ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-3.5 bg-slate-800 rounded w-11/12" />
                            <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm font-semibold text-slate-200 italic leading-relaxed">
                            {aiCommentatorLine || "Awaiting commentary stream..."}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-900 mt-2 text-[10px]">
                          <span className="text-slate-500 font-bold uppercase font-mono">
                            🎙️ {aiCommentatorPersona === 'shastri' ? 'RAVI SHASTRI STYLE' : aiCommentatorPersona === 'harsha' ? 'HARSHA BHOGLE CAPABILITY' : 'SIDHU SHAYAR INDEX'}
                          </span>
                          
                          {/* TTS Trigger Actions */}
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined' && window.speechSynthesis) {
                                window.speechSynthesis.cancel();
                                const u = new SpeechSynthesisUtterance(aiCommentatorLine.replace(/⚡|🎙️|🔥|⚡/g, ''));
                                if (aiCommentatorPersona === 'shastri') { u.pitch = 0.90; u.rate = 1.05; }
                                else if (aiCommentatorPersona === 'harsha') { u.pitch = 1.15; u.rate = 1.0; }
                                else { u.pitch = 1.25; u.rate = 1.15; }
                                window.speechSynthesis.speak(u);
                                onTriggerToast ? onTriggerToast("🎙️ Play AI Speech Synthesis!", "success") : null;
                              }
                            }}
                            disabled={aiCommentatorLoading}
                            className="bg-yellow-500/10 hover:bg-yellow-500 hover:text-slate-950 border border-yellow-500/20 px-2.5 py-1 rounded text-[10px] font-black tracking-tight text-yellow-400 transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>📣 Speak Aloud</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="inline-block h-1.5 w-1.5 bg-green-500 rounded-full" />
                        <span>Voice generation uses real-time server-side Gemini 3.5 LLMs. Toggle audio in settings.</span>
                      </div>
                    </div>

                    {/* COLUMN 2: CROWD SENTIMENT & FAN ENERGY METRICS (5 Columns) */}
                    <div className="md:col-span-5 bg-slate-950/80 border border-slate-900/60 rounded-xl p-4.5 space-y-4">
                      <div>
                        <span className="text-[9px] font-mono font-black text-rose-450 uppercase tracking-widest">
                          📊 LIVE TELEMETRY LOGS
                        </span>
                        <h4 className="text-xs font-black text-white tracking-wide uppercase pt-1 inline-flex items-center gap-1">
                          Live Fan Sentiment Spectrum
                        </h4>
                      </div>

                      {/* Crowds sliders */}
                      <div className="space-y-3 pt-1 text-[11px]">
                        
                        {/* Team A Excitement */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-yellow-405">CSK Fans Excitement</span>
                            <span className="font-mono text-yellow-400">{aiCrowdData?.teamAExcitement || 60}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-500" 
                              style={{ width: `${aiCrowdData?.teamAExcitement || 60}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">CSK Mood: {aiCrowdData?.cskEmotion || 'Chanting'}</span>
                        </div>

                        {/* Team B Excitement */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-blue-400">MI Fans Excitement</span>
                            <span className="font-mono text-blue-400">{aiCrowdData?.teamBExcitement || 40}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${aiCrowdData?.teamBExcitement || 40}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">MI Mood: {aiCrowdData?.miEmotion || 'Stress watch'}</span>
                        </div>
                      </div>

                      {/* Dynamic Stadium Noise Waveform visualizer */}
                      <div className="pt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1.5">虚拟体育场声压 (Acoustic Amplitude)</span>
                        <div className="flex items-end justify-center gap-1.5 h-12 bg-black/60 rounded-xl p-2.5 border border-slate-900 overflow-hidden">
                          {[25, 45, 80, 55, 90, 60, 40, 75, 95, 50, 85, 30, 70, 40, 60].map((h, index) => (
                            <div
                              key={index}
                              className={`w-1 rounded-full transition-all duration-500 ${
                                screenEffect === 'six' ? 'bg-yellow-400' :
                                screenEffect === 'wicket' ? 'bg-rose-500' :
                                screenEffect === 'drs_alert' ? 'bg-cyan-400' : 'bg-fuchsia-500'
                              }`}
                              style={{
                                height: `${Math.max(10, Math.min(100, h + (Math.sin((currentBallIdx + index) * 0.7) * 20)))}%`
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[9px] text-fuchsia-400 font-semibold italic text-center mt-1.5">{aiCrowdData?.emotionAlert || "Crowd chanting active!"}</p>
                      </div>

                    </div>

                  </div>

                  {/* ROW 3: AI DEFIANT COHERENT MEME COMPILER */}
                  <div className="border-t border-slate-900/60 pt-4 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🎭</span>
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-[#10b981] font-extrabold block">AUTOMATED MATCH TROLL COMPILER</span>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">AI Meme of the Moment</h4>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const queue = MATCH_BALLS_SIMULATION[activeSport] || MATCH_BALLS_SIMULATION.csk_mi;
                          const currentBall = queue[currentBallIdx];
                          // Force fetch meme again
                          try {
                            const res = await fetch('/api/auto-meme', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ currentBall, activeSport })
                            });
                            if (res.ok) {
                              const mData = await res.json();
                              setAiMemeData(mData);
                              onTriggerToast ? onTriggerToast("🎭 Fresh match meme compiled!", "success") : onAddPoints(2);
                            }
                          } catch(err) {}
                        }}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 border border-slate-850 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 transition font-bold cursor-pointer"
                      >
                        🔄 Regenerate Duel Meme
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4 items-stretch">
                      
                      {/* Left logo meme label */}
                      <div className="sm:col-span-1 rounded-xl bg-slate-950 border border-slate-900 p-3.5 flex flex-col justify-center items-center text-center space-y-1">
                        <span className="text-4xl animate-bounce">{aiMemeData?.imageUrl || "🚁"}</span>
                        <h5 className="text-[10px] sm:text-xs font-black text-white tracking-widest uppercase truncate max-w-full">
                          {aiMemeData?.templateName || "Thala's Heli Classic"}
                        </h5>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Meme ID Index</p>
                      </div>

                      {/* Right setups and caption */}
                      <div className="sm:col-span-3 rounded-xl bg-slate-900/40 p-4 border border-slate-900 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-mono font-extrabold uppercase">CAPTION SETUP:</p>
                          <p className="text-xs font-extrabold text-[#f59e0b] filter drop-shadow">
                            " {aiMemeData?.caption} "
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-950/60 mt-3">
                          <p className="text-[9px] text-slate-500 font-mono font-extrabold uppercase">THE PUNCHLINE / TROLL RESPONSE:</p>
                          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                            {aiMemeData?.punchline}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* CURRENT PARTNERSHIP ANALYSIS FRAME */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex justify-between">
                      <span>🏏 Active Partnership</span>
                      <span className="font-mono text-yellow-400">{activePartnership.runs} runs ({activePartnership.balls}b)</span>
                    </h4>

                    <div className="space-y-3.5 text-[11px] font-semibold text-slate-300">
                      {/* Player 1 progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{activePartnership.player1} *</span>
                          <span className="font-mono">{activePartnership.r1} off {activePartnership.b1} balls (SR: {(activePartnership.r1 / activePartnership.b1 * 100).toFixed(0)})</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded">
                          <div className="h-full bg-yellow-400 rounded" style={{ width: `${activePartnership.r1 / activePartnership.runs * 100}%` }} />
                        </div>
                      </div>

                      {/* Player 2 progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{activePartnership.player2}</span>
                          <span className="font-mono">{activePartnership.r2} off {activePartnership.b2} balls (SR: {(activePartnership.r2 / activePartnership.b2 * 100).toFixed(0)})</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded">
                          <div className="h-full bg-[#3b82f6] rounded" style={{ width: `${activePartnership.r2 / activePartnership.runs * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE COMPETING STATS LISTS */}
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-900 pb-2 flex justify-between">
                      <span>⚡ Active Bowler</span>
                      <span className="font-mono text-cyan-400">RADAR VELOCITY</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-320">Jasprit Bumrah *</span>
                        <span className="font-mono text-white">3.4 - 0 - 32 - 2</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>Speed Avg: 144.5 km/h</span>
                        <span>Economy: 8.72</span>
                      </div>
                      
                      <div className="h-1 bg-slate-900 w-full mt-1 rounded relative">
                        <span className="absolute top-0 right-1/4 h-1 w-2 bg-red-500 animate-ping" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME FAN ATMOSPHERE BANNER */}
                <div className="relative overflow-hidden rounded-2xl border border-yellow-500/10 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="space-y-1 max-w-lg text-center sm:text-left">
                    <span className="text-[9px] font-black tracking-widest text-yellow-405 uppercase block font-mono">💥 HYPE PROTOCOL: 20TH OVER CLASH</span>
                    <h4 className="text-xs font-extrabold text-white">Stadium Sound Meter: 114 Decibels!</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Fans are typing and reacting wildly. Tap active cheering emojis in the noise tab to level up your multiplier.</p>
                  </div>
                  
                  {/* Action trigger cheer */}
                  <div className="flex gap-1.5 flex-wrap justify-center shrink-0">
                    {['💪', '🤩', '🔥', '🦁', '🌀'].map(emoji => (
                      <button 
                        onClick={() => throwEmoji(emoji)} 
                        key={emoji}
                        className="bg-slate-950 hover:scale-125 hover:bg-slate-900 p-2 text-sm rounded-xl border border-slate-805 transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'commentary' && (
              <div className="space-y-4" id="match-live-commentary">
                <div className="rounded-2xl border border-slate-900 bg-slate-955 p-4 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase font-mono block">📢 BALL BY BALL TELEMETRY COMMENTARY</span>
                    <p className="text-[9px] text-slate-500 font-extrabold uppercase leading-none">Powered by real-time neural sports synthesis & voice commentary</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Voice commentary switch */}
                    <button
                      onClick={() => {
                        setVoiceCommentaryEnabled(!voiceCommentaryEnabled);
                        // Trigger startup pitch check to wake speech engine
                        if (!voiceCommentaryEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                          try {
                            const testSound = new SpeechSynthesisUtterance("IPLVerse voice commentary is active!");
                            testSound.pitch = 1.2;
                            testSound.rate = 1.1;
                            window.speechSynthesis.speak(testSound);
                          } catch (e) {}
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black tracking-wide flex items-center gap-1 transition cursor-pointer ${
                        voiceCommentaryEnabled 
                          ? 'bg-yellow-405 border-yellow-500 text-slate-950' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {voiceCommentaryEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                    </button>

                    {/* Hype speed mode switch */}
                    <button
                      onClick={() => {
                        setHypeSpeedMode(!hypeSpeedMode);
                        setTimeToNextBall(hypeSpeedMode ? 5 : 1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black tracking-wide flex items-center gap-1 transition cursor-pointer ${
                        hypeSpeedMode 
                          ? 'bg-cyan-400 border-cyan-500 text-slate-950' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Deliver balls at 1-second intervals instead of 5-second intervals"
                    >
                      ⚡ {hypeSpeedMode ? 'Hype Speed (1s)' : 'Normal (5s)'}
                    </button>

                    <button 
                      onClick={() => {
                        setCustomCommentary([MATCH_BALLS_SIMULATION[activeSport][0]]);
                        setCurrentBallIdx(0);
                      }}
                      className="text-[9px] font-mono border border-slate-800 text-slate-400 px-2.5 py-1.5 bg-slate-950 rounded-lg hover:text-white cursor-pointer"
                    >
                      Reset Sim Loop
                    </button>
                  </div>
                </div>

                {/* COMMENTARY HIGHLIGHT FILTER BUTTONS */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-900 justify-start select-none items-center">
                  <span className="text-[9px] font-mono font-black uppercase text-slate-500 mr-2">Highlight Filters:</span>
                  {([
                    { id: 'all', label: 'All deliveries', icon: '🏏' },
                    { id: 'boundary', label: 'Boundaries (4s/6s)', icon: '💥' },
                    { id: 'wicket', label: 'Wickets (Out)', icon: '☝️' },
                    { id: 'special', label: 'DRS & Extra alerts', icon: '🤖' }
                  ] as const).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setCommentaryFilter(f.id)}
                      className={`text-[9.5px] font-black uppercase tracking-wider py-1 px-3 rounded-lg border cursor-pointer transition ${
                        commentaryFilter === f.id
                          ? 'bg-yellow-405 border-yellow-500 text-slate-950'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <span className="mr-1">{f.icon}</span> {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                  {((superOverActive ? SUPER_OVER_BALLS : customCommentary).filter(ball => {
                    if (commentaryFilter === 'all') return true;
                    if (commentaryFilter === 'boundary') return ball.type === '4' || ball.type === '6';
                    if (commentaryFilter === 'wicket') return ball.type === 'W' || ball.isWicket;
                    if (commentaryFilter === 'special') return ball.type === 'DRS' || ball.type === 'NB';
                    return true;
                  })).map((ball, idx) => {
                    const isSix = ball.type === '6';
                    const isWicket = ball.type === 'W';
                    const isFour = ball.type === '4';
                    const isDrs = ball.type === 'DRS';
                    const isNoBall = ball.type === 'NB';

                    let background = 'bg-slate-950/40 border-slate-900';
                    let markerBg = 'bg-slate-900 text-slate-400';
                    let highlightWord = '';

                    if (isSix) {
                      background = 'bg-yellow-500/5 border-yellow-500/20 shadow-md';
                      markerBg = 'bg-yellow-405 text-slate-950 font-black';
                      highlightWord = '⚡ SIXER! ⚡';
                    } else if (isWicket) {
                      background = 'bg-red-500/5 border-red-500/20 shadow-md';
                      markerBg = 'bg-rose-500 text-white font-extrabold';
                      highlightWord = '☝️ OUT! WICKET FALLS ☝️';
                    } else if (isFour) {
                      background = 'bg-green-500/5 border-green-500/20';
                      markerBg = 'bg-emerald-500 text-white font-bold';
                      highlightWord = '🏏 CRIPS BOUNDARY 🏏';
                    } else if (isDrs) {
                      background = 'bg-orange-500/5 border-orange-500/20 animate-pulse';
                      markerBg = 'bg-orange-500 text-white font-bold';
                      highlightWord = '🤖 DRS REVIEW SYSTEM 🤖';
                    } else if (isNoBall) {
                      background = 'bg-indigo-500/5 border-indigo-500/20';
                      markerBg = 'bg-indigo-500 text-white font-bold';
                      highlightWord = '⚡ NO BALL! FREE HIT ⚡';
                    }

                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border flex items-start gap-4 transition duration-300 ${background}`}
                      >
                        {/* Ball indicator over */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <span className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-extrabold font-mono ${markerBg}`}>
                            {ball.type === 'DRS' ? 'DRS' : ball.over}
                          </span>
                          <span className="text-[7.5px] font-mono text-slate-500 mt-1 uppercase font-bold">{ball.type}</span>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 flex-1 select-text">
                          {highlightWord && (
                            <span className="inline-block text-[9px] font-black text-yellow-404 bg-yellow-500/10 border border-yellow-500/25 py-0.5 px-2 rounded uppercase tracking-wider font-mono">
                              {highlightWord}
                            </span>
                          )}
                          <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                            {ball.desc}
                          </p>
                          <div className="flex items-center gap-3.5 text-[10px] text-slate-400 font-semibold font-mono">
                            <span>Batter: <strong className="text-white">{ball.batsman || "M.S. Dhoni"}</strong></span>
                            <span>Bowler: <strong className="text-white">{ball.bowler || "Gerald Coetzee"}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'wagon' && (
              <div className="grid gap-6 md:grid-cols-2" id="wagon-and-pitch">
                
                {/* WAGON WHEEL GRAPHICS */}
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Interactive Shot Wagon Wheel</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none">Click zone rays to filter highlight scoring frequencies.</p>
                  </div>

                  {/* SVG Container representing field */}
                  <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative h-[250px] w-[250px] rounded-full border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center">
                      
                      {/* Stadium Field boundaries */}
                      <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/25" />
                      <div className="absolute inset-12 rounded-full border border-emerald-500/10" />
                      
                      {/* Pitch lines */}
                      <div className="h-10 w-4 bg-slate-900 border border-slate-800 rotate-45 flex items-center justify-center">
                        <span className="h-6 w-0.5 bg-silver border-silver/50" />
                      </div>

                      {/* SVG Canvas drawing vector lines representing shot directions in first delivery */}
                      <svg className="absolute inset-0 h-full w-full pointer-events-none">
                        {WAGON_WHEEL_ZONES.map((zone, idx) => {
                          const isSelected = selectedWagonAngle === zone.name;
                          return (
                            <path 
                              key={idx}
                              d={zone.angles} 
                              stroke={zone.color} 
                              strokeWidth={isSelected ? "5" : "2.5"} 
                              strokeDasharray={isSelected ? "none" : "3,1"}
                              className="transition-all duration-300"
                            />
                          );
                        })}
                      </svg>

                      {/* Action hover sectors */}
                      <div className="absolute top-1/4 right-1/4 h-8 w-8 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 cursor-pointer border border-yellow-500/20" title="Off Side Cover Cover" onClick={() => setSelectedWagonAngle("Off Side Cover")} />
                      <div className="absolute top-1/4 left-1/4 h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 cursor-pointer border border-red-500/20" title="Leg Side Mid-Wicket pull" onClick={() => setSelectedWagonAngle("Leg Side Mid-Wicket")} />
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-green-500/10 hover:bg-green-500/20 cursor-pointer border border-green-500/20" title="Straight Down lofted" onClick={() => setSelectedWagonAngle("Straight Down Stadium")} />
                      <div className="absolute bottom-1/4 right-1/4 h-8 w-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer border border-blue-500/20" title="Fine Leg scoop" onClick={() => setSelectedWagonAngle("Fine Leg / Third Man")} />
                    </div>

                    {/* Selected angle explanation */}
                    <div className="mt-4 text-center text-xs h-12">
                      {selectedWagonAngle ? (
                        <div className="bg-slate-900/40 p-2 border border-slate-850 rounded-xl space-y-0.5">
                          <strong className="text-white block uppercase text-[10px] font-mono tracking-widest">{selectedWagonAngle} Zone</strong>
                          <p className="text-[10px] text-yellow-405 leading-none">{WAGON_WHEEL_ZONES.find(z => z.name === selectedWagonAngle)?.runs} Runs scored in this direction. {WAGON_WHEEL_ZONES.find(z => z.name === selectedWagonAngle)?.detail}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium italic block text-[10px] pt-2">★ Tap a section indicator on the stadium map to inspect shot analytics</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOWLING PITCH HEATMAP */}
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Bowling Pitch Delivery Map</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none">Inspect ball release land coordinates and radar heat grids.</p>
                  </div>

                  {/* Pitch Graphics representation */}
                  <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative h-[250px] w-[140px] bg-amber-900/15 rounded border-2 border-amber-800/40 p-2 flex flex-col justify-between">
                      {/* Crease markings */}
                      <div className="h-0.5 w-full bg-white/20 border-white/10" />
                      
                      <div className="flex-1 relative flex items-center justify-center">
                        <div className="h-full w-2.5 bg-yellow-600/10 border-r border-l border-yellow-700/20" />

                        {/* Render coordinates spots */}
                        {PITCH_HEATMAP_ZONES.map((zone, idx) => {
                          const isSelected = selectedHeatmapZone === zone.name;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedHeatmapZone(zone.name)}
                              className="absolute rounded-full flex items-center justify-center transition duration-300 hover:scale-130 cursor-pointer"
                              style={{ 
                                left: `${zone.x - 100}px`, 
                                top: `${zone.y}px`, 
                                height: isSelected ? '20px' : '15px', 
                                width: isSelected ? '20px' : '15px',
                                backgroundColor: zone.color,
                                border: isSelected ? "2px solid white" : "none"
                              }}
                              title={zone.name}
                            />
                          );
                        })}
                      </div>

                      <div className="h-0.5 w-full bg-white/20 border-white/10" />
                    </div>

                    {/* Explanatory zone detail */}
                    <div className="mt-4 text-center text-xs h-12 w-full">
                      {selectedHeatmapZone ? (
                        <div className="bg-slate-900/40 p-2 border border-slate-850 rounded-xl space-y-0.5">
                          <strong className="text-white block uppercase text-[10px] font-mono tracking-widest">{selectedHeatmapZone} ({PITCH_HEATMAP_ZONES.find(z => z.name === selectedHeatmapZone)?.density})</strong>
                          <p className="text-[10px] text-[#10b981] leading-none">{PITCH_HEATMAP_ZONES.find(z => z.name === selectedHeatmapZone)?.count}. {PITCH_HEATMAP_ZONES.find(z => z.name === selectedHeatmapZone)?.desc}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium italic block text-[10px] pt-2">★ Click pitching zones on the layout pitch grid to render bowling strategy</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6" id="ai-predictions-center">
                
                {/* GEMINI MATCH ANALYSIS ENGINE CONFIG */}
                <div className="rounded-2xl border border-fuchsia-500/15 bg-gradient-to-br from-[#1c0f3a]/60 to-black p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-purple-950">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-fuchsia-400 animate-spin" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Gemini Smart AI Match predictor</h4>
                    </div>

                    <button 
                      onClick={triggerMatchAIPredictions}
                      disabled={aiPredicting}
                      className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-5 py-2 text-xs font-black text-white hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                    >
                      {aiPredicting ? "Computing Radar Matrix..." : "🔮 Launch Gemini Prediction Engine"}
                    </button>
                  </div>

                  {aiAnalysisResult ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid gap-4 md:grid-cols-3 pt-2 text-xs font-bold leading-none"
                    >
                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-1.5 shadow-md">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">PREDICTED STARMER</span>
                        <div className="text-yellow-405 text-sm font-extrabold flex items-center gap-1.5">
                          <span>🏏</span> {aiAnalysisResult.bestBatter}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium pt-1">Holds high potential for pitch leverage inside second innings.</p>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-1.5 shadow-md">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">TURNING POINT CRITERIA</span>
                        <div className="text-fuchsia-400 text-sm font-extrabold flex items-center gap-1.5">
                          <span>🎯</span> {aiAnalysisResult.turningPoint}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium pt-1">Identified block hole control threshold scenario metric.</p>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-1.5 shadow-md col-span-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">EXPERT EXPLANATION MATRIX</span>
                        <p className="text-[11px] text-slate-300 font-semibold leading-relaxed pt-1 select-text">
                          "{aiAnalysisResult.predictionReason}"
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      Press the **Launch Gemini Prediction Engine** button to consult the AI Sports Guru, retrieving real-time commentary metrics and predicting match winner probabilities, the best batting performer, and the critical turning point of the game!
                    </p>
                  )}
                </div>

                {/* FAN POLLS FOR ACCOUNT LOYALTY MULTIPLIER */}
                <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Active Loyalty Fanpoll</span>
                    <span className="rounded bg-yellow-500/5 px-2 py-0.5 text-[8.5px] font-mono text-yellow-400 border border-yellow-500/10">+15 PTS FOR UNLOCK</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Whom do you pledge your ultimate loyalty to today? Cast your vote below to unlock the coveted **Oracle of Eden Badge** and claim points!
                  </p>

                  <div className="grid gap-3 pt-1">
                    <button 
                      disabled={!!hasVoted[activeSport]}
                      onClick={() => handleVote('teamA')}
                      className={`relative overflow-hidden rounded-xl border p-4 text-left transition cursor-pointer ${
                        hasVoted[activeSport] === 'teamA' 
                          ? 'border-yellow-405 bg-yellow-950/20' 
                          : 'border-slate-850 bg-slate-950/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="relative flex justify-between items-center text-xs font-black">
                        <span>{teams.A}</span>
                        <span className="font-mono text-yellow-405">55% support</span>
                      </div>
                    </button>

                    <button 
                      disabled={!!hasVoted[activeSport]}
                      onClick={() => handleVote('draw')}
                      className={`relative overflow-hidden rounded-xl border p-4 text-left transition cursor-pointer ${
                        hasVoted[activeSport] === 'draw' 
                          ? 'border-purple-500 bg-purple-950/20' 
                          : 'border-slate-850 bg-slate-950/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="relative flex justify-between items-center text-xs font-black">
                        <span>{teams.draw}</span>
                        <span className="font-mono text-purple-400">5% support</span>
                      </div>
                    </button>

                    <button 
                      disabled={!!hasVoted[activeSport]}
                      onClick={() => handleVote('teamB')}
                      className={`relative overflow-hidden rounded-xl border p-4 text-left transition cursor-pointer ${
                        hasVoted[activeSport] === 'teamB' 
                          ? 'border-blue-500 bg-blue-950/20' 
                          : 'border-slate-850 bg-slate-950/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="relative flex justify-between items-center text-xs font-black">
                        <span>{teams.B}</span>
                        <span className="font-mono text-blue-400">40% support</span>
                      </div>
                    </button>
                  </div>

                  {hasVoted[activeSport] && (
                    <div className="text-center text-[10px] font-black tracking-widest text-[#10b981] bg-emerald-500/5 py-2 border border-emerald-500/10 rounded-lg">
                      ✓ LOYALTY VOTE REGISTERED INDEED! +15 PRESTIGE POINTS GRANTED.
                    </div>
                  )}
                </div>

                {/* DYNAMIC STADIUM CROWD ACOUSTICS SYNTHESIZER PANEL */}
                <div className="rounded-2xl border border-slate-900 bg-slate-1000 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-cyan-400 tracking-wider uppercase">📢 PREMIUM AUDIO INTERFACE</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Dynamic Stadium Crowd Acoustics</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Toggle professional digital synthesizer oscillation channels to play real crowd acoustics on demand!</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'horn', name: '🎺 Horn Blast', icon: '📣', color: 'from-amber-600/20 to-orange-600/30 border-amber-500/20 text-amber-300' },
                      { id: 'vuvuzela', name: '📯 Vuvuzela', icon: '🌀', color: 'from-cyan-600/20 to-teal-600/30 border-cyan-500/20 text-cyan-300' },
                      { id: 'cheer', name: '🙌 Crowd Cheer', icon: '🎭', color: 'from-emerald-600/20 to-teal-600/30 border-emerald-500/20 text-emerald-300' },
                      { id: 'drum', name: '🥁 Stadium Drum', icon: '⚡', color: 'from-fuchsia-600/20 to-purple-600/30 border-fuchsia-500/20 text-fuchsia-300' }
                    ].map(snd => (
                      <button
                        key={snd.id}
                        onClick={() => playStadiumSynth(snd.id as any)}
                        className={`relative rounded-xl border p-3 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95 bg-gradient-to-b ${snd.color} ${
                          stadiumAmbientType === snd.id ? 'brightness-150 border-white/60 shadow-lg scale-105' : ''
                        }`}
                      >
                        <span className="text-xl">{snd.icon}</span>
                        <span className="text-[10px] font-black tracking-wide">{snd.name}</span>
                        {stadiumAmbientType === snd.id && (
                          <span className="absolute inset-0 bg-white/5 rounded-xl animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* REAL-TIME AI SENTIMENT ANALYSIS METER */}
                <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-rose-400 tracking-wider uppercase">🎭 TELEMETRY SENTIMENT BREAKDOWN</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Live Fan Emotion Percentages</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Passive artificial intelligence monitoring over stadium emoji streams and text chats in real-time.</p>
                  </div>

                  {(() => {
                    const sentiment = getDynamicSentimentPercentages();
                    return (
                      <div className="space-y-3 pt-1">
                        {[
                          { label: 'Excited 🤩', value: sentiment.excited, color: 'bg-yellow-405' },
                          { label: 'Celebrating 🎉', value: sentiment.celebrating, color: 'bg-emerald-400' },
                          { label: 'Nervous 😰', value: sentiment.nervous, color: 'bg-indigo-400' },
                          { label: 'Shocked 😮', value: sentiment.shocked, color: 'bg-orange-400' },
                          { label: 'Angry 😡', value: sentiment.angry, color: 'bg-rose-500' }
                        ].map(emotion => (
                          <div key={emotion.label} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                              <span className="text-slate-300 font-bold">{emotion.label}</span>
                              <strong className={`${emotion.color.replace('bg-', 'text-')} font-black`}>{emotion.value}%</strong>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${emotion.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${emotion.value}%` }}
                                transition={{ type: "spring", stiffness: 40 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* COGNITIVE AI MEME GENERATOR SECTION */}
                <div className="rounded-2xl border border-slate-900 bg-[#0c0a21]/50 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-purple-400 tracking-wider uppercase">🔥 COGNITIVE STADIUM HUMOR</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">AI Meme Synthesizer</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Render automated funny sports memes instantly relating to recent historical moments.</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'dhoni_six', name: 'Dhoni 104m Six', emoji: '🚁' },
                      { id: 'virat_catch', name: 'Kohli Flying Catch', emoji: '🦅' },
                      { id: 'narine_storm', name: 'Narine Empty fifty', emoji: '😑' },
                      { id: 'pant_reverse', name: 'Pant Reverse Sweep', emoji: '🤸' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => generateStadiumMeme(btn.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border tracking-tight flex items-center gap-1.5 transition cursor-pointer select-none ${
                          customMemeText?.moment === btn.id
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-350 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <span>{btn.emoji}</span> {btn.name}
                      </button>
                    ))}
                  </div>

                  {customMemeText && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-purple-500/20 bg-slate-950 rounded-xl p-4 text-center space-y-3 relative overflow-hidden"
                    >
                      <span className="absolute top-2 right-2 text-xs opacity-20 select-none">🔥 IPLVERSE MEME</span>
                      <div className="h-12 w-12 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center text-3xl">
                        {customMemeText.imageUrl}
                      </div>

                      <div className="space-y-1 select-all">
                        <p className="text-[9px] font-mono text-purple-400 uppercase tracking-wilder font-bold">
                          [ {customMemeText.caption} ]
                        </p>
                        <p className="text-xs text-white font-extrabold italic leading-relaxed">
                          "{customMemeText.punchline}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CROWD NOISE CHAT & WATCH PARTY PANEL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* VIRTUAL WATCH PARTY SECTOR */}
          <div className="rounded-2xl border border-slate-900 bg-[#070514]/65 p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-yellow-405 animate-pulse" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Voice Watch Party Mode</h4>
              </div>
              <button 
                onClick={() => setUserInVoiceRoom(!userInVoiceRoom)}
                className={`text-[9px] font-black uppercase py-0.5 px-2.5 rounded-full border transition ${
                  userInVoiceRoom 
                    ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {userInVoiceRoom ? '🎤 Connected' : 'Disconnected'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Virtual watch party lounge enabled. Webcams and micro audio toggled. React with friends live using direct triggers.
            </p>

            {/* Simulated webcam grid tiles */}
            <div className="grid grid-cols-2 gap-3" id="watch-party-grid">
              {watchPartyMembers.map((member) => (
                <div 
                  key={member.id}
                  className="rounded-xl border border-slate-900 bg-slate-950 p-2 text-center space-y-1.5 relative overflow-hidden group"
                >
                  <div className="h-20 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-center text-2xl relative select-none">
                    {member.videoActive ? (
                      <div className="text-center px-1">
                        <span className="block animate-bounce">{member.avatar}</span>
                        <p className="text-[7.5px] text-slate-500 truncate max-w-[90px] leading-none">"{member.videoFeedMockSeed}"</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <CameraOff className="h-4 w-4 text-slate-600 mx-auto" />
                        <span className="text-[7px] text-slate-600 font-bold block uppercase">FEED DARK</span>
                      </div>
                    )}

                    {/* Float emojis triggered specifically from face tiles */}
                    <AnimatePresence>
                      {floatingEmojis.filter(e => e.senderId === member.id).map(emojiObj => (
                        <motion.span
                          key={emojiObj.id}
                          initial={{ opacity: 1, scale: 0, y: 15 }}
                          animate={{ opacity: 0, scale: 1.8, y: -40 }}
                          exit={{ opacity: 0 }}
                          className="absolute text-2xl z-10 filter drop-shadow font-bold"
                        >
                          {emojiObj.emoji}
                        </motion.span>
                      ))}
                    </AnimatePresence>

                    {/* Small team badge */}
                    <span className="absolute bottom-1 right-1 rounded bg-black/85 text-[7px] font-black text-slate-400 px-1 border border-slate-800">
                      {member.team}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-white truncate max-w-[70px]">{member.username}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setWatchPartyMembers(p => p.map(m => m.id === member.id ? { ...m, micActive: !m.micActive } : m))}
                        className={`p-0.5 rounded ${member.micActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'}`}
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* User webcam block */}
              <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-2 text-center space-y-1.5 relative">
                <span className="absolute top-1 left-1.5 h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                
                <div className="h-20 bg-slate-950 border border-dashed border-yellow-500/15 rounded-lg flex items-center justify-center text-2xl relative select-none">
                  {myVideoActive ? (
                    <div className="text-center">
                      <span className="block scale-110">🥋</span>
                      <p className="text-[7.5px] text-yellow-405 font-bold uppercase tracking-wide">MY RADAR VIEW</p>
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-600 font-bold uppercase">Cam dark</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-yellow-405 font-extrabold truncate max-w-[70px]">Me (Live)</span>
                  <div className="flex gap-1">
                    <button onClick={() => setMyMicActive(!myMicActive)} className={`p-0.5 rounded ${myMicActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Volume2 className="h-3 w-3" />
                    </button>
                    <button onClick={() => setMyVideoActive(!myVideoActive)} className={`p-0.5 rounded ${myVideoActive ? 'text-yellow-405' : 'text-slate-500'}`}>
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* REAL-TIME DISCORD-LIKE STADIUM CHAT */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-col h-[400px] relative">
            <div className="p-3 border-b border-slate-900 bg-slate-950 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-yellow-405 animate-pulse shrink-0" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Crowd Noise Room</h4>
              </div>
              <span className="text-[8.5px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">
                {chatMessages.length * 7 + 144} active fans
              </span>
            </div>

            {/* Scroll messages logs */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
              id="chat-messages-container"
            >
              {chatMessages.map((msg) => {
                const isMe = msg.id.startsWith('my-');
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] text-slate-500 font-bold font-mono">
                        {isMe ? 'You' : msg.user}
                      </span>
                      {msg.team && (
                        <span className="text-[7.5px] font-black uppercase py-0.2 px-1.5 rounded bg-slate-900 text-slate-350 border border-slate-850 leading-none">
                          {msg.team}
                        </span>
                      )}
                    </div>

                    <div className={`max-w-[85%] rounded-2xl py-2 px-3 text-xs leading-relaxed font-semibold ${
                      isMe 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-950 font-black rounded-tr-none' 
                        : 'bg-slate-900 text-slate-200 border border-slate-850 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Emoji pipeline display */}
            <div className="absolute inset-x-0 bottom-24 h-40 pointer-events-none overflow-hidden0">
              <AnimatePresence>
                {floatingEmojis.filter(e => !e.senderId).map((item) => (
                  <motion.span
                    key={item.id}
                    initial={{ y: 150, opacity: 1, scale: 0.6 }}
                    animate={{ y: -60, opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, ease: "easeOut" }}
                    className="absolute text-3xl font-black filter drop-shadow select-none pointer-events-none"
                    style={{ left: `${item.left}%` }}
                  >
                    {item.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Fast expressions tab */}
            <div className="p-2 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between gap-1 select-none shrink-0 overflow-x-auto">
              <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Cheer Noise:</span>
              <div className="flex gap-1">
                {['🎉', '🏏', '🦁', '🌀', '👑', '🔮', '🧡', '⚡', '😮', '💔'].map((emoji) => (
                  <button 
                    onClick={() => throwEmoji(emoji)}
                    key={emoji}
                    className="hover:scale-135 transition transform duration-150 p-0.5 text-sm rounded cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-2 bg-slate-950 rounded-b-2xl border-t border-slate-900">
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Draft live cheering text..."
                  maxLength={100}
                  className="flex-1 bg-slate-900 border border-slate-850 text-xs text-white rounded-xl px-3 py-2 focus:outline-none placeholder-slate-500 font-semibold"
                />
                <button type="submit" className="rounded-xl bg-gradient-to-r from-yellow-405 to-orange-500 p-2 text-slate-950 font-black hover:brightness-110">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* REAL-TIME DLS MODEL COMPUTATOR MODAL */}
      {dlsShowModal && (
        <div className="fixed inset-0 min-h-screen z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-900 bg-gradient-to-b from-slate-950 to-[#0b081c] p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient neon backdrop */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-yellow-405/5 rounded-full blur-3xl" />

            <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono block">🌧️ WEATHER PROTOCOL DLS CALCULATOR</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Duckworth-Lewis-Stern target modeler</h3>
              </div>
              <button 
                onClick={() => setDlsShowModal(false)}
                className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Target Score Input */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-slate-300 uppercase tracking-wider">Target score established (1st Innings)</span>
                  <span className="font-mono text-yellow-400 font-bold">{dlsFirstInningsScore} Runs</span>
                </div>
                <input 
                  type="range"
                  min="100"
                  max="280"
                  value={dlsFirstInningsScore}
                  onChange={(e) => setDlsFirstInningsScore(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>100 R</span>
                  <span>280 R</span>
                </div>
              </div>

              {/* Rain Shortened Overs Input */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-slate-300 uppercase tracking-wider">Shortened overs in chase</span>
                  <span className="font-mono text-green-405 font-bold">{dlsShortenedOvers} Overs (Max 20)</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="20"
                  value={dlsShortenedOvers}
                  onChange={(e) => setDlsShortenedOvers(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>5 Overs</span>
                  <span>20 Overs</span>
                </div>
              </div>

              {/* Wickets Lost in Chase */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-slate-300 uppercase tracking-wider">Active wickets lost in chase</span>
                  <span className="font-mono text-rose-500 font-bold">{dlsWicketsLost}/10 Wickets</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="9"
                  value={dlsWicketsLost}
                  onChange={(e) => setDlsWicketsLost(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0 (No wickets)</span>
                  <span>9 (Last wicket pair)</span>
                </div>
              </div>

              {/* DYNAMIC CALCULATED RESULTS AREA */}
              <div className="p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/25 text-center space-y-1 relative overflow-hidden">
                <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono">DLS PAR TO WIN CHASE</p>
                <div className="text-4xl font-extrabold text-white tracking-widest font-mono">
                  {Math.ceil(
                    dlsFirstInningsScore * 
                    (Math.max(0.1, (dlsShortenedOvers / 20) * 0.96 - (dlsWicketsLost * 0.055)))
                  )}
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">RUNS</span>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  Target Required rate: <strong className="text-cyan-300">
                    {((Math.ceil(
                      dlsFirstInningsScore * 
                      (Math.max(0.1, (dlsShortenedOvers / 20) * 0.96 - (dlsWicketsLost * 0.055)))
                    )) / dlsShortenedOvers).toFixed(2)}
                  </strong> RPO
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDlsShowModal(false);
                    onTriggerToast("📥 Scoreboard calibrated to DLS weather target!", "success");
                    onAddPoints(15);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-black text-slate-950 uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition"
                >
                  ⚡ Calibrate scoreboard
                </button>
                <button
                  type="button"
                  onClick={() => setDlsShowModal(false)}
                  className="px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 text-xs font-black text-slate-400 hover:text-white cursor-pointer uppercase tracking-wider transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
