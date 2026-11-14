// 404 page: clicking "home" plays three taps of the slippers, then navigates.
(function () {
  const homeLink = document.querySelector(".error-404__message a");
  const wrapper = document.querySelector(".error-404__slippers");
  const slipperBg = document.getElementById("slipper-bg");
  if (!homeLink || !wrapper || !slipperBg) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let clicked = false;

  homeLink.addEventListener("click", (e) => {
    if (clicked || reduceMotion) return;
    e.preventDefault();
    clicked = true;
    wrapper.classList.add("slippers-clicked");

    // a timer, not animationend: the sparkle children's own animationend events bubble up and fire early
    setTimeout(() => {
      window.location.href = homeLink.href;
    }, 2150);
  });
})();
