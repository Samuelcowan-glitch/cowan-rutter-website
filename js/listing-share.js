/* Share button on a property's full details page.
 *
 * Uses the phone's own share sheet where there is one, and otherwise copies
 * the property's address to the clipboard and says so on the button itself.
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var btn = document.getElementById('share-property');
    if (!btn) return;

    var label = btn.querySelector('.share-label');
    var original = label ? label.textContent : '';
    var resetTimer = null;

    function say(message) {
      if (!label) return;
      label.textContent = message;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { label.textContent = original; }, 2200);
    }

    function copyFallback(url) {
      // Older browsers, and any page not served over https, where the
      // clipboard API is unavailable.
      var field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:absolute;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(field);
      say(ok ? 'Link copied' : 'Press ⌘C to copy');
      if (!ok) window.prompt('Copy this link:', url);
    }

    btn.addEventListener('click', function () {
      var url = window.location.href;
      var title = document.title;

      if (navigator.share) {
        navigator.share({title: title, url: url}).catch(function () {
          /* the person closed the share sheet — nothing to report */
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          say('Link copied');
        }).catch(function () {
          copyFallback(url);
        });
        return;
      }

      copyFallback(url);
    });
  });
})();
