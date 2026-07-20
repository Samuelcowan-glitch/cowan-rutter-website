/* Cowan & Rutter — property listings + filter/sort helpers.
   Exposes window.CR_LISTINGS and window.CR.
   To add or edit a listing, update the array below. */
(function () {

  function img(p, w, h) {
    if (!p) p = 'photo-1497366216548-37526070297c';
    // A full URL (e.g. a photo uploaded in the database) is used as-is.
    if (/^https?:\/\//.test(p)) return p;
    // A real local property photo — serve from the site root regardless of
    // which page (e.g. /properties/) included this script.
    if (/^img\//.test(p)) return '/' + p;
    return 'https://images.unsplash.com/' + p + '?auto=format&fit=crop&w=' + (w || 900) + '&h=' + (h || 640) + '&q=80';
  }
  var EX = ['photo-1497366216548-37526070297c','photo-1497366412874-3415097a27e7','photo-1497366754035-f200968a6e72','photo-1497366811353-6870744d04b2'];

  var L = [

    { id:'cr-c01', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Units 1–3, Plato Place', area:'Fulham', postcode:'SW6 4TU', address:'72–74 St Dionis Road',
      price:98800, priceUnit:'pa', sqft:2470, lat:51.4753, lng:-0.2012, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      photos:['img/listings/cr-c01/01.jpg','img/listings/cr-c01/02.jpg','img/listings/cr-c01/03.jpg','img/listings/cr-c01/04.jpg','img/listings/cr-c01/05.jpg','img/listings/cr-c01/06.jpg','img/listings/cr-c01/07.jpg'],
      blurb:'Bright, spacious office space just off Parsons Green, offering excellent natural light in a quiet yet well-connected Fulham location.' },

    { id:'cr-c02', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Lockside House', area:'Chelsea Creek', postcode:'SW6 2XD', address:'1 Thurstan Street',
      price:42120, priceUnit:'pa', sqft:936, lat:51.4734, lng:-0.1818, added:'2026-06-22',
      photo:'photo-1497366412874-3415097a27e7',
      photos:['img/listings/cr-c02/01.jpg','img/listings/cr-c02/02.jpg','img/listings/cr-c02/03.jpg','img/listings/cr-c02/04.jpg','img/listings/cr-c02/05.jpg','img/listings/cr-c02/06.jpg','img/listings/cr-c02/07.jpg','img/listings/cr-c02/08.jpg','img/listings/cr-c02/09.jpg','img/listings/cr-c02/10.jpg','img/listings/cr-c02/11.jpg','img/listings/cr-c02/12.jpg','img/listings/cr-c02/13.jpg','img/listings/cr-c02/14.jpg','img/listings/cr-c02/15.jpg','img/listings/cr-c02/16.jpg','img/listings/cr-c02/17.jpg','img/listings/cr-c02/18.jpg','img/listings/cr-c02/19.jpg','img/listings/cr-c02/20.jpg'],
      blurb:'Fully fitted and furnished ground floor commercial unit within the prestigious Chelsea Creek development — ready to occupy immediately.' },

    { id:'cr-c03', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 202–203, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:7565, priceUnit:'pcm', sqft:1665, lat:51.4737, lng:-0.1837, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      photos:['img/listings/cr-c03/01.jpg','img/listings/cr-c03/02.jpg','img/listings/cr-c03/03.jpg','img/listings/cr-c03/04.jpg','img/listings/cr-c03/05.jpg','img/listings/cr-c03/06.jpg','img/listings/cr-c03/07.jpg','img/listings/cr-c03/08.jpg','img/listings/cr-c03/09.jpg','img/listings/cr-c03/10.jpg','img/listings/cr-c03/11.jpg','img/listings/cr-c03/12.jpg','img/listings/cr-c03/13.jpg'],
      blurb:'Duplex office suite to let in Harbour Yard, Chelsea Harbour — modern riverside workspace in a prestigious West London location with stunning waterfront views.' },

    { id:'cr-c08', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Suite 7, Station Court', area:'Fulham', postcode:'SW6 2PY', address:'2 Station Court',
      price:750, priceUnit:'pcm', sqft:430, lat:51.4726, lng:-0.1789, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      photos:['img/listings/cr-c08/01.jpg'],
      blurb:'Modern self-contained office to let next to Imperial Wharf — comfort cooling, kitchenette and excellent transport links to central London.' },

    { id:'cr-c09', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Furniture & Arts Building — First Floor', area:'Chelsea', postcode:'SW10 0TZ', address:'533 Kings Road',
      price:110000, priceUnit:'pa', sqft:3142, lat:51.4891, lng:-0.1836, added:'2026-06-22',
      photo:'photo-1555396273-367ea4eb4db5',
      photos:['img/listings/cr-c09/01.jpg','img/listings/cr-c09/02.jpg','img/listings/cr-c09/03.jpg','img/listings/cr-c09/04.jpg','img/listings/cr-c09/05.jpg','img/listings/cr-c09/06.jpg','img/listings/cr-c09/07.jpg','img/listings/cr-c09/08.jpg','img/listings/cr-c09/09.jpg','img/listings/cr-c09/10.jpg','img/listings/cr-c09/11.jpg','img/listings/cr-c09/12.jpg','img/listings/cr-c09/13.jpg','img/listings/cr-c09/14.jpg','img/listings/cr-c09/15.jpg'],
      blurb:'First floor office, showroom and leisure space on the King\'s Road — an exceptional opportunity in one of Chelsea\'s most celebrated buildings.' },

    { id:'cr-c10', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'591–593 Kings Road', area:'Chelsea', postcode:'SW6 2EH', address:'591–593 Kings Road',
      price:23500, priceUnit:'pa', sqft:518, lat:51.4809, lng:-0.1938, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      photos:['img/listings/cr-c10/01.jpg','img/listings/cr-c10/02.jpg','img/listings/cr-c10/03.jpg','img/listings/cr-c10/04.jpg','img/listings/cr-c10/05.jpg','img/listings/cr-c10/06.jpg','img/listings/cr-c10/07.jpg'],
      blurb:'Prime fitted office space in the Chelsea Design Quarter — high-quality workspace on a prestigious stretch of the King\'s Road.' },

    { id:'cr-c13', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Worlds End Studios', area:'Chelsea', postcode:'SW10 0RJ', address:'132–134 Lots Road',
      price:1400, priceUnit:'pcm', priceDisplay:'From £1,400 pcm', sqft:580, lat:51.4800, lng:-0.1854, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      photos:['img/listings/cr-c13/01.jpg','img/listings/cr-c13/02.jpg','img/listings/cr-c13/03.jpg','img/listings/cr-c13/04.jpg','img/listings/cr-c13/05.jpg','img/listings/cr-c13/06.jpg','img/listings/cr-c13/07.jpg','img/listings/cr-c13/08.jpg','img/listings/cr-c13/09.jpg','img/listings/cr-c13/10.jpg','img/listings/cr-c13/11.jpg','img/listings/cr-c13/12.jpg'],
      blurb:'Modern serviced office suites to rent in Chelsea on sought-after Lots Road, moments from the King\'s Road and the River Thames. Various sizes available.' },

    { id:'cr-c15', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Bishops Park House — Suite A', area:'Fulham', postcode:'SW6 3JH', address:'25–29 Fulham High Street',
      price:37625, priceUnit:'pa', sqft:1075, lat:51.4693, lng:-0.2173, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      photos:['img/listings/cr-c15/01.jpg','img/listings/cr-c15/02.jpg','img/listings/cr-c15/03.jpg','img/listings/cr-c15/04.jpg'],
      blurb:'Recently refurbished open-plan office to let in the heart of Fulham — bright, modern space in a purpose-built scheme with excellent access.' },

    { id:'cr-c19', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 10, Plato Place', area:'Fulham', postcode:'SW6 4TU', address:'72–74 St Dionis Road',
      price:45000, priceUnit:'pa', sqft:1282, lat:51.4754, lng:-0.2013, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      photos:['img/listings/cr-c19/01.jpg','img/listings/cr-c19/02.jpg','img/listings/cr-c19/03.jpg','img/listings/cr-c19/04.jpg','img/listings/cr-c19/05.jpg'],
      blurb:'Top floor E Class office space in Fulham — bright and well-appointed with exceptional natural light and excellent transport connections.' },

    { id:'cr-c21', featured:true,  category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Units 6 & 12, The Talina Centre', area:'Fulham', postcode:'SW6 2BW', address:'Bagleys Lane',
      price:1300000, priceUnit:'sale', priceDisplay:'OIRO £1,300,000', sqft:3816, lat:51.4780, lng:-0.1947, added:'2026-06-22',
      photo:'photo-1586528116311-ad8dd3c8310d',
      photos:['img/listings/cr-c21/01.jpg'],
      blurb:'Warehouses and offices for sale at The Talina Centre — a substantial industrial and office freehold of 3,816 sq ft (361.8 sq m) in Fulham SW6.' },

    { id:'cr-c22', featured:false, category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Hurlingham Business Park — Unit 6', area:'Fulham', postcode:'SW6 3DU', address:'Sulivan Road',
      price:1350000, priceUnit:'sale', priceDisplay:'OIRO £1,350,000', sqft:2867, lat:51.4706, lng:-0.2050, added:'2026-06-22',
      photo:'photo-1486406146926-c627a92ad1ab',
      photos:['img/listings/cr-c22/01.jpg','img/listings/cr-c22/02.jpg','img/listings/cr-c22/03.jpg','img/listings/cr-c22/04.jpg','img/listings/cr-c22/05.jpg','img/listings/cr-c22/06.jpg','img/listings/cr-c22/07.jpg','img/listings/cr-c22/08.jpg','img/listings/cr-c22/09.jpg','img/listings/cr-c22/10.jpg'],
      blurb:'Warehouse, studio and offices for sale — a self-contained freehold unit of 2,867 sq ft at Hurlingham Business Park in Fulham SW6.' },

    { id:'cr-c25', featured:false, category:'commercial', status:'let', listingStatus:'under-offer',
      type:'Office Suite', use:'office',
      title:'Unit 2, Marlin House', area:'Fulham', postcode:'SW6 3BN', address:'40 Peterborough Road',
      price:12500, priceUnit:'pa', sqft:236, lat:51.4779, lng:-0.1948, added:'2026-06-01',
      photo:'photo-1497366412874-3415097a27e7',
      photos:['img/listings/cr-c25/01.jpg','img/listings/cr-c25/02.jpg','img/listings/cr-c25/03.jpg','img/listings/cr-c25/04.jpg','img/listings/cr-c25/05.jpg','img/listings/cr-c25/06.jpg','img/listings/cr-c25/07.jpg','img/listings/cr-c25/08.jpg','img/listings/cr-c25/09.jpg','img/listings/cr-c25/10.jpg','img/listings/cr-c25/11.jpg'],
      blurb:'Fully serviced and fitted office space at Marlin House, Fulham — close to Fulham Broadway and Parsons Green station. Currently under offer.' },

    { id:'cr-c29', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Solon House — Ground Floor Suites', area:'Fulham', postcode:'SW6 3BN', address:'40 Peterborough Road',
      price:7500, priceUnit:'pa', priceDisplay:'From £7,500 per annum', sqft:360, lat:51.4779, lng:-0.1949, added:'2026-07-14',
      photo:'photo-1497366216548-37526070297c',
      photos:['img/listings/cr-new-solon/01.jpg','img/listings/cr-new-solon/02.jpg','img/listings/cr-new-solon/03.jpg','img/listings/cr-new-solon/04.jpg','img/listings/cr-new-solon/05.jpg','img/listings/cr-new-solon/06.jpg'],
      blurb:'Refurbished ground floor serviced office suites on Peterborough Road, Parsons Green — dual air-conditioning, meeting room, kitchen and shower facilities, ideal for small businesses and creative occupiers.' },

    { id:'cr-c30', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Retail Unit', use:'retail',
      title:'57B New Kings Road', area:'Fulham', postcode:'SW6 4SE', address:'57B New Kings Road',
      price:36000, priceUnit:'pa', sqft:1025, lat:51.4737, lng:-0.1965, added:'2026-07-14',
      photo:'photo-1497366754035-f200968a6e72',
      photos:['img/listings/cr-new-57b/01.jpg','img/listings/cr-new-57b/02.jpg','img/listings/cr-new-57b/03.jpg','img/listings/cr-new-57b/04.jpg','img/listings/cr-new-57b/05.jpg','img/listings/cr-new-57b/06.jpg'],
      blurb:'Self-contained E Class unit opposite Eel Brook Common, arranged over ground and lower ground floors with a fully glazed shopfront — excellent natural light and outstanding street visibility.' }

  ];

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

  // Normalise listingStatus — the two admin forms send it differently
  // ("let-agreed" vs "Let Agreed"), so lowercase and hyphenate before matching.
  function normStatus(l) {
    return String(l.listingStatus || 'available').toLowerCase().replace(/\s+/g, '-');
  }

  function statusLabel(l) {
    switch (normStatus(l)) {
      case 'under-offer': return 'Under Offer';
      case 'let-agreed':  return 'Let Agreed';
      case 'sold':        return 'Sold';
      case 'sold-stc':    return 'Sold STC';
      case 'withdrawn':   return 'Withdrawn';
      default:            return l.status === 'sale' ? 'For Sale' : 'To Let';
    }
  }

  function statusBadge(l) {
    var s = normStatus(l), mod = '';
    if (s === 'under-offer') mod = ' ps-badge--uo';
    else if (s === 'let-agreed' || s === 'sold' || s === 'sold-stc' || s === 'withdrawn') mod = ' ps-badge--sold';
    return '<span class="ps-badge' + mod + '">' + statusLabel(l) + '</span>';
  }

  function metaText(l) {
    if (l.category === 'commercial') return cap(l.use) + ' · ' + Number(l.sqft).toLocaleString('en-GB') + ' sq ft';
    return l.beds + ' bed · ' + l.baths + ' bath · ' + Number(l.sqft).toLocaleString('en-GB') + ' sq ft';
  }

  // Real uploaded photos (from the DB) take priority; otherwise fall back to
  // the placeholder photo plus a few stock examples.
  function gallery(l) {
    if (l.photos && l.photos.length) return l.photos.map(function (u) { return img(u, 1100, 760); });
    return [img(l.photo, 1100, 760), img(EX[0], 1100, 760), img(EX[1], 1100, 760), img(EX[2], 1100, 760)];
  }
  // Cover image for cards: first uploaded photo, else the placeholder.
  function cover(l, w, h) {
    if (l.photos && l.photos.length) return img(l.photos[0], w, h);
    return img(l.photo, w, h);
  }
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
        if (f.beds && f.beds !== 'all' && !(Number(l.beds) >= Number(f.beds))) return false;
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

  /* ── Live DB fetch ──────────────────────────────────────────────────────────
     Any property marked "List on website" in the database will automatically
     appear here. Falls back to hardcoded listings if DB is offline.          */
  // 'pending' until the fetch settles, then 'live' (DB data) or 'fallback'
  // (DB unreachable/empty — keep the hardcoded list). The properties page
  // waits on this so it never flashes the hardcoded demo listings first.
  var CR_API_URL = 'https://web-production-3d01.up.railway.app/api/listings';
  window.CR_LIVE_STATUS = 'pending';
  function settleListings(status) {
    window.CR_LIVE_STATUS = status;
    document.dispatchEvent(new CustomEvent('cr:listings-updated'));
  }
  if (typeof fetch !== 'undefined') {
    fetch(CR_API_URL)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (live) {
        if (live && live.length) {
          // Replace hardcoded listings with live DB data entirely (no duplicates)
          window.CR_LISTINGS = live;
          settleListings('live');
        } else {
          settleListings('fallback');
        }
      })
      .catch(function () { settleListings('fallback'); });
  } else {
    window.CR_LIVE_STATUS = 'fallback';
  }

  window.CR = {
    img: img, cap: cap, formatPrice: formatPrice,
    statusLabel: statusLabel, statusBadge: statusBadge,
    metaText: metaText, gallery: gallery, cover: cover, annual: annual,
    filter: filter, sort: sort,
    typeOptions: [
      { value:'all', label:'Any type' }, { value:'Detached', label:'Detached' },
      { value:'Semi-Detached', label:'Semi-Detached' }, { value:'Terraced', label:'Terraced' },
      { value:'Apartment', label:'Apartment' }
    ],
    bedOptions: [
      { value:'all', label:'Any beds' }, { value:'1', label:'1+ beds' },
      { value:'2', label:'2+ beds' }, { value:'3', label:'3+ beds' },
      { value:'4', label:'4+ beds' }, { value:'5', label:'5+ beds' }
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
