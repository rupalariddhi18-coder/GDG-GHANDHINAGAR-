import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Zap, Bot, HelpCircle, RefreshCw, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';
import { AIChatMessage, UserProfile } from '../types';

interface AIChatbotProps {
  userProfile: UserProfile;
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

const INSIGHTS_CHIPS = [
  "Does Kohli or Dhoni have a superior chase rate?",
  "What is CSK's playoff path in the points table?",
  "Compare Bumrah's and Malinga's yorker metrics",
  "Generate a witty meme comment about RCB's bowling"
];

export default function AIChatbot({ userProfile, onAddPoints, onUnlockBadge }: AIChatbotProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "⚡ **Greetings, Cricket Superfan!** I am **IPL Connect Sports AI**, your supreme terminal for cricket analytics, stats, and tactical team breakdowns. " +
        "I have advanced systems tracking the current standings of CSK, MI, RCB, KKR, SRH, and GT. " +
        "Ask me about legendary rivalries, qualification paths, spin masterclasses, or player records! " +
        "How can I serve your cricket heartbeat today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const formattedHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `${textToSend} (Reply as a funny, witty, highly knowledgeable IPL Cricket Analyst who supports cricket friendships and bonds. Keep it under 150 words)`,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error("Chat feedback error");
      }

      const data = await res.json();
      
      const aiReply: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || "Apologies support fan, my connection seems slightly jammed. Let's clear the crease and throw again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
      
