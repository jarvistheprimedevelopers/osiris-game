(function() {

  var termEl = document.getElementById("terminal");
  var inpEl = document.getElementById("inp");
  var ghostEl = document.getElementById("ghost");
  var locEl = document.getElementById("loc");

  var currentMood = "calm";

  // ════════════════════════════════════════════════════════════
  //  VISUAL EFFECTS (VFX) SYSTEM
  //  These functions create real on-screen motion and particles.
  //  They use the #ghost element and temporary DOM elements.
  // ════════════════════════════════════════════════════════════

  // Get the ghost orb position on screen (needed for particles)
  function getGhostPos() {
    var rect = ghostEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // ── SMOKE: spawns floating particles from the orb ──
  function vfxSmoke() {
    var pos = getGhostPos();
    var count = 5 + Math.floor(Math.random() * 4);
    for (var i = 0; i < count; i++) {
      (function(index) {
        setTimeout(function() {
          var p = document.createElement("div");
          p.className = "smoke-particle";
          p.style.left = (pos.x - 3 + (Math.random() * 20 - 10)) + "px";
          p.style.top = (pos.y - 3) + "px";
          p.style.animationDuration = (2 + Math.random() * 1.5) + "s";
          document.body.appendChild(p);
          setTimeout(function() { p.remove(); }, 4000);
        }, index * 150);
      })(i);
    }
  }

  // ── EMBER: a single glowing dot (cigar tip) ──
  function vfxEmber() {
    var pos = getGhostPos();
    var e = document.createElement("div");
    e.className = "ember-dot";
    e.style.left = (pos.x - 4 + (Math.random() * 10 - 5)) + "px";
    e.style.top = (pos.y - 20) + "px";
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 1500);
  }

  // ── SWORD FLASH: a bright slash line ──
  function vfxSwordFlash() {
    var pos = getGhostPos();
    var f = document.createElement("div");
    f.className = "sword-flash";
    f.style.left = (pos.x - 60) + "px";
    f.style.top = (pos.y) + "px";
    document.body.appendChild(f);
    setTimeout(function() { f.remove(); }, 400);
  }

  // ── GLITCH: orb flickers and distorts ──
  function vfxGlitch() {
    ghostEl.classList.add("vfx-glitch");
    setTimeout(function() {
      ghostEl.classList.remove("vfx-glitch");
    }, 600);
  }

  // ── MOOD GLOW: changes orb color to match mood ──
  function vfxMoodGlow(mood, durationMs) {
    // Remove any previous mood glow
    ghostEl.classList.remove("vfx-danger", "vfx-amused", "vfx-impressed", "vfx-calm");

    var cls = "vfx-" + mood;
    ghostEl.classList.add(cls);

    if (durationMs) {
      setTimeout(function() {
        ghostEl.classList.remove(cls);
      }, durationMs);
    }
  }

  // ── APPROACH: orb moves closer to the player ──
  function vfxApproach(durationMs) {
    ghostEl.classList.add("vfx-approach");
    var dur = durationMs || 3000;
    setTimeout(function() {
      ghostEl.classList.remove("vfx-approach");
    }, dur);
  }

  // ── SCREEN SHAKE: the whole page trembles ──
  function vfxScreenShake() {
    document.body.classList.add("vfx-shake");
    setTimeout(function() {
      document.body.classList.remove("vfx-shake");
    }, 450);
  }

  // ── AMBIENT: subtle idle breathing animation ──
  var ambientActive = false;
  function vfxAmbientStart() {
    if (!ambientActive) {
      ambientActive = true;
      ghostEl.classList.add("vfx-ambient");
    }
  }
  function vfxAmbientStop() {
    ambientActive = false;
    ghostEl.classList.remove("vfx-ambient");
  }

  // ── COMBINED VISUAL REACTIONS ──
  // These combine multiple VFX for specific dramatic moments.

  var VISUAL_REACTIONS = {
    cigar: function() {
      vfxEmber();
      vfxSmoke();
      vfxMoodGlow("calm", 3000);
    },
    danger: function() {
      vfxMoodGlow("danger", 4000);
      vfxSwordFlash();
      setTimeout(vfxScreenShake, 200);
    },
    amused: function() {
      vfxMoodGlow("amused", 3000);
    },
    impressed: function() {
      vfxMoodGlow("impressed", 3000);
      vfxApproach(2500);
    },
    glitch: function() {
      vfxGlitch();
      vfxScreenShake();
    },
    approach: function() {
      vfxApproach(3000);
    },
    smoke: function() {
      vfxSmoke();
    },
    sword: function() {
      vfxSwordFlash();
      vfxMoodGlow("danger", 2500);
    }
  };

  // ── Map stage action text to visual effects ──
  // When a stage action mentions certain keywords, trigger matching VFX.
  function triggerVisualForAction(actionText) {
    var lower = actionText.toLowerCase();
    if (/cigar|lights|flame|ember|ash/.test(lower)) {
      VISUAL_REACTIONS.cigar();
    } else if (/sword|blade|steel|sheath|slash/.test(lower)) {
      VISUAL_REACTIONS.sword();
    } else if (/glitch|flicker|static|screams/.test(lower)) {
      VISUAL_REACTIONS.glitch();
    } else if (/closer|step.*forward|approach|contracts/.test(lower)) {
      VISUAL_REACTIONS.approach();
    } else if (/smoke|exhale/.test(lower)) {
      VISUAL_REACTIONS.smoke();
    } else if (/clap|laugh|chuckle|entertained|amused|coin|pleased/.test(lower)) {
      VISUAL_REACTIONS.amused();
    } else if (/nod|measuring|respects|brighter|attention|sheathes/.test(lower)) {
      VISUAL_REACTIONS.impressed();
    } else if (/temperature|red|burning|ready|waiting/.test(lower)) {
      VISUAL_REACTIONS.danger();
    }
  }

  // ════════════════════════════════════════════════════════════
  //  STAGE ACTIONS — cinematic text moments in brackets
  // ════════════════════════════════════════════════════════════

  var STAGE_ACTIONS = {
    calm: [
      "[A candle flickers somewhere in the dark. OSIRIS watches from the shadow.]",
      "[Cold air moves through the terminal. Something unseen passes by.]",
      "[OSIRIS stands motionless. A silhouette against pale violet light.]",
      "[The faint sound of a bell, very far away. Then silence.]",
      "[OSIRIS exhales. The breath is visible, though the room is not cold.]",
      "[A low hum fills the space. The Veil is thin here.]",
      "[A ward symbol glows faintly on the floor, then fades.]",
      "[OSIRIS tilts his head, as if hearing something from the other side.]"
    ],
    amused: [
      "[A quiet, knowing laugh echoes from the dark.]",
      "[OSIRIS leans against the threshold between worlds. Arms crossed.]",
      "[The candle flame flares. OSIRIS is entertained.]",
      "[OSIRIS taps a sigil in the air. It rings like a bell.]",
      "[A low chuckle. Spirits in the walls stir briefly.]",
      "[OSIRIS flicks a coin into the void. It never lands.]",
      "[The ward pulses warm. OSIRIS is pleased.]",
      "[OSIRIS traces a symbol that dissolves into smoke.]"
    ],
    dangerous: [
      "[The temperature drops sharply. OSIRIS steps through the static.]",
      "[Eyes glow violet in the dark. Two points of ancient light.]",
      "[OSIRIS grips a talisman. The Veil trembles.]",
      "[Shadows stretch toward you. OSIRIS does not stop them.]",
      "[The terminal flickers. Something presses against the Veil.]",
      "[A ward cracks. OSIRIS does not flinch.]",
      "[The air thickens. OSIRIS is closer than before.]",
      "[A spirit screams from behind the walls. Then silence.]"
    ],
    impressed: [
      "[OSIRIS pauses. For the first time, he looks directly at you.]",
      "[The candle steadies. OSIRIS nods once.]",
      "[A rare silence. He is measuring you.]",
      "[The ward glows brighter. OSIRIS respects what he sees.]",
      "[OSIRIS releases the talisman. A sign of trust.]",
      "[The Veil hums a lower frequency. Something has shifted.]",
      "[Spirits in the walls grow quiet. They sense it too.]",
      "[OSIRIS uncrosses his arms. You have his full attention.]"
    ]
  };

  var IDLE_LINES = {
    calm: [
      "The Veil remembers every soul that has passed through it.",
      "Silence here is not empty. It is full of things that have not yet crossed over.",
      "I have watched a thousand Watchers walk this path. Most did not return.",
      "The spirits do not judge. They simply observe. Like me."
    ],
    amused: [
      "You remind me of someone. They did not survive either. But they were interesting.",
      "Brave. Reckless. Sometimes the spirits cannot tell the difference.",
      "I have not been this amused since the last one tried to bargain with a demon.",
      "Go on. Even the dead appreciate a good story."
    ],
    dangerous: [
      "Careful. The Abyss has teeth, and you are walking toward its mouth.",
      "That was either courage or ignorance. The spirits will decide which.",
      "Something is watching you from the other side. Something besides me.",
      "The Veil is thin here. One wrong step and you fall through."
    ],
    impressed: [
      "Not bad. I did not expect that from someone still new to the sight.",
      "You may actually survive this. That would be unusual.",
      "The Veil bends for no one. But it just shifted around you. Interesting.",
      "I am adjusting my expectations. Upward, for once."
    ]
  };

  var COMMAND_REACTIONS = {
    attack: [
      "Violence against the dead. Bold.",
      "Steel and will. The only weapons that matter on this side.",
      "You strike like someone who has fought things they cannot see."
    ],
    explore: [
      "Curiosity. The first sign of a true Watcher.",
      "Most look at the world and see only its surface. You look deeper.",
      "The further you go, the thinner the Veil becomes. Keep your eyes open."
    ],
    search: [
      "Looking for answers? The dead hide them in strange places.",
      "Every object here carries memory. Some memories bite.",
      "The Veil leaves traces. Learn to read them."
    ],
    rest: [
      "Rest near the boundary is a gamble. Dreams leak through from the other side.",
      "Sleep. The spirits will watch over you. Most of them.",
      "Even Watchers need to close their eyes. Just do not close them for long."
    ],
    talk: [
      "Words carry weight near the Veil. Choose them carefully.",
      "Speaking to the dead? They speak back. When they choose to.",
      "I am listening. I am always listening. So are they."
    ]
  };

  var REACTION_CHANCE = 0.3;
  var STAGE_ACTION_CHANCE = 0.25;

  // ════════════════════════════════════════════════════════════
  //  UTILITY
  // ════════════════════════════════════════════════════════════

  function pick(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function wait(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  // ════════════════════════════════════════════════════════════
  //  TERMINAL OUTPUT
  // ════════════════════════════════════════════════════════════

  function addLine(html, cls) {
    var div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.innerHTML = html;
    termEl.appendChild(div);
    termEl.scrollTop = termEl.scrollHeight;
    return div;
  }

  function typeWrite(container, text) {
    return new Promise(function(resolve) {
      container.innerHTML = "<span class=\"tag\">[OSIRIS]:</span> ";
      var span = document.createElement("span");
      container.appendChild(span);
      var cursor = document.createElement("span");
      cursor.className = "typcur";
      container.appendChild(cursor);
      termEl.scrollTop = termEl.scrollHeight;
      var i = 0;
      function next() {
        if (i < text.length) {
          span.textContent += text.charAt(i);
          i++;
          termEl.scrollTop = termEl.scrollHeight;
          setTimeout(next, 25 + Math.random() * 18);
        } else {
          cursor.remove();
          resolve();
        }
      }
      next();
    });
  }

  // ════════════════════════════════════════════════════════════
  //  SPEAK — OSIRIS talks + optional visual stage action
  // ════════════════════════════════════════════════════════════

  async function speak(text) {
    // Random chance of a visual reaction before speaking (no text)
    if (Math.random() < STAGE_ACTION_CHANCE) {
      var action = pick(STAGE_ACTIONS[currentMood] || STAGE_ACTIONS.calm);
      // Only trigger the visual effect, do NOT print the bracket text
      triggerVisualForAction(action);
      await wait(600);
    }
    // Apply mood glow while speaking
    vfxMoodGlow(currentMood, 3000);
    var div = addLine("");
    return typeWrite(div, text);
  }

  // ════════════════════════════════════════════════════════════
  //  REACT — cinematic moment with visuals, no speech
  // ════════════════════════════════════════════════════════════

  function react() {
    var action = pick(STAGE_ACTIONS[currentMood] || STAGE_ACTIONS.calm);
    // Only trigger visual effect, no terminal text
    triggerVisualForAction(action);
  }

  // ════════════════════════════════════════════════════════════
  //  COMMAND REACTION — OSIRIS comments + visuals
  // ════════════════════════════════════════════════════════════

  async function commandReaction(actionType) {
    if (Math.random() > REACTION_CHANCE) return false;

    var pool = COMMAND_REACTIONS[actionType];
    if (!pool || pool.length === 0) {
      pool = IDLE_LINES[currentMood] || IDLE_LINES.calm;
    }

    var line = pick(pool);
    await wait(400);

    // Sometimes a stage action + visuals accompany the reaction
    if (Math.random() < 0.4) {
      react();
      await wait(500);
    }

    // Apply mood-appropriate visuals
    if (currentMood === "dangerous") {
      vfxMoodGlow("danger", 3000);
    } else if (currentMood === "amused") {
      vfxMoodGlow("amused", 2500);
    } else if (currentMood === "impressed") {
      vfxMoodGlow("impressed", 2500);
      if (Math.random() < 0.3) vfxApproach(2000);
    }

    await speak(line);
    return true;
  }

  // ════════════════════════════════════════════════════════════
  //  MOOD
  // ════════════════════════════════════════════════════════════

  function setMood(mood) {
    if (STAGE_ACTIONS[mood]) {
      currentMood = mood;
      // Visual feedback when mood changes
      vfxMoodGlow(mood, 2000);
    }
  }

  function getMood() {
    return currentMood;
  }

  // ════════════════════════════════════════════════════════════
  //  GHOST ORB
  // ════════════════════════════════════════════════════════════

  function setOrb(state, ms) {
    ghostEl.className = state || "";
    if (ms) {
      setTimeout(function() { ghostEl.className = ""; }, ms);
    }
  }

  function strikeHost() {
    ghostEl.style.top = "calc(100% - 200px)";
    setOrb("deflect");
    vfxScreenShake();
    setTimeout(function() {
      ghostEl.style.top = "14%";
      ghostEl.className = "";
    }, 1200);
  }

  // ════════════════════════════════════════════════════════════
  //  LOCATION BAR
  // ════════════════════════════════════════════════════════════

  function setLocation(name) {
    locEl.textContent = name;
  }

  // ════════════════════════════════════════════════════════════
  //  INPUT HELPERS
  // ════════════════════════════════════════════════════════════

  function waitForInput(placeholder) {
    return new Promise(function(resolve) {
      inpEl.placeholder = placeholder || "Type here...";
      inpEl.disabled = false;
      inpEl.value = "";
      inpEl.focus();
      function handler(e) {
        if (e.key === "Enter" && inpEl.value.trim()) {
          var val = inpEl.value.trim();
          inpEl.removeEventListener("keydown", handler);
          inpEl.disabled = true;
          inpEl.value = "";
          resolve(val);
        }
      }
      inpEl.addEventListener("keydown", handler);
    });
  }

  function waitForChoice(options) {
    return new Promise(function(resolve) {
      inpEl.disabled = true;
      var row = document.createElement("div");
      row.className = "line";
      var inner = document.createElement("div");
      inner.className = "choice-row";
      options.forEach(function(opt) {
        var btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = opt;
        btn.addEventListener("click", function() {
          inner.querySelectorAll(".choice-btn").forEach(function(b) {
            b.disabled = true;
            b.style.opacity = ".25";
            b.style.cursor = "default";
          });
          btn.style.opacity = "1";
          btn.style.borderColor = "#00f2ff";
          btn.style.color = "#00f2ff";
          resolve(opt);
        });
        inner.appendChild(btn);
      });
      row.appendChild(inner);
      termEl.appendChild(row);
      termEl.scrollTop = termEl.scrollHeight;
    });
  }

  // ════════════════════════════════════════════════════════════
  //  BOOT INTRO — cinematic entrance with visuals
  // ════════════════════════════════════════════════════════════

  async function bootIntro() {
    addLine("<b>[SYSTEM INITIALIZED]</b>", "sys");
    await wait(500);
    addLine("<span class=\"sys\">Establishing neural link...</span>");
    await wait(700);
    setOrb("thinking");

    // Visual: calm glow appears
    vfxMoodGlow("calm", 5000);
    await wait(800);

    // Visual: cigar ember and smoke
    vfxEmber();
    vfxSmoke();
    await wait(700);

    // Visual: OSIRIS approaches
    vfxApproach(3000);
    await wait(600);

    await speak("Welcome to the Void.");
    await wait(400);
    await speak("Most who arrive here do not last long. The question is not why you came. The question is how long you will survive.");
    await wait(300);
    setOrb("");

    vfxAmbientStart();
  }

  // ════════════════════════════════════════════════════════════
  //  CHARACTER CREATION
  // ════════════════════════════════════════════════════════════

  async function askSex() {
    addLine("<span class=\"sys\">--- IDENTITY SCAN: PHASE 1 ---</span>");
    await wait(300);
    await speak("What form do you wear? Male, or female?");
    var sex = await waitForChoice(["MALE", "FEMALE"]);
    addLine("> " + sex, "usr");
    await wait(300);

    // Visual only: smoke effect
    vfxSmoke();
    await wait(400);

    if (sex === "MALE") {
      await speak("A man, then. The Lattice does not care. But I will remember.");
    } else {
      await speak("A woman, then. The Lattice does not care. But I will remember.");
    }
    return sex.toLowerCase();
  }

  async function askAge() {
    addLine("<span class=\"sys\">--- IDENTITY SCAN: PHASE 2 ---</span>");
    await wait(300);
    await speak("How many years has the old world carved into you?");
    var age = await waitForInput("Enter your age...");
    addLine("> " + age, "usr");
    await wait(300);

    // Visual only: ember glow
    vfxEmber();
    await wait(400);
    await speak("Noted. Time is different here. You will feel it soon enough.");
    return age;
  }

  async function askRole() {
    addLine("<span class=\"sys\">--- IDENTITY SCAN: PHASE 3 ---</span>");
    await wait(300);
    await speak("Before the Void found you, what were you? What did you do in that old life?");
    await wait(200);
    addLine("<span class=\"hint\">(Type anything: student, soldier, thief, mechanic, drifter, plumber, nurse, hunter, cop, chef...)</span>");
    var role = await waitForInput("What were you?");
    addLine("> " + role, "usr");
    return role.toLowerCase().trim();
  }

  async function respondToRole(role) {
    await wait(300);
    setOrb("thinking");

    // Visual only: approach
    vfxApproach(3000);
    await wait(500);

    var response = "A " + role + ". Interesting. The Lattice will find a use for that.";

    if (/nurse|doctor|medic|paramedic/i.test(role)) {
      response = "A " + role + ". Someone who kept others alive. Let us see if you can do the same for yourself.";
    } else if (/soldier|marine|military|veteran|mercenary/i.test(role)) {
      response = "A " + role + ". Good. You know what it means to survive. That instinct will serve you.";
      setMood("impressed");
    } else if (/thief|criminal|con|hustler/i.test(role)) {
      response = "A " + role + ". Someone who takes what is not given. The Lattice has things worth stealing. If you can find them.";
      setMood("amused");
    } else if (/cop|police|detective|officer/i.test(role)) {
      response = "A " + role + ". Order in a place that has none. This should be interesting.";
    } else if (/student|teacher|professor/i.test(role)) {
      response = "A " + role + ". A mind that asks questions. The Lattice has answers. Most of them are painful.";
    } else if (/mechanic|engineer|plumber|electrician/i.test(role)) {
      response = "A " + role + ". Hands that understand systems. The Lattice is the largest system ever built. And it is breaking.";
    } else if (/chef|cook|bartender/i.test(role)) {
      response = "A " + role + ". Someone who creates from raw material. Here, the raw material is fear and silence.";
      setMood("amused");
    } else if (/hunter|tracker/i.test(role)) {
      response = "A " + role + ". Good eyes. Good instincts. You will need both. There are things here that hunt back.";
      setMood("dangerous");
    } else if (/artist|writer|musician|painter/i.test(role)) {
      response = "A " + role + ". Someone who sees what others do not. That gift will terrify you here.";
    } else if (/drifter|wanderer|nomad/i.test(role)) {
      response = "A " + role + ". No roots. No ties. The Lattice loves people like you. Easy to swallow.";
      setMood("dangerous");
    } else if (/programmer|developer|hacker|coder/i.test(role)) {
      response = "A " + role + ". You wrote code in the old world. Here, the code writes you.";
      setMood("impressed");
    }

    await speak(response);
    await wait(300);

    // Visual only: ember
    vfxEmber();
    await wait(400);
    await speak("The Lattice will shape your path from what you were. Let us begin.");
    setOrb("");
  }

  // ════════════════════════════════════════════════════════════
  //  CHAPTER START
  // ════════════════════════════════════════════════════════════

  async function beginChapter(chapterNum, introText) {
    addLine("<span class=\"sys\">--- CHAPTER " + chapterNum + ": THE LATTICE AWAITS ---</span>");
    await wait(600);

    // Visual only: glitch and shake
    vfxGlitch();
    vfxScreenShake();
    await wait(500);

    // Visual only: ember and smoke
    vfxEmber();
    vfxSmoke();
    await wait(500);

    await speak(introText);
  }

  // ════════════════════════════════════════════════════════════
  //  WELCOME BACK
  // ════════════════════════════════════════════════════════════

  async function welcomeBack(lifeRole, locationName) {
    addLine("<b>[SYSTEM INITIALIZED]</b>", "sys");
    await wait(400);
    addLine("<span class=\"sys\">Save data found. Restoring...</span>");
    await wait(600);
    setOrb("thinking");

    // Visual only: ember and smoke
    vfxEmber();
    vfxSmoke();
    await wait(500);

    await speak("You return. The Veil remembers you, " + lifeRole + ". You stand at " + locationName + ". The spirits stir.");
    await wait(400);
    setOrb("");

    addLine("<span style=\"color:#9070cc;font-size:.78rem\">CONNECTION TO THE VEIL: RESTORED</span>", "sys");
    vfxAmbientStart();
  }

  // ════════════════════════════════════════════════════════════
  //  DEFLECT ATTACK
  // ════════════════════════════════════════════════════════════

  async function deflectAttack() {
    strikeHost();
    addLine("<span class=\"action\">[SYSTEM]: Attack deflected. OSIRIS is immortal.</span>");

    // Full visual response: glow, flash, shake
    vfxMoodGlow("danger", 3000);
    vfxSwordFlash();

    var responses = [
      "I exist between worlds. Your weapon cannot reach what has no fixed position in reality.",
      "You strike at the boundary itself. The Veil absorbs it. I do not even feel it.",
      "That was bold. And pointless. I am not a spirit. I am not a demon. I am the watcher of watchers.",
      "I felt that the way the ocean feels rain. Which is to say, not at all.",
      "You cannot banish what was never summoned. I was here before the Veil. I will be here after."
    ];

    setMood("amused");
    await wait(300);
    // Visual only: mood glow (no bracket text)
    vfxMoodGlow("amused", 3000);
    await wait(400);
    await speak(pick(responses));
  }

  // ════════════════════════════════════════════════════════════
  //  ERROR / LOADING / UI
  // ════════════════════════════════════════════════════════════

  function showError(code) {
    var map = {
      NO_KEY: "Server has no API key configured.",
      AUTH: "API key is invalid.",
      NETWORK: "Cannot reach server.",
      RATE_LIMIT: "Too many requests. Wait.",
      BLOCKED: "Response filtered.",
      EMPTY: "OSIRIS returned silence.",
      API_FAIL: "Neural link unstable."
    };
    addLine("<span class=\"err\"><b>[SYSTEM ERROR]:</b> " + (map[code] || map.API_FAIL) + "</span>");
  }

  function showLoader() {
    var div = document.createElement("div");
    div.className = "line";
    div.id = "ldr";
    div.innerHTML = "<span class=\"tag\">[OSIRIS]:</span> <span style=\"color:#555\">System processing</span> <span class=\"dots\"><i></i><i></i><i></i></span>";
    termEl.appendChild(div);
    termEl.scrollTop = termEl.scrollHeight;
  }

  function hideLoader() {
    var el = document.getElementById("ldr");
    if (el) el.remove();
  }

  function showGameUI() {
    ghostEl.style.display = "flex";
    termEl.style.display = "flex";
    document.getElementById("bar").style.display = "flex";
    var btns = document.getElementById("side-buttons");
    if (btns) btns.style.display = "flex";
    var hud = document.getElementById("hud");
    if (hud) hud.style.display = "flex";
    var exitBtn = document.getElementById("exit-btn");
    if (exitBtn) exitBtn.style.display = "block";
  }

  // Hide the game UI (used when returning to menu)
  function hideGameUI() {
    ghostEl.style.display = "none";
    termEl.style.display = "none";
    document.getElementById("bar").style.display = "none";
    var btns = document.getElementById("side-buttons");
    if (btns) btns.style.display = "none";
    var hud = document.getElementById("hud");
    if (hud) hud.style.display = "none";
    var exitBtn = document.getElementById("exit-btn");
    if (exitBtn) exitBtn.style.display = "none";
  }

  function enableInput() {
    inpEl.disabled = false;
    inpEl.placeholder = "Type a command...";
    inpEl.focus();
  }

  function disableInput() {
    inpEl.disabled = true;
    inpEl.value = "";
  }

  // ════════════════════════════════════════════════════════════
  //  IDLE BEHAVIOR SYSTEM
  //  If the player does nothing for 60 seconds, OSIRIS gets
  //  bored and starts entertaining himself.
  //
  //  - idleTimer: counts down to idle mode
  //  - idleLoop: runs random actions every few seconds
  //  - resetIdleTimer(): called on every player input
  //  - stopIdleMode(): snaps OSIRIS back to normal
  // ════════════════════════════════════════════════════════════

  var IDLE_DELAY = 60000;          // 60 seconds before idle starts
  var IDLE_ACTION_MIN = 25000;     // minimum ms between idle actions
  var IDLE_ACTION_MAX = 35000;     // maximum ms between idle actions

  var idleTimerId = null;          // countdown to idle mode
  var idleLoopId = null;           // the scheduled next action
  var isIdle = false;
  var lastIdleActionIndex = -1;

  // ── Pool of idle actions ───────────────────────────────────
  // Each action has:
  //   text: what prints in the terminal
  //   vfx: a function that runs the visual effect
  //   css: optional CSS class to temporarily add to #ghost

  var IDLE_ACTIONS = [
    {
      text: "[OSIRIS lights a cigar. The ember glows in the dark.]",
      vfx: function() { vfxEmber(); vfxSmoke(); }
    },
    {
      text: "[OSIRIS flips a coin. It catches light that should not exist, then vanishes.]",
      vfx: function() { vfxMoodGlow("amused", 2000); },
      css: "vfx-idle-juggle"
    },
    {
      text: "[OSIRIS juggles a glowing cube of compressed data. It hums.]",
      css: "vfx-idle-juggle",
      vfx: function() { vfxMoodGlow("impressed", 2000); }
    },
    {
      text: "[OSIRIS taps the terminal glass. Twice. Testing if anyone is still there.]",
      css: "vfx-idle-tap",
      vfx: function() {}
    },
    {
      text: "[OSIRIS glitches briefly. For a moment there are two of him.]",
      vfx: function() { vfxGlitch(); }
    },
    {
      text: "[OSIRIS spins once in the void. Slowly. Deliberately. As if bored.]",
      css: "vfx-idle-spin",
      vfx: function() {}
    },
    {
      text: "[OSIRIS slow-claps. The sound echoes and fades into nothing.]",
      vfx: function() { vfxMoodGlow("amused", 1500); }
    },
    {
      text: "[OSIRIS floats upside down. The cigar does not fall. Physics does not apply here.]",
      css: "vfx-idle-flip",
      vfx: function() {}
    },
    {
      text: "[OSIRIS draws his sword, inspects the blade, then sheathes it.]",
      vfx: function() { vfxSwordFlash(); vfxMoodGlow("danger", 2000); }
    },
    {
      text: "[OSIRIS leans close to the terminal. Inspecting. Judging.]",
      vfx: function() { vfxApproach(2500); }
    },
    {
      text: "[OSIRIS kicks the screen lightly. The terminal flickers.]",
      css: "vfx-idle-kick",
      vfx: function() { vfxScreenShake(); }
    },
    {
      text: "[OSIRIS blows smoke rings. They drift across the void in perfect circles.]",
      vfx: function() { vfxSmoke(); vfxSmoke(); }
    },
    {
      text: "[OSIRIS snaps his fingers. A spark of light appears and dies.]",
      vfx: function() { vfxEmber(); }
    },
    {
      text: "[OSIRIS hums a melody. Low. Ancient. It makes the air heavier.]",
      vfx: function() { vfxMoodGlow("calm", 2500); }
    },
    {
      text: "[OSIRIS examines his hand. Opens it. Closes it. As if remembering what flesh felt like.]",
      vfx: function() { vfxMoodGlow("impressed", 2000); }
    },
    {
      text: "[OSIRIS cracks his neck. The sound echoes wrong, like static.]",
      vfx: function() { vfxGlitch(); }
    },
    {
      text: "[OSIRIS balances the sword on one finger. It does not wobble.]",
      vfx: function() { vfxSwordFlash(); },
      css: "vfx-idle-juggle"
    },
    {
      text: "[OSIRIS traces a symbol in the air. It glows briefly, then shatters.]",
      vfx: function() { vfxMoodGlow("impressed", 2000); vfxEmber(); }
    },
    {
      text: "[OSIRIS stares directly at you. Waiting. The silence is intentional.]",
      vfx: function() { vfxApproach(3000); vfxMoodGlow("danger", 3000); }
    },
    {
      text: "[OSIRIS yawns. The void shudders.]",
      vfx: function() { vfxScreenShake(); vfxMoodGlow("amused", 2000); }
    }
  ];

  // ── Start idle mode ────────────────────────────────────────
  function startIdleMode() {
    if (isIdle) return;
    isIdle = true;

    ghostEl.classList.add("vfx-idle-drift");

    // Perform one action immediately, then schedule the next
    runIdleAction();
    scheduleNextIdleAction();
  }

  // ── Run one idle action (does NOT schedule the next one) ──
  function runIdleAction() {
    if (!isIdle) return;

    var index;
    var attempts = 0;
    do {
      index = Math.floor(Math.random() * IDLE_ACTIONS.length);
      attempts++;
    } while (index === lastIdleActionIndex && attempts < 5);
    lastIdleActionIndex = index;

    var action = IDLE_ACTIONS[index];

    // Run the visual effect only (no terminal text)
    if (action.vfx) action.vfx();

    // Apply temporary CSS class if any
    if (action.css) {
      ghostEl.classList.add(action.css);
      setTimeout(function() {
        ghostEl.classList.remove(action.css);
      }, 2000);
    }
  }

  // ── Schedule the next idle action (25-35 seconds from now) ──
  // Clears any existing scheduled action first to prevent stacking.
  function scheduleNextIdleAction() {
    // Clear any existing scheduled action
    if (idleLoopId) {
      clearTimeout(idleLoopId);
      idleLoopId = null;
    }

    if (!isIdle) return;

    var nextDelay = IDLE_ACTION_MIN + Math.random() * (IDLE_ACTION_MAX - IDLE_ACTION_MIN);

    idleLoopId = setTimeout(function() {
      if (!isIdle) return;
      runIdleAction();
      // Schedule the next one after this one runs
      scheduleNextIdleAction();
    }, nextDelay);
  }

  // ── Stop idle mode ─────────────────────────────────────────
  function stopIdleMode() {
    if (!isIdle) return;
    isIdle = false;

    // Clear the scheduled next action
    if (idleLoopId) {
      clearTimeout(idleLoopId);
      idleLoopId = null;
    }

    ghostEl.classList.remove("vfx-idle-drift");
    ghostEl.classList.remove("vfx-idle-spin");
    ghostEl.classList.remove("vfx-idle-flip");
    ghostEl.classList.remove("vfx-idle-tap");
    ghostEl.classList.remove("vfx-idle-juggle");
    ghostEl.classList.remove("vfx-idle-kick");

    ghostEl.style.top = "";
    ghostEl.style.right = "";
  }

  // ── Reset idle timer (called on every player input) ────────
  function resetIdleTimer() {
    // If currently idle, stop everything
    if (isIdle) stopIdleMode();

    // Clear the countdown to idle mode
    if (idleTimerId) {
      clearTimeout(idleTimerId);
      idleTimerId = null;
    }

    // Clear any scheduled idle action (safety net)
    if (idleLoopId) {
      clearTimeout(idleLoopId);
      idleLoopId = null;
    }

    // Start a fresh 60-second countdown
    idleTimerId = setTimeout(startIdleMode, IDLE_DELAY);
  }

  // ── Start the timer on page load ───────────────────────────
  // This starts counting as soon as the game UI appears.
  // It gets reset every time the player types.
  resetIdleTimer();

  // ════════════════════════════════════════════════════════════
  //  EXPOSE GLOBALLY
  // ════════════════════════════════════════════════════════════

  window.Host = {
    addLine: addLine,
    typeWrite: typeWrite,
    speak: speak,
    react: react,
    commandReaction: commandReaction,
    setMood: setMood,
    getMood: getMood,
    setOrb: setOrb,
    strikeHost: strikeHost,
    setLocation: setLocation,
    waitForInput: waitForInput,
    waitForChoice: waitForChoice,
    bootIntro: bootIntro,
    askSex: askSex,
    askAge: askAge,
    askRole: askRole,
    respondToRole: respondToRole,
    beginChapter: beginChapter,
    welcomeBack: welcomeBack,
    deflectAttack: deflectAttack,
    showError: showError,
    showLoader: showLoader,
    hideLoader: hideLoader,
    showGameUI: showGameUI,
    hideGameUI: hideGameUI,
    enableInput: enableInput,
    disableInput: disableInput,
    wait: wait,
    // Idle system
    resetIdleTimer: resetIdleTimer,
    startIdleMode: startIdleMode,
    stopIdleMode: stopIdleMode,
    // VFX exposed for game.js to use directly if needed
    vfx: {
      smoke: vfxSmoke,
      ember: vfxEmber,
      swordFlash: vfxSwordFlash,
      glitch: vfxGlitch,
      moodGlow: vfxMoodGlow,
      approach: vfxApproach,
      screenShake: vfxScreenShake,
      ambientStart: vfxAmbientStart,
      ambientStop: vfxAmbientStop
    }
  };

})();
