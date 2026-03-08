// api/osiris.js — Vercel Serverless Function
// This file runs on the server. The API key stays here, never sent to the browser.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── OSIRIS system prompt ───────────────────────────────────────
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

// ─── Handler ────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  // Check that the API key exists in environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[OSIRIS] GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ ok: false, error: "NO_KEY" });
  }

  // Read the request body from the frontend
  const { input, location, action, history } = req.body || {};

  if (!input || typeof input !== "string") {
    return res.status(400).json({ ok: false, error: "EMPTY" });
  }

  // Build the conversation messages for Gemini
  // We convert our history array into the format Gemini expects
  const geminiHistory = [];

  if (Array.isArray(history)) {
    for (const msg of history.slice(-28)) {
      if (msg.role === "user") {
        geminiHistory.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.role === "model") {
        geminiHistory.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }
  }

  // Build the current user message with context
  const userMessage =
    `[Location: ${location || "VOID_LOBBY"}] [Action: ${action || "GENERAL"}]\n` +
    `Player says: ${input}`;

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Start a chat with the existing history
const chat = model.startChat({
  history: geminiHistory,
  generationConfig: {
    maxOutputTokens: 250,
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
  }
});

    // Send the player's message and get a response
    const result = await chat.sendMessage(userMessage);
    const text = result.response.text().trim();

    if (!text) {
      return res.status(200).json({ ok: false, error: "EMPTY" });
    }

    return res.status(200).json({ ok: true, text: text });
  } catch (err) {
    console.error("[OSIRIS] Gemini API error:", err.message || err);

    // Return specific error codes the frontend already understands
    if (err.message && err.message.includes("API_KEY_INVALID")) {
      return res.status(401).json({ ok: false, error: "AUTH" });
    }
    if (err.status === 429 || (err.message && err.message.includes("429"))) {
      return res.status(429).json({ ok: false, error: "RATE_LIMIT" });
    }
    if (err.message && err.message.includes("SAFETY")) {
      return res.status(200).json({ ok: false, error: "BLOCKED" });
    }

    return res.status(500).json({ ok: false, error: "API_FAIL" });
  }
};