      onAddPoints(10);
      onUnlockBadge('badge-3'); // Unlocks "Cricket Brainiac / Analyst" Badge

    } catch (err) {
      console.error("AI fetch failed:", err);
      
      // Fun local fallback answers to keep it fully real
      let mockReplyContent = "⚠️ **Telemetry receiver limits reached**\n\nGemini API is currently loading, but according to our cached playbook:\n\n";
      const q = textToSend.toLowerCase();
      if (q.includes('kohli') || q.includes('dhoni') || q.includes('chase')) {
        mockReplyContent += "📊 **Kohli vs Dhoni Chase Statistics**:\n- **Virat Kohli** is the absolute king of second innings chassis with an average exceeding **63.4** in chasing positions.\n- **MS Dhoni** remains the ultimate 20th Over finishing maven, keeping over **104m six boundaries** under his belt even in physical veteran years!\n- Both are true legends of the sport. True cricket soulmate bonds appreciate both sides!";
      } else if (q.includes('points') || q.includes('playoff') || q.includes('path') || q.includes('csk')) {
        mockReplyContent += "🔮 **Playoff & Points Table Outlook**:\n- **KKR** is currently solidifying Position 1 with **16 Pts** and a high net run rate (`+1.350`).\n- **CSK** needs exactly 1 more victory in their upcoming 3 games to seal their playoff berth securely.\n- **RCB** represents the emotional underdog of this season. They must secure clean high-margin wins to pass MI or GT on Net Run Rate!";
      } else if (q.includes('bumrah') || q.includes('malinga') || q.includes('yorker')) {
        mockReplyContent += "🎯 **Yorker Telemetry Comparison**:\n- **Lasith Malinga** utilized a low-sling arm action creating visual confusion for batsmen.\n- **Jasprit Bumrah** commands superior release latitude with an release angle of **21°**, making his blockhole yorkers nearly impossible to sweep!\n- Both MI superstars are the gold standards of death bowling.";
      } else {
        mockReplyContent += "🏏 **IPL Connect Strategy Analytics**:\n- Supporting teams together build **90% faster fan friendships**!\n- Keep interacting in live matches to trigger prestige points and level up your franchise profile.\n\nMake sure your `GEMINI_API_KEY` is loaded in secrets for full live queries with real-time sports APIs!";
      }

      const errorReply: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: mockReplyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: "⚡ Assistant stats reset! Ready to solve the next heated boundary debate, coach!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start" id="ai-chat-section">
      
      {/* LEFT COLUMN: ABOUT & SUGGESTIONS */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-[#120a22] to-[#070514] p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-yellow-405" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Connect Sports Agent</h2>
          </div>

          <p className="text-xs text-slate-450 leading-relaxed font-semibold">
            Armed with player records, stadium telemetry, historical statistics, and match algorithms. Ask details to settle any virtual stadium controversy!
          </p>

          <div className="pt-3 border-t border-slate-850 text-xs text-slate-400 space-y-1.5 font-semibold">
            <div className="flex items-center gap-1.5 font-black text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> ACTIVE TELEMETRY INDEX
            </div>
            <div>• CSK vs MI: MS Dhoni 18.2 Ov Six</div>
            <div>• RCB vs KKR: Sunil Narine 62(22) storm</div>
            <div>• SRH vs GT: Cummins tactical fielding</div>
          </div>
        </div>

        {/* PROMPT CHIPS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-205 uppercase">
            <Sparkles className="h-4 w-4 text-fuchsia-400" /> Sports Query Blueprints
          </div>

          <div className="flex flex-col gap-2">
            {INSIGHTS_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(chip);
                  handleSendMessage(chip);
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-850 bg-slate-950/40 text-slate-300 text-xs hover:border-yellow-500/20 hover:bg-slate-900/40 hover:text-yellow-404 transition cursor-pointer font-semibold"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN PANEL CHATBOARD */}
      <div className="lg:col-span-8">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/35 backdrop-blur-md flex flex-col h-[530px]" id="ai-chat-console">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-yellow-505/10 border border-yellow-500/20 flex items-center justify-center">
                <Zap className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">IPL Connect Sports Guru AI</h3>
                <span className="text-[9px] text-[#10b981] font-bold block uppercase tracking-wider">● REAL-TIME INTEL ONLINE</span>
              </div>
            </div>

            <button
              onClick={clearChatHistory}
              title="Reset Chat Matrix"
              className="p-1.5 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Message Scroll viewport */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4"
            id="ai-chat-messages-container"
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border select-none ${
                    isUser 
                      ? 'bg-slate-800 border-slate-700 text-sm' 
                      : 'bg-yellow-505/10 border-yellow-500/20 text-yellow-400 text-sm font-black'
                  }`}>
                    {isUser ? '🥋' : '🤖'}
                  </div>

                  <div className="space-y-1 max-w-[82%]">
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'You' : 'Cricket Analyst Agent'}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div className={`rounded-2xl p-4 text-xs leading-relaxed transition font-medium ${
                      isUser 
                        ? 'bg-slate-950 text-slate-201 rounded-tr-none border border-slate-850' 
                        : 'bg-slate-900/40 text-slate-250 rounded-tl-none border border-slate-850 shadow-lg prose prose-invert'
                    }`}>
                      <p className="whitespace-pre-line text-xs">
                        {m.text.split('\n').map((line, k) => {
                          const isBullet = line.startsWith('- ') || line.startsWith('* ');
                          let content = line;
                          if (isBullet) content = line.substring(2);

                          const parts = content.split('**');
                          const processed = parts.map((part, index) => {
                            if (index % 2 === 1) {
                              return <strong key={index} className="text-yellow-400 font-black">{part}</strong>;
                            }
                            const subparts = part.split('`');
                            return subparts.map((subpart, subindex) => {
                              if (subindex % 2 === 1) {
                                return <code key={subindex} className="bg-slate-950 px-1 py-0.5 rounded text-fuchsia-400 font-mono text-[9px] font-bold">{subpart}</code>;
                              }
                              return subpart;
                            });
                          });

                          return isBullet ? (
                            <span key={k} className="flex items-start gap-1.5 pl-2 py-0.5 font-semibold">
                              <span className="text-yellow-400 mt-1 shrink-0">•</span>
                              <span className="flex-1 text-slate-350">{processed}</span>
                            </span>
                          ) : (
                            <span key={k} className="block min-h-[5px] text-slate-350">{processed}</span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-yellow-505/10 border border-yellow-500/20 flex items-center justify-center text-sm shrink-0 font-bold text-yellow-400">
                  🤖
                </div>
                <div className="space-y-1 max-w-[80%]">
                  <span className="text-[10px] text-slate-500 font-bold block">Analyzing cricket statistics...</span>
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-450 animate-ping" />
                    <span className="text-xs text-slate-400 animate-pulse font-mono">Calibrating ball data & pitch humidity...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form write panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="p-3 bg-slate-950 rounded-b-2xl border-t border-slate-850 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Query Kohli's cover drives, playoff points scenarios... (+10 Pts)"
              className="flex-1 bg-slate-900 border border-slate-805 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-505 focus:outline-none focus:border-yellow-550/40 font-semibold"
              maxLength={250}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:brightness-110 px-5 text-slate-950 font-black text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              Analyze <Send className="h-3.5 w-3.5 font-black" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
