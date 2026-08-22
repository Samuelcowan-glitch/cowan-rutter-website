/* Site analytics loader.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  TO TURN TRACKING ON: paste your IDs into the two lines below, then push.
 *  Until then this file does nothing at all — no scripts load, no cookies.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  GA4_ID     Google Analytics 4 measurement ID. Looks like "G-ABC1234XYZ".
 *             Get it at analytics.google.com → Admin → Data Streams → Web
 *             → your stream → "Measurement ID" (top right).
 *
 *  CLARITY_ID Microsoft Clarity project ID (optional — heatmaps and session
 *             recordings, free). Looks like "abcd1234ef".
 *             Get it at clarity.microsoft.com → your project → Settings
 *             → Overview → "Project ID".
 */
(function () {
  var GA4_ID = '';        // e.g. 'G-ABC1234XYZ'
  var CLARITY_ID = '';    // e.g. 'abcd1234ef'

  if (GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);

    // Track enquiry clicks as conversions — phone, email and enquiry buttons.
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) window.gtag('event', 'phone_click');
      else if (href.indexOf('mailto:') === 0) window.gtag('event', 'email_click');
      else if (/\/contact\//.test(href)) window.gtag('event', 'contact_page_click');
    });
  }

  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }
})();
