// ════════════════════════════════════════════════════════════════
//  save.js — localStorage Save / Load System
//  No dependencies. Loaded first.
//
//  Usage from other files:
//    Save.save(gameState)    — writes gameState to localStorage
//    Save.load()             — returns gameState object or null
//    Save.exists()           — returns true/false
//    Save.erase()            — deletes the save
//    Save.freshState()       — returns a brand-new default gameState
// ════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // The key used in localStorage. Change this if you ever need
  // to reset all saves (e.g. after a big update).
  var SAVE_KEY = 'osiris_save_v1';

  // ─── Default game state (used for New Player) ──────────────
  function freshState() {
    return {
      character: {
        sex: '',
        age: '',
        lifeRole: '',
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        gold: 0
      },
      world: {
        location: 'VOID_LOBBY',
        chapter: 1
      },
      inventory: [],
      quests: [],
      flags: {},
      summary: '',
      recentLog: []
    };
  }

  // ─── Save ──────────────────────────────────────────────────
  function save(stateObj) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateObj));
      return true;
    } catch (e) {
      console.error('[SAVE] Write failed:', e);
      return false;
    }
  }

  // ─── Load ──────────────────────────────────────────────────
  // Returns the parsed gameState, or null if nothing is saved.
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // Basic validation: make sure it has the expected shape
      if (parsed && parsed.character && parsed.world) {
        return parsed;
      }
      return null;
    } catch (e) {
      console.error('[SAVE] Read failed:', e);
      return null;
    }
  }

  // ─── Exists ────────────────────────────────────────────────
  function exists() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  // ─── Erase ─────────────────────────────────────────────────
  function erase() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('[SAVE] Erase failed:', e);
    }
  }

  // ─── Expose globally ──────────────────────────────────────
  window.Save = {
    save: save,
    load: load,
    exists: exists,
    erase: erase,
    freshState: freshState
  };

})();
