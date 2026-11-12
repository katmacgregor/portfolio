/* Beats app walkthrough: one timeline (ms) drives every layer of the [data-beats-app] stage
   (markup: _includes/beats-app.html, styles and colour tokens: beats-app.css). Plays once when mostly in view, then rests; the button replays. */
(function () {
  'use strict';

  var TOTAL = 18500;
  var LOOPS = 1;

  // Beat sheet in ms; tap and pill coordinates are in the Android screen's 1080x2340 space.
  var T = {
    zoomIn: [1000, 2000],
    pairUp: [2300, 2900],
    tapSave: 3500,
    toSetup: [3800, 4100],
    tapSetUp: 5000,
    toStarting: [5300, 5600],
    tapStartDone: 6150,
    sheetDown: [6600, 7100],
    tip1Up: [6800, 7400],
    tip1Clip: 7400,
    tapNext: 10300,
    tipSwap: [10600, 11200],
    tip2Clip: 11200,
    tapDone: 15200,
    tipsDown: [15600, 16100],
    zoomOut: [16800, 17800]
  };
  var CLIP1_END = 2.6, CLIP2_END = 3.93;   // s: stop before the recording's own card slide
  var TAPS = [[T.tapSave, 888, 2084], [T.tapSetUp, 884, 2084], [T.tapStartDone, 192, 2084], [T.tapNext, 540, 1920], [T.tapDone, 540, 1920]];
  var TAP_MS = 450;

  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var out = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };

  function init(root) {
    var el = function (n) { return root.querySelector('[data-beats-app-el="' + n + '"]'); };
    var pair = el('pair'), ios = el('ios'), android = el('android'), ctl = el('ctl'), tap = el('tap');
    var sheets = [el('sheet-pair'), el('sheet-setup'), el('sheet-starting')];
    var sPair = sheets[0], sSetup = sheets[1], sStart = sheets[2];
    var blur = el('blur'), gfx = el('gfx'), nav = el('nav'), navIcons = nav.firstElementChild;
    var pager = el('pager'), pillA = el('pill-a'), pillB = el('pill-b'), tip1 = el('tip1'), tip2 = el('tip2');
    var V1 = el('video-1'), V2 = el('video-2');

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t = reduced ? 8800 : 0, playing = false, ended = reduced, loops = 0, last = 0, visible = false;

    var C = {};
    var probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    function readColor(token) {   // token -> [r, g, b, a]; the token must resolve to rgb()/rgba()/hex
      probe.style.color = 'var(' + token + ')';
      root.appendChild(probe);
      var m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
      root.removeChild(probe);
      return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1];
    }
    function readColors() {
      ['nav-home', 'nav-sheet', 'nav-dark', 'nav-icon-home', 'nav-icon-sheet', 'nav-icon-dark', 'pager-on', 'pager-off']
        .forEach(function (n) { C[n] = readColor('--beats-app-' + n); });
    }
    var blend = function (a, b, c, wa, wb, wc) {
      var o = [0, 1, 2, 3].map(function (i) { return a[i] * wa + b[i] * wb + c[i] * wc; });
      return 'rgba(' + Math.round(o[0]) + ',' + Math.round(o[1]) + ',' + Math.round(o[2]) + ',' + o[3].toFixed(3) + ')';
    };

    function render(now) {
      var z = out(seg(now, T.zoomIn[0], T.zoomIn[1])) * (1 - inOut(seg(now, T.zoomOut[0], T.zoomOut[1])));
      pair.style.transform = 'translateX(' + (-14.9 * z) + 'cqw)';
      ios.style.opacity = 1 - 0.8 * z;
      ios.style.transform = 'translate(' + (-20 * z) + '%, ' + (40 * z) + '%)';
      android.style.transform = 'translateY(' + (-22.75 * z) + '%) scale(' + (1 + 0.475 * z) + ')';

      var up = out(seg(now, T.pairUp[0], T.pairUp[1]));
      var setupP = seg(now, T.toSetup[0], T.toSetup[1]), startP = seg(now, T.toStarting[0], T.toStarting[1]);
      var sheetY = 'translateY(' + (1 - up) * 100 + '%)';
      sPair.style.opacity = setupP < 1 ? 1 : 0;   // the next sheet fades in on top, then the old one drops out
      sSetup.style.opacity = up > 0 ? (startP < 1 ? setupP : 0) : 0;
      sStart.style.opacity = startP;

      var down = inOut(seg(now, T.sheetDown[0], T.sheetDown[1]));
      if (down > 0) { sheetY = 'translateY(' + down * 100 + '%)'; sPair.style.opacity = 0; sSetup.style.opacity = 0; sStart.style.opacity = 1; }
      sheets.forEach(function (s) { s.style.transform = sheetY; });
      sStart.style.visibility = down >= 1 ? 'hidden' : 'visible';
      gfx.style.transform = sheetY;
      gfx.style.visibility = up > 0 && down < 1 ? 'visible' : 'hidden';

      var t1 = out(seg(now, T.tip1Up[0], T.tip1Up[1])), swap = inOut(seg(now, T.tipSwap[0], T.tipSwap[1]));
      var tipsOut = inOut(seg(now, T.tipsDown[0], T.tipsDown[1]));
      var lift = (1 - t1) * 100 + tipsOut * 100;
      var tipsOn = now >= T.tip1Up[0] && tipsOut < 1 ? 1 : 0;
      tip1.style.transform = 'translate(' + (-swap * 100) + '%, ' + lift + '%)';
      tip2.style.transform = 'translate(' + ((1 - swap) * 100) + '%, ' + lift + '%)';
      tip1.style.opacity = tip2.style.opacity = tipsOn;
      blur.style.opacity = up * (1 - tipsOut);

      // nav colours: home -> white sheet -> blurred dark -> home
      var wS = up * (1 - down), wD = down * (1 - tipsOut), wH = 1 - wS - wD;
      nav.style.backgroundColor = blend(C['nav-home'], C['nav-sheet'], C['nav-dark'], wH, wS, wD);
      navIcons.style.stroke = blend(C['nav-icon-home'], C['nav-icon-sheet'], C['nav-icon-dark'], wH, wS, wD);

      // pager pills trade widths (70 <-> 39 px of 1080) and shades during the swap
      pager.style.opacity = tipsOn;
      pager.style.transform = 'translateY(' + lift + '%)';
      var wA = 6.48 - 2.87 * swap, wB = 3.61 + 2.87 * swap;
      pillA.style.cssText = 'left:43.89%;width:' + wA + '%;background:' + blend(C['pager-on'], C['pager-off'], C['pager-off'], 1 - swap, swap, 0);
      pillB.style.cssText = 'left:' + (56.11 - wB) + '%;width:' + wB + '%;background:' + blend(C['pager-off'], C['pager-on'], C['pager-on'], 1 - swap, swap, 0);

      var on = null;
      TAPS.forEach(function (k) { if (now >= k[0] && now < k[0] + TAP_MS) on = [(now - k[0]) / TAP_MS, k[1], k[2]]; });
      if (on) {
        var p = on[0];
        tap.style.left = (on[1] / 1080 * 100) + '%';
        tap.style.top = (on[2] / 2340 * 100) + '%';
        tap.style.opacity = p < .25 ? p * 4 * .9 : .9 * (1 - (p - .25) / .75);
        tap.style.transform = 'translate(-50%,-50%) scale(' + (p < .25 ? .6 + p * 1.6 : 1 + (p - .25) * .6) + ')';
      } else tap.style.opacity = 0;

      syncVideo(V1, now - T.tip1Clip, CLIP1_END);
      syncVideo(V2, now - T.tip2Clip, CLIP2_END);
    }

    // clips play natively while the timeline runs (seek only on drift or scrub) and hold their first/last frame outside the window
    function syncVideo(v, ms, end) {
      if (!v.duration) return;
      if (useClips && ms > -2000 && ms <= 0 && v.readyState < 3 && v.paused && !v.primed) {   // iOS only buffers a clip once asked to play
        v.primed = true; v.play().then(function () { v.pause(); }).catch(function () {});
      }
      var want = Math.min(end, Math.max(0, ms / 1000));
      var live = playing && visible && ms > 0 && want < end;
      if (live) {
        if (!v.seeking && Math.abs(v.currentTime - want) > .4) v.currentTime = want;   // seeking on small drift makes mobile decoders stutter
        if (v.paused) v.play().catch(function () {});
      } else {
        if (!v.paused) v.pause();
        if (Math.abs(v.currentTime - want) > .02) v.currentTime = want;
      }
    }

    // if a clip is short of data while it should be playing (at its start or mid-clip), hold the timeline (1.5 s in total at most) instead of letting it freeze
    var held = 0;
    function clipReady(v, startMs, endSec) {
      if (!useClips || !v.src || v.error || (v.readyState >= 3 && !v.seeking)) return true;
      return !(t >= startMs - 60 && t < startMs + endSec * 1000);
    }

    function label() {
      var state = ended ? 'replay' : playing ? 'pause' : 'play';
      ctl.dataset.state = state;
      ctl.setAttribute('aria-label', state.charAt(0).toUpperCase() + state.slice(1) + ' animation');
      tick();
    }
    function tick() {
      if (root.hasAttribute('data-beats-app-debug')) root.dispatchEvent(new CustomEvent('beats-app:tick', { detail: { t: t, playing: playing, ended: ended } }));
    }
    function set(v) { t = v; render(t); tick(); }
    function toggle() {
      if (ended) { ended = false; loops = 0; held = 0; playing = true; set(0); }
      else playing = !playing;
      label();
    }
    function frame(now) {
      if (playing && visible) {
        var dt = now - last;
        if (held < 1500 && !(clipReady(V1, T.tip1Clip, CLIP1_END) && clipReady(V2, T.tip2Clip, CLIP2_END))) { held += dt; dt = 0; }
        t += dt;
        if (t >= TOTAL) {
          if (++loops >= LOOPS) { playing = false; ended = true; label(); t = 0; }
          else t -= TOTAL;
        }
        set(t);
      }
      last = now;
      requestAnimationFrame(frame);
    }

    ctl.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    root.addEventListener('click', toggle);   // clicking anywhere on the stage toggles, like a video; the button is for keyboards
    // autoplay once when mostly in view; pause while off-screen
    var started = reduced;
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible && !started) { started = true; playing = true; label(); }
    }, { threshold: .5 }).observe(root);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); render(t); });

    // hook for the sandbox scrubber and scripted tests
    root.beatsApp = { total: TOTAL, seek: function (ms) { playing = false; label(); set(ms); }, toggle: toggle, get time() { return t; } };

    function start() {
      readColors(); set(t); label();
      root.classList.add('is-ready');
      requestAnimationFrame(function (n) { last = n; frame(n); });
    }

    // nothing is fetched until the stage is within 800px of the viewport; then images go eager, clips get their src
    // (skipped for reduced motion and Save-Data: the still tip cards stand in) and the timeline starts once all have decoded
    var saveData = navigator.connection && navigator.connection.saveData;
    var useClips = !reduced && !saveData;
    var armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      var imgs = [].slice.call(root.querySelectorAll('img'));
      imgs.forEach(function (i) { i.loading = 'eager'; });
      var waits = imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; });
      if (useClips) [V1, V2].forEach(function (v) {
        waits.push(new Promise(function (resolve) {
          ['loadedmetadata', 'error'].forEach(function (ev) { v.addEventListener(ev, resolve, { once: true }); });
          setTimeout(resolve, 5000);   // don't let a slow or unsupported clip block the start
        }));
        v.preload = 'auto'; v.src = v.dataset.src;
      });
      Promise.all(waits).then(start);
    }
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { arm(); near.disconnect(); } }, { rootMargin: '800px 0px' });
      near.observe(root);
    } else arm();
  }

  [].forEach.call(document.querySelectorAll('[data-beats-app]'), init);
})();
