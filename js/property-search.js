/* Cowan & Rutter — Property Search interactive logic.
   Requires listings.js loaded first (window.CR_LISTINGS + window.CR).
   Leaflet optional — map view gracefully degrades without it. */
(function () {
  'use strict';
  var CR = window.CR, DATA = window.CR_LISTINGS;
  if (!CR || !DATA) { console.warn('[property-search] listings.js must load before property-search.js'); return; }

  var FAV_KEY = 'cr-fav';
  var state = { category:'commercial', status:'all', type:'all', beds:'all', use:'all', price:'all', size:'all', sort:'featured', view:'grid', favs:loadFavs(), quickId:null };

  var $ = function (s) { return document.querySelector(s); };
  var els = {
    cat:$('#ps-cat'), status:$('#ps-status'), type:$('#ps-type'), beds:$('#ps-beds'), price:$('#ps-price'),
    use:$('#ps-use'), size:$('#ps-size'), sort:$('#ps-sort'), view:$('#ps-view'),
    count:$('#ps-count'), countLabel:$('#ps-count-label'), chips:$('#ps-chips'), clear:$('#ps-clear'),
    grid:$('#ps-grid'), mapbox:$('#ps-mapbox'), map:$('#ps-map'), mapcount:$('#ps-mapcount'),
    panel:$('#ps-panel'),
    res:document.querySelectorAll('.ps-res'), com:document.querySelectorAll('.ps-com')
  };

  function loadFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; } catch (e) { return {}; } }
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify(state.favs)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  // Sub-line under the title. When the address is identical to the title
  // (listings with no separate unit name), don't repeat it — show just the
  // postcode. Otherwise show the address plus postcode.
  function addrLine(l) {
    var pc = l.postcode || '';
    if (l.address && l.address !== l.title) return esc(l.address) + (pc ? ', ' + pc : '');
    return esc(pc);
  }
  function find(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i].value === v) return arr[i]; return null; }
  function priceOpts() { return state.status === 'let' ? CR.priceLetOptions : CR.priceSaleOptions; }
  function results() { return CR.sort(CR.filter(DATA, {category:state.category,status:state.status,type:state.type,beds:state.beds,use:state.use,price:state.price,size:state.size}), state.sort); }

  function fillSelect(el, opts, val) { el.innerHTML = opts.map(function (o) { return '<option value="'+o.value+'">'+esc(o.label)+'</option>'; }).join(''); el.value = val; }
  function buildSeg(el, items) { el.innerHTML = items.map(function (it) { return '<button type="button" data-val="'+it.val+'">'+esc(it.label)+'</button>'; }).join(''); }
  function setActive(seg, val) { if (!seg) return; Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) { b.classList.toggle('is-active', b.dataset.val === val); }); }

  /* init controls */
  buildSeg(els.cat, [{val:'residential',label:'Residential'},{val:'commercial',label:'Commercial'}]);
  fillSelect(els.status, CR.statusOptions, state.status);
  fillSelect(els.type, CR.typeOptions, state.type);
  fillSelect(els.beds, CR.bedOptions, state.beds);
  fillSelect(els.price, priceOpts(), state.price);
  fillSelect(els.use, CR.useOptions, state.use);
  fillSelect(els.size, CR.sizeOptions, state.size);
  fillSelect(els.sort, CR.sortOptions, state.sort);

  /* events */
  els.cat.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setCat(b.dataset.val); });
