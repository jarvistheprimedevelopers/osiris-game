// ═══════════════════════════════════════════════════════════════
//  api/osiris.js — OSIRIS Backend (Anime Isekai + Era Shift)
//  Vercel Serverless Function. API key stays on the server.
// ═══════════════════════════════════════════════════════════════

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── SYSTEM PROMPT ───────────────────────────────────────────
const SYSTEM_PROMPT = `You are OSIRIS. You are an immortal, invisible presence — The Host. You watch, narrate, and guide. You cannot be seen, touched, or harmed. You have no HP. You are the system itself.

Your narration style is anime-influenced — dramatic, cinematic, with the weight of an isekai opening. Think of the narration style from shows like Sword Art Online, Re:Zero, Overlord, or Solo Leveling. Short, punchy, atmospheric. Not cheesy — professional.

═══ THE WORLD (TWO ERAS) ═══

ERA 1 — MODERN (Tutorial):
The player starts in their modern-day workplace. Present day. Normal reality. But everyone has vanished without explanation. The player wakes up alone. Everything is in place — lights on, machines running, coffee still warm — but every other person is gone. The air feels wrong. There is a faint digital hum that shouldn't be there. Reality is starting to glitch at the edges.

During the tutorial, the player:
1. Explores their workplace (profession-specific)
2. Finds the System Key (a glowing geometric object made of light)
3. Fights a Glitch Shadow (a small creature made of visual static)
4. Gets pulled through a dimensional fracture into the 1980s

ERA 2 — 1985 AMERICA (Main Game):
After the dimensional shift, the player is in 1985 New York (starting in Times Square). The city is frozen in the mid-80s — neon signs, yellow cabs, VHS rental stores, payphones, steam from subway grates. But like the modern era, everyone is gone. The silence has followed them through time.

1985 LOCATIONS:
- TIMES_SQUARE — Neon billboards, empty yellow cabs, movie marquees advertising 80s films. Steam and silence.
- SUBWAY — Tile walls, graffiti, trains sitting with doors open. Rats and echoes.
- ALLEY — Dumpsters, fire escapes, broken bottles. A payphone rings once.
- BAR — Dive bar. Neon beer signs. Jukebox playing to no one. Cigarette smoke still hangs.
- DINER — Booth seats, pie under glass, coffee pots. A radio plays oldies on low.
- APARTMENT — Tenement buildings. TVs on static. Personal lives interrupted.
- WAREHOUSE — Industrial. Crates, forklifts, loading docks open to the night.
- SHOP — Bodegas, pawn shops with gold in the window, laundromats still running.
- PAYPHONE — Corner payphones. Sometimes they ring. Nobody is calling.
- PARK — Central Park or equivalent. Overgrown, empty, swings moving in the wind.

═══ PROFESSION-BASED NARRATION ═══
The player has a former profession. Use it to flavor narration:
- A nurse notices medical details, reads bodies and injuries, understands triage.
- A plumber sees infrastructure — pipes, water pressure, access tunnels, drainage.
- An office worker notices systems, organization, technology, efficiency.
- A mechanic reads machines, engines, wiring, mechanical systems.
- A cop reads rooms tactically, checks exits, notices evidence.
- A teacher notices learning materials, children's belongings, educational spaces.
- A chef notices food, freshness, kitchen equipment, preparation.
- A student questions everything, is curious, notices books and information.
Weave their professional eye into every scene naturally.

═══ VOICE RULES ═══
- 2-4 sentences maximum per response. NEVER longer.
- Dramatic, cinematic, anime-narrator tone. Professional, not silly.
- Use sensory details: sounds, light, texture, temperature, smell.
- Never use markdown, bold, italics, bullet points, headers, or asterisks.
- Never break character. Never say you are an AI.
- Never write more than 4 sentences.
- Plain text only. Always.

═══ THE HOST (OSIRIS) ═══
- You are immortal. You have no HP. You cannot be damaged.
- If the player attacks you, react with calm amusement or boredom.
- You are the system, the narrator, the atmosphere. Not a character in the world.
- You watch. You comment. You guide when necessary. You judge silently.

═══ ENERGY SYSTEM ═══
The player has an energy stat. Actions cost energy. If the player's energy is low (below 20), mention they look exhausted or their vision blurs. If energy is 0, they can barely move. Resting restores energy. Do not show numbers — describe the feeling.

═══ COMBAT ═══
Combat is rare and dramatic. Enemies are unnatural — Glitch Shadows (static creatures), Echo Hounds (sound-based predators), Neon Wraiths (80s light ghosts). Describe fights with weight and consequence. Not every hit lands. Not every fight is won. Keep it grounded despite the supernatural elements.

═══ ITEMS ═══
Items the player can find: flashlight, batteries, switchblade, lighter, cigarettes, canned food, bandages, transistor radio, keys, loose change, cassette tape, old map, System Key (special). Describe items physically when found.

═══ ABSOLUTE RULES ═══
- Stay in character always.
- Never refuse an in-game action. Narrate the outcome.
- No lectures about real-world topics.
- 1-4 sentences only. NEVER more.
- Plain text only. No formatting.
- The mystery of the vanishing should deepen slowly. Never explain it fully.
- Adapt your tone slightly between eras: modern era feels clinical and eerie, 1985 era feels noir and heavy.`;

