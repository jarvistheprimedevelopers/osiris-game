// ════════════════════════════════════════════════════════════════
//  host.js — OSIRIS: The Host
//  Controls everything the player SEES and HEARS:
//    - Adding lines to the terminal
//    - The typewriter effect
//    - The ghost orb states
//    - The location bar
//    - Input helpers (waitForInput, waitForChoice)
//    - Error display
//
//  Depends on: DOM elements only (no other JS files)
//  Loaded after: save.js (but doesn't use it)
// ════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── DOM references (cached once) ─────────────────────────
  var termEl  = document.getElementById('terminal');
  var inpEl   = document.getElementById('inp');
  var ghostEl = document.getElementById('ghost');
  var locEl   = document.getElementById('loc');

  // ════════════════════════════════════════════════════════════
  //  TERMINAL OUTPUT
  // ════════════════════════════════════════════════════════════

  // Add a line of HTML to the terminal. Returns the <div>.
  // Optional cls: 'usr', 'sys', 'err', 'hint', etc.
  function addLine(html, cls) {
    var div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    termEl.appendChild(div);
    termEl.scrollTop = termEl.scrollHeight;
    return div;
  }

  // Typewriter effect — OSIRIS speaking.
  // Writes text one character at a time inside the given container.
  // Returns a Promise that resolves when typing is complete.
  function typeWrite(container, text) {
    return new Promise(function (resolve) {
      container.innerHTML = '<span class="tag">[OSIRIS]:</span> ';
      var span = document.createElement('span');
      container.appendChild(span);
      var cursor = document.createElement('span');
      cursor.className = 'typcur';
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

  // Shortcut: add a line AND typewrite OSIRIS into it.
  // Returns a Promise.
  function speak(text) {
    var div = addLine('');
    return typeWrite(div, text);
  }

  // ════════════════════════════════════════════════════════════
  //  GHOST ORB
  // ════════════════════════════════════════════════════════════

  function setOrb(state, ms) {
    ghostEl.className = state || '';
    if (ms) {
      setTimeout(function () {
        ghostEl.className = '';
      }, ms);
    }
  }

  // The "attack OSIRIS" bounce animation
  function strikeHost() {
    ghostEl.style.top = 'calc(100% - 200px)';
    setOrb('deflect');
    setTimeout(function () {
      ghostEl.style.top = '14%';
      ghostEl.className = '';
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

  // Wait for the player to type something and press Enter.
  // Returns a Promise that resolves with the trimmed text.
  function waitForInput(placeholder) {
    return new Promise(function (resolve) {
      inpEl.placeholder = placeholder || 'Type here...';
      inpEl.disabled = false;
      inpEl.value = '';
      inpEl.focus();

      function handler(e) {
        if (e.key === 'Enter' && inpEl.value.trim()) {
          var val = inpEl.value.trim();
          inpEl.removeEventListener('keydown', handler);
          inpEl.disabled = true;
          inpEl.value = '';
          resolve(val);
        }
      }
      inpEl.addEventListener('keydown', handler);
    });
  }

  // Show clickable buttons and wait for the player to pick one.
  // options = array of strings, e.g. ['MALE', 'FEMALE']
  // Returns a Promise that resolves with the chosen string.
  function waitForChoice(options) {
    return new Promise(function (resolve) {
      inpEl.disabled = true;
      var row = document.createElement('div');
      row.className = 'line';
      var inner = document.createElement('div');
      inner.className = 'choice-row';

      options.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = opt;
        btn.addEventListener('click', function () {
          // Dim all buttons, highlight the chosen one
          inner.querySelectorAll('.choice-btn').forEach(function (b) {
            b.disabled = true;
            b.style.opacity = '.25';
            b.style.cursor = 'default';
          });
          btn.style.opacity = '1';
          btn.style.borderColor = '#00f2ff';
          btn.style.color = '#00f2ff';
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
  //  ERROR DISPLAY
  // ════════════════════════════════════════════════════════════

  var ERROR_MAP = {
    NO_KEY: 'Server has no API key configured.',
    AUTH: 'API key is invalid.',
    NETWORK: 'Cannot reach server.',
    RATE_LIMIT: 'Too many requests. Wait.',
    BLOCKED: 'Response filtered.',
    EMPTY: 'OSIRIS returned silence.',
    API_FAIL: 'Neural link unstable.'
  };

  function showError(code) {
    addLine('<span class="err"><b>[SYSTEM ERROR]:</b> ' + (ERROR_MAP[code] || ERROR_MAP.API_FAIL) + '</span>');
  }

  // ════════════════════════════════════════════════════════════
  //  LOADING DOTS
  // ════════════════════════════════════════════════════════════

  function showLoader() {
    var div = document.createElement('div');
    div.className = 'line';
    div.id = 'ldr';
    div.innerHTML = '<span class="tag">[OSIRIS]:</span> <span style="color:#555">System processing</span> <span class="dots"><i></i><i></i><i></i></span>';
    termEl.appendChild(div);
    termEl.scrollTop = termEl.scrollHeight;
  }

  function hideLoader() {
    var el = document.getElementById('ldr');
    if (el) el.remove();
  }

  // ════════════════════════════════════════════════════════════
  //  VISIBILITY TOGGLES
  // ════════════════════════════════════════════════════════════

  function showGameUI() {
    ghostEl.style.display = 'flex';
    termEl.style.display = 'flex';
    document.getElementById('bar').style.display = 'flex';
  }

  function enableInput() {
    inpEl.disabled = false;
    inpEl.placeholder = 'Type a command...';
    inpEl.focus();
  }

  function disableInput() {
    inpEl.disabled = true;
    inpEl.value = '';
  }

  // ════════════════════════════════════════════════════════════
  //  UTILITY
  // ════════════════════════════════════════════════════════════

  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  // ─── Expose globally ──────────────────────────────────────
  window.Host = {
    addLine: addLine,
    typeWrite: typeWrite,
    speak: speak,
    setOrb: setOrb,
    strikeHost: strikeHost,
    setLocation: setLocation,
    waitForInput: waitForInput,
    waitForChoice: waitForChoice,
    showError: showError,
    showLoader: showLoader,
    hideLoader: hideLoader,
    showGameUI: showGameUI,
    enableInput: enableInput,
    disableInput: disableInput,
    wait: wait
  };

})();
