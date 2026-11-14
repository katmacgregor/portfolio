/* Beats 360 cushion carousel (markup: _includes/beats-360.html, layout and tokens: beats-360.css).
   The cushions take turns locking onto a stationary frame; one change plays as travel, scale up, twist in, rest, twist out, scale down.
   The copy under the stage has one line per cushion. Autoplay runs through the lines once while in view and rests on the last.
   The button pauses, resumes or replays; a drag, key press or pager click also takes control. */
(function () {
  'use strict';

  const HOLD = 2500;     // ms a cushion rests locked before the next change starts
  const SCALE = 300;     // ms to scale up (and back down); sizes: --beats-360-rest-scale and --beats-360-rest-drop in the CSS
  const TWIST = 420;     // ms to twist into place (and back out); angle: --beats-360-twist in the CSS
  const TRAVEL = 120;    // ms time constant of the ease while travelling
  const SLOP = 5;        // px a press must move before it counts as a drag (a tap leaves autoplay alone)
  const FLICK = 160;     // ms of release velocity projected onto where a swipe lands
  const UNLOCK = 8;      // unlock speed multiplier while dragging, so the cushion follows the finger

  function init(root) {
    const stage = root.querySelector('[data-beats-360-stage]');
    const items = [].slice.call(root.querySelectorAll('[data-beats-360-item]'));
    const lines = [].slice.call(root.querySelectorAll('[data-beats-360-line]'));
    const callout = root.querySelector('[data-beats-360-callout]');
    const foot = root.querySelector('[data-beats-360-foot]');
    const dots = [].slice.call(root.querySelectorAll('[data-beats-360-dot]'));
    const N = items.length;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const first = Math.max(0, items.indexOf(root.querySelector('[data-beats-360-start]')));   // the cushion that starts on the frame
    let pos = first, target = first;       // travel in cushions: fractional while moving
    let P = reduced ? SCALE + TWIST : 0;   // engagement in ms: 0 free to travel, SCALE scaled up, SCALE + TWIST locked. Starts at 0 so the intro plays on first sight
    const control = root.querySelector('[data-beats-360-control]');
    let raf = 0, last = 0, timer = 0, visible = false, auto = !reduced, controlState = '';
    let drag = null, quick = false, moved = !reduced, begun = reduced;

    const wrap = function (d) { return d - N * Math.round(d / N); };
    const mod = function (n) { return ((n % N) + N) % N; };
    const clamp = function (x) { return Math.min(1, Math.max(0, x)); };
    const ease = function (x) { return x * x * (3 - 2 * x); };
    let pitch = 0;                // px between cushions (--beats-360-pitch is cqw), measured on resize
    function measurePitch() { pitch = parseFloat(getComputedStyle(stage).getPropertyValue('--beats-360-pitch')) / 100 * stage.clientWidth; }

    let shownNow = -1, landedNow = '';
    function render() {
      const up = ease(clamp(P / SCALE));                 // scaled up
      const turn = 1 - ease(clamp((P - SCALE) / TWIST)); // 0 twisted into place, 1 twisted out
      items.forEach((el, i) => {
        const d = wrap(i - pos);
        // scale and twist belong to the cushion on the frame; w fades them out as it leaves
        const w = ease(clamp(1 - Math.abs(d) * 2));
        el.style.setProperty('--d', d);
        el.style.setProperty('--z', (up * w));
        el.style.setProperty('--k', (1 - (1 - turn) * w));
      });
      const landed = (1 - turn).toFixed(3);
      if (landed !== landedNow) { landedNow = landed; root.style.setProperty('--landed', landed); }
      const shown = mod(Math.round(pos) - first);        // dots and lines run in story order from the starting cushion
      label(shown);
      if (shown === shownNow) return;
      shownNow = shown;
      dots.forEach((d, i) => { d.setAttribute('aria-current', i === shown ? 'true' : 'false'); });
      lines.forEach((p, i) => {
        p.classList.toggle('is-active', i === shown);
        p.setAttribute('aria-hidden', i === shown ? 'false' : 'true');
      });
    }

    // button states: pause while playing, play to resume, replay at the last line
    function label(shown) {
      const state = auto ? 'pause' : shown === N - 1 ? 'replay' : 'play';
      if (!control || state === controlState) return;
      controlState = state;
      control.dataset.state = state;
      control.setAttribute('aria-label', state.charAt(0).toUpperCase() + state.slice(1) + ' animation');
    }

    function frame(now) {
      const dt = Math.min(now - last, 64);
      last = now;
      const settled = !drag && pos === target;
      // engage once travel has stopped; unlock fully before travel starts
      P = settled ? Math.min(SCALE + TWIST, P + dt) : Math.max(0, P - dt * (quick ? UNLOCK : 1));
      if (!drag && P < 16) {
        pos += (target - pos) * (1 - Math.exp(-dt / TRAVEL));
        if (Math.abs(target - pos) < .004) pos = target;
      }
      render();
      if (!drag && pos === target && P === SCALE + TWIST) { raf = 0; if (moved) lock(); }
      else raf = requestAnimationFrame(frame);
    }
    function tintTo(i) {               // flood colour = the cushion on the frame; CSS blends it
      const cs = getComputedStyle(items[i]);
      stage.style.setProperty('--beats-360-flood', 'rgb(' + cs.getPropertyValue('--beats-360-tint').trim() + ' / ' + cs.getPropertyValue('--beats-360-tint-strength').trim() + ')');
    }
    function lock() {
      moved = false; quick = false;
      const el = items[mod(Math.round(pos))];
      tintTo(mod(Math.round(pos)));
      el.classList.remove('is-locking'); void el.offsetWidth; el.classList.add('is-locking');
      if (!auto && navigator.vibrate) navigator.vibrate(8);   // a tiny haptic click where supported
      if (!auto) return;
      if (mod(Math.round(pos) - first) === N - 1) { auto = false; label(N - 1); }   // last line: rest
      else schedule(HOLD);
    }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    function go(to) { target = to; moved = true; wake(); }
    // autoplay: the next change starts HOLD ms after a lock, only while on screen and the tab is visible
    function schedule(ms) {
      clearTimeout(timer);
      if (auto && visible) timer = setTimeout(() => {
        if (document.hidden) return schedule(ms);
        go(target + 1);
      }, ms);
    }
    function takeOver() {              // the user is driving now
      auto = false; clearTimeout(timer);
      if (callout) callout.setAttribute('aria-live', 'polite');
      render();
    }
    function toggle() {
      if (auto) return takeOver();
      auto = true;
      if (mod(Math.round(target) - first) === N - 1) go(Math.round(target) + 1);   // replay
      else schedule(600);                                            // resume
      render();
    }
    if (control) control.addEventListener('click', toggle);

    // drag / swipe: a press becomes a drag only after SLOP px
    let press = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.button || e.target.closest('[data-beats-360-dot], [data-beats-360-control]')) return;
      press = { x: e.clientX, id: e.pointerId };
    });
    stage.addEventListener('pointermove', (e) => {
      if (!drag && press && e.pointerId === press.id && Math.abs(e.clientX - press.x) > SLOP) {
        takeOver();
        quick = true;
        drag = { x: e.clientX, pos: pos, v: 0, t: e.timeStamp, id: e.pointerId };
        root.classList.add('is-dragging');
        stage.setPointerCapture(e.pointerId);
        wake();
      }
      if (!drag || e.pointerId !== drag.id) return;
      const next = drag.pos - (e.clientX - drag.x) / pitch;
      const dt = e.timeStamp - drag.t;
      if (dt > 0) drag.v = .8 * drag.v + .2 * (next - pos) / dt;   // cushions per ms, smoothed
      drag.t = e.timeStamp;
      pos = target = next; moved = true;
    });
    function release(e) {
      if (press && e.pointerId === press.id) press = null;
      if (!drag || e.pointerId !== drag.id) return;
      const v = drag.v;
      drag = null;
      root.classList.remove('is-dragging');
      go(Math.round(pos + Math.max(-1, Math.min(1, v * FLICK))));
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);

    // keyboard and pager
    stage.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); takeOver();
      go(Math.round(target) + (e.key === 'ArrowRight' ? 1 : -1));
    });
    dots.forEach((d, i) => {
      d.addEventListener('click', () => { takeOver(); go(Math.round(target) + wrap(first + i - Math.round(target))); });
    });

    new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible && !begun) { begun = true; wake(); }   // first sight: the intro, then lock() starts autoplay
      else if (visible) schedule(HOLD); else clearTimeout(timer);
    }, { threshold: .5 }).observe(stage);

    measurePitch();
    new ResizeObserver(measurePitch).observe(stage);

    // the art fits above the pager and copy, whose height follows the stage width
    function measureFoot() { stage.style.setProperty('--beats-360-foot', foot.offsetHeight + 'px'); }
    if (foot) {
      measureFoot();
      new ResizeObserver(measureFoot).observe(foot);
    }

    if (reduced) tintTo(first);
    render();
  }

  [].forEach.call(document.querySelectorAll('[data-beats-360]'), init);
})();
