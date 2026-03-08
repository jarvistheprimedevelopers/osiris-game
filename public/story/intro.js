(function() {
  var INTROS = {
    _default: "You open your eyes. The room is wrong. The light bends at angles it should not. You feel something watching from behind the walls, from behind reality itself. You are a Watcher now, though you do not yet know what that means. The Veil is thinning. And you are standing at its edge.",
    student: "You were studying late. The library was empty, the fluorescent lights humming. Then the air changed. The words on the page rearranged themselves into a language you almost understood. When you looked up, the library was gone. You are somewhere else now. Somewhere between worlds.",
    plumber: "You were underground, fixing pipes in a building older than memory. The walls were sweating something that was not water. You heard whispering from inside the concrete. When you turned your wrench, the pipe opened into darkness that had no bottom. Now you stand in that darkness.",
    thief: "You were mid-job. Silent hands, quiet feet, a lock half-picked. Then the door opened on its own, into a room that should not exist. Cold air. Pale light. Something on the other side of the room was breathing. You stepped through anyway. That was your first mistake. Or your first gift.",
    mechanic: "The engine was running wrong. Not mechanically, something deeper. The pistons were moving in a rhythm that matched a heartbeat that was not yours. When you reached inside, your hand passed through the metal like water. You pulled it back holding something cold and alive. Now the veil between worlds is thinner around you.",
    nurse: "You were on night shift. The monitors were steady, the hallways quiet. Then a patient who had been dead for three hours opened their eyes and spoke a name. Your name. The lights flickered. When they steadied, the hospital felt different. Thinner. Like reality had lost a layer of paint.",
    soldier: "You know threat assessment. You know when something is wrong before your mind catches up. The air shifted during patrol, a pressure change with no source. Your radio played voices from a frequency that does not exist. When the static cleared, you were somewhere between the world you knew and the world that was always hiding beneath it.",
    drifter: "You have slept in strange places. Abandoned buildings, overpasses, the backs of trucks. But this place found you. The alley you ducked into folded in on itself. The graffiti on the wall moved. A door appeared where there was only brick. You walked through because you had nowhere else to go. Now you are somewhere that has always existed, just out of sight.",
    hunter: "The trail went cold in a way you have never experienced. Not lost, erased. The forest changed around you, trees bending toward something you could not see. Animal tracks became symbols in the mud. Your instincts said run. Your curiosity said stay. You stayed. The forest opened its hidden mouth and swallowed you into a world layered beneath your own.",
    cop: "The case made no sense. Witnesses described things that contradicted physics. Evidence that should not exist. A crime scene where the walls were colder on the inside than the outside, by forty degrees. When you touched the wall, you saw through it, into a place where shadows had weight and the dead still walked. You are a Watcher now. The case was never about crime.",
    chef: "The kitchen was hot. The orders were piling up. Then the flame on the stove turned white, then black, then a color you have never seen. The smoke formed shapes. Faces. When you reached through the flame to turn it off, your hand came out the other side of something. A membrane between worlds. You tore it. Now you stand in the gap.",
    teacher: "You were grading papers when the ink began to move. Not smudging, rearranging. Forming symbols that predated the alphabet. The classroom lights dimmed. Through the window, the sky was the wrong color. Your students were gone. The desks were empty but warm. Something had taken their place in the world, and you could see it. You have always been able to see it.",
    artist: "You were painting something from memory, a dream you could not shake. The colors began to glow. Not reflected light, emitted light. The canvas became a window. Through it, you saw a world layered beneath your own, full of spirits and shadow and a thin membrane holding everything apart. You touched the canvas. Your hand went through. You are on the other side now.",
    programmer: "The code compiled wrong. Not errors, something else. The output was a language, ancient and structured, describing the architecture of reality itself. Your screen flickered. Behind the pixels, you saw depth, layers, a world behind the screen that was also behind every wall and floor and sky. You have breached the Veil from the digital side. Welcome to the truth.",
    mercenary: "You were between contracts. Cleaning a weapon, waiting for a call. The call came, but not on any phone. A voice in the wall. A whisper in the barrel of the gun. It said your name and then it said a word that rearranged everything you understood about the world. The room split open. Not physically. Spiritually. You fell through the crack into a war that has been raging since before humanity."
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
    return "You were a " + lifeRole + " once. That life ended the moment the Veil tore open in front of you. Now you stand between worlds, a Watcher, though you do not yet understand what that means. The spirits are restless. The Abyss is pressing. And something ancient has noticed you.";
  }

  window.StoryIntro = { get: get };
})();
