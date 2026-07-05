/* Cowan & Rutter — interactions */
(function () {
  "use strict";

  /* ---- Sticky header state ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      document.body.classList.toggle("nav-open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Subtle parallax on hero media ---- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && window.matchMedia("(min-width: 720px)").matches) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroMedia.style.transform = "translateY(" + y * 0.18 + "px)";
      }
    }, { passive: true });
  }

  /* ---- EmailJS config ---- */
  var EJS_SERVICE  = 'service_j0aq6ii';
  var EJS_TEMPLATE = 'template_868qre6';
  var EJS_KEY      = '7Bnpu7fCbIU5NHxMk';
  if (typeof emailjs !== 'undefined') { emailjs.init({ publicKey: EJS_KEY }); }

  /* ---- Pre-fill property from URL param (e.g. ?property=Plato+Place) ---- */
  var propPrefill = document.getElementById('property-prefill');
  if (propPrefill) {
    var urlProp = new URLSearchParams(window.location.search).get('property');
    if (urlProp) propPrefill.value = decodeURIComponent(urlProp);
  }

  /* ---- Contact form (EmailJS) ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof emailjs === 'undefined') {
        alert('Email service not loaded. Please call us on 020 7349 6666.');
        return;
      }
      var btn = document.getElementById('contact-submit');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

      var data = Object.fromEntries(new FormData(form));

      // Silently mirror every submission into the property database.
      // Falls back gracefully if the DB server is offline.
      var params = new URLSearchParams(window.location.search);
      fetch('https://web-production-3d01.up.railway.app/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_name:   data.from_name  || '',
          from_email:  data.from_email || '',
          phone:       data.phone      || '',
          property:    data.property   || '',
          interest:    data.interest   || 'General Enquiry',
          message:     data.message    || '',
          transaction: params.get('transaction') || '',
          category:    params.get('category')    || ''
        })
      }).catch(function () { /* DB offline — email still sends fine */ });

      emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
        from_name:  data.from_name  || '',
        from_email: data.from_email || '',
        phone:      data.phone      || '',
        property:   data.property   || '',
        interest:   data.interest   || 'General Enquiry',
        message:    data.message    || '',
        subject:    data.property
          ? 'Viewing request — ' + data.property
          : 'New enquiry — ' + (data.interest || 'General Enquiry')
      }).then(function () {
        var note = document.getElementById("form-success");
        if (note) note.classList.add("show");
        form.reset();
        if (btn) { btn.textContent = 'Send Enquiry'; btn.disabled = false; }
      }, function () {
        if (btn) { btn.textContent = 'Send Enquiry'; btn.disabled = false; }
        alert('Something went wrong. Please call us on 020 7349 6666 or email bc@cowanandrutter.co.uk');
      });
    });
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Property search ---- */
  var resultsEl = document.getElementById("property-results");
  if (resultsEl) {
    // Placeholder listings. Replace fetchProperties() below with a call to
    // the Kato API once credentials are available, returning the same shape:
    // { id, title, address, price, status, type, beds, baths, sqft, image }
    var sampleProperties = [
      {
        id: 1,
        title: "Period Townhouse",
        address: "Cadogan Square, Chelsea SW1X",
        price: 4250000,
        status: "Sale",
        type: "Residential",
        beds: 5,
        baths: 4,
        sqft: 3200,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: 2,
        title: "Retail Unit",
        address: "King's Road, Chelsea SW3",
        price: 95000,
        status: "Let",
        type: "Commercial",
        beds: 0,
        baths: 1,
        sqft: 1450,
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: 3,
        title: "Riverside Apartment",
        address: "The Plaza, King's Road SW10",
        price: 1850000,
        status: "Sale",
        type: "Residential",
        beds: 2,
        baths: 2,
        sqft: 1100,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: 4,
        title: "Office Suite",
        address: "Fulham Road, SW6",
        price: 65000,
        status: "Let",
        type: "Commercial",
        beds: 0,
        baths: 2,
        sqft: 2800,
        image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1000&q=80"
      }
    ];

    function fetchProperties() {
      return Promise.resolve(sampleProperties);
    }

    function formatPrice(p) {
      return "£" + p.toLocaleString("en-GB");
    }

    function renderProperties(list) {
      var emptyEl = document.getElementById("property-empty");
      resultsEl.innerHTML = "";

      if (!list.length) {
        if (emptyEl) emptyEl.style.display = "block";
        return;
      }
      if (emptyEl) emptyEl.style.display = "none";

      list.forEach(function (p) {
        var card = document.createElement("div");
        card.className = "property-card";

        var metaParts = [];
        if (p.type === "Residential") {
          metaParts.push(p.beds + " Bed");
          metaParts.push(p.baths + " Bath");
        } else {
          metaParts.push(p.type);
        }
        metaParts.push(p.sqft + " sq ft");

        card.innerHTML =
          '<div class="photo" style="background-image:url(\'' + p.image + '\');">' +
            '<span class="tag">' + (p.status === "Sale" ? "For Sale" : "To Let") + '</span>' +
          '</div>' +
          '<div class="body">' +
            '<div class="price">' + formatPrice(p.price) + (p.status === "Let" ? " pcm" : "") + '</div>' +
            '<div class="title">' + p.title + '</div>' +
            '<div class="addr">' + p.address + '</div>' +
            '<div class="meta">' + metaParts.map(function (m) { return "<span>" + m + "</span>"; }).join("") + '</div>' +
          '</div>';

        resultsEl.appendChild(card);
      });
    }

    function applyFilters(all) {
      var form = document.getElementById("property-filters");
      var type = form.elements.type.value;
      var status = form.elements.status.value;
      var maxPrice = form.elements.maxPrice.value;

      return all.filter(function (p) {
        if (type && p.type !== type) return false;
        if (status && p.status !== status) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        return true;
      });
    }

    var allProperties = [];
    fetchProperties().then(function (list) {
      allProperties = list;
      renderProperties(allProperties);
    });

    var filtersForm = document.getElementById("property-filters");
    if (filtersForm) {
      filtersForm.addEventListener("submit", function (e) {
        e.preventDefault();
        renderProperties(applyFilters(allProperties));
      });
    }
  }
})();
