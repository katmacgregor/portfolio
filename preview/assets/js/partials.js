// The nav and footer are plain HTML, rendered at build time from _includes/nav.njk and footer.njk.
// This only adds their behaviour: the compact nav bar slides in when scrolling up, and the footer
// arrow scrolls back to the top.
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('mini-nav');
  if (bar) {
    let lastY = window.scrollY;
    const threshold = 140;
    let ticking = false;

    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < threshold) {
        bar.classList.remove('is-visible');
      } else if (currentY < lastY) {
        bar.classList.add('is-visible');
      } else if (currentY > lastY) {
        bar.classList.remove('is-visible');
      }
      lastY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  const toTop = document.querySelector('.footer-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Videos only play while actually in view, and pause otherwise.
  const videos = document.querySelectorAll('video');
  if (videos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          // a loop-hold video parks on its last frame and reports ended; play() there is a no-op, so restart it
          if (v.ended) v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach((v) => { videoObserver.observe(v); });
  }

  // data-loop-hold videos rest on their final frame for that many ms, then fade out, seek to the start and fade back in.
  // Only restarts while on screen; otherwise the observer above resumes it from frame one when it returns.
  const holdVideos = document.querySelectorAll('video[data-loop-hold]');
  holdVideos.forEach((v) => {
    v.removeAttribute('loop');
    v.classList.add('loop-hold-fade');
    v.addEventListener('ended', () => {
      const hold = parseInt(v.dataset.loopHold, 10) || 0;
      setTimeout(() => {
        const rect = v.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return;
        v.classList.add('is-fading');
        setTimeout(() => {
          v.currentTime = 0;
          v.play().catch(() => {});
          v.classList.remove('is-fading');
        }, 400);
      }, hold);
    });
  });

  // Fade/rise for content as it scrolls into view. Items entering in the same batch are staggered.
  const revealEls = document.querySelectorAll('.work-media, .work-media--pair, .gallery-entry, .work-entry, .extra-body img, .extra-body video, ' +
    '.text-emphasize p, section > .heading, section > h2, section > h2 + p, .hero__greeting, .hero__rotator, .error-404 > *, .section-intro, .highlights .col, .work-list__row, .about p, .contact');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty('--reveal-i', Math.min(k++, 5));
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => { revealObserver.observe(el); });
  }

  // Lazy images fade in once loaded (CSS hides them until img-loaded; craft handles its own).
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    function show() { img.classList.add('img-loaded'); }
    if (img.complete) show();
    else { img.addEventListener('load', show); img.addEventListener('error', show); }
  });

  // Animated inline <svg> banners run only while in view, and stay paused for reduced motion.
  // .is-paused covers CSS keyframes (main.css); pauseAnimations covers SMIL.
  const animatedSvgs = document.querySelectorAll('svg.svg-anim-gate');
  if (animatedSvgs.length) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    animatedSvgs.forEach((svg) => {
      if (reduceMotion) {
        // CSS already stops the keyframes; stop SMIL too
        if (typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
        return;
      }
      const svgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            svg.classList.remove('is-paused');
            if (typeof svg.unpauseAnimations === 'function') svg.unpauseAnimations();
          } else {
            svg.classList.add('is-paused');
            if (typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
          }
        });
      }, { threshold: 0.2 });
      svgObserver.observe(svg);
    });
  }

  // Doodles masonry: .draw-grid is a CSS Grid with no native masonry packing, so each item's grid-row-end is set
  // from its rendered height, and recomputed on resize.
  const drawGrid = document.querySelector('.draw-grid');
  if (drawGrid) {
    const MASONRY_ROW_UNIT = 1; // px; matches grid-auto-rows in main.css
    const MASONRY_ROW_GAP = 14; // px; matches each item's margin-bottom
    const MASONRY_SETTLE_MS = 260;
    const masonryReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Re-span every item. With `settle`, items that moved glide from their last drawn spot to the new one (FLIP, transform only).
    // `_pos` is each item's last position relative to the grid.
    function sizeMasonryItems(settle) {
      const items = [].filter.call(drawGrid.children, (el) => {
        return !el.classList.contains('doodle-expand');   // the hover button isn't a grid item
      });

      // where each item is on screen right now, including any settle still in flight
      const before = items.map((el) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return el._pos ? { x: el._pos.x + m.e, y: el._pos.y + m.f } : null;
      });
      items.forEach((el) => { el.getAnimations().forEach((a) => { a.cancel(); }); });

      items.forEach((el) => {
        el.style.gridRowEnd = 'span ' + Math.ceil((el.offsetHeight + MASONRY_ROW_GAP) / MASONRY_ROW_UNIT);
      });

      const g = drawGrid.getBoundingClientRect();
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const now = { x: r.left - g.left, y: r.top - g.top };
        el._pos = now;
        const from = before[i];
        if (settle === true && from && !masonryReduceMotion && el.animate &&
            (Math.abs(from.x - now.x) > 1 || Math.abs(from.y - now.y) > 1)) {
          el.animate(
            [{ transform: 'translate(' + (from.x - now.x) + 'px, ' + (from.y - now.y) + 'px)' }, { transform: 'none' }],
            { duration: MASONRY_SETTLE_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
          );
        }
      });
    }
    sizeMasonryItems();
    // re-measure after load and as each image/video resolves, so a stale span can't leave a gap or overlap
    window.addEventListener('load', () => { sizeMasonryItems(); });
    const mediaEls = drawGrid.querySelectorAll('img, video');
    mediaEls.forEach((el) => {
      const evt = el.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
      el.addEventListener(evt, () => { sizeMasonryItems(); });
    });
    // on a width change, re-span in the same frame so nothing overlaps, then settle
    let masonryWidth = drawGrid.clientWidth;
    function onMasonryResize() {
      if (drawGrid.clientWidth === masonryWidth) return;
      masonryWidth = drawGrid.clientWidth;
      sizeMasonryItems(true);
    }
    new ResizeObserver(onMasonryResize).observe(drawGrid);
  }

  // .portkey-link links (e.g. the Hogwarts doodle) get the homepage rotator's portkey launch transition (styles in main.css/craft.css)
  document.querySelectorAll('a.portkey-link').forEach((a) => {
    a.addEventListener('click', () => {
      document.documentElement.classList.add('portkey-launch');
    });
  });

  // Cmd/Ctrl+Right jumps to the next case study (only pages with a .work-next link)
  const nextLink = document.querySelector('.work-next');
  if (nextLink) {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        window.location.href = nextLink.href;
      }
    });
  }

  // Doodles lightbox: click an illustration to see it full size; previous/next, arrow keys and swipe step through them,
  // Escape, the close button or the backdrop close it. The portkey-link video keeps its own click behaviour.
  // With a real pointer, one shared expand button follows the hovered illustration.
  const doodleGrid = document.querySelector('.draw-grid');
  if (doodleGrid) {
    const ICONS = {
      expand: '<path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9"/>',
      collapse: '<path d="M13 7H9V3M9 7l4.5-4.5M3 9h4v4M7 9l-4.5 4.5"/>',
      prev: '<path d="M10 3L5 8l5 5"/>',
      next: '<path d="M6 3l5 5-5 5"/>'
    };
    function iconSvg(name) {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FLY_MS = 320;     // grow from / shrink back to the thumbnail
    const FLY_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    const STEP_MS = 240;    // slide between illustrations
    const STEP_SHIFT = 32;  // px the new image travels

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Illustration viewer');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML =
      '<button class="doodle-ctrl lightbox__close" type="button" aria-label="Close">' + iconSvg('collapse') + '</button>' +
      '<button class="doodle-ctrl lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous illustration">' + iconSvg('prev') + '</button>' +
      '<div class="lightbox__content"></div>' +
      '<button class="doodle-ctrl lightbox__nav lightbox__nav--next" type="button" aria-label="Next illustration">' + iconSvg('next') + '</button>';
    document.body.appendChild(lightbox);

    const lightboxContent = lightbox.querySelector('.lightbox__content');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const lightboxPrev = lightbox.querySelector('.lightbox__nav--prev');
    const lightboxNext = lightbox.querySelector('.lightbox__nav--next');
    const lightboxItems = [];     // the illustrations, in page order
    let lightboxIndex = 0;
    let hiddenThumb = null;     // the thumbnail currently standing in for the open image
    let lastFocused = null;
    let closing = null;         // the shrink-back animation, if one is running

    function fullSrc(el) { return el.getAttribute('data-full') || el.currentSrc || el.src; }

    // thumbnail first (already loaded), then the full-size file fades in over it once decoded; videos open as they are
    function showLightboxItem(index) {
      lightboxIndex = index;
      const el = lightboxItems[index];

      if (hiddenThumb) hiddenThumb.style.visibility = '';
      hiddenThumb = el;
      el.style.visibility = 'hidden';   // the copy in the lightbox stands in for it

      lightboxContent.getAnimations().forEach((a) => { a.cancel(); });
      lightboxContent.innerHTML = '';
      lightboxContent.style.setProperty('--ratio', (el.getAttribute('width') / el.getAttribute('height')) || 1);

      if (el.tagName === 'VIDEO') {
        const video = el.cloneNode(true);
        video.removeAttribute('class');
        video.removeAttribute('style');      // the original was just hidden; don't copy that
        video.removeAttribute('tabindex');
        video.setAttribute('controls', '');
        video.muted = true;
        lightboxContent.appendChild(video);
        video.play().catch(() => {});
      } else {
        const thumb = new Image();
        thumb.alt = el.alt;
        thumb.src = el.currentSrc || el.src;
        lightboxContent.appendChild(thumb);

        if (fullSrc(el) !== thumb.src) {
          const full = new Image();
          full.className = 'lightbox__full';
          full.alt = '';
          full.src = fullSrc(el);
          lightboxContent.appendChild(full);
          if (full.complete) {
            full.classList.add('is-loaded');   // cached: no placeholder phase
          } else {
            // decode before fading so a big image can't stutter mid-fade
            (full.decode ? full.decode() : Promise.resolve()).catch(() => {}).then(() => {
              full.classList.add('is-loaded');
            });
          }
        }
      }

      // preload the neighbours (wrapping at the ends) so stepping is quick
      const count = lightboxItems.length;
      [index - 1, index + 1].forEach((i) => {
        const n = lightboxItems[(i + count) % count];
        if (n && n.tagName === 'IMG') new Image().src = fullSrc(n);
      });
    }

    // FLIP: move the lightbox image between the thumbnail's rect and its own, using transform only
    function flyTransform(fromRect, toRect) {
      const scale = fromRect.width / toRect.width;
      return 'translate(' + (fromRect.left - toRect.left) + 'px, ' + (fromRect.top - toRect.top) + 'px) scale(' + scale + ')';
    }

    function openLightbox(mediaEl) {
      if (closing) { closing.onfinish = null; closing.cancel(); closing = null; }   // reopened mid-shrink
      lastFocused = document.activeElement;
      const thumbRect = mediaEl.getBoundingClientRect();   // measured before the page lock can shift the layout
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-locked');
      showLightboxItem(lightboxItems.indexOf(mediaEl));
      if (!reduceMotion && lightboxContent.animate) {
        lightboxContent.animate(
          [{ transform: flyTransform(thumbRect, lightboxContent.getBoundingClientRect()) }, { transform: 'none' }],
          { duration: FLY_MS, easing: FLY_EASE }
        );
      }
      lightboxClose.focus({ preventScroll: true });
      document.addEventListener('keydown', onLightboxKeydown);
    }

    function closeLightbox() {
      if (!lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-locked');
      document.removeEventListener('keydown', onLightboxKeydown);

      const el = lightboxItems[lightboxIndex];
      function finish() {
        closing = null;
        lightboxContent.innerHTML = '';
        if (hiddenThumb) hiddenThumb.style.visibility = '';
        hiddenThumb = null;
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
      }
      if (reduceMotion || !lightboxContent.animate) { finish(); return; }

      const t = el.getBoundingClientRect();   // after the unlock, i.e. where the thumbnail will be
      const onScreen = t.bottom > 0 && t.top < window.innerHeight && t.right > 0 && t.left < window.innerWidth;
      const frames = onScreen
        ? [{ transform: 'none' }, { transform: flyTransform(t, lightboxContent.getBoundingClientRect()) }]
        : [{ opacity: 1 }, { opacity: 0 }];   // its thumbnail is off-screen: just fade
      closing = lightboxContent.animate(frames, { duration: FLY_MS, easing: FLY_EASE, fill: 'forwards' });
      closing.onfinish = finish;
    }

    function stepLightbox(dir) {
      const count = lightboxItems.length;
      showLightboxItem((lightboxIndex + dir + count) % count);   // loops: past the last illustration comes the first
      // the new image slides in a short way from the direction we're heading (transform + opacity only)
      if (!reduceMotion && lightboxContent.animate) {
        lightboxContent.animate(
          [{ transform: 'translateX(' + dir * STEP_SHIFT + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: STEP_MS, easing: FLY_EASE }
        );
      }
    }

    function onLightboxKeydown(e) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => { stepLightbox(-1); });
    lightboxNext.addEventListener('click', () => { stepLightbox(1); });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // touch: swipe left / right to step, swipe down to close
    let swipeX = 0, swipeY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      swipeX = e.changedTouches[0].clientX;
      swipeY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - swipeX;
      const dy = e.changedTouches[0].clientY - swipeY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) stepLightbox(dx < 0 ? 1 : -1);
      else if (dy > 80 && dy > Math.abs(dx) * 1.5) closeLightbox();
    }, { passive: true });

    doodleGrid.querySelectorAll('img, video').forEach((el) => {
      if (el.closest('.portkey-link')) return;
      lightboxItems.push(el);
      el.classList.add('lightbox-trigger');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => { openLightbox(el); });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(el);
        }
      });
    });

    // hover affordance: a small expand button in the corner of the illustration under the pointer
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const expandBtn = document.createElement('button');
      expandBtn.className = 'doodle-ctrl doodle-expand';
      expandBtn.type = 'button';
      expandBtn.tabIndex = -1;                 // keyboard users open an illustration with Enter on the image itself
      expandBtn.setAttribute('aria-hidden', 'true');
      expandBtn.innerHTML = iconSvg('expand');
      doodleGrid.appendChild(expandBtn);

      let hoverEl = null, hoverHideTimer;
      function showExpand(el) {
        clearTimeout(hoverHideTimer);
        hoverEl = el;
        expandBtn.style.left = (el.offsetLeft + el.offsetWidth - expandBtn.offsetWidth - 10) + 'px';
        expandBtn.style.top = (el.offsetTop + 10) + 'px';
        expandBtn.classList.add('is-visible');
      }
      function hideExpand() {
        hoverHideTimer = setTimeout(() => {
          hoverEl = null;
          expandBtn.classList.remove('is-visible');
        }, 60);   // short grace so moving from the image onto its button doesn't flicker
      }
      doodleGrid.addEventListener('mouseover', (e) => {
        const el = e.target.closest('.lightbox-trigger');
        if (el) showExpand(el);
      });
      doodleGrid.addEventListener('mouseout', (e) => {
        if (e.target.closest('.lightbox-trigger')) hideExpand();
      });
      expandBtn.addEventListener('mouseenter', () => { clearTimeout(hoverHideTimer); });
      expandBtn.addEventListener('mouseleave', hideExpand);
      expandBtn.addEventListener('click', () => { if (hoverEl) openLightbox(hoverEl); });
      window.addEventListener('resize', () => { expandBtn.classList.remove('is-visible'); });
    }
  }
});

