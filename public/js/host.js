(function() {

  var termEl = document.getElementById("terminal");
  var inpEl = document.getElementById("inp");
  var ghostEl = document.getElementById("ghost");
  var locEl = document.getElementById("loc");

  var currentMood = "calm";

  // ════════════════════════════════════════════════════════════
  //  STAGE ACTIONS — cinematic moments in brackets
  //  These make OSIRIS feel physically present.
  //  Each mood has its own pool.
  // ════════════════════════════════════════════════════════════

  var STAGE_ACTIONS = {
    calm: [
      "[A thin flame appears in the dark. OSIRIS lights a cigar.]",
      "[Smoke drifts across the terminal in a slow ribbon.]",
      "[OSIRIS stands motionless. A silhouette against faint blue light.]",
      "[The faint tap of a boot heel echoes once, then silence.]",
      "[OSIRIS exhales. Smoke curls upward and dissolves into static.]",
      "[A low hum fills the void. OSIRIS is listening.]",
      "[The tip of the cigar glows amber in absolute darkness.]",
      "[OSIRIS tilts his head slightly, as if hearing something far away.]"
    ],
    amused: [
      "[A slow, amused chuckle echoes from nowhere.]",
      "[OSIRIS leans against the void, arms crossed. Smirking.]",
      "[The cigar flares bright. OSIRIS is entertained.]",
      "[OSIRIS slow-claps. Twice. The sound rings hollow.]",
      "[A low laugh. The kind that makes the air heavier.]",
      "[OSIRIS flicks ash into the void. It falls upward.]",
      "[The ghost orb pulses warm. OSIRIS is pleased.]",
      "[OSIRIS spins a coin across his knuckles. It vanishes.]"
    ],
    dangerous: [
      "[Steel whispers as OSIRIS draws his sword an inch from its sheath.]",
      "[The temperature drops. OSIRIS steps forward from the static.]",
      "[Eyes glow red in the void. Two points of burning data.]",
      "[OSIRIS taps the sword hilt. Once. Twice. Waiting.]",
      "[The terminal flickers. OSIRIS glitches in and out of reality.]",
      "[A blade catches light that does not exist. OSIRIS is ready.]",
      "[The void contracts. OSIRIS is closer than before.]",
      "[Static screams for half a second. Then perfect silence.]"
    ],
    impressed: [
      "[OSIRIS pauses. For the first time, he looks directly at you.]",
      "[The cigar lowers. OSIRIS nods once, barely perceptible.]",
      "[A rare silence from OSIRIS. He is measuring you.]",
      "[The ghost orb glows brighter. OSIRIS respects what he sees.]",
      "[OSIRIS sheathes his blade fully. A sign of acknowledgment.]",
      "[Smoke forms a brief halo before dissolving. OSIRIS approves.]",
      "[The void hums a lower frequency. Something has shifted.]",
      "[OSIRIS uncrosses his arms. You have his full attention.]"
    ]
  };

  // ════════════════════════════════════════════════════════════
  //  IDLE LINES — atmospheric things OSIRIS says unprompted
  // ════════════════════════════════════════════════════════════

  var IDLE_LINES = {
    calm: [
      "The Lattice remembers everything. Even the things you try to forget.",
      "Silence is not empty here. It is full of things waiting.",
      "I have watched a thousand travelers cross this floor. Most did not last.",
      "The void does not judge. It simply observes. Like me."
    ],
    amused: [
      "You remind me of someone. They did not survive either. But they were entertaining.",
      "Brave. Stupid. Sometimes the same thing.",
      "I have not been this amused since the last one tried to negotiate with a data-wolf.",
      "Go on. I could use the entertainment."
    ],
    dangerous: [
      "Careful. The Lattice has teeth, and you are walking into its mouth.",
      "That was either courage or ignorance. I will find out which.",
      "The next step you take may be your last. I say that with professional interest.",
      "Something is watching you. Something besides me."
    ],
    impressed: [
      "Not bad. I did not expect that from someone who used to be a civilian.",
      "You may actually survive this. That would be a first.",
      "The Lattice bends for no one. But it just flinched. Interesting.",
      "I am adjusting my expectations. Upward, for once."
    ]
  };

  // ════════════════════════════════════════════════════════════
  //  COMMAND REACTIONS — OSIRIS comments on player actions
  // ════════════════════════════════════════════════════════════

  var COMMAND_REACTIONS = {
    attack: [
      "Violence. The universal language.",
      "Steel and intent. The only currency that matters here.",
      "You fight like someone who has lost before. Good. You learned."
    ],
    explore: [
      "Curiosity. The first sign of intelligence.",
      "Most do not look closely. You do. That will matter.",
      "The deeper you go, the less the world makes sense. Keep going."
    ],
    search: [
      "Looking for answers? They do not like being found.",
      "The Lattice hides its gifts in ugly places.",
      "Every drawer you open tells a story. Most are tragedies."
    ],
    rest: [
      "Sleep here is a gamble. The void does not always give it back.",
      "Rest. You have earned a moment of silence.",
      "Even the condemned get a last meal. This is yours."
    ],
    talk: [
      "Words dissolve fast in this place. Choose them carefully.",
      "Speaking to the void? It speaks back. Eventually.",
      "I am listening. I am always listening."
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
  //  SPEAK — main way OSIRIS talks
  //  Sometimes performs a stage action first
  // ════════════════════════════════════════════════════════════

  async function speak(text) {
    if (Math.random() < STAGE_ACTION_CHANCE) {
      var action = pick(STAGE_ACTIONS[currentMood] || STAGE_ACTIONS.calm);
      addLine("<span class=\"action\">" + action + "</span>");
      await wait(600);
    }
    var div = addLine("");
    return typeWrite(div, text);
  }

  // ════════════════════════════════════════════════════════════
  //  REACT — standalone cinematic moment, no speech
  // ════════════════════════════════════════════════════════════

  function react() {
    var action = pick(STAGE_ACTIONS[currentMood] || STAGE_ACTIONS.calm);
    addLine("<span class=\"action\">" + action + "</span>");
  }

  // ════════════════════════════════════════════════════════════
  //  COMMAND REACTION — OSIRIS sometimes comments on actions
  //  Returns true if he reacted, false if silent
  // ════════════════════════════════════════════════════════════

  async function commandReaction(actionType) {
    if (Math.random() > REACTION_CHANCE) return false;

    var pool = COMMAND_REACTIONS[actionType];
    if (!pool || pool.length === 0) {
      pool = IDLE_LINES[currentMood] || IDLE_LINES.calm;
    }

    var line = pick(pool);
    await wait(400);

    if (Math.random() < 0.4) {
      react();
      await wait(500);
    }

    await speak(line);
    return true;
  }

  // ════════════════════════════════════════════════════════════
  //  MOOD
  // ════════════════════════════════════════════════════════════

  function setMood(mood) {
    if (STAGE_ACTIONS[mood]) currentMood = mood;
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
  //  BOOT INTRO — OSIRIS cinematic entrance
  // ════════════════════════════════════════════════════════════

  async function bootIntro() {
    addLine("<b>[SYSTEM INITIALIZED]</b>", "sys");
    await wait(500);
    addLine("<span class=\"sys\">Establishing neural link...</span>");
    await wait(700);
    setOrb("thinking");

    addLine("<span class=\"action\">[The void stirs. A point of light appears in the darkness.]</span>");
    await wait(800);
    addLine("<span class=\"action\">[A thin flame. A cigar. A silhouette takes shape.]</span>");
    await wait(700);
    addLine("<span class=\"action\">[OSIRIS steps forward. Eyes like cold starlight.]</span>");
    await wait(600);

    await speak("Welcome to the Void.");
    await wait(400);
    await speak("Most who arrive here do not last long. The question is not why you came. The question is how long you will survive.");
    await wait(300);
    setOrb("");
  }

  // ════════════════════════════════════════════════════════════
  //  CHARACTER CREATION DIALOGUE
  // ════════════════════════════════════════════════════════════

  async function askSex() {
    addLine("<span class=\"sys\">--- IDENTITY SCAN: PHASE 1 ---</span>");
    await wait(300);
    await speak("What form do you wear? Male, or female?");
    var sex = await waitForChoice(["MALE", "FEMALE"]);
    addLine("> " + sex, "usr");
    await wait(300);

    addLine("<span class=\"action\">[OSIRIS exhales smoke. It forms the shape of the answer before dissolving.]</span>");
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

    addLine("<span class=\"action\">[OSIRIS taps the cigar. Ash falls into the void like gray snow.]</span>");
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

    addLine("<span class=\"action\">[OSIRIS pauses. The cigar lowers. He studies you.]</span>");
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

    addLine("<span class=\"action\">[OSIRIS slides the cigar back between his teeth. The flame steadies.]</span>");
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

    addLine("<span class=\"action\">[The void contracts. Light bends. The world reshapes around you.]</span>");
    await wait(500);
    addLine("<span class=\"action\">[OSIRIS steps back into shadow. His cigar glows like a dying star.]</span>");
    await wait(500);

    await speak(introText);
  }

  // ════════════════════════════════════════════════════════════
  //  WELCOME BACK (continue from save)
  // ════════════════════════════════════════════════════════════

  async function welcomeBack(lifeRole, locationName) {
    addLine("<b>[SYSTEM INITIALIZED]</b>", "sys");
    await wait(400);
    addLine("<span class=\"sys\">Save data found. Restoring...</span>");
    await wait(600);
    setOrb("thinking");

    addLine("<span class=\"action\">[A match strikes in the dark. OSIRIS reappears.]</span>");
    await wait(500);

    await speak("You return. The Lattice remembers you, " + lifeRole + ". You stand in " + locationName + ". The hum resumes.");
    await wait(400);
    setOrb("");

    addLine("<span style=\"color:#00f2ff;font-size:.78rem\">NEURAL LINK: RESTORED</span>", "sys");
  }

  // ════════════════════════════════════════════════════════════
  //  DEFLECT ATTACK — OSIRIS cannot be harmed
  // ════════════════════════════════════════════════════════════

  async function deflectAttack() {
    strikeHost();
    addLine("<span class=\"action\">[SYSTEM]: Attack deflected. OSIRIS is immortal.</span>");

    var responses = [
      "I am the voice of this world. Your blade passes through me like light through glass.",
      "You swing at smoke. I am not here. I am everywhere here.",
      "That was either brave or foolish. In this place, those are the same thing.",
      "I felt that the way the ocean feels a single raindrop. Which is to say, not at all.",
      "You cannot kill what was never alive. I am code. I am memory. I am the dark between the stars."
    ];

    setMood("amused");
    await wait(300);
    addLine("<span class=\"action\">[OSIRIS does not flinch. The cigar does not even tremble.]</span>");
    await wait(400);
    await speak(pick(responses));
  }

  // ════════════════════════════════════════════════════════════
  //  ERROR AND LOADING
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

  // ════════════════════════════════════════════════════════════
  //  UI VISIBILITY
  // ════════════════════════════════════════════════════════════

  function showGameUI() {
    ghostEl.style.display = "flex";
    termEl.style.display = "flex";
    document.getElementById("bar").style.display = "flex";
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
    enableInput: enableInput,
    disableInput: disableInput,
    wait: wait
  };

})();
