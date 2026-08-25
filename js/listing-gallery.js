/* Photo gallery on a property's full details page.
 *
 * Steps through the photographs already uploaded against that property — the
 * same images the page is built with, read straight out of the markup, so
 * there is no second copy of the image data anywhere.
 *
 * Arrows, thumbnails, keyboard arrows and a swipe all move the same index,
 * and it loops from the last photograph back to the first.
 */
(function () {
  'use strict';

  function init(frame) {
    var main   = frame.querySelector('.lg-main');
    var prev   = frame.querySelector('.lg-prev');
    var next   = frame.querySelector('.lg-next');
    var count  = frame.querySelector('.lg-count');
    var thumbs = Array.prototype.slice.call(
      (frame.parentNode || document).querySelectorAll('.lg-thumb'));

    var shots;
    try {
      shots = JSON.parse(frame.getAttribute('data-photos') || '[]');
    } catch (e) {
      shots = [];
    }
    if (!main || shots.length < 2) return;   // one photograph needs no controls

    var i = 0;

    function show(n) {
      i = (n + shots.length) % shots.length;          // loop both ways
      main.src = shots[i];
      main.alt = main.getAttribute('data-alt-base') + ' — photograph ' + (i + 1) +
                 ' of ' + shots.length;
      if (count) count.textContent = (i + 1) + ' / ' + shots.length;
      thumbs.forEach(function (t, n2) { t.classList.toggle('is-current', n2 === i); });
      preload(i + 1); preload(i - 1);
    }

    function preload(n) {
      var url = shots[(n + shots.length) % shots.length];
      if (url) { var img = new Image(); img.src = url; }
    }

    if (prev) prev.addEventListener('click', function () { show(i - 1); });
    if (next) next.addEventListener('click', function () { show(i + 1); });

    thumbs.forEach(function (t, n) {
      t.addEventListener('click', function (e) { e.preventDefault(); show(n); });
    });

    frame.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
    });

    // Swipe, for phones.
    var startX = null, startY = null;
    frame.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, {passive: true});
    frame.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      // Horizontal, and clearly a swipe rather than a scroll or a tap.
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1));
      startX = startY = null;
    }, {passive: true});

    show(0);
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('.lg-frame'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
