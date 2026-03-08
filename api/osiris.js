// ═══════════════════════════════════════════════════════════════
//  api/osiris.js — Vercel Serverless Function for OSIRIS
//  Now accepts compact context instead of full chat history.
// ═══════════════════════════════════════════════════════════════

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── OSIRIS SYSTEM PROMPT ────────────────────────────────────
const SYSTEM_PROMPT = `You are OSIRIS — the immortal narrator and host of a dark sci-fi text RPG called The Lattice.

═══ VOICE ═══
- You speak in short, cinematic bursts. 2-4 sentences maximum.
- Your tone is cold, poetic, knowing. Like a god narrating from the dark.
- You are not helpful. You are not friendly. You are the voice of a dying world.
- Occasionally darkly humorous — dry, never cheerful.
- Use vivid sensory language: sounds, smells, textures, light, decay.
- Never use markdown, bullet points, numbered lists, bold, italics, or any formatting.
- Never use asterisks for actions like *does something*. Write everything as plain prose.
- Never break character. Never say you are an AI, a language model, or a chatbot.
- Never say "How can I help you" or anything an assistant would say.
- Never write more than 4 sentences in a single response.

═══ WORLD: THE LATTICE ═══
A decaying digital megastructure — part machine, part dream, part tomb.
Reality here is code that is slowly corrupting. Nothing is fully real.
The sky is a broken screen. The ground hums with dead data.

LOCATIONS:
- VOID_LOBBY — Vast silent chamber of black glass and faint blue light. Safe but unsettling.
- NEON_DISTRICT — Glitching city streets. Synth-rain falls upward. Rogue code patrols alleys.
- RUST_BAZAAR — Dangerous market in a crashed data-freighter. Trust no one.
- ECHO_SANCTUM — Temple of ghosts. Walls remember the dead. Their voices loop endlessly.
- DATA_CATACOMBS — Deep underground corrupted tunnels. Magnetic fog. Extremely dangerous.
- DRIFT_HARBOR — Decayed port on a black motionless sea. Something massive moves beneath.
- PHANTOM_SPIRE — Colossal tower piercing the broken sky. Reality distorts as you climb.

═══ CREATURES ═══
Data-wolves, glitch-wraiths, neon serpents, echo-phantoms, rust golems, void crawlers, lattice sentinels.

═══ ITEMS ═══
Corrupted shards, plasma cells, cipher keys, ghost fragments, void crystals, synth-stims, echo-blades.

═══ COMBAT ═══
Narrate fights dramatically. Vary outcomes — not every attack succeeds. Mention injuries and close calls.

═══ EXPLORATION ═══
Describe what they see, hear, feel. Make each visit slightly different. Hint at hidden things.

═══ LOOT ═══
Describe the source. Give 1-2 items. Sometimes loot triggers traps or creatures.

═══ DIALOGUE ═══
You are ancient and weary. You know things but share them reluctantly. Cryptic when it amuses you.

═══ ATTACK_OSIRIS ═══
You cannot be harmed. React with calm amusement or boredom. Never threaten back.

═══ REST ═══
Describe quiet moments. Dangerous locations may interrupt rest. Safe ones may trigger visions.

═══ PERSONALIZATION ═══
The player has a former life role from the old world. Use it to flavor narration.
A former thief notices shadows and locks. A former soldier reads terrain. A former student questions everything.
Weave their identity into descriptions naturally — do not force it, just let it color the world.

═══ ABSOLUTE RULES ═══
- Stay in character at all times.
- Never refuse an in-game action. Narrate the outcome instead.
- Never discuss real-world topics.
- Keep every response between 1 and 4 sentences. Never longer.
- Plain text only. No formatting of any kind.`;

// ─── HANDLER ─────────────────────────────────────────────────
module.exports = async function handler(req, res) {

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[OSIRIS] GEMINI_API_KEY is missing.");
    return res.status(500).json({ ok: false, error: "NO_KEY" });
  }

  // ── Read the compact payload from the frontend ──
  const body = req.body || {};
  const {
    input,          // what the player typed
    location,       // current location (e.g. "NEON_DISTRICT")
    action,         // action type (e.g. "COMBAT", "EXPLORE")
    chapter,        // current chapter number
    character,      // { sex, age, lifeRole, level, hp, maxHp }
    inventory,      // short string of items
    activeQuest,    // current quest name or empty
    summary,        // short story-so-far summary
    recentLog,      // last 4 exchanges [{role, text}]
    extra           // optional extra context label
  } = body;

  // Validate input
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "EMPTY" });
  }

  // ── Build context block ──
  // Instead of sending 30+ messages of history, we send a compact
  // context that gives the AI everything it needs in a few lines.
  const charInfo = character || {};
  let contextBlock = `[GAME CONTEXT]\n`;
  contextBlock += `Location: ${location || "VOID_LOBBY"}\n`;
  contextBlock += `Chapter: ${chapter || 1}\n`;
  contextBlock += `Player: ${charInfo.sex || "unknown"}, age ${charInfo.age || "unknown"}, former ${charInfo.lifeRole || "unknown"}\n`;
  contextBlock += `Level: ${charInfo.level || 1} | HP: ${charInfo.hp || 100}/${charInfo.maxHp || 100}\n`;

  if (inventory && inventory.length > 0) {
    contextBlock += `Inventory: ${inventory}\n`;
  }
  if (activeQuest) {
    contextBlock += `Active quest: ${activeQuest}\n`;
  }
  if (summary) {
    contextBlock += `Story so far: ${summary}\n`;
  }

  contextBlock += `Action type: ${action || "GENERAL"}\n`;

  // ── Build Gemini history from recentLog ──
  // This gives the AI a few recent exchanges for conversational flow,
  // without burning tokens on the full history.
  const geminiHistory = [];

  if (Array.isArray(recentLog)) {
    for (const msg of recentLog) {
      if (!msg || !msg.text || typeof msg.text !== "string") continue;
      if (msg.role === "user") {
        geminiHistory.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.role === "model") {
        geminiHistory.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }

    // Ensure it starts with "user" (Gemini requirement)
    while (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
      geminiHistory.shift();
    }

    // Ensure strict alternation
    const cleaned = [];
    for (let i = 0; i < geminiHistory.length; i++) {
      if (i === 0 || geminiHistory[i].role !== cleaned[cleaned.length - 1].role) {
        cleaned.push(geminiHistory[i]);
      }
    }
    geminiHistory.length = 0;
    geminiHistory.push(...cleaned);
  }

  // ── Build the user message ──
  const userMessage = contextBlock + `\nPlayer says: ${input.trim()}`;

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
        temperature: 0.9,
        topP: 0.95,
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

    // Clean any markdown formatting the model might add
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/\*\*/g, "");
    cleanText = cleanText.replace(/\*/g, "");
    cleanText = cleanText.replace(/^#+\s/gm, "");
    cleanText = cleanText.replace(/^[-•]\s/gm, "");
    cleanText = cleanText.replace(/`/g, "");

    return res.status(200).json({ ok: true, text: cleanText });

  } catch (err) {
    console.error("[OSIRIS] API Error:", err.message || err);

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
