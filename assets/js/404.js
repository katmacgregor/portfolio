// 404 page: clicking "home" plays three taps of the slippers, then navigates.
(function () {
  var homeLink = document.querySelector(".error-404__message a");
  var wrapper = document.querySelector(".error-404__slippers");
  var slipperBg = document.getElementById("slipper-bg");
  if (!homeLink || !wrapper || !slipperBg) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clicked = false;

  homeLink.addEventListener("click", function (e) {
    if (clicked || reduceMotion) return;
    e.preventDefault();
    clicked = true;
    wrapper.classList.add("slippers-clicked");

    // a timer, not animationend: the sparkle children's own animationend events bubble up and fire early
    setTimeout(function () {
      window.location.href = homeLink.href;
    }, 2150);
  });
})();
