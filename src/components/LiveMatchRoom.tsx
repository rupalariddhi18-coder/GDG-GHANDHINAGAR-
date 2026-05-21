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
  onVotePrediction
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
  const [customMemeText, setCustomMemeText] = useState<{
    moment: string;
    caption: string;
    punchline: string;
    imageUrl: string;
  } | null>(null);

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const emojiIdCounter = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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

          // Voice Commentary Speech Synthesis Trigger
          if (voiceCommentaryEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            try {
              window.speechSynthesis.cancel(); // Stop backlog
              const cleanSpeech = `${currentBall.over} overs, ${currentBall.desc.replace(/[#*]/g, '')}`;
              const utterance = new SpeechSynthesisUtterance(cleanSpeech);
              utterance.pitch = 1.15;
              utterance.rate = 1.05;
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.warn("Speech Synthesis failed or blocked in preview panel:", err);
            }
          }

          // Trigger special screen effects
          if (currentBall.type === '6') {
            setScreenEffect('six');
            setTimeout(() => setScreenEffect('normal'), 3000);
            onAddPoints(8);
          } else if (currentBall.type === 'W') {
            setScreenEffect('wicket');
            setTimeout(() => setScreenEffect('normal'), 3000);
            onAddPoints(12);
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]); // Vibrates if system supports
            }
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
          }

          return hypeSpeedMode ? 1 : 5; // Reset interval to 1 or 5 seconds countdown
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBallIdx, activeSport, hypeSpeedMode, voiceCommentaryEnabled]);

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
                <span className="text-[10px] sm:text-xs font-mono font-black text-rose-450 uppercase tracking-widest">{match.league}</span>
              </div>
              
              <div className="rounded-full bg-slate-900 px-3 py-1 flex items-center gap-1.5 border border-slate-800 text-[10px] font-black text-slate-300">
                <Clock className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
                <span>BALL TICK IN: <strong className="text-yellow-400 font-mono font-black">{timeToNextBall}S</strong></span>
              </div>
            </div>

            {/* Score layout */}
            <div className="grid grid-cols-12 gap-3 items-center py-4 rounded-2xl bg-black/60 border border-slate-900 px-4">
              {/* Home Team */}
              <div className="col-span-4 text-center space-y-1">
                <span className="text-3xl block select-none">
                  {activeSport === 'csk_mi' ? '🦁' : activeSport === 'rcb_kkr' ? '👑' : '🧡'}
                </span>
                <span className="text-sm font-black text-white uppercase tracking-tight block">
                  {teams.codeA}
                </span>
                <p className="text-[9px] text-yellow-500 font-extrabold uppercase tracking-widest">Home</p>
              </div>

              {/* Centered Score */}
              <div className="col-span-4 text-center space-y-2">
                <span className="text-[8px] font-mono font-bold text-slate-500 tracking-widest uppercase">RADAR SCOREBOARD</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter shrink-0">
                  {tickerScore}
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-450 block">{tickerOver} Overs</span>
              </div>

              {/* Away Team */}
              <div className="col-span-4 text-center space-y-1">
                <span className="text-3xl block select-none">
                  {activeSport === 'csk_mi' ? '🌀' : activeSport === 'rcb_kkr' ? '🔮' : '⚡'}
                </span>
                <span className="text-sm font-black text-white uppercase tracking-tight block">
                  {teams.codeB}
                </span>
                <p className="text-[9px] text-[#3b82f6] font-extrabold uppercase tracking-widest">Away</p>
              </div>
            </div>

            {/* Ball-by-ball micro history of the current over */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 py-3 border-t border-slate-900">
              <div className="flex items-center gap-2 select-none">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest">THIS OVER:</span>
                <div className="flex gap-1.5">
                  {lastBallsInOver.map((ball, idx) => (
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
                  ))}
                </div>
              </div>

              {/* Toss / Conditions */}
              <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1">
                🏏 Toss: MI won toss & elected to bowl • Dew: Heavy 🌧️
              </span>
            </div>

            {/* Run Rate indices */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-2 rounded-xl bg-slate-900/30 border border-slate-900 text-xs text-slate-400 uppercase tracking-wider font-bold">
                Current Run Rate: <strong className="text-yellow-400 font-mono font-black">CRR: 10.28</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/30 border border-slate-900 text-xs text-slate-400 uppercase tracking-wider font-bold">
                Required Run Rate: <strong className="text-[#a855f7] font-mono font-black">RRR: 11.45</strong>
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
                <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Live Winning Probability Swing</h4>
                    <span className="text-[10px] font-mono text-yellow-400">UPDATES EVERY BALL DELIVERED</span>
                  </div>

                  {/* Swinger indicator bar */}
                  <div className="space-y-2">
                    <div className="h-6 w-full rounded-full bg-slate-900 overflow-hidden flex text-[10px] font-mono font-black relative border border-slate-800">
                      <div 
                        className="bg-yellow-400 text-slate-950 flex items-center justify-center transition-all duration-700 ease-out"
                        style={{ width: `${calculatedWinPctA}%` }}
                      >
                        {calculatedWinPctA >= 15 ? `${teams.codeA} ${calculatedWinPctA}%` : ''}
                      </div>
                      <div 
                        className="bg-[#3b82f6] text-white flex items-center justify-center transition-all duration-700 ease-out"
                        style={{ width: `${calculatedWinPctB}%` }}
                      >
                        {calculatedWinPctB >= 15 ? `${teams.codeB} ${calculatedWinPctB}%` : ''}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed text-center">
                      🏏 Sentiment Analysis: Chasing side has a <strong className="text-yellow-400">high leveraged bounce</strong> due to death-over batters at strike!
                    </p>
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

                <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                  {customCommentary.map((ball, idx) => {
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

    </div>
  );
}
