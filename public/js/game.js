// ════════════════════════════════════════════════════════════════
//  game.js — Main Game Controller
//  Handles: menu, character creation, chapter start, input routing,
//  and the main game loop.
//
//  Depends on: Save (save.js), Host (host.js), StoryIntro (story/intro.js)
//  Loaded last.
//
//  Future: change GAME_MODE to "ai" to enable API narration.
// ════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── MODE SWITCH ───────────────────────────────────────────
  var GAME_MODE = "offline";

  // ─── The live game state ───────────────────────────────────
  var gs = Save.freshState();

  // ─── DOM ───────────────────────────────────────────────────
  var menuEl    = document.getElementById('menu-screen');
  var contDoor  = document.getElementById('door-continue');
  var creditsEl = document.getElementById('credits-overlay');
  var inpEl     = document.getElementById('inp');

  // ─── Lock flag (prevents double input) ─────────────────────
  var locked = false;

  // ─── Track if game loop listener is already attached ───────
  var gameLoopActive = false;

  // Grey out Continue if no save
  if (!Save.exists()) contDoor.classList.add('disabled');

  // ════════════════════════════════════════════════════════════
  //  SCENE DATABASE
  // ════════════════════════════════════════════════════════════
  var SCENES = {
    VOID_LOBBY: {
      name: 'Void Lobby',
      look: [
        "A vast chamber of black glass stretches in every direction. Faint blue light pulses along the floor like a heartbeat. The air is still and cool.",
        "The Void Lobby hums beneath your feet. Columns of dark crystal rise into a ceiling you cannot see. Somewhere far away, a sound like breathing.",
        "Black glass. Blue veins of light. Silence so deep it presses against your ears. A corridor opens to the north. Another to the east."
      ],
      explore: [
        "You walk the perimeter. The walls shift when you're not looking. A corridor to the north glows faintly — the Neon District entrance.",
        "Your footsteps echo strangely. Near the far wall, faint scratches in the glass — claw marks. Something was here before you.",
        "The blue veins in the floor pulse faster as you move. A passage to the east leads into shadow — the Broken Alley."
      ],
      talk: [
        "You call out. Your voice returns three times, each echo slightly different. Something heard you.",
        "The silence swallows your words. Then a faint whisper: 'Not yet.' It could be OSIRIS. It could be your mind."
      ],
      rest: [
        "You sit on the cold glass floor. The blue light dims. For a moment, the hum quiets. You feel slightly restored.",
        "You close your eyes. The Lobby feels almost protective when you're still. Your wounds knit slowly."
      ],
      search: [
        "Near the base of a column, you find a corrupted shard — glowing faintly.",
        "Behind a crystal pillar, a narrow alcove. Inside: a plasma cell, humming softly.",
        "A loose floor panel. Beneath it — nothing but deep hum and the smell of ozone."
      ],
      exits: { north: 'NEON_DISTRICT', east: 'BROKEN_ALLEY' },
      enemies: [],
      loot: ['corrupted shard', 'plasma cell'],
      restHeal: 20
    },

    NEON_DISTRICT: {
      name: 'Neon District',
      look: [
        "Holographic signs flicker above cracked streets. Synth-rain falls upward. The district buzzes with dead electricity.",
        "Neon towers lean at impossible angles. The rain glitches as it falls. A data-wolf howl echoes down the strip.",
        "Purple and cyan light spills from cycling signs. Long shadows move on their own."
      ],
      explore: [
        "The buildings grow denser. Down a side street: the Old Market entrance.",
        "Walls of code graffiti — old programs, names of the dead, warnings. A terminal flickers: 'GATEKEEPER — ACCESS DENIED.'",
        "A narrow passage between towers. Dark. The kind of dark that watches back."
      ],
      talk: [
        "A sign flickers: 'ALONE... ALWAYS... WATCHING...' Then goes dark.",
        "A rhythmic clicking. Claws on metal. Coming closer. Then stopping."
      ],
      rest: [
        "You lean against a dead terminal. The neon hum is almost soothing. You rest, but not deeply.",
        "A sheltered doorway. A sign flickers: 'REST... WHILE... YOU... CAN.'"
      ],
      search: [
        "Under debris: a synth-stim. It pulses with faint green light.",
        "A broken terminal yields a cipher key — small, warm.",
        "Gutters hold a handful of credits. Not much, but something."
      ],
      exits: { south: 'VOID_LOBBY', west: 'BROKEN_ALLEY', north: 'OLD_MARKET' },
      enemies: ['data-wolf'],
      loot: ['synth-stim', 'cipher key'],
      restHeal: 12
    },

    BROKEN_ALLEY: {
      name: 'Broken Alley',
      look: [
        "Narrow and dark. Pipes leak luminescent fluid. Something skitters in the shadows.",
        "Debris lines the floor — circuit boards, glass, a single boot. Walls pulse with faint red light.",
        "A gap in the wall, barely wide enough. Beyond it, the hum of a market."
      ],
      explore: [
        "You follow the pipes. They converge at a junction box. Something was sealed here. The seal is cracking.",
        "Through the gap: old maintenance tunnels, thick with cables and the smell of burnt metal.",
        "A hatch in the floor. Locked. A cipher key might open it."
      ],
      talk: [
        "Your voice bounces. The echoes distort until they sound like someone else. Then silence.",
        "You whisper. A pipe vibrates, carrying your words somewhere deeper."
      ],
      rest: [
        "You crouch behind old crates. Cold but quiet. The shadows hold still.",
        "Not safe. But your body demands it. You close your eyes briefly. When you open them, something has moved."
      ],
      search: [
        "Behind a loose panel: an echo-blade, humming faintly with looped sound.",
        "A ghost fragment — crystallized memory. Glows pale blue in your palm.",
        "Nothing useful. Just broken things and static."
      ],
      exits: { west: 'VOID_LOBBY', east: 'NEON_DISTRICT', north: 'OLD_MARKET' },
      enemies: ['data-wolf'],
      loot: ['echo-blade', 'ghost fragment'],
      restHeal: 8
    },

    OLD_MARKET: {
      name: 'Old Market',
      look: [
        "A graveyard of commerce. Tattered stalls, flickering price tags. A large gate hums at the far end — the Gate Terminal.",
        "Ozone and old copper. The market is picked clean. But the gate at the north end still glows with power.",
        "Empty avenue. The Gate Terminal stands at the end — an arch of white light and black metal."
      ],
      explore: [
        "Most stalls are empty. One has a display: weapons, keys. All 'SOLD OUT.'",
        "The gate grows larger as you approach. A figure stands before it — the Gatekeeper.",
        "A side room behind a stall. A workshop, tools scattered, a half-finished device."
      ],
      talk: [
        "Near the gate, movement. The Gatekeeper shifts. They know you're here.",
        "A thin voice: 'Approach the gate. State your purpose. Or leave.'"
      ],
      rest: [
        "An abandoned stall gives shelter. The gate hums its endless note. You recover some strength.",
        "Quiet. Peaceful, in a dead sort of way. You breathe. You rest."
      ],
      search: [
        "Under a counter: a pouch of gold. Ten pieces.",
        "A locked chest. You need a cipher key.",
        "A torn note: 'The Gatekeeper knows the way. Bring proof of strength.'"
      ],
      exits: { south: 'NEON_DISTRICT', east: 'BROKEN_ALLEY', north: 'GATE_TERMINAL' },
      enemies: [],
      loot: ['torn note'],
      restHeal: 15
    },

    GATE_TERMINAL: {
      name: 'Gate Terminal',
      look: [
        "The Gate Terminal towers above — a massive arch of white light. The Gatekeeper stands at its base, a figure of shifting code.",
        "Light pours from the gate like liquid. The Gatekeeper's form flickers — solid, then transparent.",
        "The gate is the way forward. But the Gatekeeper does not move aside."
      ],
      explore: [
        "You circle the gate. No back — just light on both sides. The Gatekeeper tracks you without turning.",
        "Old offerings at the base — shards, fragments, weapons. Left by those who came before."
      ],
      talk: [
        "The Gatekeeper speaks: 'You carry the mark of the Void. Have you proven yourself?' They wait for someone who has defeated a data-wolf.",
        "'Come back when you've earned the right.' Their voice is static shaped into words.",
        "The Gatekeeper is silent. They stare through you."
      ],
      rest: [
        "You sit near the gate. Its light warms you but feels like being watched. You rest uneasily."
      ],
      search: [
        "Among the offerings: a plasma cell, half-charged. And a note: 'Chapter 2 lies beyond.'",
        "The Gatekeeper's gaze makes you hurry. You find nothing new."
      ],
      exits: { south: 'OLD_MARKET' },
      enemies: [],
      loot: ['plasma cell'],
      restHeal: 10
    }
  };

  // ════════════════════════════════════════════════════════════
  //  ENEMY DATA
  // ════════════════════════════════════════════════════════════
  var ENEMIES = {
    'data-wolf': {
      name: 'Data-Wolf', hp: 30,
      attack: [8, 15], defense: 3,
      xpReward: 25, goldReward: 5,
      loot: ['corrupted shard'],
      intro: [
        "A data-wolf materializes — red wireframe, teeth like broken code. It charges.",
        "Clicking. Then growling. A data-wolf emerges, flickering between solid and ghost.",
        "Red light cracks the ground. A data-wolf rises, eyes burning."
      ],
      hitPlayer: [
        "The wolf lunges. Claws catch your arm. Pain — sharp and real.",
        "Teeth graze your side. Corruption sparks across your skin.",
        "A glancing blow. The wolf circles for another pass."
      ],
      playerHit: [
        "Your strike connects! The wolf staggers, pixels scattering.",
        "A solid hit. The wolf's form destabilizes, flickering.",
        "Clean strike. The wolf howls, its body cracking with light."
      ],
      death: [
        "The wolf collapses into a shower of red pixels. They float upward and dissolve. Silence.",
        "A final distorted howl. The wolf shatters. Fragments fade.",
        "The wolf's form crumbles. Almost alive for a moment. Then just fading light."
      ]
    }
  };

  // ════════════════════════════════════════════════════════════
  //  NARRATION ENGINE
  // ════════════════════════════════════════════════════════════
  function getNarration(location, actionType) {
    if (GAME_MODE === "offline") {
      var scene = SCENES[location];
      if (!scene) return "The void stretches. You are somewhere unknown.";
      var pool = scene[actionType];
      if (!pool || pool.length === 0) return "Nothing happens. The silence continues.";
      return pool[Math.floor(Math.random() * pool.length)];
    }
    // Future: if (GAME_MODE === "ai") { ... }
    return "The system hums.";
  }

  function getEnemyText(id, type) {
    var e = ENEMIES[id];
    if (!e) return "Something stirs.";
    var pool = e[type];
    if (!pool || pool.length === 0) return "...";
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ════════════════════════════════════════════════════════════
  //  STAT HELPERS
  // ════════════════════════════════════════════════════════════
  function takeDamage(n) {
    gs.character.hp = Math.max(0, gs.character.hp - n);
    Save.save(gs);
  }
  function healPlayer(n) {
    gs.character.hp = Math.min(gs.character.maxHp, gs.character.hp + n);
    Save.save(gs);
  }
  function addXP(n) {
    gs.character.xp += n;
    var needed = gs.character.level * 100;
    if (gs.character.xp >= needed) {
      gs.character.xp -= needed;
      gs.character.level++;
      gs.character.maxHp += 10;
      gs.character.hp = gs.character.maxHp;
      gs.character.maxMana += 5;
      gs.character.mana = gs.character.maxMana;
      Host.addLine('<span class="action">[SYSTEM]: LEVEL UP! Now level ' + gs.character.level + '. HP and Mana restored.</span>');
    }
    Save.save(gs);
  }
  function addGold(n) { gs.character.gold += n; Save.save(gs); }

  // ════════════════════════════════════════════════════════════
  //  COMBAT
  // ════════════════════════════════════════════════════════════
  async function doCombat(enemyId) {
    var t = ENEMIES[enemyId];
    if (!t) { Host.addLine('<span class="sys">Nothing to fight here.</span>'); return; }

    var enemy = { name: t.name, hp: t.hp };
    Host.setOrb('combat', 8000);
    Host.addLine('<span class="dmg">[COMBAT INITIATED]</span>');
    await Host.wait(300);
    await Host.speak(getEnemyText(enemyId, 'intro'));
    await Host.wait(400);

    var round = 0;
    while (enemy.hp > 0 && gs.character.hp > 0 && round < 10) {
      round++;
      await Host.wait(350);

      var pDmg = Math.floor(10 + Math.random() * 12) - t.defense;
      if (pDmg < 1) pDmg = 1;
      enemy.hp -= pDmg;
      await Host.speak(getEnemyText(enemyId, 'playerHit'));
      Host.addLine('<span class="dmg">You deal ' + pDmg + ' damage. [' + t.name + ' HP: ' + Math.max(0, enemy.hp) + '/' + t.hp + ']</span>');
      if (enemy.hp <= 0) break;

      await Host.wait(400);

      var eDmg = Math.floor(t.attack[0] + Math.random() * (t.attack[1] - t.attack[0]));
      takeDamage(eDmg);
      await Host.speak(getEnemyText(enemyId, 'hitPlayer'));
      Host.addLine('<span class="dmg">You take ' + eDmg + ' damage. [HP: ' + gs.character.hp + '/' + gs.character.maxHp + ']</span>');
      if (gs.character.hp <= 0) break;
    }

    await Host.wait(400);

    if (enemy.hp <= 0) {
      await Host.speak(getEnemyText(enemyId, 'death'));
      addXP(t.xpReward);
      addGold(t.goldReward);
      Host.addLine('<span class="loot">+' + t.xpReward + ' XP | +' + t.goldReward + ' gold</span>');
      if (t.loot && t.loot.length > 0) {
        var drop = t.loot[Math.floor(Math.random() * t.loot.length)];
        gs.inventory.push(drop);
        Host.addLine('<span class="loot">Loot: ' + drop + '</span>');
      }
      if (enemyId === 'data-wolf') gs.flags.wolfKilled = true;
      Save.save(gs);
    } else if (gs.character.hp <= 0) {
      Host.addLine('<span class="err">[SYSTEM]: You collapse. The Lattice catches you.</span>');
      gs.character.hp = Math.floor(gs.character.maxHp * 0.3);
      gs.world.location = 'VOID_LOBBY';
      Host.setLocation('VOID_LOBBY');
      Host.addLine('<span class="sys">You wake in the Void Lobby. Battered. Alive.</span>');
      Save.save(gs);
    }
    Host.setOrb('');
  }

  // ════════════════════════════════════════════════════════════
  //  QUEST CHECK
  // ════════════════════════════════════════════════════════════
  async function checkQuests() {
    if (gs.quests.indexOf('reach_gatekeeper') !== -1 &&
        gs.world.location === 'GATE_TERMINAL' &&
        gs.flags.wolfKilled) {
      gs.quests.splice(gs.quests.indexOf('reach_gatekeeper'), 1);
      await Host.wait(500);
      Host.addLine('<span class="action">[QUEST COMPLETE]: Reach the Gatekeeper</span>');
      await Host.speak("The Gatekeeper nods. 'You carry death on your hands and purpose in your steps. The gate recognizes you.' The arch flares. Chapter 1 is complete.");
      addXP(50);
      addGold(20);
      Host.addLine('<span class="loot">Reward: +50 XP | +20 Gold</span>');
      Save.save(gs);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  MENU
  // ════════════════════════════════════════════════════════════
  function hideMenu() {
    menuEl.classList.add('hidden');
    setTimeout(function () { menuEl.style.display = 'none'; }, 800);
  }

  function doorNewPlayer() {
    Save.erase();
    gs = Save.freshState();
    hideMenu();
    Host.showGameUI();
    setTimeout(function () { beginCharacterCreation(); }, 900);
  }

  function doorContinue() {
    if (!Save.exists()) return;
    var loaded = Save.load();
    if (!loaded) return;
    gs = loaded;
    hideMenu();
    Host.showGameUI();
    Host.setLocation(gs.world.location);
    setTimeout(function () { bootContinue(); }, 900);
  }

  function doorCredits() { creditsEl.classList.add('show'); }
  function closeCredits() { creditsEl.classList.remove('show'); }

  // ════════════════════════════════════════════════════════════
  //  CHARACTER CREATION — driven by Host's cinematic methods
  // ════════════════════════════════════════════════════════════
  async function beginCharacterCreation() {
    // OSIRIS introduces himself with full cinematic entrance
    await Host.bootIntro();
    await Host.wait(500);

    // Q1: Sex (Host handles the dialogue and stage actions)
    gs.character.sex = await Host.askSex();
    await Host.wait(400);

    // Q2: Age
    gs.character.age = await Host.askAge();
    await Host.wait(400);

    // Q3: Life Role
    gs.character.lifeRole = await Host.askRole();

    // OSIRIS reacts to the role with a personalized cinematic response
    await Host.respondToRole(gs.character.lifeRole);
    await Host.wait(400);

    // Save
    gs.world.location = "VOID_LOBBY";
    gs.world.chapter = 1;
    gs.quests.push("reach_gatekeeper");
    gs.summary = gs.character.sex + ", age " + gs.character.age + ", former " + gs.character.lifeRole + ".";
    Save.save(gs);
    Host.setLocation("VOID_LOBBY");

    // Chapter 1 (personalized intro from story/intro.js)
    var introText = StoryIntro.get(gs.character.lifeRole);
    await Host.beginChapter(1, introText);
    await Host.wait(400);

    // Quest announcement
    Host.addLine("<span class=\"action\">[QUEST]: Reach the Gatekeeper</span>");
    await Host.speak("A quest crystallizes: find the Gatekeeper at the Gate Terminal beyond the Old Market. Reach them. Prove you belong.");
    await Host.wait(300);
    Host.addLine("<span class=\"hint\">(Commands: <b>look</b> . <b>explore</b> . <b>go north</b> . <b>search</b> . <b>attack</b> . <b>rest</b> . <b>inventory</b> . <b>stats</b> . <b>help</b>)</span>");

    startGameLoop();
  }

  // ════════════════════════════════════════════════════════════
  //  CONTINUE — cinematic welcome back
  // ════════════════════════════════════════════════════════════
  async function bootContinue() {
    var sceneName = SCENES[gs.world.location] ? SCENES[gs.world.location].name : gs.world.location;
    await Host.welcomeBack(gs.character.lifeRole, sceneName);

    if (gs.quests.length > 0) {
      gs.quests.forEach(function(q) {
        Host.addLine("<span class=\"action\">[ACTIVE QUEST]: " + q.replace(/_/g, " ") + "</span>");
      });
    }

    Host.addLine("<span class=\"hint\">(Commands: <b>look</b> . <b>explore</b> . <b>go north</b> . <b>search</b> . <b>attack</b> . <b>rest</b> . <b>inventory</b> . <b>stats</b> . <b>help</b>)</span>");
    startGameLoop();
  }

  // ════════════════════════════════════════════════════════════
  //  MAIN GAME LOOP
  //  The keydown listener is a NAMED function attached ONCE.
  //  startGameLoop only unlocks input — it never re-attaches.
  // ════════════════════════════════════════════════════════════

  // This is the single, named handler. Defined once, attached once.
  function onGameInput(e) {
    if (e.key === 'Enter' && !locked && inpEl.value.trim()) {
      processCommand(inpEl.value);
    }
  }

  function startGameLoop() {
    locked = false;
    Host.enableInput();

    // Only attach the listener ONCE, ever
    if (!gameLoopActive) {
      gameLoopActive = true;
      inpEl.addEventListener('keydown', onGameInput);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  COMMAND PARSER
  // ════════════════════════════════════════════════════════════
  async function processCommand(rawText) {
    if (!rawText.trim() || locked) return;
    locked = true;
    inpEl.value = '';
    Host.disableInput();

    Host.addLine('> ' + rawText, 'usr');
    var cmd = rawText.toLowerCase().trim();
    var loc = gs.world.location;
    var scene = SCENES[loc];

    // ── HELP ──
    if (/^help$/i.test(cmd)) {
      Host.addLine('<span class="sys">Commands:</span>');
      Host.addLine('<span class="hint"><b>look</b> — describe surroundings</span>');
      Host.addLine('<span class="hint"><b>explore</b> — investigate the area</span>');
      Host.addLine('<span class="hint"><b>go [north/south/east/west]</b> — move</span>');
      Host.addLine('<span class="hint"><b>search</b> — search for items</span>');
      Host.addLine('<span class="hint"><b>attack</b> — fight (add target, e.g. "attack wolf")</span>');
      Host.addLine('<span class="hint"><b>talk</b> — speak or listen</span>');
      Host.addLine('<span class="hint"><b>rest</b> — recover HP</span>');
      Host.addLine('<span class="hint"><b>inventory</b> — view items</span>');
      Host.addLine('<span class="hint"><b>stats</b> — view character info</span>');
      Host.addLine('<span class="hint"><b>quests</b> — view active quests</span>');
      done(); return;
    }

    // ── STATS ──
    if (/^stats?$/i.test(cmd)) {
      var c = gs.character;
      Host.addLine('<span class="sys">— CHARACTER —</span>');
      Host.addLine('<span class="sys">' + c.sex.toUpperCase() + ' | Age: ' + c.age + ' | Former: ' + c.lifeRole + '</span>');
      Host.addLine('<span class="sys">Lv ' + c.level + ' | XP: ' + c.xp + '/' + (c.level*100) + ' | HP: ' + c.hp + '/' + c.maxHp + ' | Mana: ' + c.mana + '/' + c.maxMana + ' | Gold: ' + c.gold + '</span>');
      done(); return;
    }

    // ── INVENTORY ──
    if (/^(inventory|inv|items|bag)$/i.test(cmd)) {
      if (gs.inventory.length === 0) {
        Host.addLine('<span class="sys">Inventory is empty.</span>');
      } else {
        Host.addLine('<span class="sys">— INVENTORY —</span>');
        gs.inventory.forEach(function (item, i) {
          Host.addLine('<span class="sys">[' + (i+1) + '] ' + item + '</span>');
        });
      }
      done(); return;
    }

    // ── QUESTS ──
    if (/^quests?$/i.test(cmd)) {
      if (gs.quests.length === 0) {
        Host.addLine('<span class="sys">No active quests.</span>');
      } else {
        gs.quests.forEach(function (q) {
          Host.addLine('<span class="action">[QUEST]: ' + q.replace(/_/g, ' ') + '</span>');
        });
      }
      done(); return;
    }

    // ── LOOK ──
    if (/^(look|look around|l)$/i.test(cmd)) {
      Host.setOrb('explore', 2500);
      await Host.speak(getNarration(loc, 'look'));
      if (scene && scene.exits) {
        var exits = Object.keys(scene.exits).map(function (d) {
          return d + ' \u2192 ' + SCENES[scene.exits[d]].name;
        }).join(' | ');
        Host.addLine('<span class="hint">Exits: ' + exits + '</span>');
      }
      if (scene && scene.enemies && scene.enemies.length > 0) {
        Host.addLine('<span class="hint">Danger: creatures have been seen here.</span>');
      }
      done(); return;
    }

    // ── EXPLORE ──
    if (/^explore/i.test(cmd)) {
      Host.setOrb('explore', 3000);
      await Host.speak(getNarration(loc, 'explore'));
      done(); return;
    }

    // ── GO / MOVE ──
    var goMatch = cmd.match(/^(go|move|walk|head|travel)\s+(north|south|east|west|n|s|e|w)$/i);
    if (goMatch) {
      var dirMap = { n:'north', s:'south', e:'east', w:'west', north:'north', south:'south', east:'east', west:'west' };
      var dir = dirMap[goMatch[2].toLowerCase()];
      if (scene && scene.exits && scene.exits[dir]) {
        var dest = scene.exits[dir];
        gs.world.location = dest;
        Host.setLocation(dest);
        Host.addLine('<span class="sys">\u2014 ' + SCENES[dest].name.toUpperCase() + ' \u2014</span>');
        Host.setOrb('explore', 2500);
        await Host.speak(getNarration(dest, 'look'));
        Save.save(gs);
        await checkQuests();
      } else {
        Host.addLine('<span class="sys">You can\'t go that way. There\'s nothing but void.</span>');
      }
      done(); return;
    }

    // ── SEARCH ──
    if (/^search/i.test(cmd)) {
      Host.setOrb('explore', 2500);
      await Host.speak(getNarration(loc, 'search'));
      if (scene && scene.loot && scene.loot.length > 0 && Math.random() < 0.4) {
        var found = scene.loot[Math.floor(Math.random() * scene.loot.length)];
        var gm = found.match(/^(\d+)\s*gold$/i);
        if (gm) {
          addGold(parseInt(gm[1]));
        } else {
          gs.inventory.push(found);
          Save.save(gs);
        }
        Host.addLine('<span class="loot">Found: ' + found + '</span>');
      }
      done(); return;
    }

    // ── ATTACK ──
    if (/^(attack|fight|kill|strike|hit)/i.test(cmd)) {
      // Attacking OSIRIS
      if (/osiris|ghost|orb|host|watcher|you/i.test(cmd)) {
        Host.strikeHost();
        Host.addLine('<span class="action">[SYSTEM]: Attack deflected. OSIRIS is immortal.</span>');
        await Host.speak("I am the voice of this world. Your blade passes through me like light through glass.");
        done(); return;
      }
      // Regular combat
      if (scene && scene.enemies && scene.enemies.length > 0) {
        await doCombat(scene.enemies[Math.floor(Math.random() * scene.enemies.length)]);
        await checkQuests();
      } else {
        Host.addLine('<span class="sys">Nothing to fight here. The shadows are still.</span>');
      }
      done(); return;
    }

    // ── TALK ──
    if (/^(talk|speak|listen|shout|hello|hey)/i.test(cmd)) {
      Host.setOrb('thinking', 2500);
      await Host.speak(getNarration(loc, 'talk'));
      if (loc === 'GATE_TERMINAL') await checkQuests();
      done(); return;
    }

    // ── REST ──
    if (/^(rest|sleep|sit|camp|meditate|heal)/i.test(cmd)) {
      var h = (scene && scene.restHeal) ? scene.restHeal : 10;
      healPlayer(h);
      await Host.speak(getNarration(loc, 'rest'));
      Host.addLine('<span style="color:#00ff88">+' + h + ' HP restored. [HP: ' + gs.character.hp + '/' + gs.character.maxHp + ']</span>');
      done(); return;
    }

    // ── SLEEP AND SAVE ──
    if (/^(sleep and save|save and sleep|sleep & save)$/i.test(cmd)) {
      Save.save(gs);
      await Host.speak("Your eyes grow heavy. The Lattice hums a low lullaby. Your progress has been recorded.");
      Host.addLine("<span class=\"sys\">[GAME SAVED]</span>");
      await Host.wait(1000);
      exitToMenu();
      return;
    }

    // ── SAVE (quick save, stay in game) ──
    if (/^save$/i.test(cmd)) {
      Save.save(gs);
      await Host.speak("The Lattice etches your progress into its memory. You are saved.");
      Host.addLine("<span class=\"sys\">[GAME SAVED]</span>");
      done(); return;
    }

    // ── SLEEP (rest + save, stay in game) ──
    if (/^sleep$/i.test(cmd)) {
      var h = (scene && scene.restHeal) ? scene.restHeal : 10;
      healPlayer(h);
      Save.save(gs);
      await Host.speak("You close your eyes. The void watches over you. When you wake, you feel restored.");
      Host.addLine("<span style=\"color:#40aa30\">+" + h + " HP restored. [HP: " + gs.character.hp + "/" + gs.character.maxHp + "]</span>");
      Host.addLine("<span class=\"sys\">[GAME SAVED]</span>");
      done(); return;
    }

    // ── UNKNOWN ──
    var unknowns = [
      "The Lattice doesn't understand that action. Type 'help' for commands.",
      "Your words dissolve into the void. Try 'help' to see what you can do.",
      "Nothing happens. The silence absorbs your intent. Type 'help' for a list of commands."
    ];
    await Host.speak(unknowns[Math.floor(Math.random() * unknowns.length)]);
    done();
  }

  // Unlock input after every command completes
  function done() {
    locked = false;
    Host.enableInput();
  }

  // ════════════════════════════════════════════════════════════
  //  EXIT TO MENU — saves the game and returns to main menu
  // ════════════════════════════════════════════════════════════
  function exitToMenu() {
    // Save current game state
    Save.save(gs);

    // Stop idle behavior
    Host.stopIdleMode();
    Host.resetIdleTimer();

    // Detach the game input handler so it does not stack
    if (gameLoopActive) {
      inpEl.removeEventListener("keydown", onGameInput);
      gameLoopActive = false;
    }

    // Lock input
    locked = true;
    Host.disableInput();

    // Hide all game UI
    Host.hideGameUI();

    // Clear the terminal so it is fresh next time
    var termEl = document.getElementById("terminal");
    termEl.innerHTML = "";

    // Show the menu again
    var menuEl = document.getElementById("menu-screen");
    menuEl.style.display = "flex";
    menuEl.classList.remove("hidden");

    // Make sure Continue is now enabled (save exists)
    var contDoor = document.getElementById("door-continue");
    contDoor.classList.remove("disabled");
  }

  // ── Wire up the Exit button click ──
  var exitBtnEl = document.getElementById("exit-btn");
  if (exitBtnEl) {
    exitBtnEl.addEventListener("click", exitToMenu);
  }

  // ════════════════════════════════════════════════════════════
  //  WIRE UP CLICK HANDLERS
  //  We attach these here (not in HTML onclick) so that they
  //  only run AFTER all scripts are loaded. This prevents
  //  "Game is not defined" errors.
  // ════════════════════════════════════════════════════════════
  document.getElementById('door-new').addEventListener('click', doorNewPlayer);
  document.getElementById('door-continue').addEventListener('click', doorContinue);
  document.getElementById('door-credits').addEventListener('click', doorCredits);
  document.getElementById('credits-close-btn').addEventListener('click', closeCredits);

  // Also expose globally in case anything else needs it
  window.Game = {
    doorNewPlayer: doorNewPlayer,
    doorContinue: doorContinue,
    doorCredits: doorCredits,
    closeCredits: closeCredits
  };

  // ════════════════════════════════════════════════════════════
  //  CENTER PANEL SYSTEM (MAP / ITEM / QUEST / SKILL)
  //  All four are toggles. Only one open at a time.
  //  Clicking the same button again closes the panel.
  // ════════════════════════════════════════════════════════════

  var panelOverlay = document.getElementById("center-panel-overlay");
  var panelTitle   = document.getElementById("cp-title");
  var panelBody    = document.getElementById("cp-body");
  var panelClose   = document.getElementById("cp-close");
  var currentPanel = null;

  // ── ITEM panel: reads real inventory from game state ────────
  function getItemContent() {
    var slots = 4;
    var html = "";
    for (var i = 0; i < slots; i++) {
      if (gs.inventory[i]) {
        html += "<div class=\"inv-slot filled\">" + gs.inventory[i].toUpperCase() + "</div>";
      } else {
        html += "<div class=\"inv-slot\">EMPTY</div>";
      }
    }
    return html;
  }

  // ── MAP panel ──────────────────────────────────────────────
  function getMapContent() {
    return "<div class=\"cp-empty\">--- WORLD MAP ---</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">VOID LOBBY</div>" +
        "<div class=\"cp-item-desc\">The entry point. Black glass and blue light.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">NEON DISTRICT</div>" +
        "<div class=\"cp-item-desc\">Glitching streets. Synth-rain. Data-wolves.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">BROKEN ALLEY</div>" +
        "<div class=\"cp-item-desc\">Narrow. Dark. Pipes and shadows.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">OLD MARKET</div>" +
        "<div class=\"cp-item-desc\">Abandoned stalls. The Gate Terminal looms.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">GATE TERMINAL</div>" +
        "<div class=\"cp-item-desc\">The Gatekeeper waits. Prove yourself.</div>" +
      "</div>";
  }

  // ── QUEST panel ────────────────────────────────────────────
  function getQuestContent() {
    if (gs.quests.length === 0) {
      return "<div class=\"cp-empty\">NO ACTIVE QUESTS</div>";
    }
    var html = "<div class=\"cp-empty\">--- ACTIVE QUESTS ---</div>";
    gs.quests.forEach(function(q) {
      html += "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">" + q.replace(/_/g, " ").toUpperCase() + "</div>" +
        "<div class=\"cp-item-desc\">In progress.</div>" +
      "</div>";
    });
    return html;
  }

  // ── SKILL panel ────────────────────────────────────────────
  function getSkillContent() {
    return "<div class=\"cp-empty\">--- SKILLS ---</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">COMBAT LV " + gs.character.level + "</div>" +
        "<div class=\"cp-item-desc\">Base attack damage scales with level.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">SURVIVAL</div>" +
        "<div class=\"cp-item-desc\">Rest healing. Locked: future upgrade.</div>" +
      "</div>" +
      "<div class=\"cp-item\">" +
        "<div class=\"cp-item-title\">PERCEPTION</div>" +
        "<div class=\"cp-item-desc\">Search loot chance. Locked: future upgrade.</div>" +
      "</div>" +
      "<div class=\"cp-empty\" style=\"margin-top:10px\">More skills unlock as you level up.</div>";
  }

  // ── Open / toggle a panel ──────────────────────────────────
  function openPanel(type) {
    if (currentPanel === type) {
      closePanel();
      return;
    }

    currentPanel = type;

    // Clear all active states
    var allBtns = document.querySelectorAll(".side-btn");
    allBtns.forEach(function(b) { b.classList.remove("active"); });

    // Highlight the clicked button
    var btnId = { map:"btn-map", item:"btn-item", quest:"btn-quest", skill:"btn-skill" };
    var activeBtn = document.getElementById(btnId[type]);
    if (activeBtn) activeBtn.classList.add("active");

    // Set title
    var titles = { map:"MAP", item:"INVENTORY", quest:"QUESTS", skill:"SKILLS" };
    panelTitle.textContent = titles[type] || "PANEL";

    // Fill content
    if (type === "map")        panelBody.innerHTML = getMapContent();
    else if (type === "item")  panelBody.innerHTML = getItemContent();
    else if (type === "quest") panelBody.innerHTML = getQuestContent();
    else if (type === "skill") panelBody.innerHTML = getSkillContent();

    panelOverlay.classList.add("open");
  }

  // ── Close panel ────────────────────────────────────────────
  function closePanel() {
    currentPanel = null;
    panelOverlay.classList.remove("open");
    var allBtns = document.querySelectorAll(".side-btn");
    allBtns.forEach(function(b) { b.classList.remove("active"); });
  }

  // ── Wire up clicks ─────────────────────────────────────────
  var btnMap   = document.getElementById("btn-map");
  var btnItem  = document.getElementById("btn-item");
  var btnQuest = document.getElementById("btn-quest");
  var btnSkill = document.getElementById("btn-skill");

  if (btnMap)   btnMap.addEventListener("click", function() { openPanel("map"); });
  if (btnItem)  btnItem.addEventListener("click", function() { openPanel("item"); });
  if (btnQuest) btnQuest.addEventListener("click", function() { openPanel("quest"); });
  if (btnSkill) btnSkill.addEventListener("click", function() { openPanel("skill"); });
  if (panelClose) panelClose.addEventListener("click", closePanel);

  if (panelOverlay) {
    panelOverlay.addEventListener("click", function(e) {
      if (e.target === panelOverlay) closePanel();
    });
  }

})();