els.status.addEventListener('change', function () { state.status = this.value; state.price = 'all'; fillSelect(els.price, priceOpts(), 'all'); render(); });
  els.type.addEventListener('change', function () { state.type = this.value; render(); });
  els.beds.addEventListener('change', function () { state.beds = this.value; render(); });
  els.price.addEventListener('change', function () { state.price = this.value; render(); });
  els.use.addEventListener('change', function () { state.use = this.value; render(); });
  els.size.addEventListener('change', function () { state.size = this.value; render(); });
  els.sort.addEventListener('change', function () { state.sort = this.value; render(); });
  if (els.clear) els.clear.addEventListener('click', clearAll);

  els.grid.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'ps-reset') { clearAll(); return; }
    var favBtn = e.target.closest('[data-fav]');
    if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav); return; }
    var card = e.target.closest('[data-id]');
    if (card) openQuick(card.dataset.id);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && els.panel && !els.panel.hidden) closeQuick(); });

  function setCat(val) {
    state.category = val; state.type = 'all'; state.beds = 'all'; state.use = 'all'; state.price = 'all'; state.size = 'all';
    els.type.value = 'all'; els.beds.value = 'all'; els.use.value = 'all'; els.price.value = 'all'; els.size.value = 'all';
    render();
  }
  function clearAll() {
    state.category = 'commercial'; state.status = 'all'; state.type = 'all'; state.beds = 'all'; state.use = 'all'; state.price = 'all'; state.size = 'all';
    els.status.value = 'all'; els.type.value = 'all'; els.beds.value = 'all'; els.use.value = 'all'; els.price.value = 'all'; els.size.value = 'all';
    render();
  }
  function toggleFav(id) { if (state.favs[id]) delete state.favs[id]; else state.favs[id] = true; saveFavs(); render(); if (state.quickId === id) renderPanelFav(); }

  /* render */
  function render() {
    var list = results();
    var isCom = state.category === 'commercial';
    els.res.forEach(function (el) { el.style.display = isCom ? 'none' : ''; });
    els.com.forEach(function (el) { el.style.display = isCom ? '' : 'none'; });
    els.count.textContent = list.length;
    els.countLabel.textContent = list.length === 1 ? 'property' : 'properties';
    setActive(els.cat, state.category);
    setActive(els.view, state.view);
    els.status.value = state.status; els.type.value = state.type; els.beds.value = state.beds; els.price.value = state.price;
    els.use.value = state.use; els.size.value = state.size; els.sort.value = state.sort;
    renderChips();

    els.grid.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML();
  }

  function renderChips() {
    var c = [], isCom = state.category === 'commercial';
    if (state.status !== 'all') c.push({label: state.status === 'sale' ? 'For sale' : 'To let', clear:function(){state.status='all';render();}});
    if (!isCom && state.type !== 'all') c.push({label:state.type, clear:function(){state.type='all';render();}});
    if (!isCom && state.beds !== 'all') c.push({label:state.beds+'+ beds', clear:function(){state.beds='all';render();}});
    if (!isCom && state.price !== 'all') { var po=find(priceOpts(),state.price); if(po) c.push({label:po.label,clear:function(){state.price='all';render();}}); }
    if (isCom && state.use !== 'all') c.push({label:CR.cap(state.use), clear:function(){state.use='all';render();}});
    if (isCom && state.size !== 'all') { var so=find(CR.sizeOptions,state.size); if(so) c.push({label:so.label,clear:function(){state.size='all';render();}}); }
    els.chips.innerHTML = '';
    c.forEach(function (chip) { var b=document.createElement('button'); b.className='ps-chip'; b.innerHTML=esc(chip.label)+' <span>&times;</span>'; b.addEventListener('click',chip.clear); els.chips.appendChild(b); });
    if (els.clear) els.clear.style.display = c.length ? '' : 'none';
  }

  function cardHTML(l) {
    var fav = !!state.favs[l.id];
    return '<article class="ps-card" data-id="'+l.id+'">'
      +'<div class="ps-card-media">'
        +'<img src="'+CR.cover(l,760,560)+'" alt="'+esc(l.title)+'" onerror="this.style.opacity=0">'
        +'<div class="ps-badges">'+CR.statusBadge(l)+(l.featured?'<span class="ps-badge ps-badge--featured">Featured</span>':'')+'</div>'
        +'<button class="ps-fav'+(fav?' is-fav':'')+'" data-fav="'+l.id+'" aria-label="Save property">'+(fav?'♥':'♡')+'</button>'
      +'</div>'
      +'<div class="ps-card-body">'
        +'<div class="ps-price">'+CR.formatPrice(l)+'</div>'
        +'<div class="ps-title">'+esc(l.title)+'</div>'
        +'<div class="ps-addr">'+addrLine(l)+'</div>'
        +'<div class="ps-rule"></div>'
        +'<div class="ps-meta">'+CR.metaText(l)+'</div>'
      +'</div></article>';
  }

  function emptyHTML() { return '<div class="ps-empty"><h3>No properties match those filters.</h3><button type="button" class="btn" id="ps-reset">Reset search</button></div>'; }

  // Static placeholder cards shown while the live database listings load, so
  // the page never flashes the old hardcoded demo listings first.
  function renderLoading() {
    els.count.textContent = '';
    els.countLabel.textContent = 'Loading properties…';
    var card = '<article class="ps-card ps-card--skeleton" aria-hidden="true">'
      + '<div class="ps-card-media"></div>'
      + '<div class="ps-card-body"><span class="ps-skl ps-skl-lg"></span>'
      + '<span class="ps-skl ps-skl-md"></span><span class="ps-skl ps-skl-sm"></span></div></article>';
    els.grid.innerHTML = new Array(6).join(card) + card;
  }

  /* map */
  function showMap(list) {
    if (!window.L) {
      document.getElementById('ps-map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5b6675;font-family:sans-serif;font-size:1rem;padding:40px;">Map unavailable — please refresh the page.</div>';
      return;
    }
    if (map) { try { map.remove(); } catch(e){} map = null; markers = {}; }
    setTimeout(function() {
      try {
        map = L.map('ps-map', { zoomControl: true, scrollWheelZoom: false });
        map.setView([51.484, -0.186], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          subdomains: 'abc', maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var pts = [];
        list.forEach(function(l) {
          if (!l.lat || !l.lng) return;
          var price = CR.formatPrice(l).replace(' per annum','/yr').replace(' pcm','/m').replace('Price on application','POA');
          var icon = L.divIcon({className:'cr-pinwrap', html:'<div class="cr-pin"><span class="cr-tag">'+price+'</span><span class="cr-stem"></span></div>', iconSize:[1,1], iconAnchor:[0,0]});
          var m = L.marker([l.lat, l.lng], {icon:icon}).addTo(map);
          m.on('click', function(){ openQuick(l.id); });
          markers[l.id] = m;
          pts.push([l.lat, l.lng]);
        });
        setTimeout(function() {
          if (!map) return;
          map.invalidateSize();
          if (pts.length) try { map.fitBounds(pts, {padding:[55,55], maxZoom:14}); } catch(e){}
        }, 200);
      } catch(e) {
        document.getElementById('ps-map').innerHTML = '<div style="padding:20px;color:red;font-family:sans-serif;">Map error: ' + e.message + '</div>';
      }
    }, 150);
  }
  function syncMarkers(list) {
    if (!map || !window.L) return;
    Object.keys(markers).forEach(function(k){map.removeLayer(markers[k]);}); markers={};
    if (!list.length) return; var pts=[];
    list.forEach(function(l){
      if (!l.lat || !l.lng) return;
      var price = CR.formatPrice(l).replace(' per annum','/yr').replace(' pcm','/m').replace('Price on application','POA');
      var icon = L.divIcon({className:'cr-pinwrap',html:'<div class="cr-pin"><span class="cr-tag">'+price+'</span><span class="cr-stem"></span></div>',iconSize:[1,1],iconAnchor:[0,0]});
      var m = L.marker([l.lat,l.lng],{icon:icon}).addTo(map);
      m.on('click',function(){openQuick(l.id);});
      markers[l.id]=m; pts.push([l.lat,l.lng]);
    });
    if (pts.length) try { map.fitBounds(pts,{padding:[55,55],maxZoom:14}); } catch(e){}
  }

  /* quick-view slide-over */
  
  function areaLine(l) {
    // Area only — the postcode already appears under the address, never here.
    var area = (l.area || '').trim();
    var pc = (l.postcode || '').trim();
    if (pc && area) {
      var re = new RegExp('\\s*,?\\s*' + pc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i');
      area = area.replace(re, '').trim();
      if (area.toLowerCase() === pc.toLowerCase()) area = '';
    }
    return area;
  }

  function listingSlug(l) {
    var text = ((l.title || l.address || 'Property') + '-' + l.id).toLowerCase();
    text = text.replace(/[^\w\s-]/g, '');
    text = text.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    return text || 'listing';
  }

function facts(l) {
    var isCom = l.category === 'commercial', isSale = l.status === 'sale';
    var sqft = Number(l.sqft).toLocaleString('en-GB');
    var size = l.sqft ? (sqft + ' sq ft' + (l.measurement ? ' (' + l.measurement + ')' : '')) : null;
    var rows = [];
    if (isCom) {
      rows.push(['Type', l.type], ['Floor area', size]);
      if (l.pricePerSqft) rows.push(['Rent / sq ft', '£' + Number(l.pricePerSqft).toLocaleString('en-GB') + ' pa']);
      // Vacant-possession sales quote a capital rate (£/sq ft) in place of a yield %.
      if (isSale && l.yield) rows.push(l.vacantPossession ? ['Cap rate', '£' + Number(l.yield).toLocaleString('en-GB') + ' / sq ft'] : ['Initial yield', l.yield + '%']);
      var comTenure = l.saleTenure || l.tenure;
      if (isSale && comTenure) rows.push(['Tenure', comTenure + (/long leasehold/i.test(comTenure) && l.leaseYears ? ' · ' + l.leaseYears + ' yrs remaining' : '')]);
    } else {
      rows.push(['Type', l.type], ['Bedrooms', l.beds], ['Bathrooms', l.baths], ['Floor area', size]);
      if (isSale && l.yield) rows.push(l.vacantPossession ? ['Cap rate', '£' + Number(l.yield).toLocaleString('en-GB') + ' / sq ft'] : ['Gross initial yield', l.yield + '%']);
      var resTenure = l.saleTenure || l.tenure;
      if (isSale && resTenure) rows.push(['Tenure', resTenure + (/long leasehold/i.test(resTenure) && l.leaseYears ? ' · ' + l.leaseYears + ' yrs remaining' : '')]);
    }
    rows.push(['Status', CR.statusLabel(l)], ['Area', areaLine(l)]);
    return rows.filter(function (r) { return r[1] != null && r[1] !== '' && String(r[1]) !== 'null'; });
  }
  function openQuick(id) {
    var l = null; for(var i=0;i<DATA.length;i++){if(DATA[i].id===id){l=DATA[i];break;}} if(!l) return;
    state.quickId = id;
    var fav = !!state.favs[id];
    var G = CR.gallery(l);
    els.panel.innerHTML =
      '<div class="ps-panel-backdrop" data-close></div>'
      +'<aside class="ps-panel-sheet" role="dialog" aria-modal="true">'
        +'<div class="ps-panel-media"><img class="ps-gallery-main" src="'+G[0]+'" alt="'+esc(l.title)+'" onerror="this.style.opacity=0">'
          +CR.statusBadge(l)
          +(G.length>1 ? '<button type="button" class="ps-gallery-nav ps-gallery-prev" aria-label="Previous photo">&#8249;</button><button type="button" class="ps-gallery-nav ps-gallery-next" aria-label="Next photo">&#8250;</button>' : '')
          +'<button class="ps-panel-close" data-close aria-label="Close">&times;</button></div>'
        +(G.length>1
          ? '<div class="ps-gallery-thumbs">'+G.map(function(u,i){return '<button type="button" class="ps-gallery-thumb'+(i===0?' is-active':'')+'" data-gimg="'+u+'"><img src="'+u+'" alt="" onerror="this.style.opacity=0"></button>';}).join('')+'</div>'
          : '')
        +'<div class="ps-panel-body">'
          +'<div class="ps-panel-price">'+CR.formatPrice(l)+'</div>'
          +'<div class="ps-panel-title">'+esc(l.title)+'</div>'
          +'<div class="ps-panel-addr">'+addrLine(l)+'</div>'
          +'<div class="ps-facts">'+facts(l).map(function(f){return '<div class="ps-fact"><dt>'+esc(f[0])+'</dt><dd>'+esc(String(f[1]))+'</dd></div>';}).join('')+'</div>'
          +(l.keyTerms ? '<div class="ps-keyterms"><span>Key terms</span><ul>'+l.keyTerms.split(/[\n·,;|]+/).map(function(t){return t.trim();}).filter(Boolean).map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul></div>' : '')
          +(l.blurb ? '<div class="ps-location"><h4>Description</h4><p>'+esc(l.blurb)+'</p></div>' : '')
          +(l.locationText ? '<div class="ps-location"><h4>Location</h4><p>'+esc(l.locationText)+'</p></div>' : '')
          +((l.brochureUrl || l.floorPlanUrl)
            ? '<div class="ps-docs">'
              +(l.brochureUrl  ? '<a class="ps-doc" href="'+l.brochureUrl+'" target="_blank" rel="noopener">📄 Download brochure</a>' : '')
              +(l.floorPlanUrl ? '<a class="ps-doc" href="'+l.floorPlanUrl+'" target="_blank" rel="noopener">🗺️ Floor plan</a>' : '')
              +'</div>'
            : '')
          +'<div class="ps-docs"><a class="ps-doc" href="/listings/'+listingSlug(l)+'/">🔗 View full details page</a></div>'
          +'<div class="ps-panel-actions" style="flex-direction:column;gap:0;">'
          +'<form id="ps-view-form" style="width:100%;">'
            +'<input type="hidden" name="property" value="'+esc(l.title)+' — '+esc(l.address)+', '+esc(l.postcode)+'">'
            +'<input type="hidden" name="transaction" value="'+(l.status||'let')+'">'
            +'<input type="hidden" name="category"    value="'+(l.category||'commercial')+'">'
            +'<p style="font-size:.82rem;line-height:1.55;color:#3a4560;margin:0 0 14px;">Please provide us with your requirements so we can arrange a viewing or, if this property is no longer suitable, find you the ideal alternative options.</p>'
            +'<div style="display:grid;gap:10px;margin-bottom:14px;">'
              +'<input type="text" name="from_name" placeholder="Your name *" required style="font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;width:100%;">'
              +'<input type="email" name="from_email" placeholder="Your email *" required style="font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;width:100%;">'
              +'<input type="tel" name="phone" placeholder="Phone (optional)" style="font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;width:100%;">'
              +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                +'<div>'
                  +'<label style="display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#0e1f44;margin-bottom:6px;">Min Size</label>'
                  +'<select name="sqft_min" style="width:100%;font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;">'
                    +'<option value="">No minimum</option>'
                    +'<option>100 sq ft</option><option>250 sq ft</option><option>500 sq ft</option>'
                    +'<option>750 sq ft</option><option>1,000 sq ft</option><option>1,500 sq ft</option>'
                    +'<option>2,000 sq ft</option><option>3,000 sq ft</option><option>5,000 sq ft</option>'
                  +'</select>'
                +'</div>'
                +'<div>'
                  +'<label style="display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#0e1f44;margin-bottom:6px;">Max Size</label>'
                  +'<select name="sqft_max" style="width:100%;font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;">'
                    +'<option value="">No maximum</option>'
                    +'<option>500 sq ft</option><option>750 sq ft</option><option>1,000 sq ft</option>'
                    +'<option>1,500 sq ft</option><option>2,000 sq ft</option><option>3,000 sq ft</option>'
                    +'<option>5,000 sq ft</option><option>10,000 sq ft</option><option>10,000+ sq ft</option>'
                  +'</select>'
                +'</div>'
              +'</div>'
              +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                +'<div>'
                  +'<label style="display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#0e1f44;margin-bottom:6px;">Min Budget</label>'
                  +'<select name="budget_min" style="width:100%;font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;">'
                    +'<option value="">No minimum</option>'
                    +'<option>£500 pcm</option><option>£1,000 pcm</option><option>£2,000 pcm</option>'
                    +'<option>£5,000 pcm</option><option>£10,000 pa</option><option>£25,000 pa</option>'
                    +'<option>£50,000 pa</option><option>£100,000 pa</option><option>£250,000</option>'
                  +'</select>'
                +'</div>'
                +'<div>'
                  +'<label style="display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#0e1f44;margin-bottom:6px;">Max Budget</label>'
                  +'<select name="budget_max" style="width:100%;font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;">'
                    +'<option value="">No maximum</option>'
                    +'<option>£1,000 pcm</option><option>£2,000 pcm</option><option>£5,000 pcm</option>'
                    +'<option>£10,000 pcm</option><option>£25,000 pa</option><option>£50,000 pa</option>'
                    +'<option>£100,000 pa</option><option>£500,000 pa</option><option>£1,000,000+</option>'
                  +'</select>'
                +'</div>'
              +'</div>'
              +'<textarea name="message" placeholder="Any other specific requirements?" rows="2" style="font-family:inherit;font-size:.88rem;padding:11px 14px;border:1px solid rgba(14,31,68,.18);background:#fff;width:100%;resize:vertical;"></textarea>'
            +'</div>'
            +'<button type="submit" class="ps-btn-solid" style="width:100%;" id="ps-view-submit">Arrange a Viewing</button>'
          +'</form>'
          +'<div style="display:flex;gap:12px;margin-top:12px;">'
            +'<button type="button" class="ps-btn-fav" id="ps-panel-fav" style="flex:1;">'+(fav?'Saved ♥':'Save ♡')+'</button>'
          +'</div></div>'
        +'</div></aside>';
    els.panel.hidden = false;
    document.body.style.overflow = 'hidden';
    Array.prototype.forEach.call(els.panel.querySelectorAll('[data-close]'),function(x){x.addEventListener('click',closeQuick);});
    // Gallery: thumbnails + prev/next arrows both cycle the main image.
    var galleryMain = els.panel.querySelector('.ps-gallery-main');
    var galleryThumbs = Array.prototype.slice.call(els.panel.querySelectorAll('.ps-gallery-thumb'));
    var galleryIdx = 0;
    function showGalleryImage(idx) {
      if (!galleryMain || !G.length) return;
      galleryIdx = (idx + G.length) % G.length;     // wrap around both ends
      galleryMain.src = G[galleryIdx];
      galleryThumbs.forEach(function (o, i) { o.classList.toggle('is-active', i === galleryIdx); });
    }
    galleryThumbs.forEach(function (t, i) { t.addEventListener('click', function () { showGalleryImage(i); }); });
    var gPrev = els.panel.querySelector('.ps-gallery-prev');
    var gNext = els.panel.querySelector('.ps-gallery-next');
    if (gPrev) gPrev.addEventListener('click', function () { showGalleryImage(galleryIdx - 1); });
    if (gNext) gNext.addEventListener('click', function () { showGalleryImage(galleryIdx + 1); });
    var favBtn = els.panel.querySelector('#ps-panel-fav');
    if (favBtn) favBtn.addEventListener('click',function(){toggleFav(id);});
    var viewForm = els.panel.querySelector('#ps-view-form');
    if (viewForm) {
      viewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (typeof emailjs === 'undefined') { alert('Email service not available. Please call 020 7349 6666.'); return; }
        var btn = document.getElementById('ps-view-submit');
        if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
        var d = Object.fromEntries(new FormData(viewForm));
        var msgBody = 'Size requirement: ' + (d.sqft_min || 'No min') + ' – ' + (d.sqft_max || 'No max')
                    + '\nBudget: ' + (d.budget_min || 'No min') + ' – ' + (d.budget_max || 'No max')
                    + (d.message ? '\n\nAdditional requirements:\n' + d.message : '');

        // Mirror into the property database (silent — never blocks the form)
        fetch('https://web-production-3d01.up.railway.app/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_name:   d.from_name  || '',
            from_email:  d.from_email || '',
            phone:       d.phone      || '',
            property:    d.property   || '',
            interest:    'Arrange a viewing',
            transaction: d.transaction || 'let',
            category:    d.category   || 'commercial',
            message:     msgBody
          })
        }).catch(function(){});

        emailjs.send('service_j0aq6ii','template_868qre6',{
          from_name:  d.from_name  || '',
          from_email: d.from_email || '',
          phone:      d.phone      || '',
          property:   d.property   || '',
          interest:   'Arrange a viewing',
          message:    msgBody,
          subject:    'Viewing request — ' + (d.property || 'Property enquiry')
        }).then(function(){
          viewForm.innerHTML = '<p style="color:#0e1f44;font-family:inherit;font-size:.95rem;padding:16px 0;text-align:center;">Thank you — we will be in touch shortly to arrange your viewing.</p>';
        },function(){
          if (btn) { btn.textContent = 'Arrange a Viewing'; btn.disabled = false; }
          alert('Something went wrong. Please call 020 7349 6666.');
        });
      });
    }
  }
  function renderPanelFav(){var b=els.panel.querySelector('#ps-panel-fav');if(b)b.textContent=state.favs[state.quickId]?'Saved ♥':'Save ♡';}
  function closeQuick(){state.quickId=null;els.panel.hidden=true;els.panel.innerHTML='';document.body.style.overflow='';}

  /* Wait for the live DB listings before painting real cards. If the fetch
     has already settled (e.g. served from cache) render straight away;
     otherwise show the loading placeholder and a safety net in case the
     fetch never fires an event. */
  var settled = false;
  function paintLive() {
    if (settled) return;
    settled = true;
    DATA = window.CR_LISTINGS;
    render();
  }
  if (window.CR_LIVE_STATUS && window.CR_LIVE_STATUS !== 'pending') {
    paintLive();
  } else {
    renderLoading();
    document.addEventListener('cr:listings-updated', paintLive);
    setTimeout(paintLive, 6000);   // fallback if the fetch stalls entirely
  }
})();
