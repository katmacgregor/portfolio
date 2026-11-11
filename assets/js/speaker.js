/* Beeps & boops: interactive speaker.
   Markup: index.html (.spk-slot).  Styles: assets/css/speaker.css.

   Everything is synthesised in the browser with the Web Audio API (no audio
   files). Sound only ever starts from a visitor's tap or key press.

   Hold the power button for pairing, hold the multifunction button to group
   a second speaker; taps, double and triple taps do the rest. The drawer
   lists every action, and keyboard shortcuts mirror them.

   Contents
   1. Artwork setup: buttons, press targets, LED, second speaker, notes
   2. State
   3. Audio engine
   4. Sounds and melodies
   5. Feedback badge, caption, phone
   6. Linking two speakers
   7. Actions
   8. Pointer and keyboard input on the speaker
   9. Press-target hint and flash
   10. Larger view
   11. Drawer, drawer actions and keyboard shortcuts
   12. Idle peek: the drawer nudges up once if nobody has touched the speaker
   13. Start
*/
(function () {
  "use strict";

  function $(id) { return document.getElementById("spk-" + id); }   // every artwork/UI id is prefixed spk-
  if (!$("svg")) return;

  var svg = $("svg");
  var frame = $("frame");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* ==========================================================================
     1. Artwork setup: buttons, press targets, LED, second speaker, notes
     ========================================================================== */
  var groups = { power: "button-power", play: "button-middle", up: "button-vol-up", down: "button-vol-down" };
  var LABEL = { power: "Power", play: "Play", up: "Volume up", down: "Volume down" };
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  Object.keys(groups).forEach(function (k) {
    var g = $(groups[k]);
    g.classList.add("spk-btn");
    g.setAttribute("role", "button"); g.setAttribute("tabindex", "0"); g.setAttribute("aria-label", LABEL[k]);
    var ell = g.querySelector("ellipse");
    ell.classList.add("spk-cap");
    var holder = ell.parentNode; // the transformed group around the ellipse
    var cx = ell.getAttribute("cx"), cy = ell.getAttribute("cy"), rx = +ell.getAttribute("rx"), ry = +ell.getAttribute("ry");
    mk("ellipse", { class: "spk-hit", cx: cx, cy: cy, rx: rx * 1.45, ry: ry * 2.6 }, holder);
  });
  var pt = $("press-target");
  pt.querySelector("ellipse").style.removeProperty("fill-opacity");
  var glowImg = $("on");  // the artwork's own LED glow image
  function alignTarget(el, btnId) {   // centre a highlight on its button, matching the button's proportions (a bit larger)
    var bb = $(btnId).querySelector("ellipse.spk-cap").getBoundingClientRect();
    var tb = el.querySelector("ellipse").getBoundingClientRect();
    var inv = el.parentNode.getScreenCTM().inverse();
    function toLocal(r) { return new DOMPoint(r.left + r.width / 2, r.top + r.height / 2).matrixTransform(inv); }
    var c = toLocal(bb), c0 = toLocal(tb), k = 1.55;
    var n = svg.createSVGMatrix().translate(c.x - c0.x, c.y - c0.y).translate(c0.x, c0.y).scaleNonUniform(bb.width * k / tb.width, bb.height * k / tb.height).translate(-c0.x, -c0.y).multiply(el.transform.baseVal.consolidate().matrix);
    el.setAttribute("transform", "matrix(" + [n.a, n.b, n.c, n.d, n.e, n.f].join(",") + ")");
  }
  var TGT = { power: pt };
  [["play", "button-middle"], ["up", "button-vol-up"], ["down", "button-vol-down"]].forEach(function (p) {
    var c = pt.cloneNode(true); c.removeAttribute("id"); pt.parentNode.insertBefore(c, pt); TGT[p[0]] = c;
  });
  pt.classList.add("spk-ptgt");
  Object.keys(TGT).forEach(function (k) { TGT[k].classList.add("spk-ptgt"); alignTarget(TGT[k], groups[k]); });
  var heldAt = {};   // keep the circle pressed for a minimum time so quick taps still read as a press, not a flicker
  function holdTarget(k) { clearTimeout(TGT[k]._rel); heldAt[k] = performance.now(); TGT[k].classList.add("is-held"); }
  function releaseTarget(k) { var wait = Math.max(0, 450 - (performance.now() - (heldAt[k] || 0))); TGT[k]._rel = setTimeout(function () { TGT[k].classList.remove("is-held"); }, wait); }
  function tapTarget(k) { if (S.power || k === "power") { holdTarget(k); releaseTarget(k); } }
  // LED: the artwork's own glow image (#on) + white dot (#on1), tinted per colour via an alpha-masked flood
  var defs = svg.querySelector("defs") || mk("defs", {}, svg);
  var COLORS = { white: "#ffffff", blue: "#4fb3ff" };
  Object.keys(COLORS).forEach(function (c) {
    var f = mk("filter", { id: "spk-tint-" + c, "color-interpolation-filters": "sRGB" }, defs);
    mk("feFlood", { "flood-color": COLORS[c], result: "f" }, f);
    mk("feComposite", { in: "f", in2: "SourceGraphic", operator: "in" }, f);
  });
  var fadeFilter = mk("filter", { id: "spk-tint-fade", "color-interpolation-filters": "sRGB" }, defs);   // same tint, but its colour can be transitioned (blue -> white)
  var fadeFlood = mk("feFlood", { result: "f" }, fadeFilter);
  mk("feComposite", { in: "f", in2: "SourceGraphic", operator: "in" }, fadeFilter);
  var ledEll = $("on1").querySelector("ellipse");
  glowImg.style.opacity = 0; glowImg.style.transition = "opacity 80ms";
  // second speaker: a copy of the artwork, parked below the frame until "link" is used
  var speaker = $("speaker"), body = $("body"), speaker2 = speaker.cloneNode(true);
  speaker2.id = "spk-speaker2";
  var cDot = speaker2.querySelector("#spk-on1 ellipse"), cGlow = speaker2.querySelector("#spk-on");
  speaker2.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
  speaker2.querySelectorAll(".spk-btn").forEach(function (n) { n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); });
  speaker2.setAttribute("aria-hidden", "true");
  cDot.style.opacity = 0; cGlow.style.opacity = 0; cGlow.style.transition = "opacity 80ms";
  speaker.parentNode.insertBefore(speaker2, speaker.nextSibling);
  var REST = new DOMMatrix([0.301334, 0, 0, 0.401779, 43.999441, -2676.825141]);
  function linkMatrices() {   // stacked pair, each at 78% size, centred on where the single speaker sits
    var pc = speaker.parentNode.getScreenCTM(), r = body.getBoundingClientRect(), s = 0.78;
    var gapU = (r.height * s * 0.5 + 6) / pc.d;                 // half the pill height + half a gap, in parent units
    var bb = speaker.getBBox(), c = REST.transformPoint(new DOMPoint(bb.x + bb.width / 2, bb.y + bb.height / 2));
    function about(dy) { return new DOMMatrix().translate(0, dy).translate(c.x, c.y).scale(s).translate(-c.x, -c.y).multiply(REST); }
    var off = (frame.getBoundingClientRect().height) / pc.d;
    return { a: about(-gapU).toString(), b: about(gapU - 16 / pc.d).toString(), off: new DOMMatrix().translate(0, off).multiply(REST).toString() };
  }
  var notes = $("notes");
  (function () { var bb = notes.getBBox(); notes.style.transformOrigin = (bb.x + bb.width * .15) + "px " + (bb.y + bb.height * .95) + "px"; })();   // shrink toward where the notes leave the grille

  var LEDS = [{ dot: ledEll, glow: glowImg }, { dot: cDot, glow: cGlow }];   // main speaker + the linked copy
  var ledFadeTimer = null;
  function setLed(color, level, fade) {   // fade = ms for a slow fade; otherwise the quick default
    clearTimeout(ledFadeTimer);
    LEDS.forEach(function (l) {
      l.dot.style.transition = fade ? "opacity " + fade + "ms ease-in" : ""; l.glow.style.transition = "opacity " + (fade || 80) + "ms" + (fade ? " ease-in" : "");
      l.dot.classList.remove("spk-led-pulse"); l.glow.classList.remove("spk-led-pulse");
      if (!color || !level) { l.dot.style.opacity = 0; l.glow.style.opacity = 0; return; }
      l.dot.style.fill = COLORS[color]; l.dot.style.opacity = 1;
      if (color === "white") l.glow.removeAttribute("filter"); else l.glow.setAttribute("filter", "url(#spk-tint-" + color + ")");
      l.glow.style.opacity = level;
    });
  }
  function ledFadeToWhite(ms) {   // linked (solid blue) -> single speaker (white): the dot, the glow's tint and its level all ease over together
    clearTimeout(ledFadeTimer);
    fadeFlood.style.setProperty("transition", "none"); fadeFlood.style.setProperty("flood-color", COLORS.blue);
    void svg.getBoundingClientRect();   // commit the blue start before transitioning
    fadeFlood.style.setProperty("transition", "flood-color " + ms + "ms ease-in-out"); fadeFlood.style.setProperty("flood-color", COLORS.white);
    LEDS.forEach(function (l) {
      l.dot.classList.remove("spk-led-pulse"); l.glow.classList.remove("spk-led-pulse");
      l.glow.setAttribute("filter", "url(#spk-tint-fade)");
      l.dot.style.transition = "fill " + ms + "ms ease-in-out"; l.glow.style.transition = "opacity " + ms + "ms ease-in-out";
      l.dot.style.fill = COLORS.white; l.glow.style.opacity = .7;
    });
    ledFadeTimer = setTimeout(applyBase, ms + 60);   // settle on the ordinary white state
  }
  function ledPulse() {   // continuous blue 1s pulse (pairing)
    setLed("blue", 1);
    LEDS.forEach(function (l) { l.dot.classList.add("spk-led-pulse"); l.glow.classList.add("spk-led-pulse"); });
  }
  setLed(null);

  /* ==========================================================================
     2. State
     ========================================================================== */
  var S = { power: false, everOn: false, state: "off", vol: 4, melody: 0, playing: false, interacted: false, linked: false };
  var VOL_STEPS = 8;
  function baseColor() { return S.power ? (S.linked ? "blue" : "white") : null; }   // two linked speakers hold a solid blue LED
  function applyBase() { var c = baseColor(); setLed(c, c === "blue" ? 1 : c ? 0.7 : 0); }

  /* ==========================================================================
     3. Audio engine
     ========================================================================== */
  var ctx, master, echoSend;
  function gainFor(v) { return 0.05 + v * 0.06; }
  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = gainFor(S.vol); master.connect(ctx.destination);
      var delay = ctx.createDelay(1.0); delay.delayTime.value = 0.17;
      var fb = ctx.createGain(); fb.gain.value = 0.28;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      var wet = ctx.createGain(); wet.gain.value = 0.35;
      echoSend = ctx.createGain();
      echoSend.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(master);
      newBus();
    }
    return ctx.resume();
  }
  var active = new Set(), queue = [], rafId = null, timers = new Set(), bus, wbus;
  function newBus() { bus = ctx.createGain(); bus.connect(master); wbus = ctx.createGain(); wbus.connect(echoSend); }   // every voice goes through these so silence() can fade them instead of cutting
  function tone(o) {
    var parts = o.partials || [[1, 1, 1]], vol = o.vol == null ? 0.5 : o.vol;
    parts.forEach(function (p) {
      var osc = ctx.createOscillator(), g = ctx.createGain(), d = o.dur * p[2];
      osc.type = p[3] || o.type || "sine";
      osc.frequency.setValueAtTime(o.freq * p[0], o.t);
      if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo * p[0], o.t + d);
      g.gain.setValueAtTime(0.0001, o.t);
      g.gain.linearRampToValueAtTime(vol * p[1], o.t + (o.attack || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, o.t + d);
      osc.connect(g); g.connect(bus);
      if (!o.dry) g.connect(wbus);
      osc.start(o.t); osc.stop(o.t + d + 0.05); active.add(osc);
      osc.onended = function () { active.delete(osc); g.disconnect(); };   // don't let finished nodes pile up
    });
  }
  var F = { D7:2349.32, C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880, B5:987.77, C6:1046.5, D6:1174.66, E6:1318.51, G6:1567.98, A6:1760, C7:2093, E7:2637.02, B4:493.88 };
  var TRI_BELL = [[1,1,1,"triangle"],[2.76,.28,.45,"sine"],[5.4,.1,.22,"sine"]];
  function ev(at, fn) { queue.push({ at: at, fn: fn }); }
  function blink(at, color, dur) { ev(at, function () { setLed(color, 1); }); ev(at + dur, applyBase); }
  function loop() {
    var now = ctx ? ctx.currentTime : 0;
    for (var i = queue.length - 1; i >= 0; i--) if (queue[i].at <= now) { var e = queue.splice(i, 1)[0]; e.fn(); }
    rafId = queue.length ? requestAnimationFrame(loop) : null;
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(loop); }
  function later(ms, fn) { var id = setTimeout(function () { timers.delete(id); fn(); }, ms); timers.add(id); }
  function silence(keepLed) {
    if (ctx) {   // ~25ms fade-out on the old voices, then a fresh bus for whatever plays next: no click from a mid-wave cut
      var old = [bus, wbus], now = ctx.currentTime;
      old.forEach(function (b) { b.gain.setTargetAtTime(0, now, .008); });
      active.forEach(function (o) { try { o.stop(now + .12); } catch (e) {} });
      setTimeout(function () { old.forEach(function (b) { b.disconnect(); }); }, 300);
      newBus();
    }
    active.clear(); queue = []; timers.forEach(clearTimeout); timers.clear();
    if (!keepLed) applyBase();
  }
  var lastPuff = 0;
  function puff() {   // one rise at a time: skip if the last one is still in flight
    var now = performance.now(); if (reduce || now - lastPuff < 3200) return; lastPuff = now;
    notes.classList.remove("is-rising"); void notes.getBoundingClientRect(); notes.classList.add("is-rising");
  }

  /* ==========================================================================
     4. Sounds and melodies
     ========================================================================== */
  function sndPowerOn(t) {   // evenly spaced rise, ending on a longer bright major third
    [["G5", 0, .34, .46], ["C6", .12, .34, .46], ["E6", .24, .55, .5]].forEach(function (n) { tone({ t: t + n[1], freq: F[n[0]], dur: n[2], type: "triangle", vol: n[3] }); });
    ev(t, function(){ setLed("white", .7, 1000); });   // 1s fade in to white
  }
  function sndPowerOff(t) { ["G5","E5","C5"].forEach(function (n, i) { tone({ t: t + i*.13, freq: F[n], dur: .36, type: "triangle", vol: .45 }); }); ev(t, function(){ setLed(null, 0, 1000); }); }   // one 1s fade out, no blinks
  var PING = [[1, 1, 1], [2, .1, .45], [3, .03, .25]];   // round, mostly fundamental: low-passed sonar rather than a bright bell
  function sndPairing(t, n) {   // one tight ping + softer return per second, landing as the LED swells
    for (var i = 0; i < n; i++) {
      var s = t + i + .3;
      tone({ t: s, freq: 587.33, glideTo: 560, dur: .55, partials: PING, vol: .5, attack: .006 });
      tone({ t: s + .24, freq: 587.33, glideTo: 560, dur: .4, partials: PING, vol: .2, attack: .006 });
    }
    return n;
  }
  function sndLinked(t) {   // two quick tones, low to high
    tone({ t: t, freq: F.E5, dur: .14, type: "triangle", vol: .5, attack: .004 });
    tone({ t: t + .11, freq: F.B5, dur: .4, type: "triangle", vol: .5, attack: .004 });
  }
  function sndConnected(t) { tone({ t: t, freq: F.G5, dur: .18, type: "sine", vol: .5 }); tone({ t: t + .16, freq: F.C6, dur: .5, type: "sine", vol: .5 }); }
  function sndTick(t, dir, limit) {   // one fixed pitch per direction (up higher, down lower); the level change comes from the volume itself
    if (limit) { [0, .09].forEach(function (d) { tone({ t: t + d, freq: 300, dur: .06, type: "square", vol: .2, dry: true, attack: .003 }); }); blink(t, "white", .16); }
    else { tone({ t: t, freq: dir > 0 ? 988 : 698, dur: .05, type: "triangle", vol: .45, dry: true, attack: .002 }); blink(t, "white", .07); }
  }
  function runSeq(t, seq, step, mk) { var x = t; seq.forEach(function (n, i) { var len = (n[1] || 1) * step; if (n[0]) mk(x, F[n[0]], len, i, n); x += len; }); return x - t; }
  var SOFT = [[1, 1, 1], [2, .14, .5], [3, .04, .3]];
  var MELODIES = [
    { name: "Warm drift", play: function (t) {
        var seq = [["C5"],["E5"],["G5"],["B5"],["G5"],["E5"],["F5"],["A5"],["C6"],["E6"],["C6"],["A5"],["G5"],["B5"],["D6"],["G6",4]];
        return runSeq(t, seq, .15, function (x, f, len, i, n) {
          tone({ t: x, freq: f, dur: n[1] === 4 ? 1.8 : .9, type: "sine", vol: .34, attack: .03 });
          if (i % 4 === 0) { ev(x, puff); }
        });
      } },
    { name: "Twinkle", gap: .3, play: function (t) {   // sparse and light: a pickup, one high leap, no long rests
        var seq = [["G6"],["E7",2],["C7"],["D7"],["C7",2.5],["A6"],["C7",2],["G6",3]];
        return runSeq(t, seq, .2, function (x, f, len, i, n) {
          var last = i === seq.length - 1;
          tone({ t: x, freq: f, dur: last ? 2 : .9, partials: TRI_BELL, vol: last ? .34 : .28, attack: .006 });
          if (i === 1) ev(x, puff);
        });
      } },
    { name: "Lullaby", play: function (t) {   // an octave lower and rounder than the music box: soft sine with a faint 2nd harmonic
        var seq = [["E4"],["G4"],["C5"],["B4"],["G4"],["E4"],["D4"],["G4"],["B4"],["A4"],["F4"],["D4"],["E4"],["G4"],["C5",3]];
        return runSeq(t, seq, .32, function (x, f, len, i, n) {
          var last = n[1] === 3;
          tone({ t: x, freq: f, dur: last ? 2.4 : 1.3, partials: SOFT, vol: .5, attack: .03 });
          if (i % 3 === 0) { ev(x, puff); }
        });
      } }
  ];

  /* ==========================================================================
     5. Feedback badge, caption, phone
     ========================================================================== */
  var badge = $("badge"), live = $("live"), ring = $("ring"), volIcon = badge.querySelector(".spk-i-vol"), flashTimer = null;
  function setBadge(icon, ring, say) { badge.toggleAttribute("data-off", icon === "power" && !S.power); badge.dataset.icon = icon; badge.dataset.ring = ring || ""; if (say) live.textContent = say; }
  function badgeRest() {   // resting badge = current state: off (gray power), on (blue power), playing, pairing
    clearTimeout(flashTimer);
    if (badge.dataset.ring === "hold") { setBadge("hand", "hold"); return; }
    if (S.state === "linking") setBadge("link", "spin");
    else if (S.state === "pairing") setBadge("bt", "spin");
    else if (S.playing) setBadge("eq", "");
    else setBadge("power", "");
  }
  function flash(icon, ms, level, say) {
    clearTimeout(flashTimer);
    setBadge(icon, level == null ? "" : "level", say);
    if (level != null) ring.style.strokeDasharray = (level * 100) + " 100"; else ring.style.strokeDasharray = "";
    flashTimer = setTimeout(function () { ring.style.strokeDasharray = ""; badgeRest(); }, ms);
  }
  var caption = $("caption");
  var capTimer = null;
  function syncCaption() { clearTimeout(capTimer); caption.classList.toggle("is-shown", !S.power && !S.everOn); }   // the full-time instruction is only for people who haven't powered it on yet
  var phoneTimer = null;
  function setPhone(on, holdMs, card) {   // phone + zoom come up when pairing starts; the card pops in on connect
    clearTimeout(phoneTimer);
    if (on) clearFlash();
    frame.classList.toggle("is-phone-up", on);
    frame.classList.toggle("is-card-on", on && !!card);
    if (on) phoneTimer = setTimeout(function () { frame.classList.remove("is-phone-up", "is-card-on"); }, holdMs);
  }

  /* ==========================================================================
     6. Linking two speakers
     ========================================================================== */
  var linkTimer = null, LM = null;
  function setLink(on) {
    clearTimeout(linkTimer);
    if (on) {
      LM = LM || linkMatrices();
      speaker2.style.transition = "none"; speaker2.style.transform = LM.off; void speaker2.getBoundingClientRect(); speaker2.style.transition = "";
      clearFlash(); frame.classList.add("is-linking");
      speaker.style.transform = LM.a; speaker2.style.transform = LM.b;
    } else if (frame.classList.contains("is-linking")) {
      frame.classList.remove("is-linking");
      speaker.style.transform = ""; speaker2.style.transform = LM ? LM.off : "";
      if (S.state === "linking") S.state = "on";
      if (S.linked) { S.linked = false; if (S.power) ledFadeToWhite(1000); else applyBase(); }   // the second speaker leaves: the LED eases back to white
    }
  }
  function startLink() {
    S.playing = false; S.state = "linking";
    silence(true); var t = ctx.currentTime + .03, len = sndPairing(t, 3); kick();
    clearTimeout(flashTimer); setBadge("link", "spin", "Linking speakers"); setLink(true); ledPulse();
    later((len + .05) * 1000, function () {
      if (S.state !== "linking") return;
      S.state = "on"; S.linked = true; var t2 = ctx.currentTime + .02; sndLinked(t2); ev(t2, applyBase); kick();   // linked: solid blue on both speakers
      flash("check", 1600, null, "Speakers linked");
      linkTimer = setTimeout(function () { setLink(false); }, 3600);
    });
  }

  /* ==========================================================================
     7. Actions
     ========================================================================== */
  function volApply() { if (master) master.gain.setTargetAtTime(gainFor(S.vol), ctx.currentTime, 0.02); }
  function powerOn() {
    S.power = true; S.everOn = true; S.state = "on"; syncCaption();
    silence(true); sndPowerOn(ctx.currentTime + .03); kick(); flash("power", 1200, null, "Power on");
  }
  function powerOff() {
    S.playing = false; S.power = false; S.state = "off"; syncCaption();
    silence(true); sndPowerOff(ctx.currentTime + .03); flash("power", 1200, null, "Power off");
    kick();
  }
  function startPairing() {
    S.playing = false; S.state = "pairing";
    silence(true); var t = ctx.currentTime + .03, len = sndPairing(t, 3); kick(); clearTimeout(flashTimer); setBadge("bt", "spin", "Pairing"); setPhone(true, 8000, false); ledPulse();
    later((len + .05) * 1000, function () {
      if (S.state !== "pairing") return;
      S.state = "connected"; flash("check", 3600, null, "Connected"); setPhone(true, 3600, true); var t2 = ctx.currentTime + .02; sndConnected(t2); ev(t2, function () { setLed("white", 1); }); ev(t2 + .5, applyBase); kick();
    });
  }
  var MAX_PLAYS = 3;   // loop three times, then stop
  function startMelody(count) {
    count = count || 1; S.playing = true; if (S.state !== "pairing") applyBase(); if (S.state === "pairing") S.state = "on"; silence(true);
    var len = MELODIES[S.melody].play(ctx.currentTime + .03); kick(); if (S.state !== "pairing") { clearTimeout(flashTimer); setBadge("eq", "", "Playing " + MELODIES[S.melody].name); }
    later((len + (MELODIES[S.melody].gap == null ? .9 : MELODIES[S.melody].gap)) * 1000, function () {
      if (!S.playing) return;
      if (count >= MAX_PLAYS) { S.playing = false; badgeRest(); } else startMelody(count + 1);
    });
  }
  function stopMelody() { S.playing = false; silence(); badgeRest(); }
  var lastPlayPress = 0, playTaps = 0;
  function pressPlay() {
    if (!S.power) { nudgePower(); return; }
    var now = performance.now(), n = MELODIES.length;
    playTaps = now - lastPlayPress < 320 ? playTaps + 1 : 1; lastPlayPress = now;
    if (playTaps === 2) { S.melody = (S.melody + 1) % n; startMelody(); }                 // double: next
    else if (playTaps === 3) { S.melody = (S.melody + n - 2) % n; startMelody(); playTaps = 0; }   // triple: previous
    else if (S.playing) stopMelody(); else startMelody();
  }
  function stepMelody(dir) {
    if (!S.power) { nudgePower(); return; }
    S.melody = (S.melody + dir + MELODIES.length) % MELODIES.length; startMelody();
  }
  function pressVol(dir) {
    if (!S.power) { nudgePower(); return; }
    var next = Math.max(0, Math.min(VOL_STEPS - 1, S.vol + dir)), limit = next === S.vol;
    S.vol = next; volApply();
    var t = ctx.currentTime + .01;
    if (!S.playing) silence(true);
    sndTick(t, dir, limit); kick(); volIcon.setAttribute("data-n", S.vol === 0 ? 0 : S.vol <= 2 ? 1 : S.vol <= 5 ? 2 : 3); flash("vol", 1400, S.vol / (VOL_STEPS - 1), "Volume " + S.vol);
  }
  function nudgePower() {   // a dead button was pressed while off: point at power and bring the prompt back briefly
    flashTarget(); clearTimeout(capTimer);
    caption.classList.add("is-shown"); caption.classList.remove("is-bump"); void caption.offsetWidth; caption.classList.add("is-bump");
    if (S.everOn) capTimer = setTimeout(syncCaption, 2800);
    live.textContent = "Speaker is off. Press the left button to turn on.";
  }

  /* ==========================================================================
     8. Pointer and keyboard input on the speaker
     ========================================================================== */
  var HOLD_MS = 700, RING_DELAY = 150, holdTimer = null, ringTimer = null, holdFired = false;   // long-press 700ms; the ring waits 150ms so ordinary taps never flash it
  function noteInteraction() { S.interacted = true; frame.classList.remove("is-peek"); clearTimeout(idleTimer); hintOff(); }   // the visitor is engaged: stop hinting
  function markInteracted() {   // a real action on the speaker also clears the pairing / linking scene
    if (frame.classList.contains("is-phone-up")) setPhone(false);
    if (frame.classList.contains("is-linking")) setLink(false);
    noteInteraction();
  }
  function pairing() { return frame.classList.contains("is-phone-up"); }   // phone is on screen (pairing, then the connected card): power is locked until it leaves
  function down(key, el) {
    if (key === "power" && pairing()) return;
    markInteracted();
    if (key === "power" || S.power) { el.classList.add("is-down"); holdTarget(key); }   // while off, only the power button gives press feedback
    ensureCtx();   // create/resume the audio context inside the gesture
    if (key === "play" && !S.power) nudgePower();   // dead button: no hold ring or badge change
    else if (key === "power" || key === "play") {   // tap acts on release, hold (0.7s) acts after the ring fills
      holdFired = false; clearTimeout(flashTimer); clearTimeout(ringTimer);
      ringTimer = setTimeout(function () { setBadge("hand", "hold"); }, RING_DELAY);
      holdTimer = setTimeout(function () {
        holdTimer = null; holdFired = true; clearTimeout(ringTimer); badge.dataset.ring = "";
        ensureCtx().then(function () {
          if (key === "power") { if (!S.power) powerOn(); else startPairing(); }
          else if (!S.power) { nudgePower(); badgeRest(); } else startLink();
        });
      }, HOLD_MS);
    } else ensureCtx().then(function () { pressVol(key === "up" ? 1 : -1); });
  }
  function up(key, el, cancelled) {
    el.classList.remove("is-down"); releaseTarget(key);
    if ((key === "power" || key === "play") && holdTimer) {
      clearTimeout(holdTimer); clearTimeout(ringTimer); holdTimer = null; badge.dataset.ring = ""; badgeRest();
      if (!cancelled) ensureCtx().then(function () { if (key === "play") pressPlay(); else if (S.power) powerOff(); else powerOn(); });
    }
  }
  Object.keys(groups).forEach(function (k) {
    var g = $(groups[k]);
    g.addEventListener("pointerdown", function (e) { e.preventDefault(); g.setPointerCapture && g.setPointerCapture(e.pointerId); down(k, g); });
    g.addEventListener("pointerup", function () { up(k, g); });
    g.addEventListener("pointercancel", function () { up(k, g, true); });
    g.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); down(k, g); } });
    g.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); up(k, g); } });
  });
  svg.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* ==========================================================================
     9. Press-target hint and flash
     ========================================================================== */
  function hintOn() { if (!S.interacted) pt.classList.add("is-hint"); }
  function hintOff() { pt.classList.remove("is-hint"); }
  function flashTarget() { pt.classList.remove("is-flash"); void pt.getBoundingClientRect(); pt.classList.add("is-flash"); clearTimeout(pt._f); pt._f = setTimeout(function () { pt.classList.remove("is-flash"); }, 1400); }
  function clearFlash() { Object.keys(TGT).forEach(function (k) { clearTimeout(TGT[k]._f); TGT[k].classList.remove("is-flash", "is-held"); }); }
  /* ==========================================================================
     10. Larger view
     ========================================================================== */
  var tab = $("tab");
  var expandBtn = $("expand"), scrim = $("scrim");
  var isExpanded = false;
  /* How much of the larger view's bigger type to use (--grow, 0 to 1): none when the larger view is barely
     wider than the inline frame (a phone), all of it once it is clearly bigger (tablet, desktop). */
  var spkGrow = 1;
  /* Portrait phones: the larger view fills the screen height with the drawer open, so the speaker keeps its
     full size instead of shrinking to make room. Anywhere else it keeps the fixed-ratio frame. */
  var phoneView = window.matchMedia("(max-width: 600px) and (orientation: portrait)");
  var openBeforeExpand = false;
  function syncRatio() {   // --ar (height / width) for the larger view; CSS sets the width (94vw) in the same query
    if (phoneView.matches) frame.style.setProperty("--ar", ((window.innerHeight - 32) / (window.innerWidth * .94)).toFixed(4));
    else frame.style.removeProperty("--ar");
  }
  function updateGrow() {
    spkGrow = Math.max(0, Math.min(1, (frame.offsetWidth / slot.offsetWidth - 1.15) / .4));
    frame.style.setProperty("--grow", spkGrow.toFixed(2));
  }
  function setExpanded(on) {   // the same frame really resizes (--w animates), so text keeps its pixel size instead of being scaled
    if (on === isExpanded) return;
    isExpanded = on;
    frame.getAnimations().forEach(function (an) { an.cancel(); });
    var first = frame.getBoundingClientRect();
    scrim.classList.toggle("is-on", on); document.documentElement.classList.toggle("spk-locked", on);
    expandBtn.setAttribute("aria-expanded", String(on)); expandBtn.setAttribute("aria-label", on ? "Close larger view" : "Expand");
    if (on) {
      noteInteraction(); frame.classList.add("is-expanded");   // resizing or opening the drawer must not cut a pairing scene short
      syncRatio(); updateGrow();
      openBeforeExpand = frame.classList.contains("is-open");
      if (phoneView.matches) setOpen(true);
    } else if (phoneView.matches) setOpen(openBeforeExpand);   // back inline, the drawer is as the visitor left it
    if (reduce) { if (!on) { frame.classList.remove("is-expanded"); frame.style.removeProperty("--ar"); } return; }
    var SHADOW = getComputedStyle(frame).getPropertyValue("--spk-lift").trim(), NONE = "0 0 0 rgb(0 0 0 / 0)";
    var from, to;
    if (on) {
      var last = frame.getBoundingClientRect();
      var dx = first.left + first.width / 2 - (last.left + last.width / 2), dy = first.top + first.height / 2 - (last.top + last.height / 2);
      from = { "--w": first.width + "px", "--ar": first.height / first.width, "--t": 0, "--u": 0, transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))", boxShadow: NONE };
      to = { "--w": last.width + "px", "--ar": last.height / last.width, "--t": spkGrow, "--u": 1, transform: "translate(-50%, -50%)", boxShadow: SHADOW };
    } else {   // stay in the large layout while shrinking; swap back into the slot only once the sizes match
      var home = slot.getBoundingClientRect();
      var cx = home.left + home.width / 2 - (first.left + first.width / 2), cy = home.top + home.height / 2 - (first.top + first.height / 2);
      from = { "--w": first.width + "px", "--ar": first.height / first.width, "--t": spkGrow, "--u": 1, transform: "translate(-50%, -50%)", boxShadow: SHADOW };
      to = { "--w": home.width + "px", "--ar": home.height / home.width, "--t": 0, "--u": 0, transform: "translate(calc(-50% + " + cx + "px), calc(-50% + " + cy + "px))", boxShadow: NONE };
    }
    frame.classList.add("is-flying");
    var snap = [{ offset: .5, "--t": from["--t"] }, { offset: .5001, "--t": to["--t"] }];   // type/spacing snap once, when the frame is halfway between its two sizes
    var anim = frame.animate([Object.assign({ offset: 0 }, from), snap[0], snap[1], Object.assign({ offset: 1 }, to)], { duration: 380, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "forwards" });   // hold the end values until the classes are swapped, or --u/--t flash back to 1 for a frame
    anim.onfinish = anim.oncancel = function () {
      anim.onfinish = anim.oncancel = null;
      frame.classList.remove("is-flying"); if (!isExpanded) { frame.classList.remove("is-expanded"); frame.style.removeProperty("--ar"); }
      anim.cancel();
    };
  }
  expandBtn.addEventListener("click", function (e) { if (e.detail) expandBtn.blur(); setExpanded(!isExpanded); });
  scrim.addEventListener("click", function () { setExpanded(false); });
  /* Swipe down to dismiss the larger view (touch only; the same thresholds as the doodles lightbox). Guarded so it
     never fights the controls: a swipe that starts on a speaker button or drawer row stays a press, a drag inside the
     drawer's scrolling list scrolls it (it only dismisses from the very top), and sideways or short drags are ignored. */
  var swipeStart = null;
  function swipeBegin(e) {
    swipeStart = null;
    if (!isExpanded || frame.classList.contains("is-flying") || e.touches.length !== 1) return;
    if (e.target.closest && e.target.closest(".spk-btn, .spk-hit, button")) return;
    var list = e.target.closest && e.target.closest(".spk-drawer-body");
    if (list && list.scrollTop > 0) return;
    swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function swipeEnd(e) {
    var s = swipeStart; swipeStart = null;
    if (!s || !isExpanded || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
    if (dy > 80 && dy > Math.abs(dx) * 1.5) setExpanded(false);
  }
  [frame, scrim].forEach(function (el) {
    el.addEventListener("touchstart", swipeBegin, { passive: true });
    el.addEventListener("touchend", swipeEnd, { passive: true });
    el.addEventListener("touchcancel", function () { swipeStart = null; }, { passive: true });
  });
  function fitStage() {   // expanded + open: centre the speaker in the room above the drawer and its tab, never under them
    if (isExpanded && !frame.classList.contains("is-flying")) { syncRatio(); updateGrow(); }   // the window may have been resized or rotated
    var H = frame.offsetHeight, dh = drawer.offsetHeight + 42;
    frame.style.setProperty("--dh", dh + "px"); frame.style.setProperty("--fit", Math.min(isExpanded && phoneView.matches ? 1 : .8, .9 * (H - dh) / (.285 * frame.offsetWidth)).toFixed(3));
  }
  var drawer = $("drawer"), slot = $("slot");
  if (window.ResizeObserver) {
    new ResizeObserver(function () {   // the slot is fluid: --w (px) feeds every size inside the frame, and narrow frames go square
      var w = slot.offsetWidth; slot.style.setProperty("--w", w + "px"); slot.classList.toggle("is-small", w < 360);
    }).observe(slot);
    var fitObserver = new ResizeObserver(fitStage); fitObserver.observe(drawer); fitObserver.observe(frame);
  }
  /* ==========================================================================
     11. Drawer, drawer actions and keyboard shortcuts
     ========================================================================== */
  function setOpen(o) {
    frame.classList.toggle("is-open", o); tab.setAttribute("aria-expanded", String(o));
    if (o) noteInteraction();
  }
  tab.addEventListener("click", function (e) {
    if (e.detail) tab.blur();
    setOpen(!frame.classList.contains("is-open"));
  });
  document.addEventListener("pointerdown", function (e) { if (frame.classList.contains("is-open") && !frame.contains(e.target)) setOpen(false); });
  function afterPower(fn) { if (S.power) fn(); else { powerOn(); later(900, fn); } }   // drawer steps that need the speaker on turn it on first
  function runStep(step) {
    if (step === "power" && pairing()) return;
    markInteracted();
    ensureCtx().then(function () {
      switch (step) {
        case "power": flashTarget(); if (S.power) powerOff(); else powerOn(); break;
        case "pair": flashTarget(); afterPower(startPairing); break;
        case "link": tapTarget("play"); afterPower(startLink); break;
        case "play": tapTarget("play"); pressPlay(); break;
        case "next": case "prev": tapTarget("play"); stepMelody(step === "next" ? 1 : -1); break;
        case "up": tapTarget("up"); pressVol(1); break;
        case "down": tapTarget("down"); pressVol(-1); break;
      }
    });
  }
  document.querySelectorAll(".spk-cols button[data-step]").forEach(function (btn) {
    btn.addEventListener("click", function (e) { if (e.detail) btn.blur(); runStep(btn.dataset.step); });
  });
  var KEYS = { "1": "power", "2": "pair", "3": "link", " ": "play", "+": "up", "=": "up", "-": "down", "_": "down" };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (isExpanded) setExpanded(false); else setOpen(false); return; }
    if (e.key === " " && !S.interacted) return;   // don't take over page scrolling until the visitor has used the speaker
    if (!inView || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === " " && e.target.closest && e.target.closest("button, [role=button]")) return;   // a focused button handles its own Space
    var arrow = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!arrow && (e.repeat || !KEYS[e.key])) return;
    e.preventDefault();
    if (arrow) { markInteracted(); ensureCtx().then(function () { stepMelody(arrow); }); }
    else runStep(KEYS[e.key]);
  });

  /* ==========================================================================
     12. Idle peek: the drawer nudges up once if nobody has touched the speaker
     ========================================================================== */
  var idleTimer = null, inView = false, peeked = false;
  function armIdle() {
    clearTimeout(idleTimer);
    if (!inView || S.interacted || peeked || reduce || frame.classList.contains("is-open")) return;
    idleTimer = setTimeout(function () {
      if (!inView || S.interacted || frame.classList.contains("is-open")) return;
      peeked = true; frame.classList.add("is-peek");
      setTimeout(function () { frame.classList.remove("is-peek"); }, 2600);
    }, 5000);
  }
  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) armIdle(); else clearTimeout(idleTimer); }, { threshold: 0.6 }).observe(frame);

  /* ==========================================================================
     13. Start
     ========================================================================== */
  badgeRest();
  document.addEventListener("visibilitychange", function () { if (document.hidden && S.playing) stopMelody(); });
  hintOn();
  frame.classList.add("is-ready");
})();
