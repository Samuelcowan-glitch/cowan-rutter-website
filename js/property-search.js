/* Cowan & Rutter — Property Search interactive logic.
   Requires listings.js loaded first (window.CR_LISTINGS + window.CR).
   Leaflet optional — map view gracefully degrades without it. */
(function () {
  'use strict';
  var CR = window.CR, DATA = window.CR_LISTINGS;
  if (!CR || !DATA) { console.warn('[property-search] listings.js must load before property-search.js'); return; }

  var FAV_KEY = 'cr-fav';
  var state = { category:'all', status:'all', type:'all', use:'all', price:'all', size:'all', sort:'featured', view:'grid', favs:loadFavs(), quickId:null };
  var map = null, markers = {};

  var $ = function (s) { return document.querySelector(s); };
  var els = {
    cat:$('#ps-cat'), status:$('#ps-status'), type:$('#ps-type'), price:$('#ps-price'),
    use:$('#ps-use'), size:$('#ps-size'), sort:$('#ps-sort'), view:$('#ps-view'),
    count:$('#ps-count'), countLabel:$('#ps-count-label'), chips:$('#ps-chips'), clear:$('#ps-clear'),
    grid:$('#ps-grid'), mapbox:$('#ps-mapbox'), map:$('#ps-map'), mapcount:$('#ps-mapcount'),
    panel:$('#ps-panel'),
    res:document.querySelectorAll('.ps-res'), com:document.querySelectorAll('.ps-com')
  };

  function loadFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; } catch (e) { return {}; } }
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify(state.favs)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function find(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i].value === v) return arr[i]; return null; }
  function priceOpts() { return state.status === 'let' ? CR.priceLetOptions : CR.priceSaleOptions; }
  function results() { return CR.sort(CR.filter(DATA, {category:state.category,status:state.status,type:state.type,use:state.use,price:state.price,size:state.size}), state.sort); }

  function fillSelect(el, opts, val) { el.innerHTML = opts.map(function (o) { return '<option value="'+o.value+'">'+esc(o.label)+'</option>'; }).join(''); el.value = val; }
  function buildSeg(el, items) { el.innerHTML = items.map(function (it) { return '<button type="button" data-val="'+it.val+'">'+esc(it.label)+'</button>'; }).join(''); }
  function setActive(seg, val) { Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) { b.classList.toggle('is-active', b.dataset.val === val); }); }

  /* init controls */
  buildSeg(els.cat, [{val:'all',label:'All'},{val:'residential',label:'Residential'},{val:'commercial',label:'Commercial'}]);
  buildSeg(els.view, [{val:'grid',label:'Grid'},{val:'map',label:'Map'}]);
  fillSelect(els.status, CR.statusOptions, state.status);
  fillSelect(els.type, CR.typeOptions, state.type);
  fillSelect(els.price, priceOpts(), state.price);
  fillSelect(els.use, CR.useOptions, state.use);
  fillSelect(els.size, CR.sizeOptions, state.size);
  fillSelect(els.sort, CR.sortOptions, state.sort);

  /* events */
  els.cat.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setCat(b.dataset.val); });
  els.view.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { state.view = b.dataset.val; render(); } });
  els.status.addEventListener('change', function () { state.status = this.value; state.price = 'all'; fillSelect(els.price, priceOpts(), 'all'); render(); });
  els.type.addEventListener('change', function () { state.type = this.value; render(); });
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
    state.category = val; state.type = 'all'; state.use = 'all'; state.price = 'all'; state.size = 'all';
    els.type.value = 'all'; els.use.value = 'all'; els.price.value = 'all'; els.size.value = 'all';
    render();
  }
  function clearAll() {
    state.category = 'all'; state.status = 'all'; state.type = 'all'; state.use = 'all'; state.price = 'all'; state.size = 'all';
    els.status.value = 'all'; els.type.value = 'all'; els.use.value = 'all'; els.price.value = 'all'; els.size.value = 'all';
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
    els.status.value = state.status; els.type.value = state.type; els.price.value = state.price;
    els.use.value = state.use; els.size.value = state.size; els.sort.value = state.sort;
    renderChips();

    if (state.view === 'grid') {
      els.grid.hidden = false; els.mapbox.hidden = true;
      if (map) { map.remove(); map = null; markers = {}; }
      els.grid.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML();
    } else {
      els.grid.hidden = true; els.mapbox.hidden = false;
      els.mapcount.textContent = list.length;
      setTimeout(function () { ensureMap(); syncMarkers(list); if (map) map.invalidateSize(); }, 50);
    }
  }

  function renderChips() {
    var c = [], isCom = state.category === 'commercial';
    if (state.category !== 'all') c.push({label: isCom ? 'Commercial' : 'Residential', clear:function(){setCat('all');}});
    if (state.status !== 'all') c.push({label: state.status === 'sale' ? 'For sale' : 'To let', clear:function(){state.status='all';render();}});
    if (!isCom && state.type !== 'all') c.push({label:state.type, clear:function(){state.type='all';render();}});
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
        +'<img src="'+CR.img(l.photo,760,560)+'" alt="'+esc(l.title)+'" onerror="this.style.opacity=0">'
        +'<div class="ps-badges">'+CR.statusBadge(l)+(l.featured?'<span class="ps-badge ps-badge--featured">Featured</span>':'')+'</div>'
        +'<button class="ps-fav'+(fav?' is-fav':'')+'" data-fav="'+l.id+'" aria-label="Save property">'+(fav?'♥':'♡')+'</button>'
      +'</div>'
      +'<div class="ps-card-body">'
        +'<div class="ps-price">'+CR.formatPrice(l)+'</div>'
        +'<div class="ps-title">'+esc(l.title)+'</div>'
        +'<div class="ps-addr">'+esc(l.address)+', '+l.postcode+'</div>'
        +'<div class="ps-rule"></div>'
        +'<div class="ps-meta">'+CR.metaText(l)+'</div>'
      +'</div></article>';
  }

  function emptyHTML() { return '<div class="ps-empty"><h3>No properties match those filters.</h3><button type="button" class="btn" id="ps-reset">Reset search</button></div>'; }

  /* map */
  function ensureMap() {
    if (map) { map.invalidateSize(); return; }
    if (!window.L) {
      els.map.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5b6675;font-family:Jost,sans-serif;font-size:0.9rem;">Map unavailable — please refresh the page.</div>';
      return;
    }
    try {
      map = L.map(els.map, { zoomControl: true, scrollWheelZoom: false }).setView([51.485, -0.18], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      setTimeout(function () { if (map) map.invalidateSize(); }, 300);
    } catch (e) { console.warn('Map init failed', e); }
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
  function facts(l) {
    if (l.category === 'commercial') return [['Type',l.type],['Use',CR.cap(l.use)],['Floor area',Number(l.sqft).toLocaleString('en-GB')+' sq ft'],['Status',CR.statusLabel(l)],['Area',l.area+', '+l.postcode]];
    return [['Type',l.type],['Bedrooms',l.beds],['Bathrooms',l.baths],['Floor area',Number(l.sqft).toLocaleString('en-GB')+' sq ft'],['Area',l.area+', '+l.postcode]];
  }
  function openQuick(id) {
    var l = null; for(var i=0;i<DATA.length;i++){if(DATA[i].id===id){l=DATA[i];break;}} if(!l) return;
    state.quickId = id;
    var fav = !!state.favs[id];
    els.panel.innerHTML =
      '<div class="ps-panel-backdrop" data-close></div>'
      +'<aside class="ps-panel-sheet" role="dialog" aria-modal="true">'
        +'<div class="ps-panel-media"><img src="'+CR.gallery(l)[0]+'" alt="'+esc(l.title)+'" onerror="this.style.opacity=0">'
          +CR.statusBadge(l)
          +'<button class="ps-panel-close" data-close aria-label="Close">&times;</button></div>'
        +'<div class="ps-panel-body">'
          +'<div class="ps-panel-price">'+CR.formatPrice(l)+'</div>'
          +'<div class="ps-panel-title">'+esc(l.title)+'</div>'
          +'<div class="ps-panel-addr">'+esc(l.address)+', '+l.postcode+'</div>'
          +'<div class="ps-facts">'+facts(l).map(function(f){return '<div class="ps-fact"><dt>'+esc(f[0])+'</dt><dd>'+esc(String(f[1]))+'</dd></div>';}).join('')+'</div>'
          +'<p class="ps-blurb">'+esc(l.blurb)+'</p>'
          +'<div class="ps-panel-actions"><a href="../contact/" class="ps-btn-solid">Arrange a viewing</a>'
          +'<button type="button" class="ps-btn-fav" id="ps-panel-fav">'+(fav?'Saved ♥':'Save ♡')+'</button></div>'
        +'</div></aside>';
    els.panel.hidden = false;
    document.body.style.overflow = 'hidden';
    Array.prototype.forEach.call(els.panel.querySelectorAll('[data-close]'),function(x){x.addEventListener('click',closeQuick);});
    els.panel.querySelector('#ps-panel-fav').addEventListener('click',function(){toggleFav(id);});
  }
  function renderPanelFav(){var b=els.panel.querySelector('#ps-panel-fav');if(b)b.textContent=state.favs[state.quickId]?'Saved ♥':'Save ♡';}
  function closeQuick(){state.quickId=null;els.panel.hidden=true;els.panel.innerHTML='';document.body.style.overflow='';}

  render();
})();
