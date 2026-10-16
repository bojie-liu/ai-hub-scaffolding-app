/* ==========================================================================
   Lesson Plan — Shared application logic (frozen engine bundle)
   Generated lesson sites must NOT modify this file.
   Everything lesson-specific comes from content.js (window.LESSON) and from
   the markup contracts documented in README.md.
   Pure vanilla JS — no dependencies. All state in localStorage.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     0. Helpers
     ---------------------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function csvCell(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
  function download(name, text) {
    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    } catch (e) {
      toast("Download unavailable in this browser.");
    }
  }
  function countWords(s) {
    var t = String(s || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  /* ----------------------------------------------------------------------
     1. Lesson manifest — content.js overrides, defaults keep the template
        rendering sensibly before it is filled in.
     ---------------------------------------------------------------------- */
  var DEFAULT_LESSON = {
    brand: { name: "Lesson Plan", sub: "Overview" },
    footer: "Progress is saved in this browser only.",
    storeKey: "lesson.v1",
    sections: [
      { id: "index", file: "index.html", num: "00", icon: "⌂", title: "Overview", short: "Overview", blurb: "Lesson at a glance and table of contents." },
      { id: "section-1", file: "section-1.html", num: "01", icon: "◎", title: "Intended Learning Outcomes", short: "ILOs", blurb: "Lesson and AI-literacy outcomes." },
      { id: "section-2", file: "section-2.html", num: "02", icon: "◱", title: "Pre-Class Preparation", short: "Prep", blurb: "Readings, video and diagnostic tasks." },
      { id: "section-3", file: "section-3.html", num: "03", icon: "▶", title: "Teaching & Learning Activities", short: "Activities", blurb: "The full run sheet, block by block." },
      { id: "section-4", file: "section-4.html", num: "04", icon: "✓", title: "Assessment Methods", short: "Assessment", blurb: "Formative, summative and feedback." },
      { id: "section-5", file: "section-5.html", num: "05", icon: "▦", title: "Constructive Alignment", short: "Alignment", blurb: "Outcome → activity → assessment matrix." },
      { id: "section-6", file: "section-6.html", num: "06", icon: "⚙", title: "Resources & Technology", short: "Resources", blurb: "Platforms, tools and materials." },
      { id: "section-7", file: "section-7.html", num: "07", icon: "☷", title: "Differentiation & Inclusivity", short: "Access", blurb: "Entry points, extension and accessibility." },
      { id: "section-8", file: "section-8.html", num: "08", icon: "↻", title: "Reflection & Improvement", short: "Reflection", blurb: "Success indicators and iteration." }
    ],
    tools: [
      { id: "assessment", file: "assessment.html", num: "A", icon: "◈", title: "Practice Studio", short: "Studio", blurb: "Quizzes, flashcards, polls and decision logs." },
      { id: "slides", file: "slides.html", num: "B", icon: "▤", title: "Slide Deck", short: "Slides", blurb: "The presentation sequence for the session." },
      { id: "resources", file: "resources.html", num: "C", icon: "☰", title: "Materials & References", short: "Sources", blurb: "Printable worksheets and the reference list." }
    ]
  };

  var supplied = window.LESSON || {};
  var LESSON = {
    brand: { name: DEFAULT_LESSON.brand.name, sub: DEFAULT_LESSON.brand.sub },
    footer: supplied.footer || DEFAULT_LESSON.footer,
    storeKey: supplied.storeKey || DEFAULT_LESSON.storeKey,
    sections: (Array.isArray(supplied.sections) && supplied.sections.length) ? supplied.sections : DEFAULT_LESSON.sections,
    tools: Array.isArray(supplied.tools) ? supplied.tools : DEFAULT_LESSON.tools
  };
  if (supplied.brand) {
    if (supplied.brand.name) LESSON.brand.name = supplied.brand.name;
    if (supplied.brand.sub) LESSON.brand.sub = supplied.brand.sub;
  }
  var ALL = LESSON.sections.concat(LESSON.tools);

  var STORE_KEY = LESSON.storeKey;
  var THEME_KEY = "lesson-theme";

  /* ----------------------------------------------------------------------
     2. Storage (defensive: localStorage can be blocked under file://)
     ---------------------------------------------------------------------- */
  var memory = {};
  function readAll() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return memory[STORE_KEY] || {}; }
  }
  function writeAll(obj) {
    memory[STORE_KEY] = obj;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { /* in-memory only */ }
  }
  function get(key, fallback) {
    var s = readAll();
    return Object.prototype.hasOwnProperty.call(s, key) ? s[key] : fallback;
  }
  function set(key, value) { var s = readAll(); s[key] = value; writeAll(s); }

  /* ----------------------------------------------------------------------
     3. Toast
     ---------------------------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-shown"); }, 2600);
  }

  /* ----------------------------------------------------------------------
     4. Theme
     ---------------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $$("[data-action='theme']").forEach(function (b) {
      b.textContent = theme === "dark" ? "☀" : "☽";
      b.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      b.title = b.getAttribute("aria-label");
    });
  }
  function initTheme() {
    var saved = null;
    try { saved = window.localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }
  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  /* ----------------------------------------------------------------------
     5. Shell — topbar, sidebar, scrim
     ---------------------------------------------------------------------- */
  function currentFile() {
    var p = window.location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function linkHTML(item, here, done) {
    var active = item.file === here ? " is-active" : "";
    var aria = item.file === here ? ' aria-current="page"' : "";
    return '<li><a class="sidenav__link' + active + '" href="' + esc(item.file) + '"' + aria + '>' +
      '<span class="sidenav__num">' + esc(item.num) + '</span>' +
      '<span aria-hidden="true">' + esc(item.icon) + '</span>' +
      '<span>' + esc(item.short || item.title) + '</span>' +
      (done[nodeKey(item)] ? '<span class="tick" aria-hidden="true">✓</span>' : "") +
      "</a></li>";
  }

  function buildShell() {
    var here = currentFile();

    if (!$("#topbar")) {
      var bar = document.createElement("header");
      bar.className = "topbar";
      bar.id = "topbar";
      bar.innerHTML =
        '<button class="icon-btn menu-btn" data-action="menu" aria-label="Open navigation" aria-expanded="false">☰</button>' +
        '<a class="topbar__brand" href="index.html">' +
          '<span class="topbar__mark" aria-hidden="true">◎</span>' +
          "<span>" +
            '<span class="topbar__title">' + esc(LESSON.brand.name) + "</span>" +
            '<span class="topbar__sub">' + esc(LESSON.brand.sub) + "</span>" +
          "</span>" +
        "</a>" +
        '<span class="topbar__spacer"></span>' +
        '<button class="icon-btn" data-action="reset" aria-label="Reset all saved progress" title="Reset saved progress">↺</button>' +
        '<button class="icon-btn" data-action="print" aria-label="Print this page" title="Print / export PDF">⎙</button>' +
        '<button class="icon-btn" data-action="theme" aria-label="Switch theme">☽</button>';
      document.body.insertBefore(bar, document.body.firstChild);
    }

    if (!$("#sidenav")) {
      var done = get("done", {});
      var html = '<div class="sidenav__label">Lesson plan</div><ul class="sidenav__list">';
      LESSON.sections.forEach(function (s) { html += linkHTML(s, here, done); });
      html += "</ul>";
      if (LESSON.tools.length) {
        html += '<div class="sidenav__label">Practice &amp; materials</div><ul class="sidenav__list">';
        LESSON.tools.forEach(function (s) { html += linkHTML(s, here, done); });
        html += "</ul>";
      }
      html +=
        '<div class="sidenav__progress">' +
          '<div class="sidenav__progress-top"><span>Session progress</span><span id="nav-pct">0%</span></div>' +
          '<div class="bar bar--sm" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="nav-bar-wrap"><div class="bar__fill" id="nav-bar"></div></div>' +
        "</div>";

      var nav = document.createElement("nav");
      nav.className = "sidenav";
      nav.id = "sidenav";
      nav.setAttribute("aria-label", "Lesson plan sections");
      nav.innerHTML = html;
      document.body.insertBefore(nav, document.body.firstChild);

      var scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.id = "scrim";
      document.body.appendChild(scrim);
    }

    // Sync the theme button icon with the theme already applied on <html>.
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    paintProgress();
  }

  function closeMenu() {
    var s = $("#sidenav"), sc = $("#scrim"), b = $("[data-action='menu']");
    if (s) s.classList.remove("is-open");
    if (sc) sc.classList.remove("is-shown");
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function initShellEvents() {
    document.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-action='menu']")) {
        var open = $("#sidenav").classList.toggle("is-open");
        $("#scrim").classList.toggle("is-shown", open);
        $("[data-action='menu']").setAttribute("aria-expanded", String(open));
        return;
      }
      if (ev.target.closest("#scrim") || ev.target.closest(".sidenav__link")) closeMenu();
      if (ev.target.closest("[data-action='print']")) window.print();
      if (ev.target.closest("[data-action='theme']")) toggleTheme();
      if (ev.target.closest("[data-action='top']")) window.scrollTo({ top: 0, behavior: "smooth" });
      if (ev.target.closest("[data-action='reset']")) {
        if (window.confirm("Reset all saved progress, notes, logs and reflections on this device? This cannot be undone.")) {
          try {
            window.localStorage.removeItem(STORE_KEY);
          } catch (e) {}
          memory[STORE_KEY] = {};
          toast("Progress reset");
          setTimeout(function () { window.location.reload(); }, 600);
        }
      }
    });
  }

  function renderFooter() {
    if (document.querySelector(".page-foot")) return;
    var wrap = $(".main .wrap") || $("main") || document.body;
    var foot = document.createElement("footer");
    foot.className = "page-foot";
    foot.innerHTML =
      "<span>" + esc(LESSON.brand.name) + (LESSON.brand.sub ? " · " + esc(LESSON.brand.sub) : "") + "</span>" +
      "<span>" + esc(LESSON.footer) + "</span>";
    wrap.appendChild(foot);
  }

  /* ----------------------------------------------------------------------
     6. Progress (sections marked complete) + visited tracking
     ---------------------------------------------------------------------- */
  function nodeKey(item) { return item.id; }

  function markVisited(item) {
    if (!item) return;
    var visited = get("visited", {});
    if (!visited[item.id]) { visited[item.id] = true; set("visited", visited); }
  }

  function markDone(id) {
    if (!id) return;
    var done = get("done", {});
    done[id] = true;
    set("done", done);
    paintProgress();
    refreshSidebarTicks();
  }

  function refreshSidebarTicks() {
    var done = get("done", {});
    $$(".sidenav__link").forEach(function (a) {
      var file = a.getAttribute("href");
      var item = ALL.filter(function (i) { return i.file === file; })[0];
      var has = item && done[item.id];
      var tick = a.querySelector(".tick");
      if (has && !tick) {
        var span = document.createElement("span");
        span.className = "tick";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "✓";
        a.appendChild(span);
      } else if (!has && tick) {
        tick.remove();
      }
    });
  }

  function progressPct() {
    var done = get("done", {});
    var core = LESSON.sections.filter(function (s) { return s.id !== "index"; });
    var n = core.filter(function (s) { return done[s.id]; }).length;
    return core.length ? Math.round((n / core.length) * 100) : 0;
  }

  function paintProgress() {
    var pct = progressPct();
    var done = get("done", {});
    var core = LESSON.sections.filter(function (s) { return s.id !== "index"; });
    var n = core.filter(function (s) { return done[s.id]; }).length;

    var nb = $("#nav-bar"), np = $("#nav-pct"), nw = $("#nav-bar-wrap");
    if (nb) nb.style.width = pct + "%";
    if (np) np.textContent = pct + "%";
    if (nw) nw.setAttribute("aria-valuenow", String(pct));

    $$("[data-progress-overall]").forEach(function (el) {
      var fill = el.querySelector(".bar__fill");
      var lbl = el.querySelector("[data-pct-label]");
      if (fill) fill.style.width = pct + "%";
      if (lbl) lbl.textContent = pct + "%";
      el.setAttribute("aria-valuenow", String(pct));
    });

    $$("[data-progress-count]").forEach(function (el) {
      el.textContent = n + " / " + core.length;
    });

    $$("[data-toc-state]").forEach(function (el) {
      var id = el.getAttribute("data-toc-state");
      var isDone = !!done[id];
      el.classList.toggle("is-done", isDone);
      el.textContent = isDone ? "✓ complete" : "not started";
    });

    $$("[data-toc-bar]").forEach(function (el) {
      var fill = el.querySelector(".bar__fill");
      if (fill) fill.style.width = (done[el.getAttribute("data-toc-bar")] ? 100 : 0) + "%";
    });
  }

  /* ----------------------------------------------------------------------
     7. Pager + table of contents + local checklists
     ---------------------------------------------------------------------- */
  function renderPager() {
    var host = $(".page-nav");
    if (!host) return;
    var here = currentFile();
    var idx = ALL.map(function (s) { return s.file; }).indexOf(here);
    if (idx === -1) return;
    var prev = idx > 0 ? ALL[idx - 1] : null;
    var next = idx < ALL.length - 1 ? ALL[idx + 1] : null;

    host.innerHTML =
      (prev
        ? '<a class="btn" href="' + esc(prev.file) + '">← ' + esc(prev.short || prev.title) + "</a>"
        : '<a class="btn" href="index.html">← Overview</a>') +
      '<span class="page-nav__spacer"></span>' +
      (next
        ? '<a class="btn btn--primary" href="' + esc(next.file) + '">Next → ' + esc(next.short || next.title) + "</a>"
        : '<a class="btn btn--primary" href="index.html">Back to Overview →</a>');
  }

  function renderToc() {
    $$("[data-toc]").forEach(function (host) {
      var isTools = host.getAttribute("data-toc") === "tools";
      var items = isTools ? LESSON.tools : LESSON.sections.filter(function (s) { return s.id !== "index"; });
      host.innerHTML = items.map(function (s) {
      var bar = isTools ? "" :
        '<div class="bar bar--sm" data-toc-bar="' + esc(s.id) + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar__fill"></div></div>';
      var state = isTools ? "" : '<p class="small muted" style="margin:0.4rem 0 0"><span data-toc-state="' + esc(s.id) + '">not started</span></p>';
      return '<a class="card card--accent" href="' + esc(s.file) + '">' +
        '<span class="eyebrow" style="margin-bottom:0.4rem">' + esc(s.num) + " · " + esc(s.icon) + "</span>" +
        "<h3 style=\"margin-bottom:0.3rem\">" + esc(s.title) + "</h3>" +
        '<p class="small muted" style="margin-bottom:0.7rem">' + esc(s.blurb) + "</p>" +
        bar + state +
        "</a>";
      }).join("");
    });
  }

  function initChecklists() {
    $$("[data-track]").forEach(function (input) {
      var key = input.getAttribute("data-track");
      var check = get("check", {});
      input.checked = !!check[key];
      input.addEventListener("change", function () {
        var c = get("check", {});
        c[key] = input.checked;
        set("check", c);
        paintLocalChecklist();
      });
    });
    paintLocalChecklist();
  }

  function paintLocalChecklist() {
    var boxes = $$("[data-track]");
    if (!boxes.length) return;
    var check = get("check", {});
    var done = boxes.filter(function (b) { return check[b.getAttribute("data-track")]; }).length;
    $$("[data-checklist-count]").forEach(function (el) {
      el.textContent = done + " / " + boxes.length + " ticked";
    });
  }

  /* ----------------------------------------------------------------------
     8. Accordions
     ---------------------------------------------------------------------- */
  function initAccordions() {
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".acc__btn");
      if (!btn) return;
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  }

  /* ----------------------------------------------------------------------
     9. Quiz engine
        <div class="quiz" data-quiz="id" data-mode="single|immediate">
          <div class="q" data-correct="b" data-explain="…"> … <div class="fb"></div> </div>
     ---------------------------------------------------------------------- */
  function revealQ(q, correct, explain, ok) {
    var fb = q.querySelector(".fb");
    $$(".opt", q).forEach(function (o) {
      var inp = o.querySelector("input");
      o.classList.remove("is-correct", "is-wrong");
      if (!inp) return;
      if (inp.value === correct) o.classList.add("is-correct");
      else if (inp.checked) o.classList.add("is-wrong");
    });
    if (fb) {
      fb.classList.add("is-shown");
      fb.classList.remove("fb--ok", "fb--no");
      fb.classList.add(ok ? "fb--ok" : "fb--no");
      fb.innerHTML = "<strong>" + (ok ? "Correct. " : "Not quite. ") + "</strong>" + explain;
    }
  }

  function initQuizzes() {
    $$(".quiz").forEach(function (quiz) {
      var qs = $$(".q", quiz);
      var mode = quiz.getAttribute("data-mode") || "immediate";

      qs.forEach(function (q) {
        var correct = q.getAttribute("data-correct");
        var explain = q.getAttribute("data-explain") || "";
        $$(".opt input", q).forEach(function (inp) {
          inp.addEventListener("change", function () {
            if (mode === "single") return;
            revealQ(q, correct, explain, inp.value === correct);
            saveQuiz(quiz.getAttribute("data-quiz"), q, inp.value === correct);
          });
        });
      });

      var checkBtn = quiz.querySelector("[data-quiz-check]");
      if (checkBtn) {
        checkBtn.addEventListener("click", function () {
          var right = 0, answered = 0;
          qs.forEach(function (q) {
            var sel = $(".opt input:checked", q);
            if (!sel) return;
            answered++;
            var ok = sel.value === q.getAttribute("data-correct");
            if (ok) right++;
            revealQ(q, q.getAttribute("data-correct"), q.getAttribute("data-explain") || "", ok);
            saveQuiz(quiz.getAttribute("data-quiz"), q, ok);
          });
          var out = quiz.querySelector("[data-quiz-result]");
          if (out) {
            out.textContent = answered === 0
              ? "Select at least one answer first."
              : right + " / " + qs.length + " correct — " + Math.round((right / qs.length) * 100) + "%";
          }
          toast("Quiz checked — " + right + "/" + qs.length + " correct");
        });
      }

      var resetBtn = quiz.querySelector("[data-quiz-reset]");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          $$(".opt input", quiz).forEach(function (i) { i.checked = false; i.disabled = false; });
          $$(".opt", quiz).forEach(function (o) { o.classList.remove("is-correct", "is-wrong"); });
          $$(".fb", quiz).forEach(function (f) { f.classList.remove("is-shown", "fb--ok", "fb--no"); f.innerHTML = ""; });
          var out = quiz.querySelector("[data-quiz-result]");
          if (out) out.textContent = "";
        });
      }
    });
  }

  function saveQuiz(quizId, q, ok) {
    if (!quizId) return;
    var store = get("quizzes", {});
    var stem = ($(".q__stem", q) || {}).textContent || "";
    store[quizId + "::" + stem.slice(0, 60)] = !!ok;
    set("quizzes", store);
  }

  /* ----------------------------------------------------------------------
     10. Matching / drag-and-drop
         <div class="match" data-match="id">
           <div class="chips" data-pool> <button class="chip" draggable data-id>…</button> </div>
           <div class="drop" data-answer="chip-id">…</div>
         </div>
     ---------------------------------------------------------------------- */
  function initMatching() {
    $$(".match").forEach(function (root) {
      var picked = null;
      var drops = $$(".drop", root);
      var originals = drops.map(function (d) { return d.innerHTML; });
      var pool = root.querySelector("[data-pool]") || root.querySelector(".chips");

      function chipClick(chip) {
        if (chip.classList.contains("is-placed")) return;
        var was = chip.classList.contains("is-picked");
        $$(".chip", root).forEach(function (c) { c.classList.remove("is-picked"); });
        if (was) { picked = null; return; }
        chip.classList.add("is-picked");
        picked = chip;
      }

      function tryPlace(chip, drop) {
        if (!chip || !drop || drop.classList.contains("is-filled")) return;
        if (chip.getAttribute("data-id") === drop.getAttribute("data-answer")) {
          var label = drop.querySelector(".drop__label");
          drop.innerHTML = (label ? label.outerHTML : "") + esc(chip.textContent);
          drop.classList.add("is-filled");
          chip.classList.add("is-placed", "is-ok");
          chip.classList.remove("is-picked");
          chip.style.display = "none";
          picked = null;
          checkComplete();
        } else {
          chip.classList.add("is-bad");
          setTimeout(function () { chip.classList.remove("is-bad"); }, 420);
          toast("Not quite — try another slot.");
        }
      }

      function checkComplete() {
        var filled = drops.filter(function (d) { return d.classList.contains("is-filled"); }).length;
        var out = root.querySelector("[data-match-result]");
        if (out) {
          out.textContent = filled === drops.length
            ? "✓ All " + drops.length + " matched correctly."
            : filled + " / " + drops.length + " matched.";
        }
        if (filled === drops.length && drops.length) {
          toast("Matching complete — " + drops.length + " / " + drops.length);
        }
      }

      root.addEventListener("click", function (ev) {
        var chip = ev.target.closest(".chip");
        var drop = ev.target.closest(".drop");
        if (chip && !drop) { chipClick(chip); return; }
        if (drop) {
          if (picked) tryPlace(picked, drop);
          else toast("Pick a card from the pool first, or drag one into the slot.");
        }
      });

      root.addEventListener("dragstart", function (ev) {
        var chip = ev.target.closest(".chip");
        if (!chip || chip.classList.contains("is-placed")) return;
        picked = chip;
        chip.classList.add("is-picked");
        try {
          ev.dataTransfer.setData("text/plain", chip.getAttribute("data-id"));
          ev.dataTransfer.effectAllowed = "move";
        } catch (e) {}
      });

      drops.forEach(function (drop) {
        drop.addEventListener("dragover", function (ev) { ev.preventDefault(); drop.classList.add("is-over"); });
        drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
        drop.addEventListener("drop", function (ev) {
          ev.preventDefault();
          drop.classList.remove("is-over");
          var id;
          try { id = ev.dataTransfer.getData("text/plain"); } catch (e) { id = ""; }
          var chip = id ? root.querySelector('.chip[data-id="' + id + '"]') : picked;
          tryPlace(chip, drop);
        });
      });

      var reset = root.querySelector("[data-match-reset]");
      if (reset) {
        reset.addEventListener("click", function () {
          picked = null;
          drops.forEach(function (d, i) { d.innerHTML = originals[i]; d.classList.remove("is-filled", "is-over"); });
          $$(".chip", root).forEach(function (c) {
            c.classList.remove("is-placed", "is-ok", "is-picked", "is-bad");
            c.style.display = "";
            if (pool) pool.appendChild(c);
          });
          checkComplete();
        });
      }

      checkComplete();
    });
  }

  /* ----------------------------------------------------------------------
     11. Single-select poll
         <div class="poll" data-poll="id">
           <button class="poll-opt" data-id> <span class="fill" data-fill> … <span class="pct" data-pct> </button>
         </div>
     ---------------------------------------------------------------------- */
  function initPolls() {
    $$("[data-poll]").forEach(function (root) {
      var key = "poll:" + (root.getAttribute("data-poll") || "default");
      var opts = $$(".poll-opt", root);
      var saved = get(key, { counts: {}, voted: null });
      var counts = saved.counts || {};
      var voted = saved.voted || null;
      // The reset button and the note sit alongside the poll inside its card
      // rather than inside [data-poll] itself, so resolve them from the card.
      var scope = root.closest(".card") || root.parentNode || root;

      function paint() {
        var total = 0;
        opts.forEach(function (o) { total += counts[o.getAttribute("data-id")] || 0; });
        opts.forEach(function (o) {
          var id = o.getAttribute("data-id");
          var c = counts[id] || 0;
          var pct = total ? Math.round((c / total) * 100) : 0;
          var f = $('[data-fill="' + id + '"]', o);
          var p = $('[data-pct="' + id + '"]', o);
          if (f) f.style.width = pct + "%";
          if (p) p.textContent = c ? pct + "% (" + c + ")" : "";
          o.classList.toggle("chosen", id === voted);
        });
        var note = scope.querySelector("[data-poll-note]");
        if (note) {
          note.textContent = total
            ? "Showing your seeded + class tally. Mirror this live in an audience-response tool for whole-room data."
            : "No votes recorded yet in this browser.";
        }
      }

      opts.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-id");
          if (voted === id) return;
          if (voted) counts[voted] = Math.max(0, (counts[voted] || 1) - 1);
          counts[id] = (counts[id] || 0) + 1;
          voted = id;
          set(key, { counts: counts, voted: voted });
          paint();
        });
      });

      var reset = scope.querySelector("[data-poll-reset]");
      if (reset) {
        reset.addEventListener("click", function () {
          if (voted) counts[voted] = Math.max(0, (counts[voted] || 1) - 1);
          voted = null;
          set(key, { counts: counts, voted: null });
          paint();
        });
      }

      paint();
    });
  }

  /* ----------------------------------------------------------------------
     12. Two-axis poll
         <div class="axis" data-axis="me|class"> … </div>
     ---------------------------------------------------------------------- */
  function placementText(x, y) {
    var h = x < 0.35 ? "strong professional autonomy" : x > 0.65 ? "tight external control" : "a mixed autonomy/control regime";
    var v = y < 0.35 ? "individualistic professionalism" : y > 0.65 ? "strongly collegial professionalism" : "moderately collegial professionalism";
    return "You placed this system in " + h + " and " + v + ".";
  }

  function initAxes() {
    var axes = $$("[data-axis]");
    if (!axes.length) return;

    function render(axis) {
      var store = get("axis", {});
      var layer = axis.querySelector(".axis__dots");
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "axis__dots";
        axis.appendChild(layer);
      }
      layer.innerHTML = "";
      (store["class"] || []).forEach(function (pt) {
        var d = document.createElement("span");
        d.className = "dot";
        d.style.left = (pt[0] * 100) + "%";
        d.style.top = (pt[1] * 100) + "%";
        layer.appendChild(d);
      });
      if (store["me"]) {
        var m = document.createElement("span");
        m.className = "dot dot--me";
        m.title = "Your placement";
        m.style.left = (store["me"][0] * 100) + "%";
        m.style.top = (store["me"][1] * 100) + "%";
        layer.appendChild(m);
      }
      var wrap = axis.closest(".axis-wrap") || axis.parentNode || document;
      var counter = wrap.querySelector("[data-axis-count]");
      if (counter) counter.textContent = (store["class"] || []).length;
    }

    axes.forEach(function (axis) {
      var mode = axis.getAttribute("data-axis");
      axis.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("axis__lab")) return;
        var r = axis.getBoundingClientRect();
        var x = Math.min(0.98, Math.max(0.02, (ev.clientX - r.left) / r.width));
        var y = Math.min(0.98, Math.max(0.02, (ev.clientY - r.top) / r.height));
        var store = get("axis", {});
        if (mode === "class") store["class"] = (store["class"] || []).concat([[x, y]]);
        else store["me"] = [x, y];
        set("axis", store);
        axes.forEach(render);
        if (mode !== "class") {
          var wrap = axis.closest(".axis-wrap") || axis.parentNode || document;
          var rp = wrap.querySelector("[data-axis-readout]");
          if (rp) rp.textContent = placementText(x, y);
        }
      });
      render(axis);
    });

    var clear = $("[data-axis-clear]");
    if (clear) {
      clear.addEventListener("click", function () {
        set("axis", {});
        axes.forEach(render);
        var rp = $("[data-axis-readout]");
        if (rp) rp.textContent = "Click the grid to place your system.";
        toast("Poll responses cleared.");
      });
    }
  }

  /* ----------------------------------------------------------------------
     13. Notes / writing tools / copy buttons
     ---------------------------------------------------------------------- */
  function initWriting() {
    $$("[data-note]").forEach(function (f) {
      var key = "note:" + f.getAttribute("data-note");
      var saved = get(key, "");
      if (saved !== "") f.value = saved;
      var countEl = f.parentNode ? f.parentNode.querySelector("[data-count]") : null;
      function recount() { if (countEl) countEl.textContent = countWords(f.value) + " words"; }
      var timer = null;
      function persist() { clearTimeout(timer); timer = setTimeout(function () { set(key, f.value); }, 300); }
      f.addEventListener("input", function () { persist(); recount(); });
      recount();
    });

    document.addEventListener("click", function (ev) {
      var copy = ev.target.closest("[data-copy]");
      if (!copy) return;
      var target = document.getElementById(copy.getAttribute("data-copy"));
      var text = target
        ? (target.value !== undefined ? target.value : target.textContent)
        : copy.getAttribute("data-copy-text");
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast("Copied to clipboard."); },
          function () { fallbackCopy(text); });
      } else fallbackCopy(text);
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied to clipboard."); }
    catch (e) { toast("Copy failed — select the text manually."); }
    document.body.removeChild(ta);
  }

  /* ----------------------------------------------------------------------
     14. AI decision log (table with CSV export)
         <div data-log> <tbody data-log-body></tbody>
           [data-log-add] [data-log-export] [data-log-clear]
     ---------------------------------------------------------------------- */
  function collectLog(root) {
    var tbody = root.querySelector("[data-log-body]");
    if (!tbody) return [];
    return $$("tr", tbody).map(function (tr) {
      var f = $$("input, textarea, select", tr);
      return {
        claim: f[0] ? f[0].value : "",
        status: f[1] ? f[1].value : "",
        action: f[2] ? f[2].value : "",
        just: f[3] ? f[3].value : "",
        human: f[4] ? f[4].value : ""
      };
    });
  }

  function initLogs() {
    $$("[data-log]").forEach(function (root) {
      var tbody = root.querySelector("[data-log-body]");
      if (!tbody) return;

      function makeRow(d) {
        d = d || {};
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td><input class="field" type="text" placeholder="AI claim…" value="' + esc(d.claim) + '"></td>' +
          '<td><select class="field">' +
            ["Unverified", "Verified", "False"].map(function (o) {
              return "<option" + (d.status === o ? " selected" : "") + ">" + o + "</option>";
            }).join("") +
          "</select></td>" +
          '<td><select class="field">' +
            ["Accepted", "Modified", "Rejected"].map(function (o) {
              return "<option" + (d.action === o ? " selected" : "") + ">" + o + "</option>";
            }).join("") +
          "</select></td>" +
          '<td><textarea class="field" rows="2" placeholder="Which evidence decided it?">' + esc(d.just) + "</textarea></td>" +
          '<td><textarea class="field" rows="2" placeholder="Where human judgement took precedence…">' + esc(d.human) + "</textarea></td>" +
          '<td><button class="btn btn--sm btn--ghost" type="button" data-log-del aria-label="Delete row">✕</button></td>';
        tbody.appendChild(tr);
        tr.querySelector("[data-log-del]").addEventListener("click", function () { tr.remove(); persist(); });
        $$("input, select, textarea", tr).forEach(function (f) {
          f.addEventListener("input", persist);
          f.addEventListener("change", persist);
        });
      }

      function persist() { set("log:" + (root.getAttribute("data-log") || "main"), collectLog(root)); }

      var addBtn = root.querySelector("[data-log-add]");
      if (addBtn) addBtn.addEventListener("click", function () { makeRow(); persist(); });

      var clearBtn = root.querySelector("[data-log-clear]");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          if (!window.confirm("Clear all rows in this decision log?")) return;
          tbody.innerHTML = "";
          makeRow();
          persist();
        });
      }

      var exportBtn = root.querySelector("[data-log-export]");
      if (exportBtn) {
        exportBtn.addEventListener("click", function () {
          var rows = [["AI Claim", "Verified/Unverified/False", "Action Taken", "Justification", "Human Judgement Applied"]]
            .concat(collectLog(root).map(function (r) { return [r.claim, r.status, r.action, r.just, r.human]; }));
          download("ai-decision-log.csv", rows.map(function (r) { return r.map(csvCell).join(","); }).join("\n"));
          toast("AI Decision Log exported");
        });
      }

      var saved = get("log:" + (root.getAttribute("data-log") || "main"), []);
      if (saved && saved.length) saved.forEach(makeRow); else makeRow();
    });
  }

  /* ----------------------------------------------------------------------
     15. Exit ticket
         <div data-exit-ticket> <textarea data-exit="k"> [data-exit-download] [data-exit-clear]
     ---------------------------------------------------------------------- */
  function initExitTickets() {
    $$("[data-exit-ticket]").forEach(function (root) {
      var fields = $$("[data-exit]", root);
      var saved = get("exit", {});
      fields.forEach(function (f) {
        var k = f.getAttribute("data-exit");
        f.value = saved[k] || "";
        var timer = null;
        f.addEventListener("input", function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            var cur = get("exit", {});
            cur[k] = f.value;
            set("exit", cur);
          }, 300);
        });
      });

      var dl = root.querySelector("[data-exit-download]");
      if (dl) {
        dl.addEventListener("click", function () {
          var lines = fields.map(function (f) {
            return "[" + f.getAttribute("data-exit") + "]\n" + f.value;
          });
          download("exit-ticket.txt",
            "Exit Ticket — " + LESSON.brand.name + "\n\n" + lines.join("\n\n"));
          toast("Exit ticket saved to file");
        });
      }

      var clr = root.querySelector("[data-exit-clear]");
      if (clr) {
        clr.addEventListener("click", function () {
          if (!window.confirm("Clear your exit ticket?")) return;
          set("exit", {});
          fields.forEach(function (f) { f.value = ""; });
        });
      }
    });
  }

  /* ----------------------------------------------------------------------
     16. Slide deck
     ---------------------------------------------------------------------- */
  function initDeck() {
    var stage = $("[data-deck]");
    if (!stage) return;
    var slides = $$(".slide", stage);
    if (!slides.length) return;
    var idx = 0;
    var counter = $("[data-deck-count]");
    var fill = $("[data-deck-fill]");

    function show(i) {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === idx); });
      if (counter) counter.textContent = "Slide " + (idx + 1) + " of " + slides.length;
      if (fill) fill.style.width = (((idx + 1) / slides.length) * 100) + "%";
      var hash = "#s" + (idx + 1);
      if (window.location.hash !== hash) {
        try { history.replaceState(null, "", hash); } catch (e) {}
      }
    }

    document.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-deck-next]")) show(idx + 1);
      if (ev.target.closest("[data-deck-prev]")) show(idx - 1);
      if (ev.target.closest("[data-deck-first]")) show(0);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.target.matches("input, textarea, select")) return;
      if (ev.key === "ArrowRight" || ev.key === "PageDown" || ev.key === " ") { ev.preventDefault(); show(idx + 1); }
      if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); show(idx - 1); }
      if (ev.key === "Home") { ev.preventDefault(); show(0); }
      if (ev.key === "End") { ev.preventDefault(); show(slides.length - 1); }
      if (ev.key === "f" || ev.key === "F") toggleFull();
    });

    var fullBtn = $("[data-deck-full]");
    if (fullBtn) fullBtn.addEventListener("click", toggleFull);
    function toggleFull() {
      try {
        if (!document.fullscreenElement) {
          (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (e) {}
    }

    var start = parseInt((window.location.hash || "").replace("#s", ""), 10);
    show(isNaN(start) ? 0 : start - 1);
  }

  /* ----------------------------------------------------------------------
     17. Countdown timer
         <div class="timer" data-timer="5"> [data-timer-fab] .timer__panel
           [data-timer-display] [data-timer-toggle] [data-timer-reset] [data-preset]
     ---------------------------------------------------------------------- */
  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      o.start(); o.stop(ctx.currentTime + 0.72);
    } catch (e) {}
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function initTimers() {
    $$("[data-timer]").forEach(function (box) {
      var disp = box.querySelector("[data-timer-display]");
      var toggle = box.querySelector("[data-timer-toggle]");
      var reset = box.querySelector("[data-timer-reset]");
      var fab = box.querySelector("[data-timer-fab]");
      var panel = box.querySelector(".timer__panel");
      var mins = parseInt(box.getAttribute("data-timer"), 10) || 5;
      var remaining = mins * 60;
      var running = false;
      var tick = null;

      function render() {
        if (!disp) return;
        disp.textContent = pad2(Math.floor(Math.max(remaining, 0) / 60)) + ":" + pad2(Math.max(remaining, 0) % 60);
        disp.classList.toggle("is-low", remaining <= 60);
      }
      function stop() {
        running = false;
        clearInterval(tick);
        tick = null;
        if (toggle) toggle.textContent = "Start";
      }
      function start() {
        if (running) return;
        if (remaining <= 0) remaining = mins * 60;
        running = true;
        if (toggle) toggle.textContent = "Pause";
        tick = setInterval(function () {
          remaining--;
          render();
          if (remaining <= 0) {
            stop();
            remaining = 0;
            render();
            toast("Time is up.");
            beep();
          }
        }, 1000);
        render();
      }

      if (fab && panel) fab.addEventListener("click", function () { panel.classList.toggle("is-open"); });
      if (toggle) toggle.addEventListener("click", function () { running ? stop() : start(); });
      if (reset) reset.addEventListener("click", function () { stop(); remaining = mins * 60; render(); });
      $$("[data-preset]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          stop();
          remaining = (parseInt(b.getAttribute("data-preset"), 10) || 5) * 60;
          render();
        });
      });
      render();
    });
  }

  /* ----------------------------------------------------------------------
     18. Complete buttons + boot
     ---------------------------------------------------------------------- */
  function initCompleteButtons() {
    $$("[data-complete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        markDone(btn.getAttribute("data-complete"));
        btn.textContent = "✓ Section marked complete";
        btn.disabled = true;
        toast("Section marked complete");
      });
    });
  }

  function boot() {
    initTheme();
    buildShell();
    initShellEvents();
    renderFooter();
    initAccordions();
    initChecklists();
    initCompleteButtons();
    initQuizzes();
    initMatching();
    initPolls();
    initAxes();
    initWriting();
    initLogs();
    initExitTickets();
    initDeck();
    initTimers();
    renderToc();
    renderPager();

    var here = currentFile();
    var item = ALL.filter(function (i) { return i.file === here; })[0];
    if (item) markVisited(item);

    paintProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.LP = {
    toast: toast,
    markDone: markDone,
    lesson: LESSON,
    get: get,
    set: set
  };
})();
