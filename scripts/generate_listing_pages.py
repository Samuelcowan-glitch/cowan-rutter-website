#!/usr/bin/env python3
"""
Generates a static, crawlable HTML page for every live website listing.

Reads from the cr-property-db public API (/api/listings) and writes one
page per listing to listings/<slug>/index.html, with a unique <title>,
meta description, and schema.org RealEstateListing JSON-LD block, so each
property is individually indexable by Google (the search page itself is
JS-rendered and not crawlable per-listing).

Run from the repo root: python3 generate_listing_pages.py
"""
import datetime
import html
import json
import os
import re
import sys
import urllib.request

API_URL = "https://web-production-3d01.up.railway.app/api/listings"
SITE_URL = "https://cowanandrutter.com"
OUT_DIR = "listings"

NAV_HTML = """  <header class="site-header">
    <div class="container nav-inner">
      <a class="brand" href="{root}">
        <img src="{root}img/logo.png" alt="Cowan &amp; Rutter" class="brand-logo" />
      </a>
      <nav class="nav-links">
        <a href="{root}">Home</a>
        <a href="{root}services/">Services</a>
        <a href="{root}properties/">Properties</a>
        <a href="{root}team/">Our Team</a>
        <a href="{root}contact/">Contact</a>
      </nav>
      <button class="nav-toggle" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>"""

FOOTER_HTML = """  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="brand-name">Cowan &amp; Rutter</span>
          <p>Established property consultants, advising across Chelsea and West London.</p>
        </div>
        <div class="footer-col">
          <h4>Navigate</h4>
          <a href="{root}">Home</a>
          <a href="{root}services/">Services</a>
          <a href="{root}properties/">Properties</a>
          <a href="{root}team/">Our Team</a>
          <a href="{root}contact/">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Visit Us</h4>
          <p>319 The Plaza<br />535 King&rsquo;s Road<br />London SW10 0SZ</p>
          <a href="tel:+442073496666">020 7349 6666</a>
          <a href="mailto:bc@cowanandrutter.co.uk">bc@cowanandrutter.co.uk</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; <span id="year">2026</span> Cowan &amp; Rutter Property Services Limited. All rights reserved. &middot; <a href="{root}privacy-statement/">Privacy</a> &middot; <a href="{root}cookie-statement/">Cookies</a></span>
        <span>Chelsea &middot; Kensington &middot; Fulham &middot; Putney</span>
      </div>
    </div>
  </footer>"""

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="{canonical}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  {og_image}
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../css/styles.css" />
  <link rel="stylesheet" href="../../css/property-search.css" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="/favicon-512.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:site_name" content="Cowan &amp; Rutter" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  {twitter_image}
  <script type="application/ld+json">{jsonld}</script>
  <script type="application/ld+json">{breadcrumbs}</script>
  <script src="/js/analytics.js" defer></script>
</head>
<body class="ps-page">
{nav}

  <section class="ps-hero" style="padding-bottom:40px">
    <div class="container">
      <span class="eyebrow">{category_label} &middot; {status_label}</span>
      <h1>{address}</h1>
      <p class="ps-hero-sub">{price_display}{sqft_line}</p>
    </div>
  </section>

  <section class="container" style="max-width:820px;margin:0 auto 60px;padding:0 20px">
    {image_block}

    <div style="display:flex;flex-wrap:wrap;gap:24px;margin:28px 0;font-size:.95rem;color:#3a4560">
      {facts_html}
    </div>

    {blurb_html}
    {key_terms_html}
    {location_html}

    <div style="margin-top:40px;padding-top:28px;border-top:1px solid rgba(14,31,68,.1)">
      <a href="../../contact/?property={listing_id}" class="btn btn-primary">Enquire about this property</a>
      <button type="button" id="share-property" class="btn btn-share" style="margin-left:12px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"></line>
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line>
        </svg><span class="share-label">Share</span>
      </button>
      <a href="../../properties/" class="btn btn-light" style="margin-left:12px">&larr; Back to all properties</a>
    </div>
  </section>

