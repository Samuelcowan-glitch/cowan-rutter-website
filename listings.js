/* Cowan & Rutter — property listings + filter/sort helpers.
   Exposes window.CR_LISTINGS and window.CR.
   To add or edit a listing, update the array below. */
(function () {

  function img(p, w, h) {
    return 'https://images.unsplash.com/' + p + '?auto=format&fit=crop&w=' + (w || 900) + '&h=' + (h || 640) + '&q=80';
  }
  var EX = ['photo-1497366216548-37526070297c','photo-1497366412874-3415097a27e7','photo-1497366754035-f200968a6e72','photo-1497366811353-6870744d04b2'];

  var L = [];

  /* ---- helpers ---- */
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function formatPrice(l) {
    if (l.priceDisplay) return l.priceDisplay;
    if (l.priceUnit === 'poa') return 'Price on application';
    var n = '£' + Number(l.price).toLocaleString('en-GB');
    if (l.priceUnit === 'pcm') return n + ' pcm';
    if (l.priceUnit === 'pa')  return n + ' per annum';
    return n;
  }

  function statusLabel(l) {
    if (l.listingStatus === 'under-offer') return 'Under Offer';
    return l.status === 'sale' ? 'For Sale' : 'To Let';
  }

  function statusBadge(l) {
    var cls = l.listingStatus === 'under-offer' ? 'ps-badge ps-badge--uo' : 'ps-badge';
    return '<span class="' + cls + '">' + statusLabel(l) + '</span>';
  }

  function metaText(l) {
    if (l.category === 'commercial') return cap(l.use) + ' · ' + Number(l.sqft).toLocaleString('en-GB') + ' sq ft';
    return l.beds + ' bed · ' + l.baths + ' bath · ' + Number(l.sqft).toLocaleString('en-GB') + ' sq ft';
  }

  function gallery(l) { return [img(l.photo, 1100, 760), img(EX[0], 1100, 760), img(EX[1], 1100, 760), img(EX[2], 1100, 760)]; }
  function annual(l) { return l.priceUnit === 'pcm' ? l.price * 12 : l.price; }

  function filter(list, f) {
    return list.filter(function (l) {
      if (f.category && f.category !== 'all' && l.category !== f.category) return false;
      if (f.status && f.status !== 'all' && l.status !== f.status) return false;
      if (f.category === 'commercial') {
        if (f.use && f.use !== 'all' && l.use !== f.use) return false;
        if (f.size && f.size !== 'all') {
          var s = l.sqft;
          if (f.size === '0-1000'    && !(s < 1000))                return false;
          if (f.size === '1000-5000' && !(s >= 1000 && s <= 5000))  return false;
          if (f.size === '5000+'     && !(s > 5000))                 return false;
        }
      } else {
        if (f.type && f.type !== 'all' && l.type !== f.type) return false;
        if (f.price && f.price !== 'all') {
          var p = l.price, pu = l.priceUnit;
          if (f.price === 's-0-1m'   && !(pu === 'sale' && p <= 1000000))              return false;
          if (f.price === 's-1-2.5m' && !(pu === 'sale' && p > 1000000 && p <= 2500000)) return false;
          if (f.price === 's-2.5-5m' && !(pu === 'sale' && p > 2500000 && p <= 5000000)) return false;
          if (f.price === 's-5m'     && !(pu === 'sale' && p > 5000000))               return false;
          if (f.price === 'l-0-3k'   && !(pu === 'pcm'  && p <= 3000))                return false;
          if (f.price === 'l-3-5k'   && !(pu === 'pcm'  && p > 3000 && p <= 5000))    return false;
          if (f.price === 'l-5k'     && !(pu === 'pcm'  && p > 5000))                 return false;
        }
      }
      return true;
    });
  }

  function sort(list, key) {
    var a = list.slice();
    if (key === 'price-asc')  a.sort(function (x, y) { return annual(x) - annual(y); });
    else if (key === 'price-desc') a.sort(function (x, y) { return annual(y) - annual(x); });
    else if (key === 'newest') a.sort(function (x, y) { return new Date(y.added) - new Date(x.added); });
    else if (key === 'size')   a.sort(function (x, y) { return y.sqft - x.sqft; });
    else a.sort(function (x, y) { return (y.featured ? 1 : 0) - (x.featured ? 1 : 0) || new Date(y.added) - new Date(x.added); });
    return a;
  }

  window.CR_LISTINGS = L;

  fetch('https://web-production-3d01.up.railway.app/api/listings')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (Array.isArray(data) && data.length) {
        window.CR_LISTINGS = data;
        document.dispatchEvent(new CustomEvent('cr:listings-updated'));
      }
    })
    .catch(function () {});

  window.CR = {
    img: img, cap: cap, formatPrice: formatPrice,
    statusLabel: statusLabel, statusBadge: statusBadge,
    metaText: metaText, gallery: gallery, annual: annual,
    filter: filter, sort: sort,
    typeOptions: [
      { value:'all', label:'Any type' }, { value:'Apartment', label:'Apartment' },
      { value:'Townhouse', label:'Townhouse' }, { value:'Mews House', label:'Mews House' },
      { value:'Garden Flat', label:'Garden Flat' }, { value:'Flat', label:'Flat' }
    ],
    useOptions: [
      { value:'all', label:'Any use' }, { value:'retail', label:'Retail' },
      { value:'office', label:'Office' }, { value:'industrial', label:'Industrial' }
    ],
    statusOptions: [
      { value:'all', label:'Sale & to let' }, { value:'sale', label:'For sale' }, { value:'let', label:'To let' }
    ],
    priceSaleOptions: [
      { value:'all', label:'Any price' }, { value:'s-0-1m', label:'Up to £1m' },
      { value:'s-1-2.5m', label:'£1m – £2.5m' },
      { value:'s-2.5-5m', label:'£2.5m – £5m' },
      { value:'s-5m', label:'£5m +' }
    ],
    priceLetOptions: [
      { value:'all', label:'Any rent' }, { value:'l-0-3k', label:'Up to £3,000 pcm' },
      { value:'l-3-5k', label:'£3,000 – £5,000 pcm' },
      { value:'l-5k', label:'£5,000 pcm +' }
    ],
    sizeOptions: [
      { value:'all', label:'Any size' }, { value:'0-1000', label:'Up to 1,000 sq ft' },
      { value:'1000-5000', label:'1,000 – 5,000 sq ft' }, { value:'5000+', label:'5,000 sq ft +' }
    ],
    sortOptions: [
      { value:'featured', label:'Featured first' }, { value:'price-asc', label:'Price: low to high' },
      { value:'price-desc', label:'Price: high to low' }, { value:'newest', label:'Newest' },
      { value:'size', label:'Largest' }
    ]
  };
})();
