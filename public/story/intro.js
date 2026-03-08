(function() {
  var INTROS = {
    _default: "You open your eyes. The world you knew is gone, replaced by black glass and blue light. This is the Void Lobby, the entry point of a dying digital world called The Lattice. You do not remember how you got here. But something tells you there is no going back.",
    student: "The last thing you remember is a lecture hall. Fluorescent lights, the drone of a professor, the weight of a textbook in your lap. Then static. Now this, a vast chamber of black glass and impossible geometry. The Void Lobby. Your textbooks will not help you here.",
    plumber: "You were underground. Pipes, wrenches, the smell of damp concrete. Then the walls dissolved into data streams and the floor became black glass. The Void Lobby stretches before you, veins of light running along its surface like a machine circulatory system. At least you understand systems.",
    thief: "You were running. That is what you remember, the burn in your lungs, the weight of something stolen in your pocket. Then the alley you were in folded in on itself, and now you are here. The Void Lobby. No exits that you can see. And something is watching.",
    mechanic: "Grease on your hands. The clang of a wrench on an engine block. That was a minute ago, or a lifetime. Now you stand in a chamber of black glass and humming light. The Void Lobby. The machinery here is like nothing you have ever seen. But it is machinery. You can feel it.",
    nurse: "You were mid-shift. Charts, vitals, the beep of monitors. Then the hospital dissolved like a dream and left you here, standing on black glass in perfect silence. The Void Lobby. Your patient training tells you to stay calm. Your instincts tell you something is very wrong.",
    soldier: "Boots on ground. That instinct never leaves you. But this ground is wrong, black glass that hums underfoot, blue light in thin veins across the floor. The Void Lobby. No intel. No squad. No extraction point. Just you and the dark.",
    drifter: "You have woken up in strange places before. But not like this. The Void Lobby is a cathedral of black glass and silence, vast, cold, and impossibly still. You have been nowhere all your life. This feels like the final nowhere.",
    hunter: "The forest was thick, the trail was fresh. Then the trees turned to columns of dark crystal and the soil became glass. The Void Lobby. Your senses are sharp, you can feel something watching from the shadows. Predator instinct says you are not the only hunter here.",
    cop: "You were on patrol. Radio chatter, coffee going cold, the hum of the cruiser. Then reality peeled away like wallpaper and dropped you here. The Void Lobby. Your training kicks in, scan the room, check the exits. There are no exits. Just corridors that should not exist.",
    chef: "The kitchen was hot, the orders were piling up. Then the stove flame turned blue, the walls dissolved, and heat became cold silence. The Void Lobby. The surfaces here are smooth and sterile. Nothing to work with. Nothing to cook. Just survival.",
    teacher: "You were writing on the whiteboard. Mid-sentence. Then the classroom folded like paper and you fell through. The Void Lobby. The architecture here has a logic to it, like a lesson plan designed by something inhuman. You have always been good at reading between the lines.",
    artist: "You were painting. The colors bled off the canvas, through the easel, into the walls, and the walls became this. The Void Lobby. A gallery of nothing, lit in blue and silence. You have always seen what others could not. Maybe that is why you are here.",
    driver: "Highway. Headlights. The white line stretching forever. Then the road dissolved and there was no more forward, just down. You fell into the Void Lobby. The engine sound still rings in your ears, but there is nothing here with wheels. Just glass and light and an open corridor ahead.",
    programmer: "You were deep in code. Compiling, debugging, lost in logic. Then the screen swallowed you, or you swallowed it. The Void Lobby looks like a rendered environment, but the resolution is too high, the physics too real. This is not a simulation. Or if it is, you are inside it now.",
    mercenary: "You were between jobs. Cleaning a weapon, waiting for a call that never came. Then the safe house walls turned to glass and the floor dropped. The Void Lobby. You have been in hostile territory before. This feels worse. This feels designed."
  };

  function get(lifeRole) {
    if (!lifeRole) return INTROS._default;
    var key = lifeRole.toLowerCase().trim();
    if (INTROS[key]) return INTROS[key];
    var keys = Object.keys(INTROS);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== "_default" && key.indexOf(keys[i]) !== -1) {
        return INTROS[keys[i]];
      }
    }
    return "You were a " + lifeRole + " once. That life ended the moment the static found you. Now you stand in the Void Lobby, a vast chamber of black glass and blue light at the edge of a dying world called The Lattice. Whatever you were before, it will not be enough for what comes next.";
  }

  window.StoryIntro = { get: get };
})();
