(function() {
  var termEl = document.getElementById("terminal");
  var inpEl = document.getElementById("inp");
  var ghostEl = document.getElementById("ghost");
  var locEl = document.getElementById("loc");

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

  function speak(text) {
    var div = addLine("");
    return typeWrite(div, text);
  }

  function setOrb(state, ms) {
    ghostEl.className = state || "";
    if (ms) {
      setTimeout(function() {
        ghostEl.className = "";
      }, ms);
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

  function setLocation(name) {
    locEl.textContent = name;
  }

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

  function wait(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

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
