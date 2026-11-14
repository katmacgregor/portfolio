// Star Wars case study: loops the lightsaber/flair demo while it is on screen.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = document.querySelector(".starwars-flair-demo");
  if (!stage) return;

  if (reduceMotion) {
    const reduceEls = stage.querySelectorAll(".dash, #notch-example, #flair-example, #flair-highlight");
    reduceEls.forEach((el) => { el.style.opacity = "1"; });
    return;
  }

  const sleep = function (ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); };

  function getDashesSortedByOrder(groupId) {
    const dashes = Array.prototype.slice.call(stage.querySelectorAll("#" + groupId + " .dash"));
    dashes.sort((a, b) => { return (+a.dataset.o) - (+b.dataset.o); });
    return dashes;
  }

  async function revealDashes(groupId, duration) {
    const dashes = getDashesSortedByOrder(groupId);
    if (dashes.length === 0) return;
    const step = duration / dashes.length;
    for (let i = 0; i < dashes.length; i++) {
      dashes[i].style.opacity = "1";
      await sleep(step);
    }
  }

  async function fadeIn(el, duration) {
    if (!el) return;
    el.style.transitionDuration = duration + "ms";
    el.style.opacity = "1";
    await sleep(duration);
  }

  async function resetScene() {
    const els = Array.prototype.slice.call(
      stage.querySelectorAll("#notch-focus .dash, #notch-line .dash, #flair-focus .dash, #flair-line .dash")
    ).concat([
      stage.querySelector("#notch-example"),
      stage.querySelector("#flair-example"),
      stage.querySelector("#flair-highlight")
    ]).filter(Boolean);

    els.forEach((el) => {
      el.style.transitionDuration = "250ms";
      el.style.opacity = "0";
    });
    await sleep(250);
    els.forEach((el) => { el.style.transitionDuration = ""; });
  }

  async function playOnce() {
    await resetScene();
    await sleep(60);

    await revealDashes("notch-focus", 650);
    await revealDashes("notch-line", 550);
    await fadeIn(stage.querySelector("#notch-example"), 700);

    await sleep(100);

    await revealDashes("flair-focus", 650);
    await revealDashes("flair-line", 350);
    await fadeIn(stage.querySelector("#flair-example"), 700);
    await fadeIn(stage.querySelector("#flair-highlight"), 250);

    await sleep(2000);
  }

  let running = false;
  async function loop() {
    if (running) return;
    running = true;
    while (running) {
      await playOnce();
    }
  }

  function stop() { running = false; }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) loop();
      else stop();
    });
  }, { threshold: 0.2 });
  observer.observe(stage);
})();