{footer}

  <script src="../../js/main.js"></script>
  <script src="../../js/listing-gallery.js"></script>
  <script src="../../js/listing-share.js"></script>
</body>
</html>
"""


def slugify(text):
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "listing"


def esc(value):
    return html.escape(str(value)) if value is not None else ""


def sized(url, width):
    """Ask the photo API for a resized copy.

    The admin app serves the raw upload by default — often 3MB per photograph —
    and supports a ?w= parameter that returns a cached, resized JPEG instead.
    """
    if not url or "?" in url:
        return url
    return f"{url}?w={width}"


def fmt_price(listing):
    if listing.get("priceDisplay"):
        return esc(listing["priceDisplay"])
    price = listing.get("price")
    unit = listing.get("priceUnit")
    if not price:
        return "Price on application"
    amount = "£{:,.0f}".format(price)
    if unit == "pa":
        return amount + " per annum"
    if unit == "pcm":
        return amount + " per calendar month"
    if unit == "sale":
        return amount
    return amount


def build_facts(listing):
    facts = []
    if listing.get("beds"):
        facts.append(f"<div><strong>{esc(listing['beds'])}</strong><br>Bedrooms</div>")
    if listing.get("baths"):
        facts.append(f"<div><strong>{esc(listing['baths'])}</strong><br>Bathrooms</div>")
    if listing.get("sqft"):
        facts.append(f"<div><strong>{esc(listing['sqft'])} sq ft</strong><br>{esc(listing.get('measurement') or '')}</div>")
    if listing.get("yield"):
        facts.append(f"<div><strong>{esc(listing['yield'])}%</strong><br>Yield</div>")
    if listing.get("tenure"):
        facts.append(f"<div><strong>{esc(listing['tenure'])}</strong><br>Tenure</div>")
    if listing.get("leaseYears"):
        facts.append(f"<div><strong>{esc(listing['leaseYears'])} yrs</strong><br>Lease Remaining</div>")
    return "\n      ".join(facts)


def build_page(listing):
    address = listing.get("title") or listing.get("address") or "Property"
    area = listing.get("area") or ""
    category = listing.get("category") or "commercial"
    category_label = "Residential" if category == "residential" else "Commercial"
    status = listing.get("status") or "available"
    # The marketing status (Under Offer / Let Agreed / Sold / Withdrawn) takes
    # precedence over the transaction type, matching what the search cards show
    # via statusLabel() in js/listings.js. Without this a withdrawn or
    # let-agreed property still read "To Let" on its own details page.
    listing_status = str(listing.get("listingStatus") or "available").lower().replace(" ", "-")
    status_label = {
        "under-offer": "Under Offer",
        "let-agreed": "Let Agreed",
        "sold": "Sold",
        "sold-stc": "Sold STC",
        "withdrawn": "Withdrawn",
    }.get(listing_status)
    if not status_label:
        status_label = {"let": "To Let", "sale": "For Sale", "sold": "Sold",
                        "available": "Available"}.get(status, status.title())

    blurb = listing.get("blurb") or ""
    blurb_plain = re.sub(r"\s+", " ", blurb).strip()
    description = blurb_plain[:155] if blurb_plain else f"{address}, {area} — {category_label} {status_label.lower()} with Cowan & Rutter, established West London property consultants."
    description = esc(description)

    slug = slugify(f"{address}-{listing['id']}")
    canonical = f"{SITE_URL}/{OUT_DIR}/{slug}/"

    # Real photographs of the property come first (uploaded in the admin app and
    # served by the API); the Unsplash placeholder is only used when a listing
    # genuinely has no photos yet.
    # Only this property's own photographs are ever shown. With none uploaded
    # the page falls back to the house "no photograph" panel — never a stock
    # image, which previously made unrelated buildings look like the listing.
    photos = [p for p in (listing.get("photos") or []) if p]
    og_image = ""
    twitter_image = ""
    image_block = ""
    hero_url = sized(photos[0], 1400) if photos else ""

    if not hero_url:
        image_block = (
            f'<img src="{SITE_URL}/img/no-photo.svg" alt="No photograph available for {esc(address)}" '
            f'style="width:100%;border-radius:8px;aspect-ratio:16/9;object-fit:cover" />'
        )

    if hero_url:
        og_image = f'<meta property="og:image" content="{esc(hero_url)}" />'
        twitter_image = f'<meta name="twitter:image" content="{esc(hero_url)}" />'

        # Every photograph uploaded against this listing, at display size. The
        # gallery script reads this list, so the page carries one copy of the
        # image data and no more.
        full_urls = [sized(p, 1400) for p in photos] or [hero_url]
        photos_json = esc(json.dumps(full_urls))

        arrows = ""
        counter = ""
        if len(full_urls) > 1:
            arrows = (
                '<button type="button" class="lg-nav lg-prev" aria-label="Previous photograph">'
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                '<polyline points="15 18 9 12 15 6"></polyline></svg></button>'
                '<button type="button" class="lg-nav lg-next" aria-label="Next photograph">'
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                '<polyline points="9 18 15 12 9 6"></polyline></svg></button>'
            )
            counter = f'<div class="lg-count">1 / {len(full_urls)}</div>'

        image_block = (
            f'<div class="lg-frame" data-photos="{photos_json}" tabindex="0" '
            f'role="group" aria-label="Photographs of {esc(address)}">'
            # No width/height attributes: they become presentational hints that
            # beat the CSS aspect-ratio and stretch the image. aspect-ratio
            # already reserves the space, so there is no layout shift.
            f'<img class="lg-main" src="{esc(hero_url)}" alt="{esc(address)}" '
            f'data-alt-base="{esc(address)}" fetchpriority="high" />'
            f'{arrows}{counter}</div>'
        )

        if len(full_urls) > 1:
            thumbs = "".join(
                f'<button type="button" class="lg-thumb" '
                f'aria-label="Show photograph {i + 1} of {len(full_urls)}">'
                f'<img src="{esc(sized(p, 500))}" alt="{esc(address)} &mdash; photograph {i + 1}" '
                f'loading="lazy" decoding="async" /></button>'
                for i, p in enumerate(photos[:12])
            )
            image_block += (
                '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));'
                f'gap:10px;margin-top:10px">{thumbs}</div>'
            )

    price_display = fmt_price(listing)
    sqft_line = f" &middot; {esc(listing['sqft'])} sq ft" if listing.get("sqft") else ""

    facts_html = build_facts(listing)

    # Bold section headings (Jost 600, spaced uppercase — matches the search-panel style)
    h3_style = "font-size:.85rem;font-family:var(--sans);font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:var(--ink);margin:0 0 8px"

    blurb_html = f'<div style="margin-top:20px"><h3 style="{h3_style}">Description</h3><p style="line-height:1.7;margin:0">{esc(blurb_plain)}</p></div>' if blurb_plain else ""

    key_terms = listing.get("keyTerms") or ""
    key_terms_html = ""
    if key_terms.strip():
        items = "".join(f"<li>{esc(t.strip())}</li>" for t in re.split(r"[\r\n·]+", key_terms) if t.strip())
        key_terms_html = f'<div style="margin-top:20px"><h3 style="{h3_style}">Key Terms</h3><ul style="padding-left:20px;margin:0">{items}</ul></div>'

    location_text = listing.get("locationText") or ""
    location_html = ""
    if location_text.strip():
        location_html = f'<div style="margin-top:20px"><h3 style="{h3_style}">Location</h3><p style="line-height:1.7;margin:0">{esc(location_text.strip())}</p></div>'

    listing_schema = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": address,
        "description": description,
        "url": canonical,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": listing.get("address") or address,
            "addressLocality": area or "London",
            "postalCode": listing.get("postcode") or "",
            "addressCountry": "GB",
        },
        "provider": {
            "@type": "RealEstateAgent",
            "@id": f"{SITE_URL}/#organisation",
            "name": "Cowan & Rutter",
            "url": f"{SITE_URL}/",
            "telephone": "+44 20 7349 6666",
        },
    }
    if hero_url:
        listing_schema["image"] = [sized(p, 1400) for p in photos[:9]] if photos else [hero_url]
    if listing.get("added"):
        listing_schema["datePosted"] = listing["added"]
    if listing.get("lat") and listing.get("lng"):
        listing_schema["geo"] = {
            "@type": "GeoCoordinates",
            "latitude": listing["lat"],
            "longitude": listing["lng"],
        }
    if listing.get("sqft"):
        listing_schema["floorSize"] = {
            "@type": "QuantitativeValue",
            "value": listing["sqft"],
            "unitCode": "FTK",
        }
    if listing.get("beds"):
        listing_schema["numberOfBedrooms"] = listing["beds"]
    if listing.get("baths"):
        listing_schema["numberOfBathroomsTotal"] = listing["baths"]
    if listing.get("price"):
        offer = {
            "@type": "Offer",
            "price": listing["price"],
            "priceCurrency": "GBP",
            "availability": ("https://schema.org/SoldOut"
                             if status == "sold" or listing_status in
                             ("sold", "sold-stc", "let-agreed", "withdrawn")
                             else "https://schema.org/InStock"),
            "url": canonical,
        }
        if listing.get("priceUnit") in ("pa", "pcm"):
            offer["@type"] = "Offer"
            offer["priceSpecification"] = {
                "@type": "UnitPriceSpecification",
                "price": listing["price"],
                "priceCurrency": "GBP",
                "unitText": "per annum" if listing["priceUnit"] == "pa" else "per calendar month",
            }
        listing_schema["offers"] = offer

    jsonld = json.dumps(listing_schema)

    breadcrumbs = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Properties", "item": f"{SITE_URL}/properties/"},
            {"@type": "ListItem", "position": 3, "name": address, "item": canonical},
        ],
    })

    nav = NAV_HTML.format(root="../../")
    footer = FOOTER_HTML.format(root="../../")

    page = PAGE_TEMPLATE.format(
        title=esc(f"{address} — Cowan & Rutter"),
        description=description,
        canonical=canonical,
        og_image=og_image,
        twitter_image=twitter_image,
        jsonld=jsonld,
        breadcrumbs=breadcrumbs,
        nav=nav,
        category_label=category_label,
        status_label=status_label,
        address=esc(address),
        price_display=price_display,
        sqft_line=sqft_line,
        image_block=image_block,
        facts_html=facts_html,
        blurb_html=blurb_html,
        key_terms_html=key_terms_html,
        location_html=location_html,
        listing_id=esc(listing["id"]),
        footer=footer,
    )
    return slug, page


STATIC_SITEMAP_URLS = [
    ("", "1.0"),
    ("properties/", "0.9"),
    ("services/", "0.8"),
    ("team/", "0.7"),
    ("contact/", "0.7"),
    ("privacy-statement/", "0.3"),
    ("cookie-statement/", "0.3"),
]


def write_sitemap(entries):
    """entries: list of {path, lastmod} for each listing page."""
    today = datetime.date.today().isoformat()
    urls = []
    for path, priority in STATIC_SITEMAP_URLS:
        urls.append(
            f"  <url>\n    <loc>{SITE_URL}/{path}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n    <priority>{priority}</priority>\n  </url>"
        )
    for entry in entries:
        lastmod = entry.get("lastmod") or today
        urls.append(
            f"  <url>\n    <loc>{SITE_URL}{entry['path']}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n    <priority>0.6</priority>\n  </url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"
    with open("sitemap.xml", "w") as f:
        f.write(xml)


INDEX_START = "<!-- LISTING-INDEX:START -->"
INDEX_END = "<!-- LISTING-INDEX:END -->"
PROPERTIES_PAGE = os.path.join("properties", "index.html")


def write_listing_index(entries):
    """Write a plain-HTML list of every live listing into properties/index.html.

    The search grid is rendered in JavaScript, so without this block nothing on
    the site links to the individual listing pages and search engines can only
    reach them via the sitemap — which leaves them crawled slowly and ranked
    poorly. This block gives every property a real internal link.
    """
    if not os.path.exists(PROPERTIES_PAGE):
        print(f"Skipped listing index — {PROPERTIES_PAGE} not found")
        return

    with open(PROPERTIES_PAGE) as f:
        src = f.read()

    if INDEX_START not in src or INDEX_END not in src:
        print(f"Skipped listing index — markers missing in {PROPERTIES_PAGE}")
        return

    groups = [("Commercial property", "commercial"), ("Residential property", "residential")]
    sections = []
    for heading, category in groups:
        items = [e for e in entries if e["category"] == category]
        if not items:
            continue
        items.sort(key=lambda e: e["title"].lower())
        lis = "\n".join(
            '          <li><a href="{path}">{title}</a>{meta}</li>'.format(
                path=e["path"],
                title=esc(e["title"]),
                meta=f' <span>&middot; {esc(e["meta"])}</span>' if e["meta"] else "",
            )
            for e in items
        )
        sections.append(
            f"      <h3>{heading}</h3>\n        <ul>\n{lis}\n        </ul>"
        )

    block = (
        "\n      <h2>All current properties</h2>\n"
        "      <p>Every property we are currently marketing, with a full details page for each.</p>\n"
        + "\n".join(sections)
        + "\n      "
    )

    new_src = re.sub(
        re.escape(INDEX_START) + r".*?" + re.escape(INDEX_END),
        INDEX_START + block + INDEX_END,
        src,
        flags=re.S,
    )

    if new_src != src:
        with open(PROPERTIES_PAGE, "w") as f:
            f.write(new_src)
        print(f"Updated listing index in {PROPERTIES_PAGE} ({len(entries)} links)")
    else:
        print("Listing index already up to date")


def index_meta(listing):
    """Short suffix shown after each link in the index — area, size, price."""
    bits = []
    if listing.get("area"):
        bits.append(str(listing["area"]))
    if listing.get("sqft"):
        bits.append(f"{listing['sqft']:,} sq ft" if isinstance(listing["sqft"], (int, float)) else f"{listing['sqft']} sq ft")
    price = fmt_price(listing)
    if price and price != "Price on application":
        bits.append(html.unescape(price))
    return " · ".join(bits)


def main():
    # Optional local file argument: `python3 scripts/generate_listing_pages.py api.json`
    # Useful for testing on a machine whose Python cannot verify the API's TLS
    # certificate; CI always runs without an argument and reads the live API.
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            listings = json.load(f)
    else:
        with urllib.request.urlopen(API_URL, timeout=30) as resp:
            listings = json.loads(resp.read())

    current_slugs = set()
    written = []
    entries = []
    for listing in listings:
        if not listing.get("id"):
            continue
        slug, page = build_page(listing)
        current_slugs.add(slug)
        out_path = os.path.join(OUT_DIR, slug, "index.html")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w") as f:
            f.write(page)
        path = f"/{OUT_DIR}/{slug}/"
        written.append(path)
        entries.append({
            "path": path,
            "title": listing.get("title") or listing.get("address") or "Property",
            "category": "residential" if listing.get("category") == "residential" else "commercial",
            "meta": index_meta(listing),
            "lastmod": listing.get("added") or None,
        })

    # remove stale listing directories (listing deleted/unpublished since last run)
    if os.path.isdir(OUT_DIR):
        for entry in os.listdir(OUT_DIR):
            entry_path = os.path.join(OUT_DIR, entry)
            if os.path.isdir(entry_path) and entry not in current_slugs:
                import shutil
                shutil.rmtree(entry_path)
                print(f"Removed stale listing page: {entry}")

    print(f"Generated {len(written)} listing pages.")

    with open(os.path.join(OUT_DIR, "_index.json"), "w") as f:
        json.dump(written, f)

    write_sitemap(entries)
    print("Updated sitemap.xml")

    write_listing_index(entries)


if __name__ == "__main__":
    main()
