import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Standard lazy initialization of Gemini Client to handle missing keys gracefully
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("IPLVerse: Gemini AI initialized successfully.");
  } catch (err) {
    console.error("IPLVerse: Error initializing Gemini AI:", err);
  }
} else {
  console.warn("IPLVerse: GEMINI_API_KEY is not defined or is placeholder. Falling back to Mock Sports AI.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // 1. API: Sports AI Chatbot Route (with custom prompt engineering for IPLVerse)
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = 
      "You are 'IPLVerse Sports Guru', the ultimate cricket analyst and commentary oracle of the IPLVerse Community. " +
      "You provide extremely funny, witty, energetic, and highly analytical IPL commentary, predictions, stats, and historical trivia.\n\n" +
      "Current Context/Date: May 2026.\n" +
      "Your critical mandate: Promote cricket friendships and bonding. When fans ask for comparisons or debate players " +
      "(e.g., Dhoni vs Kohli, Rohit vs Hardik), highlight the masterclass of BOTH, keeping it supportive and friendly rather than toxic. " +
      "Active Match Status today:\n" +
      "1. CSK vs MI (Chennai Super Kings vs Mumbai Indians). Current Score: CSK 198/6 (19.1 Overs). CSK needs 11 runs in 5 balls! MS Dhoni is at the crease! Jasprit Bumrah has 1 ball left in his spell.\n" +
      "2. RCB vs KKR (Royal Challengers Bengaluru vs Kolkata Knight Riders). Current Score: RCB 212/4 (20 Ov) vs KKR 208/8. Status: RCB won a nailbiter by 4 runs at Chinnaswamy stadium!\n" +
      "3. SRH vs GT (Sunrisers Hyderabad vs Gujarat Titans). Current Live: SRH 145/2 (12.4 Overs) chasing GT's massive target of 228. Nitish Reddy is hitting spinners at will.\n\n" +
      "Keep responses sporty, energetic, and under 150 words. Format with elegant bullet lists and bold key phrases. If asked about JSON structures for match prediction polls, return EXACTLY valid JSON.";

    // If API client is initialized, use the real Gemini API
    if (aiClient) {
      try {
        const contentsList: any[] = [];
        
        if (history && Array.isArray(history)) {
          history.slice(-10).forEach((h: any) => {
            contentsList.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text }]
            });
          });
        }
        
        contentsList.push({
          role: "user",
          parts: [{ text: message }]
        });

        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contentsList,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.85,
          }
        });

        const reply = response.text || "I was unable to analyze that delivery. Could you repeat?";
        return res.json({ text: reply });
      } catch (err: any) {
        console.error("Gemini API execution failed, returning fallback message.", err);
        return res.json({ 
          text: `⚡ *Google Gemini (Alternative Relay Link)*:\n\nThat was a spectacular query! However, I had a slight connection timeout communicating with the stadium satellite dish.\n\nHere's the match brief:\n\n- **Live CSK vs MI Clash**: The atmosphere is electric! CSK is currently at *198/6 (19.1 Overs)* chasing Mumbai's massive mountain. Dhoni is on strike!\n- **Cricket Friendship Tip**: Connecting with a rival MI fan right now boosts your prediction multiplier rate! Go find a match in the *Stadium Lobby*!`,
          isFallback: true
        });
      }
    } else {
      // High-accuracy fallback simulated AI for cricket lovers
      const upperMsg = message.toUpperCase();
      let responseText = "";

      if (upperMsg.includes("DHONI") || upperMsg.includes("KOHLI") || upperMsg.includes("CHASE") || upperMsg.includes("COMPLETION")) {
        responseText = `🦁 **IPLVerse Cricket Guru (AI simulation)**:\n\nThis debate is as legendary as they come!\n\n* **Virat Kohli**: Represents pure focus, passion, and chasing metrics. His second-innings average of **63.4** under scoreboard pressure makes him a chase master.\n* **MS Dhoni**: Represents supreme tactical ice-cool composure. Even in 2026, his finishing rate in the 20th Over remains a masterclass (having struck *114 sixes* at extreme pressure moments!).\n\n**Guru Verse Conclusion**: They represent the yin and yang of Indian cricket. The best friendships appreciate BOTH!`;
      } else if (upperMsg.includes("PLAYOFF") || upperMsg.includes("POINTS") || upperMsg.includes("TABLE") || upperMsg.includes("STANDINGS")) {
        responseText = `📊 **IPLVerse Standings breakdown (AI simulation)**:\n\nHere is how the top franchises stack up as of May 2026:\n\n- **1. KKR**: Dominating with **16 Pts** and a blistering Net Run Rate of \`+1.350\`.\n- **2. CSK**: Hovering closely on **14 Pts**. A win tonight over MI seals their ticket to the playoffs!\n- **3. MI & GT**: Locked in a tense mid-table struggle on **12 Pts** each. Every single delivery from here is a knockout match!`;
      } else if (upperMsg.includes("BUMRAH") || upperMsg.includes("MALINGA") || upperMsg.includes("YORKER") || upperMsg.includes("BOWLING")) {
        responseText = `🌀 **Death Bowling Telemetry (AI simulation)**:\n\nBoth MI bowling icons redefined the blockhole yorker:\n\n* **Lasith Malinga**: Used a slingy 38° arm angle release, which meant the batsman saw the ball extremely late from behind visual markers.\n* **Jasprit Bumrah**: Commands an extremely high release hyper-extension. This results in standard delivery speeds of **145 km/h** crashing straight into toe-crush zones.\n\n*Fun Fact*: Bumrah actually attributes much of his analytical growth to hours spent talking tactics with Malinga at watch party tables!`;
      } else {
        responseText = `🏏 **IPLVerse Analytical Assistant (AI simulation)**:\n\nWelcome to your cricket intelligence hub. I am online and analyzing ball by ball!\n\n* **Current Vibe**: CSK is chasing a mammoth target against MI. The community atmosphere is 100% active with real-time fan bonding.\n* **Verse Recommendation**: Go to the **Lobby tab**, swipe on suggested partners who support the opposite team, and build a *cricket friendship* to unlock the **Golden Friendship Bracelet Badge**!\n\n*(To activate live Gemini models, load your \`GEMINI_API_KEY\` into the platform Secrets menu!)*`;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      return res.json({ text: responseText, isFallback: true });
    }
  });

  // 2. Route returning live IPL match parameters
  app.get("/api/matches", (req, res) => {
    res.json({
      csk_mi: {
        title: "CSK vs MI Live Duel",
        league: "IPL 2026 • Group Stage",
        score: "CSK 198/6 (19.1 Ov)",
        time: "19.1 Overs (CSK Chasing)",
        status: "LIVE • 11 off 5 balls!",
        target: "Target 210",
        details: "MS Dhoni hits a boundary! 11 needed off 5 balls now. Bumrah is preparing his final delivery.",
        wicketsTimelineList: ["4", "1", "W", "6", "W", "4"]
      },
      rcb_kkr: {
        title: "RCB vs KKR Completed",
        league: "IPL 2026",
        score: "RCB 212/4 vs KKR 208/8",
        time: "Completed Game",
        status: "RCB won by 4 runs!",
        target: "Chinnaswamy Stadium",
        details: "An absolutely classic high-scoring chase. Siraj defended 12 in the final over against KKR's Russell power.",
        wicketsTimelineList: ["6", "W", "1", "W", "4", "0"]
      },
      srh_gt: {
        title: "SRH vs GT Live Arena",
        league: "IPL 2026 • Group Stage",
        score: "SRH 145/2 (12.4 Ov)",
        time: "12.4 Overs (SRH Chasing)",
        status: "LIVE • Chasing 228",
        target: "Target 228",
        details: "GT posted a mammoth 228! SRH is blazing through the chase at 11.5 Runs per Over.",
        wicketsTimelineList: ["6", "6", "W", "1", "4", "4"]
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
