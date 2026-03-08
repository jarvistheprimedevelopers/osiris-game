(function() {
  var SAVE_KEY = "osiris_save_v1";

  function freshState() {
    return {
      character: {
        sex: "",
        age: "",
        lifeRole: "",
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        gold: 0
      },
      world: {
        location: "VOID_LOBBY",
        chapter: 1
      },
      inventory: [],
      quests: [],
      flags: {},
      summary: "",
      recentLog: []
    };
  }

  function save(stateObj) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateObj));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.character && parsed.world) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  function exists() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  function erase() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
  }

  window.Save = {
    save: save,
    load: load,
    exists: exists,
    erase: erase,
    freshState: freshState
  };
})();
