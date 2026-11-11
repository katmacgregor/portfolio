// Home page hero: the rotating word (design / solve / code / ...) and its custom cursor.
  var words = [
    { word: "design", target: "#work" },
    { word: "solve", target: "#how-i-think" },
    { word: "code", target: "work/mux.html" },
    { word: "doodle", target: "doodles.html" },
    { word: "ship", target: "#ship" },
    { word: "craft", target: "craft.html" }
  ];
  var i = 0;
  var btn = document.getElementById("rotator-word");
  var nextBtn = document.getElementById("rotator-next");
  var stage = document.getElementById("rotator-stage");
  var letters = document.getElementById("rotator-letters");
  var tail = document.getElementById("rotator-tail");
  var wordCursor = document.getElementById("word-cursor");

  // Per-word cursor icons, rendered as a real DOM element (positioned
  // via mousemove below) instead of the native CSS `cursor:` property —
  // that path routes through the OS cursor compositor and can go
  // blocky on high-DPI screens no matter the source resolution. A DOM
  // element just paints through the normal page compositor, so it
  // stays as crisp as any other SVG here.
  var cursorIcons = {
    ship: '<svg viewBox="0 0 24 24" fill="none"><path d="M21.26,4.4C21.21,4.35 21.11,4.35 21.02,4.3L20.92,4.25L20.72,4.35L20.67,4.35L2.64,11.17L2.55,11.32C2.45,11.46 2.4,11.66 2.45,11.85C2.5,12.05 2.59,12.19 2.79,12.29L2.84,12.34L9.66,13.71L9.42,18.58L9.56,18.72C9.71,18.87 9.9,18.97 10.1,18.97C10.29,18.97 10.44,18.92 10.59,18.77L12.49,16.87L14.63,19.5C14.78,19.65 14.97,19.75 15.17,19.75C15.31,19.75 15.51,19.7 15.65,19.55L15.75,19.46L15.8,19.36C17.12,16.04 21.5,5.23 21.55,5.08C21.6,4.84 21.5,4.54 21.26,4.4Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M21,4.8 L9.42,18.58" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    design: '<svg viewBox="0 0 24 24" fill="none"><g transform="rotate(-35 12 12)"><rect x="3" y="10" width="18" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 10v2M10 10v2.5M13.5 10v2M17 10v2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></g></svg>',
    solve: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 6H9A2 2 0 0 1 13 6H19V10A2 2 0 0 1 19 14V20H5V16A2 2 0 0 0 5 12V6Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
    doodle: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20l1-4L15.5 5.5l3 3L8 19l-4 1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M13.5 7 17 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none"><path d="M7.90451 6.92144C8.41341 6.45495 8.44779 5.66424 7.9813 5.15534C7.51481 4.64645 6.7241 4.61207 6.2152 5.07856L7.90451 6.92144ZM1.46194 11.1314L2.3066 12.0529L2.3066 12.0529L1.46194 11.1314ZM1.46194 11.8686L2.3066 10.9471L2.3066 10.9471L1.46194 11.8686ZM6.2152 17.9214C6.7241 18.3879 7.51481 18.3536 7.9813 17.8447C8.44779 17.3358 8.41341 16.545 7.90451 16.0786L6.2152 17.9214ZM6.2152 5.07856L0.617287 10.21L2.3066 12.0529L7.90451 6.92144L6.2152 5.07856ZM0.617287 12.79L6.2152 17.9214L7.90451 16.0786L2.3066 10.9471L0.617287 12.79ZM0.617287 10.21C-0.139356 10.9036 -0.139356 12.0964 0.617287 12.79L2.3066 10.9471C2.63087 11.2444 2.63087 11.7556 2.3066 12.0529L0.617287 10.21Z" fill="currentColor"/><path d="M16.0557 16.0786C15.5468 16.545 15.5125 17.3358 15.9789 17.8447C16.4454 18.3536 17.2361 18.3879 17.745 17.9214L16.0557 16.0786ZM22.4983 11.8686L21.6537 10.9471L21.6537 10.9471L22.4983 11.8686ZM22.4983 11.1314L21.6537 12.0529L21.6537 12.0529L22.4983 11.1314ZM17.745 5.07856C17.2361 4.61207 16.4454 4.64645 15.979 5.15534C15.5125 5.66424 15.5468 6.45495 16.0557 6.92144L17.745 5.07856ZM17.745 17.9214L23.343 12.79L21.6537 10.9471L16.0557 16.0786L17.745 17.9214ZM23.343 10.21L17.745 5.07856L16.0557 6.92144L21.6537 12.0529L23.343 10.21ZM23.343 12.79C24.0996 12.0964 24.0996 10.9036 23.343 10.21L21.6537 12.0529C21.3294 11.7556 21.3294 11.2444 21.6537 10.9471L23.343 12.79Z" fill="currentColor"/><path d="M15.2127 3.80317C15.3801 3.13343 14.9729 2.45476 14.3032 2.28732C13.6334 2.11989 12.9548 2.52709 12.7873 3.19683L15.2127 3.80317ZM8.78732 19.1968C8.61989 19.8666 9.02709 20.5452 9.69683 20.7127C10.3666 20.8801 11.0452 20.4729 11.2127 19.8032L8.78732 19.1968ZM12.7873 3.19683L8.78732 19.1968L11.2127 19.8032L15.2127 3.80317L12.7873 3.19683Z" fill="currentColor"/></svg>',
    craft: '<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="17" r="3.2" stroke="currentColor" stroke-width="2.1"/><circle cx="17" cy="17" r="3.2" stroke="currentColor" stroke-width="2.1"/><path d="M9.5 15.6 18 7c.6-.6 1.6-.4 1.6.6 0 .3-.1.6-.4.9L12 16.1Z" fill="currentColor"/><path d="M14.5 15.6 6 7c-.6-.6-1.6-.4-1.6.6 0 .3.1.6.4.9l7.7 8.2Z" fill="currentColor"/><circle cx="12" cy="15.8" r="1.1" fill="currentColor"/></svg>'
  };

  var isHoveringWord = false;
  var cursorX = 0, cursorY = 0, cursorRafPending = false;

  function setCursorIcon(word) {
    wordCursor.innerHTML = cursorIcons[word] || "";
  }

  function paintCursorPosition() {
    wordCursor.style.transform = "translate(" + (cursorX - 12) + "px, " + (cursorY - 12) + "px)";
    cursorRafPending = false;
  }

  btn.addEventListener("mouseenter", function () {
    isHoveringWord = true;
    setCursorIcon(words[i % words.length].word);
    wordCursor.classList.add("is-visible");
    btn.style.cursor = "none";
  });

  btn.addEventListener("mousemove", function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (!cursorRafPending) {
      cursorRafPending = true;
      requestAnimationFrame(paintCursorPosition);
    }
  });

  btn.addEventListener("mouseleave", function () {
    isHoveringWord = false;
    wordCursor.classList.remove("is-visible");
    btn.style.cursor = "";
  });

  // Scrolling (wheel/trackpad/keyboard) moves the button out from under
  // the pointer without firing a real mouse event, so mouseleave never
  // triggers — the custom cursor is left stranded, visible wherever the
  // pointer happens to be sitting on screen. Re-check on scroll and drop
  // the hover state if the pointer isn't actually over the button anymore.
  var scrollCheckPending = false;
  function checkCursorStillOverButton() {
    scrollCheckPending = false;
    if (!isHoveringWord) return;
    var atPoint = document.elementFromPoint(cursorX, cursorY);
    if (!atPoint || !btn.contains(atPoint)) {
      isHoveringWord = false;
      wordCursor.classList.remove("is-visible");
      btn.style.cursor = "";
    }
  }
  window.addEventListener("scroll", function () {
    if (!scrollCheckPending) {
      scrollCheckPending = true;
      requestAnimationFrame(checkCursorStillOverButton);
    }
  }, { passive: true });

  function buildChars(container, word) {
    container.innerHTML = "";
    word.split("").forEach(function (ch) {
      var span = document.createElement("span");
      span.className = "rl-char";
      span.textContent = ch === " " ? " " : ch;
      container.appendChild(span);
    });
  }

  // Floor the stage at whichever of "code"/"craft" is actually wider in
  // the real (loaded) font — short words stay compact instead of
  // padding out to the longest word's width. "design" and "doodle"
  // are genuinely longer and still grow past the floor when shown.
  function measureWordWidth(word) {
    var probe = document.createElement("span");
    probe.className = "rotator-letters";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.textContent = word;
    stage.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  }

  function syncMinWidth() {
    var codeWidth = measureWordWidth("code");
    var craftWidth = measureWordWidth("craft");
    stage.style.minWidth = Math.max(codeWidth, craftWidth) + "px";
  }

  syncMinWidth();
  document.fonts.ready.then(syncMinWidth);
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncMinWidth, 150);
  });

  buildChars(letters, words[i % words.length].word);
  btn.setAttribute("data-target", words[i % words.length].target);
  btn.setAttribute("data-word", words[i % words.length].word);

  btn.addEventListener("click", function () {
    var t = btn.getAttribute("data-target");
    if (!t || t === "#") return;
    if (t === "craft.html") document.documentElement.classList.add("portkey-launch");
    window.location.href = t;
  });

  var STAGGER = 30;
  var ROTATE_INTERVAL = 2400;

  // direction: 1 to advance forward, -1 to step back. Wraps both ways —
  // plain `%` goes negative in JS when i is negative, so the index is
  // normalized back into range before looking up the word.
  function rotateWord(direction) {
    i += direction;
    var w = words[((i % words.length) + words.length) % words.length];

    // Hard cutover, per letter: no fade, just a vertical push. Each
    // outgoing letter slides up and out while the matching incoming
    // letter slides up from below into its spot, staggered across the
    // word so it cascades rather than moving as one flat block. The
    // stage width and the "things" tail still animate via FLIP so
    // neither the button/border nor the tail snap.
    var tailBefore = tail.getBoundingClientRect().left;
    var startWidth = stage.getBoundingClientRect().width;

    stage.style.transition = "none";
    stage.style.width = startWidth + "px";
    void stage.offsetWidth;

    // Ghost = a snapshot of the outgoing letters, stacked above the
    // incoming word so both are visible during the crossover.
    var ghost = document.createElement("span");
    ghost.className = "rotator-ghost";
    ghost.innerHTML = letters.innerHTML;
    stage.appendChild(ghost);
    var ghostChars = ghost.querySelectorAll(".rl-char");

    buildChars(letters, w.word);
    btn.setAttribute("data-target", w.target);
    btn.setAttribute("data-word", w.word);
    if (isHoveringWord) setCursorIcon(w.word);
    var newChars = letters.querySelectorAll(".rl-char");
    newChars.forEach(function (c) {
      c.style.transition = "none";
      c.style.transform = "translateY(100%)";
    });
    void letters.offsetWidth;

    // Measure the natural end width and the tail's resting position at
    // that width, then snap back to the start width so there's
    // somewhere for the transition to animate from.
    stage.style.width = "auto";
    var endWidth = stage.getBoundingClientRect().width;
    var tailAfter = tail.getBoundingClientRect().left;
    stage.style.width = startWidth + "px";
    void stage.offsetWidth;

    var delta = tailBefore - tailAfter;
    tail.style.transition = "none";
    tail.style.transform = "translateX(" + delta + "px)";
    void tail.offsetWidth;

    requestAnimationFrame(function () {
      stage.style.transition = "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      stage.style.width = endWidth + "px";

      tail.style.transition = "";
      tail.style.transform = "translateX(0)";

      ghostChars.forEach(function (c, idx) {
        setTimeout(function () {
          // Push slightly further than -100% so descenders (g, y, p...)
          // fully clear the clipped box instead of leaving a sliver.
          c.style.transform = "translateY(-110%)";
        }, idx * STAGGER);
      });

      newChars.forEach(function (c, idx) {
        setTimeout(function () {
          c.style.transition = "";
          c.style.transform = "translateY(0)";
        }, idx * STAGGER);
      });
    });

    var longest = Math.max(ghostChars.length, newChars.length);
    setTimeout(function () {
      ghost.remove();
      stage.style.transition = "none";
      stage.style.width = "auto";
    }, longest * STAGGER + 500);
  }

  var autoTimer = null;

  function startAutoRotate() {
    if (autoTimer) return;
    autoTimer = setInterval(function () { rotateWord(1); }, ROTATE_INTERVAL);
  }

  function stopAutoRotate() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  // No point animating a word nobody can see — pause whenever the tab
  // is backgrounded or the hero has scrolled out of the viewport, and
  // pick back up once both are true again.
  var heroInViewport = true;

  function syncAutoRotateState() {
    if (heroInViewport && document.visibilityState === "visible") {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
  }

  var heroEl = document.querySelector(".hero");
  if (heroEl && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      heroInViewport = entries[0].isIntersecting;
      syncAutoRotateState();
    }, { threshold: 0 });
    heroObserver.observe(heroEl);
  }

  document.addEventListener("visibilitychange", syncAutoRotateState);

  syncAutoRotateState();

  // Manual navigation resets the auto-rotate clock so it doesn't fire a
  // second change right on top of the one you just triggered — but only
  // actually restarts it if it should be running right now.
  function restartAutoRotate() {
    stopAutoRotate();
    syncAutoRotateState();
  }

  nextBtn.addEventListener("click", function () {
    rotateWord(1);
    restartAutoRotate();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      rotateWord(1);
      restartAutoRotate();
    } else if (e.key === "ArrowLeft") {
      rotateWord(-1);
      restartAutoRotate();
    }
  });
