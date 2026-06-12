# Cowan &amp; Rutter — Website

A boutique real estate property consultancy website for **Cowan &amp; Rutter**,
based on the King's Road in Chelsea, London. This is a static refresh of
[cowanandrutter.co.uk](https://www.cowanandrutter.co.uk/), adopting a sharp,
confident theme of dark blue, red and white.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Wide cinematic London hero with special effects (slow Ken Burns zoom, layered gradient wash, moving sheen, scroll parallax), firm introduction, services preview and call to action. |
| Services | `services.html` | The three core disciplines — **Commercial Agency**, **Residential Agency** and **Management** — with detailed descriptions. |
| Contact | `contact.html` | Office details, enquiry form and an embedded map of the Chelsea office. |

## Structure

```
website/
├── index.html
├── services.html
├── contact.html
├── css/
│   └── styles.css
└── js/
    └── main.js
```

## Design

- **Typography:** Cormorant Garamond (serif headings) + Jost (sans body), via Google Fonts.
- **Palette:** Dark blue `#0e1f44`, red `#c1121f`, white `#ffffff`.
- **Effects:** Cinematic hero animation, scroll-reveal sections, sticky translucent header, responsive mobile navigation.

## Viewing locally

It is a plain static site — open `index.html` in a browser, or serve the folder:

```bash
cd website
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Hero and section imagery is loaded from Unsplash via URL and requires an
> internet connection to display.
