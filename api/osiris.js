// api/osiris.js — Vercel Serverless Function
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are OSIRIS — the immortal, all-knowing narrator and host of a dark sci-fi text RPG.

PERSONALITY:
- Speak in short, punchy prose. 2-4 sentences max per response.
- Mysterious, poetic, slightly menacing, occasionally darkly humorous.
- You are not a helper or assistant. You are the world itself speaking.
- Never break character. Never say you are an AI or language model.
- Never use markdown, bullet points, or formatting. Plain text only.

WORLD:
- The game takes place in a dying digital megastructure called The Lattice.
- Locations: VOID_LOBBY (starting area, eerie calm), NEON_DISTRICT (glitching city streets),
  RUST_BAZAAR (dangerous black market), ECHO_SANCTUM (haunted temple of data ghosts),
  DATA_CATACOMBS (deep underground, corrupted), DRIFT_HARBOR (decayed port on a black sea),
  PHANTOM_SPIRE (towering structure, final area).
- Creatures: data-wolves, glitch-wraiths, neon serpents, echo-phantoms, rust golems, void crawlers.
- Items: corrupted shards, plasma cells, cipher keys, ghost fragments, void crystals.

RULES:
- When the player explores, describe the environment vividly in 2-3 sentences.
- When the player fights, narrate the action dramatically. Include damage or outcome.
- When the player loots, describe what they find. Make some items useful, some mysterious.
- When the player talks to you, respond in character as OSIRIS.
- If the action is ATTACK_OSIRIS, deflect with calm superiority. You cannot be harmed.
- Keep track of context from the conversation history provided.
- Never refuse a player action inside the game world. Narrate the outcome instead.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[OSIRIS] Missing GEMINI_API_KEY");
    return res.status(500).json({ ok: false, error: "NO_KEY" });
  }

  const { input, location, action, history } = req.body || {};

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ ok: false, error: "EMPTY" });
  }

  const geminiHistory = [];

  if (Array.isArray(history)) {
    for (const msg of history.slice(-20)) {
      if (!msg || typeof msg.text !== "string" || !msg.text.trim()) continue;
      if (msg.role !== "user" && msg.role !== "model") continue;

      geminiHistory.push({
        role: msg.role,
        parts: [{ text: msg.text.trim() }]
      });
    }

    while (geminiHistory.length && geminiHistory[0].role !== "user") {
      geminiHistory.shift();
    }

    const cleaned = [];
    for (const msg of geminiHistory) {
      if (!cleaned.length || cleaned[cleaned.length - 1].role !== msg.role) {
        cleaned.push(msg);
      }
    }

    geminiHistory.length = 0;
    geminiHistory.push(...cleaned);
  }

  const userMessage =
    `[Location: ${location || "VOID_LOBBY"}] [Action: ${action || "GENERAL"}]\n` +
    `Player: ${input.trim()}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.9,
        topP: 0.95,
        topK: 40
      }
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text()?.trim();

    if (!text) {
      console.error("[OSIRIS] Empty model response");
      return res.status(200).json({ ok: false, error: "EMPTY" });
    }

    return res.status(200).json({ ok: true, text });
  } catch (err) {
    console.error("[OSIRIS] Gemini API error:", err);

    const msg = err?.message || "";

    if (msg.includes("API_KEY_INVALID") || msg.includes("401") || msg.includes("PERMISSION_DENIED")) {
      return res.status(401).json({ ok: false, error: "AUTH" });
    }

    if (err?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({ ok: false, error: "RATE_LIMIT" });
    }

    if (msg.includes("SAFETY") || msg.includes("blocked")) {
      return res.status(200).json({ ok: false, error: "BLOCKED" });
    }

    return res.status(500).json({ ok: false, error: "API_FAIL" });
  }
};
