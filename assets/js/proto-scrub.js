// Home page Experience Prototyping animation: sizes the wire draw-ins, loops the sequence, and drives the stage-trail scrubber.
  // size each draw-in wire's --len from its rendered length (before the observer below), so it is hidden from the first paint
  const drawWireIds = ['wire-blue1', 'wire-red1', 'wire-red2', 'wire-blue2', 'wire', 'wire1', 'wire2'];
  drawWireIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const len = el.getTotalLength();
      el.style.setProperty('--len', len + 'px');
    }
  });

  // Loop and scrubber. The sequence plays through, holds its final frame, then restarts. proto.css keys every animation off
  // `svg.svg-anim-gate:not(.is-paused)` (also toggled by partials.js), so toggling `.is-paused` on then off restarts them all from their base state.
  // The loop follows the animations' own clock, so it stays in step when someone scrubs. The trail under the animation pauses every
  // animation (Web Animations API) and sets its currentTime; on letting go the frame is held briefly, then playback continues.
  (function () {
    const protoLoop = document.getElementById('proto-loop');
    const scrub = document.getElementById('proto-scrub');
    if (!protoLoop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const END = 13130;   // the latest-finishing entrance (the phone's slide-in) ends here
    const HOLD = 2000;   // hold on the final settled frame (bud + phone) before the loop resets (and fades, see .is-fading)
    const RESUME_MS = 1500;   // how long a scrubbed frame is held before playback continues
    // Each icon marks where its stage begins; Ship marks the end. Tapping an icon jumps to that moment.
    const STAGES = [
      { name: 'Ideate',     at: 0 },        // bulb + stickies
      { name: 'Storyboard', at: 3246 },     // the framed panels
      { name: 'Prototype',  at: 5203 },     // the code types in
      { name: 'Build',      at: 7181 },     // the breadboard and its wires
      { name: 'Ship',       at: END }       // the earbud and the app on the phone, done
    ];
    const LAST = STAGES.length - 1;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const anims = () => protoLoop.getAnimations({ subtree: true });

    let clock = null;   // one animation that never finishes (the cursor blink), so its currentTime is the true elapsed time
    function now() {
      if (!clock || clock.playState === 'idle') {
        clock = anims().find(a => a.effect.getComputedTiming().iterations === Infinity) || null;
      }
      return clock ? clock.currentTime : 0;
    }

    // time <-> position along the trail (0 to 1), icon to icon
    const SECTIONS = STAGES.length - 1;
    function posOf(t) {
      if (t >= END) return 1;
      let i = 0;
      while (i < SECTIONS - 1 && t >= STAGES[i + 1].at) i++;
      return (i + (t - STAGES[i].at) / (STAGES[i + 1].at - STAGES[i].at)) / SECTIONS;
    }
    function timeOf(pos) {
      if (pos >= 1) return END;
      const f = pos * SECTIONS, i = Math.min(SECTIONS - 1, Math.floor(f));
      return STAGES[i].at + (f - i) * (STAGES[i + 1].at - STAGES[i].at);
    }
    // the last icon the playhead has reached (1ms slack)
    function stageOf(t) { let k = 0; STAGES.forEach((s, i) => { if (t + 1 >= s.at) k = i; }); return k; }

    // ---- loop: restart after the hold ----
    let scrubbing = false, resetting = false, raf = 0;
    function restart() {
      resetting = true;
      // fade out, reset while invisible, then reappear already reset (same shape as the video loop-hold in partials.js)
      protoLoop.classList.add('is-fading');
      setTimeout(() => {
        protoLoop.classList.add('is-paused');
        protoLoop.classList.remove('is-fading');
        // re-adding must wait for a real paint, or animations holding via fill-mode:forwards don't restart
        requestAnimationFrame(() => requestAnimationFrame(() => { protoLoop.classList.remove('is-paused'); resetting = false; }));
      }, 400);
    }

    // ---- trail UI ----
    const range = document.getElementById('proto-range');
    const stops = scrub ? scrub.querySelectorAll('.proto-stop') : [];
    function render(t) {
      const k = stageOf(t);
      if (scrub) scrub.style.setProperty('--pos', posOf(t).toFixed(4));
      stops.forEach((el, i) => { el.classList.toggle('is-active', i === k); el.classList.toggle('is-done', i < k); });
      if (range) { range.value = t; range.setAttribute('aria-valuetext', STAGES[k].name); }
    }

    // ---- playhead follows the animation while it plays ----
    function tick() {
      raf = 0;
      if (protoLoop.classList.contains('is-paused')) { render(0); return; }   // out of view (partials.js) or mid-reset: restarts when the class goes away
      const t = now();
      if (!scrubbing && !resetting) {
        render(t);
        if (t >= END + HOLD) restart();
      }
      raf = requestAnimationFrame(tick);
    }
    function startTicking() { if (!raf) raf = requestAnimationFrame(tick); }
    new MutationObserver(startTicking).observe(protoLoop, { attributes: true, attributeFilter: ['class'] });
    startTicking();

    // ---- scrubbing ----
    let resumeTimer = 0;
    function seek(t) {
      const list = anims();
      if (!list.length) return false;
      t = clamp(t, 0, END);
      list.forEach(a => { a.pause(); a.currentTime = t; });
      render(t);
      return true;
    }
    function hold() { scrubbing = true; clearTimeout(resumeTimer); }
    function release() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        scrubbing = false;
        anims().forEach(a => {   // an animation already at its end would restart from 0 on play(), so leave those held
          const end = a.effect.getComputedTiming().endTime;
          if (a.currentTime < end) a.play();
        });
      }, RESUME_MS);
    }

    if (scrub) {
      const trail = scrub.querySelector('.proto-trail');
      const line = scrub.querySelector('.proto-line');
      const posAt = x => { const r = line.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0, 1); };
      let down = false, moved = false, startX = 0, tapStage = -1;
      trail.addEventListener('pointerdown', e => {
        if (e.button || resetting || !anims().length) return;
        down = true; moved = false; startX = e.clientX;
        const stop = e.target.closest('.proto-stop');
        tapStage = stop ? +stop.dataset.stage : -1;
        trail.setPointerCapture(e.pointerId);
        hold();
        if (tapStage < 0) seek(timeOf(posAt(e.clientX)));   // on the line itself: follow the finger straight away
      });
      trail.addEventListener('pointermove', e => {
        if (!down) return;
        if (!moved && Math.abs(e.clientX - startX) > 6) moved = true;
        if (moved || tapStage < 0) seek(timeOf(posAt(e.clientX)));
      });
      const up = () => {
        if (!down) return;
        down = false;
        if (!moved && tapStage >= 0) seek(STAGES[tapStage].at);   // a tap on a stage icon jumps to that moment
        release();
      };
      trail.addEventListener('pointerup', up);
      trail.addEventListener('pointercancel', up);

      // keyboard and screen readers: the hidden range input
      range.addEventListener('input', () => { hold(); seek(+range.value); release(); });
      range.addEventListener('keydown', e => {
        const t = +range.value, k = stageOf(t);
        let to = null;
        if (e.key === 'PageDown') to = STAGES[clamp(k + 1, 0, LAST)].at;   // Page keys step between stages
        else if (e.key === 'PageUp') to = STAGES[clamp(k - 1, 0, LAST)].at;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') to = t + 250;   // arrows nudge a quarter second
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') to = t - 250;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = END;
        if (to === null) return;
        e.preventDefault();
        hold(); seek(to); release();
      });
    }
  })();
