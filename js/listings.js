/* Cowan & Rutter — property listings + filter/sort helpers.
   Exposes window.CR_LISTINGS and window.CR.
   To add or edit a listing, update the array below. */
(function () {

  function img(p, w, h) {
    if (!p) p = 'photo-1497366216548-37526070297c';
    // A full URL (e.g. a photo uploaded in the database) is used as-is.
    if (/^https?:\/\//.test(p)) return p;
    return 'https://images.unsplash.com/' + p + '?auto=format&fit=crop&w=' + (w || 900) + '&h=' + (h || 640) + '&q=80';
  }
  var EX = ['photo-1497366216548-37526070297c','photo-1497366412874-3415097a27e7','photo-1497366754035-f200968a6e72','photo-1497366811353-6870744d04b2'];

  var L = [

    /* ====================================================
       COMMERCIAL — AVAILABLE — TO LET
    ==================================================== */
    { id:'cr-c01', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Units 1–3, Plato Place', area:'Fulham', postcode:'SW6 4TU', address:'72–74 St Dionis Road',
      price:98800, priceUnit:'pa', sqft:2470, lat:51.4753, lng:-0.2012, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      blurb:'Bright, spacious office space just off Parsons Green, offering excellent natural light in a quiet yet well-connected Fulham location.' },

    { id:'cr-c02', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Lockside House', area:'Chelsea Creek', postcode:'SW6 2XD', address:'1 Thurstan Street',
      price:42120, priceUnit:'pa', sqft:936, lat:51.4734, lng:-0.1818, added:'2026-06-22',
      photo:'photo-1497366412874-3415097a27e7',
      blurb:'Fully fitted and furnished ground floor commercial unit within the prestigious Chelsea Creek development — ready to occupy immediately.' },

    { id:'cr-c03', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 202–203, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:7565, priceUnit:'pcm', sqft:1665, lat:51.4737, lng:-0.1837, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      blurb:'Duplex office suite to let in Harbour Yard, Chelsea Harbour — modern riverside workspace in a prestigious West London location with stunning waterfront views.' },

    { id:'cr-c04', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 307, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:3360, priceUnit:'pcm', sqft:750, lat:51.4738, lng:-0.1839, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      blurb:'Duplex office space to let in Harbour Yard, Chelsea Harbour — modern riverside workspace with access to all building amenities.' },

    { id:'cr-c05', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 206, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:2800, priceUnit:'pcm', sqft:555, lat:51.4736, lng:-0.1835, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      blurb:'Prime office space to let in Harbour Yard, Chelsea Harbour — a self-contained suite in one of West London\'s finest business addresses.' },

    { id:'cr-c06', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 210/210a, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:15205, priceUnit:'pcm', sqft:2824, lat:51.4739, lng:-0.1841, added:'2026-06-22',
      photo:'photo-1497366412874-3415097a27e7',
      blurb:'One of the largest available suites at Harbour Yard — a substantial riverside office over two floors with exceptional natural light and water views.' },

    { id:'cr-c07', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 208, Harbour Yard', area:'Chelsea Harbour', postcode:'SW10 0XD', address:'Harbour Yard',
      price:2695, priceUnit:'pcm', sqft:538, lat:51.4737, lng:-0.1838, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      blurb:'Compact, well-appointed office suite to let in the prestigious Harbour Yard development on the Chelsea waterfront.' },

    { id:'cr-c08', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Suite 7, Station Court', area:'Fulham', postcode:'SW6 2PY', address:'2 Station Court',
      price:750, priceUnit:'pcm', sqft:430, lat:51.4726, lng:-0.1789, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      blurb:'Modern self-contained office to let next to Imperial Wharf — comfort cooling, kitchenette and excellent transport links to central London.' },

    { id:'cr-c09', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Furniture & Arts Building — First Floor', area:'Chelsea', postcode:'SW10 0TZ', address:'533 Kings Road',
      price:110000, priceUnit:'pa', sqft:3142, lat:51.4891, lng:-0.1836, added:'2026-06-22',
      photo:'photo-1555396273-367ea4eb4db5',
      blurb:'First floor office, showroom and leisure space on the King\'s Road — an exceptional opportunity in one of Chelsea\'s most celebrated buildings.' },

    { id:'cr-c10', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'591–593 Kings Road', area:'Chelsea', postcode:'SW6 2EH', address:'591–593 Kings Road',
      price:23500, priceUnit:'pa', sqft:518, lat:51.4809, lng:-0.1938, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      blurb:'Prime fitted office space in the Chelsea Design Quarter — high-quality workspace on a prestigious stretch of the King\'s Road.' },

    { id:'cr-c11', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Unit 12, The Talina Centre', area:'Fulham', postcode:'SW6 2BW', address:'Bagleys Lane',
      price:49608, priceUnit:'pa', sqft:1908, lat:51.4779, lng:-0.1946, added:'2026-06-22',
      photo:'photo-1586528116311-ad8dd3c8310d',
      blurb:'B1 industrial warehouse and office to let with on-site parking — a versatile, well-located unit in Fulham, suitable for a range of uses.' },

    { id:'cr-c12', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Britannia House', area:'Fulham', postcode:'SW6 2HE', address:'2A Britannia Way',
      price:3892, priceUnit:'pcm', sqft:1229, lat:51.4776, lng:-0.2001, added:'2026-06-22',
      photo:'photo-1497366412874-3415097a27e7',
      blurb:'Boutique fitted first-floor office to let on the King\'s Road, Chelsea — offering high-quality workspace and excellent presentation throughout.' },

    { id:'cr-c13', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Worlds End Studios', area:'Chelsea', postcode:'SW10 0RJ', address:'132–134 Lots Road',
      price:1400, priceUnit:'pcm', priceDisplay:'From £1,400 per month', sqft:580, lat:51.4800, lng:-0.1854, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      blurb:'Modern serviced office suites to rent in Chelsea on sought-after Lots Road, moments from the King\'s Road and the River Thames. Various sizes available.' },

    { id:'cr-c14', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'The Plaza — Office Suite', area:'Chelsea', postcode:'SW10 0SZ', address:'535 Kings Road',
      price:65550, priceUnit:'pa', sqft:1748, lat:51.4869, lng:-0.1839, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      blurb:'Rarely available office and retail suite in excellent condition within The Plaza on the King\'s Road — includes one designated car parking space.' },

    { id:'cr-c15', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Bishops Park House — Suite A', area:'Fulham', postcode:'SW6 3JH', address:'25–29 Fulham High Street',
      price:37625, priceUnit:'pa', sqft:1075, lat:51.4693, lng:-0.2173, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      blurb:'Recently refurbished open-plan office to let in the heart of Fulham — bright, modern space in a purpose-built scheme with excellent access.' },

    { id:'cr-c16', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Bishops Park House — Suite B', area:'Fulham', postcode:'SW6 3JH', address:'25–29 Fulham High Street',
      price:48125, priceUnit:'pa', sqft:1375, lat:51.4694, lng:-0.2174, added:'2026-06-22',
      photo:'photo-1497366412874-3415097a27e7',
      blurb:'A larger refurbished suite within Bishops Park House — recently upgraded open-plan space to let in the heart of Fulham SW6.' },

    { id:'cr-c17', featured:true,  category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'The Penthouse Office Suite, 533 Kings Road', area:'Chelsea', postcode:'SW10 0TZ', address:'533 Kings Road',
      price:0, priceUnit:'poa', sqft:2337, lat:51.4892, lng:-0.1837, added:'2026-06-22',
      photo:'photo-1555396273-367ea4eb4db5',
      blurb:'An exceptional penthouse office suite to let at 533 Kings Road — unrivalled position with outstanding natural light and panoramic views over Chelsea.' },

    { id:'cr-c18', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'533 Kings Road — Smart Office', area:'Chelsea', postcode:'SW10 0TZ', address:'533 Kings Road',
      price:35000, priceUnit:'pa', sqft:1000, lat:51.4890, lng:-0.1836, added:'2026-06-22',
      photo:'photo-1497366754035-f200968a6e72',
      blurb:'Smart first floor office to let on the King\'s Road — well-presented space with good natural light in one of Chelsea\'s most prominent buildings.' },

    { id:'cr-c19', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Unit 10, Plato Place', area:'Fulham', postcode:'SW6 4TU', address:'72–74 St Dionis Road',
      price:45000, priceUnit:'pa', sqft:1282, lat:51.4754, lng:-0.2013, added:'2026-06-22',
      photo:'photo-1497366811353-6870744d04b2',
      blurb:'Top floor E Class office space in Fulham — bright and well-appointed with exceptional natural light and excellent transport connections.' },

    { id:'cr-c20', featured:false, category:'commercial', status:'let', listingStatus:'available',
      type:'Office Suite', use:'office',
      title:'Fairbank Studios', area:'Chelsea', postcode:'SW10 0RN', address:'Lots Road',
      price:0, priceUnit:'poa', sqft:480, lat:51.4801, lng:-0.1852, added:'2026-06-22',
      photo:'photo-1497366216548-37526070297c',
      blurb:'Flexible office and retail space on a temporary basis in Chelsea — various suite sizes from 130 to 480 sq ft to suit individual requirements.' },

    /* ====================================================
       COMMERCIAL — AVAILABLE — FOR SALE
    ==================================================== */
    { id:'cr-c21', featured:true,  category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Units 6 & 12, The Talina Centre', area:'Fulham', postcode:'SW6 2BW', address:'Bagleys Lane',
      price:1300000, priceUnit:'sale', priceDisplay:'OIRO £1,300,000', sqft:3816, lat:51.4780, lng:-0.1947, added:'2026-06-22',
      photo:'photo-1586528116311-ad8dd3c8310d',
      blurb:'Warehouses and offices for sale at The Talina Centre — a substantial industrial and office freehold of 3,816 sq ft (361.8 sq m) in Fulham SW6.' },

    { id:'cr-c22', featured:false, category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Hurlingham Business Park — Unit 6', area:'Fulham', postcode:'SW6 3DU', address:'Sulivan Road',
      price:1350000, priceUnit:'sale', priceDisplay:'OIRO £1,350,000', sqft:2867, lat:51.4706, lng:-0.2050, added:'2026-06-22',
      photo:'photo-1486406146926-c627a92ad1ab',
      blurb:'Warehouse, studio and offices for sale — a self-contained freehold unit of 2,867 sq ft at Hurlingham Business Park in Fulham SW6.' },

    { id:'cr-c23', featured:false, category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Unit 7, The Talina Centre', area:'Fulham', postcode:'SW6 2BW', address:'Bagleys Lane',
      price:450000, priceUnit:'sale', priceDisplay:'OIRO £450,000', sqft:1270, lat:51.4778, lng:-0.1945, added:'2026-06-22',
      photo:'photo-1486406146926-c627a92ad1ab',
      blurb:'B1 industrial unit for sale with two parking spaces at The Talina Centre, Bagleys Lane — a well-positioned freehold opportunity in Fulham SW6.' },

    { id:'cr-c24', featured:false, category:'commercial', status:'sale', listingStatus:'available',
      type:'Industrial Unit', use:'industrial',
      title:'Unit 12, The Talina Centre — Freehold', area:'Fulham', postcode:'SW6 2BW', address:'Bagleys Lane',
      price:0, priceUnit:'poa', sqft:1908, lat:51.4779, lng:-0.1946, added:'2026-06-22',
      photo:'photo-1586528116311-ad8dd3c8310d',
      blurb:'B1 industrial warehouse and office available freehold — with on-site parking at The Talina Centre. Also available to let.' },

    /* ====================================================
       COMMERCIAL — UNDER OFFER
    ==================================================== */
    { id:'cr-c25', featured:false, category:'commercial', status:'let', listingStatus:'under-offer',
      type:'Office Suite', use:'office',
      title:'Unit 2, Marlin House', area:'Fulham', postcode:'SW6 3BN', address:'40 Peterborough Road',
      price:12500, priceUnit:'pa', sqft:236, lat:51.4779, lng:-0.1948, added:'2026-06-01',
      photo:'photo-1497366412874-3415097a27e7',
      blurb:'Fully serviced and fitted office space at Marlin House, Fulham — close to Fulham Broadway and Parsons Green station. Currently under offer.' },

    { id:'cr-c26', featured:false, category:'commercial', status:'let', listingStatus:'under-offer',
      type:'Retail Unit', use:'retail',
      title:'488 Kings Road — Prime Retail', area:'Chelsea', postcode:'SW10 0LF', address:'488 Kings Road',
      price:40000, priceUnit:'pa', priceDisplay:'£38,000–£42,500 per annum', sqft:970, lat:51.4870, lng:-0.1832, added:'2026-05-15',
      photo:'photo-1604328698692-f76ea9498e76',
      blurb:'Prime retail showroom to let on the King\'s Road, Chelsea — a rarely available assignment on one of London\'s most coveted retail streets. Under offer.' },

    { id:'cr-c27', featured:false, category:'commercial', status:'let', listingStatus:'under-offer',
      type:'Office Suite', use:'office',
      title:'Furniture & Arts Building — Ground Floor', area:'Chelsea', postcode:'SW10 0TZ', address:'533 Kings Road',
      price:30000, priceUnit:'pa', sqft:850, lat:51.4891, lng:-0.1836, added:'2026-05-10',
      photo:'photo-1497366754035-f200968a6e72',
      blurb:'Open plan office and showroom at 533 Kings Road — well-presented space in a landmark Chelsea building. Currently under offer.' },

    { id:'cr-c28', featured:false, category:'commercial', status:'let', listingStatus:'under-offer',
      type:'Industrial Unit', use:'industrial',
      title:'Hurlingham Business Park — First Floor', area:'Fulham', postcode:'SW6 3DU', address:'Sulivan Road',
      price:40500, priceUnit:'pa', sqft:1620, lat:51.4707, lng:-0.2051, added:'2026-05-20',
      photo:'photo-1486406146926-c627a92ad1ab',
      blurb:'First floor office and warehouse unit with meeting rooms at Hurlingham Business Park, Fulham SW6. Currently under offer.' },

    /* ====================================================
       RESIDENTIAL — SAMPLE (to be updated with live stock)
    ==================================================== */
    { id:'cr-r01', featured:true,  category:'residential', status:'sale', listingStatus:'available',
      type:'Apartment', use:null,
      title:'Cadogan Square Apartment', area:'Knightsbridge', postcode:'SW1X', address:'Cadogan Square',
      price:4250000, priceUnit:'sale', beds:3, baths:2, sqft:1850, lat:51.4985, lng:-0.1607, added:'2026-06-10',
      photo:'photo-1568605114967-8130f3a36994',
      blurb:'A beautifully proportioned lateral apartment in a handsome red-brick mansion building, moments from the boutiques of Sloane Street and the gardens of Cadogan Square.' },

    { id:'cr-r02', featured:false, category:'residential', status:'let', listingStatus:'available',
      type:'Apartment', use:null,
      title:'Imperial Wharf Riverside Apartment', area:'Fulham', postcode:'SW6', address:'Imperial Wharf',
      price:5400, priceUnit:'pcm', beds:2, baths:2, sqft:1100, lat:51.4734, lng:-0.1818, added:'2026-06-15',
      photo:'photo-1502672260266-1c1ef2d93688',
      blurb:'A bright contemporary apartment with a private balcony overlooking the river, available furnished within a sought-after riverside development with concierge.' },

    { id:'cr-r03', featured:false, category:'residential', status:'let', listingStatus:'available',
      type:'Garden Flat', use:null,
      title:'Parsons Green Garden Flat', area:'Fulham', postcode:'SW6', address:'Parsons Green',
      price:3950, priceUnit:'pcm', beds:2, baths:1, sqft:900, lat:51.4753, lng:-0.2012, added:'2026-06-02',
      photo:'photo-1493809842364-78817add7ffb',
      blurb:'A delightful raised ground and lower floor flat with its own private garden, set just a short stroll from the Green and the shops of the New King\'s Road.' },

    { id:'cr-r04', featured:false, category:'residential', status:'sale', listingStatus:'available',
      type:'Mews House', use:null,
      title:"Queen's Gate Mews House", area:'South Kensington', postcode:'SW7', address:"Queen's Gate Mews",
      price:2850000, priceUnit:'sale', beds:3, baths:2, sqft:1600, lat:51.4944, lng:-0.1768, added:'2026-05-28',
      photo:'photo-1570129477492-45c003edd2be',
      blurb:'A charming and immaculately presented mews house on a quiet cobbled lane, offering rare off-street parking and a flood of natural light throughout.' }

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
  var CR_API_URL = 'https://web-production-3d01.up.railway.app/api/listings';
  if (typeof fetch !== 'undefined') {
    fetch(CR_API_URL)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (live) {
        if (!live || !live.length) return;
        // Replace hardcoded listings with live DB data entirely (no duplicates)
        window.CR_LISTINGS = live;
        document.dispatchEvent(new CustomEvent('cr:listings-updated'));
      })
      .catch(function () {});
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
