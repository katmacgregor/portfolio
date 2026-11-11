// 404 page: clicking "home" plays three taps of the slippers, then navigates.
(function () {
  var homeLink = document.querySelector(".error-404__message a");
  var wrapper = document.querySelector(".error-404__slippers");
  var slipperBg = document.getElementById("slipper-bg");
  if (!homeLink || !wrapper || !slipperBg) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clicked = false;

  homeLink.addEventListener("click", function (e) {
    if (clicked) return;
    if (reduceMotion) return;
    e.preventDefault();
    clicked = true;
    wrapper.classList.add("slippers-clicked");

    // animationend was firing almost immediately instead of after the
    // full sequence — #sparkle and #sparkle1 are descendants of
    // #slipper-bg, so their own animationend events bubble up to this
    // same listener, and with three separate 0.6s×3 animations sharing
    // one handler the first one to resolve fires it early. A plain
    // timer matched to the known animation length (3 taps × 0.6s) is
    // simpler and has no bubbling ambiguity to get wrong.
    setTimeout(function () {
      window.location.href = homeLink.href;
    }, 2150);
  });
})();