// Page transitions: the arriving page's nav is its own view-transition layer and shows at full
// opacity from the first frame (see main.css), so only the content cross-fades and the nav never
// blinks. Skipped for #hash links (the page scrolls away from the nav right after landing) and for
// the craft page, whose portkey reveal needs everything under the iris.
(function () {
  if (!("onpagereveal" in window)) return;
  window.addEventListener("pagereveal", (e) => {
    const nav = document.querySelector("site-nav > .nav");
    if (!e.viewTransition || !nav || location.hash || window.scrollY > 8) return;
    if (document.body && document.body.classList.contains("craft-page")) return;
    nav.style.viewTransitionName = "site-nav";
    e.viewTransition.finished.finally(() => { nav.style.viewTransitionName = ""; });
  });
})();

(function () {
// Case-study headings rise in letter by letter, the same push the hero rotator uses.
// Respects reduced motion; the heading keeps its text for assistive tech.
function buildRiseHeading() {
  const h1 = document.querySelector(".work-header h1");
  if (!h1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const text = h1.textContent;
  h1.setAttribute("aria-label", text);
  const clip = document.createElement("span");
  clip.className = "rise-clip";
  clip.setAttribute("aria-hidden", "true");
  text.split("").forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "rise-char";
    s.style.setProperty("--i", i);
    s.textContent = ch === " " ? "\u00a0" : ch;
    clip.appendChild(s);
  });
  h1.textContent = "";
  h1.appendChild(clip);
}

// Banner fades must start after the page is actually on screen: a class added before the first
// paint has no earlier style to transition from, and during a page transition the new page is
// still fading in. "revealed" resolves after the view transition (if any) and two frames.
const revealed = new Promise((resolve) => {
  function go() { requestAnimationFrame(() => { requestAnimationFrame(resolve); }); }
  if ("onpagereveal" in window) {
    window.addEventListener("pagereveal", (e) => {
      if (e.viewTransition) e.viewTransition.finished.then(go, go); else go();
    }, { once: true });
    setTimeout(go, 1500); // safety net
  } else {
    go();
  }
});

function whenDecoded(imgs) {
  return Promise.all(imgs.map((i) => {
    return (i.decode ? i.decode() : Promise.resolve()).catch(() => {});
  }));
}

function fadeInBanners() {
  // image banners: fade the image in over its tinted frame
  document.querySelectorAll(".work-banner-frame > img").forEach((img) => {
    Promise.all([revealed, whenDecoded([img])]).then(() => { img.classList.add("is-loaded"); });
  });
  // multi-layer and inline-SVG banners: lift a tinted cover instead (no opacity on animated layers)
  document.querySelectorAll(".work-banner-fade, .work-banner-frame--svg").forEach((box) => {
    const imgs = Array.prototype.slice.call(box.querySelectorAll("img"));
    Promise.all([revealed, whenDecoded(imgs)]).then(() => { box.classList.add("is-loaded"); });
  });
}

// This script loads synchronously in <head> so the nav and footer exist for the first paint.
// The heading stays hidden (see main.css) until its letters are built, then is revealed.
document.documentElement.classList.add("has-js");
document.addEventListener("DOMContentLoaded", () => {
  buildRiseHeading();
  fadeInBanners();
  document.documentElement.classList.add("rise-ready");
});
})();
