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
  <script type="application/ld+json">{jsonld}</script>
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
      <a href="../../properties/" class="btn btn-light" style="margin-left:12px">&larr; Back to all properties</a>
    </div>
  </section>

{footer}

  <script src="../../js/main.js"></script>
</body>
</html>
"""


def slugify(text):
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "listing"


def esc(value):
    return html.escape(str(value)) if value is not None else ""


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
    status_label = {"let": "To Let", "sale": "For Sale", "sold": "Sold", "available": "Available"}.get(status, status.title())

    blurb = listing.get("blurb") or ""
    blurb_plain = re.sub(r"\s+", " ", blurb).strip()
    description = blurb_plain[:155] if blurb_plain else f"{address}, {area} — {category_label} {status_label.lower()} with Cowan & Rutter, established West London property consultants."
    description = esc(description)

    slug = slugify(f"{address}-{listing['id']}")
    canonical = f"{SITE_URL}/{OUT_DIR}/{slug}/"

    photo_id = listing.get("photo")
    og_image = ""
    image_block = ""
    if photo_id:
        img_url = f"https://images.unsplash.com/{photo_id}?w=1200&q=80&auto=format&fit=crop"
        og_image = f'<meta property="og:image" content="{img_url}" />'
        image_block = f'<img src="{img_url}" alt="{esc(address)}" style="width:100%;border-radius:8px;aspect-ratio:16/9;object-fit:cover" />'

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

    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": address,
        "description": description,
        "url": canonical,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": area,
            "postalCode": listing.get("postcode") or "",
            "addressCountry": "GB",
        },
    })

    nav = NAV_HTML.format(root="../../")
    footer = FOOTER_HTML.format(root="../../")

    page = PAGE_TEMPLATE.format(
        title=esc(f"{address} — Cowan & Rutter"),
        description=description,
        canonical=canonical,
        og_image=og_image,
        jsonld=jsonld,
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


def write_sitemap(listing_paths):
    urls = []
    for path, priority in STATIC_SITEMAP_URLS:
        urls.append(f"  <url>\n    <loc>{SITE_URL}/{path}</loc>\n    <priority>{priority}</priority>\n  </url>")
    for path in listing_paths:
        loc = f"{SITE_URL}{path}"
        urls.append(f"  <url>\n    <loc>{loc}</loc>\n    <priority>0.6</priority>\n  </url>")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"
    with open("sitemap.xml", "w") as f:
        f.write(xml)


def main():
    with urllib.request.urlopen(API_URL, timeout=30) as resp:
        listings = json.loads(resp.read())

    current_slugs = set()
    written = []
    for listing in listings:
        if not listing.get("id"):
            continue
        slug, page = build_page(listing)
        current_slugs.add(slug)
        out_path = os.path.join(OUT_DIR, slug, "index.html")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w") as f:
            f.write(page)
        written.append(f"/{OUT_DIR}/{slug}/")

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

    write_sitemap(written)
    print("Updated sitemap.xml")


if __name__ == "__main__":
    main()
