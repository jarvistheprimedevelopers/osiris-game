// ════════════════════════════════════════════════════════════════
//  story/intro.js — Personalized Chapter 1 Intros
//  Pure data. No logic, no dependencies.
//
//  Usage:
//    var text = StoryIntro.get('plumber');
//    // Returns a string tailored to that life role.
//    // Falls back to a default if the role isn't recognized.
//
//  To add a new profession, just add a new key to the INTROS object.
// ════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Intro texts keyed by lifeRole ─────────────────────────
  // Each one connects the player's old life to waking up in the
  // Void Lobby. 3-4 sentences. Personal, cinematic, immersive.
  var INTROS = {

    _default: "You open your eyes. The world you knew is gone — replaced by black glass and blue light. This is the Void Lobby, the entry point of a dying digital world called The Lattice. You don't remember how you got here. But something tells you there's no going back.",

    student: "The last thing you remember is a lecture hall. Fluorescent lights, the drone of a professor, the weight of a textbook in your lap. Then static. Now this — a vast chamber of black glass and impossible geometry. The Void Lobby. Your textbooks won't help you here.",

    plumber: "You were underground. Pipes, wrenches, the smell of damp concrete. Then the walls dissolved into data streams and the floor became black glass. The Void Lobby stretches before you — veins of light running along its surface like a machine's circulatory system. At least you understand systems.",

    thief: "You were running. That's what you remember — the burn in your lungs, the weight of something stolen in your pocket. Then the alley you were in folded in on itself, and now you're here. The Void Lobby. No exits that you can see. And something is watching.",

    mechanic: "Grease on your hands. The clang of a wrench on an engine block. That was a minute ago — or a lifetime. Now you stand in a chamber of black glass and humming light. The Void Lobby. The machinery here is like nothing you've ever seen. But it is machinery. You can feel it.",

    nurse: "You were mid-shift. Charts, vitals, the beep of monitors. Then the hospital dissolved like a dream and left you here — standing on black glass in perfect silence. The Void Lobby. Your patient training tells you to stay calm. Your instincts tell you something is very wrong.",

    soldier: "Boots on ground. That instinct never leaves you. But this ground is wrong — black glass that hums underfoot, blue light in thin veins across the floor. The Void Lobby. No intel. No squad. No extraction point. Just you and the dark.",

    drifter: "You've woken up in strange places before. But not like this. The Void Lobby is a cathedral of black glass and silence — vast, cold, and impossibly still. You've been nowhere all your life. This feels like the final nowhere.",

    hunter: "The forest was thick, the trail was fresh. Then the trees turned to columns of dark crystal and the soil became glass. The Void Lobby. Your senses are sharp — you can feel something watching from the shadows. Predator instinct says: you're not the only hunter here.",

    cop: "You were on patrol. Radio chatter, coffee going cold, the hum of the cruiser. Then reality peeled away like wallpaper and dropped you here. The Void Lobby. Your training kicks in — scan the room, check the exits. There are no exits. Just corridors that shouldn't exist.",

    chef: "The kitchen was hot, the orders were piling up. Then the stove flame turned blue, the walls dissolved, and heat became cold silence. The Void Lobby. The surfaces here are smooth and sterile. Nothing to work with. Nothing to cook. Just survival.",

    teacher: "You were writing on the whiteboard. Mid-sentence. Then the classroom folded like paper and you fell through. The Void Lobby. The architecture here has a logic to it — like a lesson plan designed by something inhuman. You've always been good at reading between the lines.",

    artist: "You were painting. The colors bled off the canvas, through the easel, into the walls — and the walls became this. The Void Lobby. A gallery of nothing, lit in blue and silence. You've always seen what others couldn't. Maybe that's why you're here.",

    driver: "Highway. Headlights. The white line stretching forever. Then the road dissolved and there was no more forward — just down. You fell into the Void Lobby. The engine sound still rings in your ears, but there's nothing here with wheels. Just glass and light and an open corridor ahead.",

    programmer: "You were deep in code. Compiling, debugging, lost in logic. Then the screen swallowed you — or you swallowed it. The Void Lobby looks like a rendered environment, but the resolution is too high, the physics too real. This isn't a simulation. Or if it is, you're inside it now.",

    mercenary: "You were between jobs. Cleaning a weapon, waiting for a call that never came. Then the safe house walls turned to glass and the floor dropped. The Void Lobby. You've been in hostile territory before. This feels worse. This feels designed."
  };

  // ─── Getter function ───────────────────────────────────────
  // Accepts a lifeRole string, returns the matching intro.
  // Tries exact match first, then checks if the role CONTAINS a key,
  // then falls back to _default.
  function get(lifeRole) {
    if (!lifeRole) return INTROS._default;

    var key = lifeRole.toLowerCase().trim();

    // Exact match
    if (INTROS[key]) return INTROS[key];

    // Partial match — e.g. "taxi driver" matches "driver",
    // "army soldier" matches "soldier"
    var keys = Object.keys(INTROS);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== '_default' && key.indexOf(keys[i]) !== -1) {
        return INTROS[keys[i]];
      }
    }

    // Reverse partial — e.g. "nurse practitioner" where "nurse" is in the role
    for (var j = 0; j < keys.length; j++) {
      if (keys[j] !== '_default' && keys[j].length > 2 && key.indexOf(keys[j]) !== -1) {
        return INTROS[keys[j]];
      }
    }

    // Nothing matched — use the default but personalize it slightly
    return "You were a " + lifeRole + " once. That life ended the moment the static found you. Now you stand in the Void Lobby — a vast chamber of black glass and blue light at the edge of a dying world called The Lattice. Whatever you were before, it won't be enough for what comes next.";
  }

  // ─── Expose globally ──────────────────────────────────────
  window.StoryIntro = {
    get: get
  };

})();
