/* Footprint walk: animated trail of footprints.
 *
 * <div class="footprint-walk walk-sw" data-prints="6" aria-hidden="true"></div>
 *   data-prints  count (default 6, max 15 - data-start)
 *   data-start   first print, 0-14 (default 1; 0 is the faded end print)
 *   direction    walk-w | -sw | -s | -se | -e | -ne | -n | -nw (default walk-sw)
 *   size         --u, CSS length per art unit (default 0.364px, ~33px per print)
 *   placement    walk-top-left (the parent must be positioned)
 * Styles are in craft.css. Each print is a sole and a heel layer animated with the Web
 * Animations API, paused while offscreen. */
(function () {
  "use strict";

  var FW = 1284;                 // footprints.svg viewBox width (--prints-w in craft.css)
  var LIFE = 3800;               // ms a print is visible
  var REST = 2500;               // ms pause before the walk repeats
  var GAPS = [650, 800, 600, 900, 600]; // uneven ms between steps, repeated

  // Per print in walking order (0 = faded end print, then solid prints heading left in the art):
  // a/b = horizontal extent in art units; blobs = [origin, clip polygon] in % of the art, sole then heel.
  var PRINTS = [{"a":1198.0,"b":1283.5,"blobs":[["95.6% 65.9%","93.1% 66.8%,93.1% 62.0%,93.6% 59.5%,96.3% 57.3%,97.7% 61.1%,97.9% 71.6%,96.8% 74.5%,94.9% 74.1%"],["99.4% 66.0%","100.0% 62.3%,100.0% 70.0%,98.9% 70.0%,98.7% 63.2%"]]},{"a":1104.5,"b":1197.5,"blobs":[["88.5% 33.3%","90.9% 29.8%,90.9% 37.3%,89.6% 42.7%,86.8% 40.0%,85.8% 34.8%,85.9% 28.6%,87.4% 25.0%,89.4% 24.3%"],["92.3% 37.0%","91.2% 41.1%,91.5% 30.0%,92.9% 30.9%,93.4% 33.6%,93.5% 40.0%,93.2% 42.7%,91.5% 43.4%"]]},{"a":1006.0,"b":1104.0,"blobs":[["80.9% 62.4%","78.1% 64.3%,78.1% 59.3%,78.7% 56.4%,81.5% 53.0%,83.1% 56.1%,83.4% 67.7%,82.6% 70.9%,80.5% 71.6%,78.7% 68.2%"],["84.9% 62.5%","86.2% 59.3%,86.2% 65.7%,85.7% 69.1%,85.0% 70.9%,84.0% 69.3%,83.7% 62.0%,84.0% 55.9%,85.4% 55.0%"]]},{"a":922.0,"b":1011.5,"blobs":[["74.1% 17.5%","71.6% 24.3%,71.7% 18.2%,73.8% 7.7%,75.9% 6.8%,76.5% 11.1%,76.2% 20.7%,75.6% 24.1%,73.5% 27.5%,72.4% 27.3%"],["77.8% 10.1%","78.0% 17.3%,77.2% 17.3%,76.8% 14.5%,76.8% 4.5%,78.3% 3.6%,78.9% 5.9%,79.0% 13.2%"]]},{"a":866.0,"b":955.5,"blobs":[["69.8% 64.4%","69.2% 55.0%,71.5% 53.6%,72.3% 59.3%,72.2% 65.7%,70.3% 73.6%,67.4% 73.6%,67.4% 65.2%"],["73.4% 53.3%","72.0% 54.3%,72.0% 49.3%,72.7% 45.9%,74.2% 46.8%,74.6% 50.5%,74.6% 56.8%,74.0% 61.4%,72.9% 60.9%"]]},{"a":747.0,"b":832.5,"blobs":[["60.5% 35.1%","62.8% 30.0%,62.7% 39.3%,61.7% 42.7%,59.6% 43.6%,57.9% 39.1%,58.2% 32.3%,59.8% 26.8%,62.1% 26.4%"],["64.1% 33.7%","63.2% 37.5%,63.2% 30.9%,63.6% 28.2%,65.0% 30.0%,65.1% 36.1%,64.6% 39.1%"]]},{"a":656.5,"b":749.0,"blobs":[["53.6% 69.1%","50.9% 73.4%,51.1% 66.1%,53.0% 60.5%,55.1% 60.0%,56.0% 65.2%,56.0% 73.6%,54.6% 78.0%,52.4% 77.5%"],["57.3% 64.6%","57.2% 72.0%,56.4% 70.9%,56.2% 61.1%,56.6% 58.2%,58.0% 58.2%,58.5% 60.9%,58.5% 67.5%"]]},{"a":555.5,"b":653.5,"blobs":[["45.8% 41.7%","48.3% 36.1%,48.1% 47.0%,47.3% 50.0%,45.1% 50.9%,43.0% 45.2%,43.3% 38.4%,45.2% 32.5%,47.2% 32.5%"],["49.9% 40.7%","48.6% 45.7%,49.1% 33.0%,50.1% 32.5%,51.1% 36.6%,51.1% 43.9%,50.6% 47.5%,49.4% 48.6%"]]},{"a":475.0,"b":565.0,"blobs":[["39.3% 88.0%","36.8% 86.8%,36.8% 81.6%,37.4% 78.9%,39.7% 79.1%,41.4% 83.6%,41.7% 93.4%,41.2% 98.4%,39.1% 98.0%"],["43.0% 94.6%","44.0% 99.8%,41.9% 99.8%,41.8% 93.6%,42.3% 88.0%,43.1% 87.3%,44.2% 90.7%"]]},{"a":415.0,"b":506.0,"blobs":[["34.7% 42.1%","32.1% 39.5%,32.1% 34.8%,32.4% 33.0%,35.0% 32.5%,37.1% 40.2%,37.3% 46.6%,36.3% 53.0%,34.9% 53.0%,33.2% 48.0%"],["38.3% 52.4%","37.0% 55.5%,37.0% 51.1%,37.9% 44.8%,38.9% 44.3%,39.4% 47.0%,39.6% 54.8%,39.3% 58.4%,37.7% 59.8%"]]},{"a":330.0,"b":414.5,"blobs":[["28.0% 75.1%","26.7% 66.4%,28.5% 66.4%,30.0% 70.5%,30.1% 82.7%,28.1% 84.3%,25.9% 78.2%,25.5% 69.8%"],["31.5% 78.8%","30.6% 81.8%,30.8% 73.6%,31.9% 73.2%,32.4% 75.7%,32.5% 81.1%,32.1% 83.9%,31.2% 84.5%"]]},{"a":248.0,"b":338.5,"blobs":[["21.7% 36.9%","24.2% 34.1%,24.0% 43.2%,23.0% 46.8%,22.0% 46.8%,19.7% 41.4%,19.1% 36.6%,19.1% 31.4%,20.4% 28.2%,22.6% 28.2%"],["25.4% 43.7%","24.7% 36.4%,25.5% 36.4%,26.4% 39.5%,26.6% 47.0%,26.2% 50.0%,24.3% 48.6%,24.3% 40.7%"]]},{"a":141.0,"b":238.0,"blobs":[["13.5% 59.2%","10.7% 59.3%,10.7% 54.5%,11.3% 51.8%,14.2% 50.0%,15.8% 54.5%,16.0% 65.2%,15.3% 68.6%,12.8% 68.2%,11.4% 64.1%"],["17.5% 62.8%","18.8% 59.5%,18.8% 65.9%,18.3% 69.1%,17.7% 70.9%,16.6% 70.0%,16.4% 56.4%,17.9% 55.0%"]]},{"a":71.0,"b":163.0,"blobs":[["7.9% 9.0%","10.4% 4.1%,10.3% 10.5%,9.2% 16.8%,6.3% 18.2%,5.3% 14.3%,5.4% 8.2%,7.5% 0.0%,10.0% 0.0%"],["11.7% 4.9%","12.9% 1.8%,12.7% 10.0%,11.9% 11.8%,10.9% 10.9%,10.6% 0.0%,12.7% 0.0%"]]},{"a":0.0,"b":94.5,"blobs":[["2.5% 51.7%","0.0% 59.1%,0.0% 50.9%,0.1% 50.2%,1.1% 45.0%,1.9% 42.3%,2.7% 41.4%,4.1% 41.4%,4.4% 42.5%,5.0% 48.0%,5.1% 52.0%,5.0% 53.9%,4.8% 55.5%,4.3% 57.7%,3.2% 60.5%,2.8% 61.1%,1.1% 61.4%,0.6% 60.9%"],["6.3% 43.8%","5.6% 36.4%,6.7% 36.4%,7.5% 40.0%,7.5% 47.0%,6.9% 51.8%,5.8% 51.8%,5.0% 45.2%,4.9% 40.2%"]]}];

  // scale at mid-fade / end; the heel shrinks far more than the sole
  var SCALE = {
    sole: { mid: 0.92, end: 0.8 },
    heel: { mid: 0.6, end: 0.35 }
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function keyframes(kind, cycle) {
    var s = SCALE[kind];
    function at(t, o, sc) {
      var f = { offset: t / cycle, opacity: o };
      if (sc != null) f.transform = "scale(" + sc + ")";
      return f;
    }
    return [
      at(0, 0, 1),
      at(300, 1),            // stamp in
      at(1800, 1, 1),        // linger
      at(2600, 0.5, s.mid),  // start to fade + shrink
      at(LIFE, 0, s.end),
      at(cycle, 0, s.end)    // rest before repeating
    ];
  }

  function build(el) {
    var count = parseInt(el.getAttribute("data-prints"), 10) || 6;
    var start = clamp(parseInt(el.getAttribute("data-start"), 10) || 1, 0, PRINTS.length - 1);
    count = clamp(count, 1, PRINTS.length - start);
    var sel = PRINTS.slice(start, start + count);

    // window of the art holding the chosen prints
    var x0 = Infinity, x1 = -Infinity;
    sel.forEach(function (p) { x0 = Math.min(x0, p.a); x1 = Math.max(x1, p.b); });
    x0 -= 4; x1 += 4;
    var ww = x1 - x0;
    el.style.setProperty("--ww", ww.toFixed(1));

    // the inner layer is the whole art, offset so only the window shows
    var inner = document.createElement("div");
    inner.className = "footprint-walk__trail";
    inner.style.left = (-x0 / ww * 100).toFixed(3) + "%";
    inner.style.width = (FW / ww * 100).toFixed(3) + "%";

    // start time per print, and the loop length
    var delays = [], t = 0;
    sel.forEach(function (_, i) { delays.push(t); t += GAPS[i % GAPS.length]; });
    var cycle = delays[delays.length - 1] + LIFE + REST;

    var layers = [];
    sel.forEach(function (p, i) {
      p.blobs.forEach(function (b, j) {
        var kind = j === 0 ? "sole" : "heel";
        var span = document.createElement("span");
        span.className = "footprint-walk__" + kind;
        span.style.clipPath = "polygon(" + b[1] + ")";
        span.style.transformOrigin = b[0];
        inner.appendChild(span);
        layers.push({ el: span, kind: kind, delay: delays[i], index: i, count: sel.length });
      });
    });
    el.appendChild(inner);

    if (reduceMotion || !el.animate) {
      // no motion: a still trail, older prints fainter
      layers.forEach(function (l) {
        l.el.style.opacity = (0.35 + 0.65 * (l.index / Math.max(1, l.count - 1))).toFixed(2);
      });
      return;
    }

    var anims = layers.map(function (l) {
      var a = l.el.animate(keyframes(l.kind, cycle), {
        duration: cycle, delay: l.delay, iterations: Infinity, fill: "backwards"
      });
      a.pause();
      return a;
    });

    // run only while on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var on = entries[entries.length - 1].isIntersecting;
        anims.forEach(function (a) { on ? a.play() : a.pause(); });
      }, { threshold: 0.3 }).observe(el);
    } else {
      anims.forEach(function (a) { a.play(); });
    }
  }

  function init() { document.querySelectorAll(".footprint-walk").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
