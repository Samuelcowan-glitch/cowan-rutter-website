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

  /* ---- Contact form (opens a pre-filled email to bc@cowanandrutter.co.uk) ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = Object.fromEntries(new FormData(form));
      var subject = "New enquiry from cowanandrutter.co.uk — " + (data.interest || "General Enquiry");
      var bodyLines = [
        "Name: " + (data.name || ""),
        "Email: " + (data.email || ""),
        "Telephone: " + (data.phone || ""),
        "Area of Interest: " + (data.interest || ""),
        "",
        "Message:",
        data.message || ""
      ];
      var mailto =
        "mailto:bc@cowanandrutter.co.uk" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;

      var note = document.getElementById("form-success");
      if (note) note.classList.add("show");
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