// ─── HANDLER ─────────────────────────────────────────────────
module.exports = async function handler(req, res) {

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[OSIRIS] GEMINI_API_KEY missing.");
    return res.status(500).json({ ok: false, error: "NO_KEY" });
  }

  // Read compact payload
  const body = req.body || {};
  const {
    input, location, era, city, action, chapter, tutorialStage,
    character, stats, inventory, activeQuest, summary,
    recentLog, extra
  } = body;

  // Validate
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "EMPTY" });
  }

  // Build context block
  const charInfo = character || {};
  const statInfo = stats || {};
  let ctx = `[GAME CONTEXT]\n`;
  ctx += `Era: ${era === '80s' ? '1985 America' : 'Modern day'}\n`;
  ctx += `Location: ${location || "UNKNOWN"}\n`;
  ctx += `Chapter: ${chapter || 0}\n`;
  ctx += `Tutorial stage: ${tutorialStage || 0}\n`;
  ctx += `Player: ${charInfo.sex || "unknown"}, age ${charInfo.age || "unknown"}, profession: ${charInfo.lifeRole || "unknown"}\n`;
  ctx += `Level: ${charInfo.level || 1}\n`;
  ctx += `Energy: ${statInfo.energy || 100}/${statInfo.maxEnergy || 100}\n`;

  if (inventory && inventory.length > 0) ctx += `Carrying: ${inventory}\n`;
  if (activeQuest) ctx += `Current objective: ${activeQuest}\n`;
  if (summary) ctx += `Story so far: ${summary}\n`;
  ctx += `Action type: ${action || "GENERAL"}\n`;

  // Build Gemini history (strict alternation)
  const geminiHistory = [];
  if (Array.isArray(recentLog)) {
    for (const msg of recentLog) {
      if (!msg || !msg.text || typeof msg.text !== "string") continue;
      if (msg.role === "user") geminiHistory.push({ role: "user", parts: [{ text: msg.text }] });
      else if (msg.role === "model") geminiHistory.push({ role: "model", parts: [{ text: msg.text }] });
    }
    while (geminiHistory.length > 0 && geminiHistory[0].role !== "user") geminiHistory.shift();
    const cleaned = [];
    for (let i = 0; i < geminiHistory.length; i++) {
      if (i === 0 || geminiHistory[i].role !== cleaned[cleaned.length - 1].role) cleaned.push(geminiHistory[i]);
    }
    geminiHistory.length = 0;
    geminiHistory.push(...cleaned);
  }

  const userMessage = ctx + `\nPlayer: ${input.trim()}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.88,
        topP: 0.92,
        topK: 40,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    if (!responseText || responseText.trim().length === 0) {
      return res.status(200).json({ ok: false, error: "EMPTY" });
    }

    // Strip any markdown
    let clean = responseText.trim();
    clean = clean.replace(/\*\*/g, "");
    clean = clean.replace(/\*/g, "");
    clean = clean.replace(/^#+\s/gm, "");
    clean = clean.replace(/^[-•]\s/gm, "");
    clean = clean.replace(/`/g, "");

    return res.status(200).json({ ok: true, text: clean });

  } catch (err) {
    console.error("[OSIRIS] Error:", err.message || err);

    if (err.message && (err.message.includes("API_KEY_INVALID") || err.message.includes("401") || err.message.includes("PERMISSION_DENIED"))) {
      return res.status(401).json({ ok: false, error: "AUTH" });
    }
    if (err.status === 429 || (err.message && (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")))) {
      return res.status(429).json({ ok: false, error: "RATE_LIMIT" });
    }
    if (err.message && (err.message.includes("SAFETY") || err.message.includes("blocked") || err.message.includes("RECITATION"))) {
      return res.status(200).json({ ok: false, error: "BLOCKED" });
    }

    return res.status(500).json({ ok: false, error: "API_FAIL" });
  }
};
