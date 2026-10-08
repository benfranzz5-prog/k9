# The K9 Boutique Hotel — website

Open `index.html` in any browser to view the site. No build step, no installs.

## Before going live — edit these

1. **WhatsApp number & socials** — top of `js/main.js`:
   ```js
   const CONFIG = {
     whatsapp: "523300000000",          // 52 + your 10-digit number, digits only
     phoneDisplay: "+52 33 0000 0000",
     instagram: "https://instagram.com/…",
     facebook: "https://facebook.com/…",
   };
   ```
   Every WhatsApp button, the booking form and the phone number on the page use these values.

2. **Facts to double-check** (adjust in `index.html` if any are off):
   - "A typical day" times: 08:00 hike, 13:00 lunch, 16:00 yard, 20:00 bed
   - Requirements: vaccines, deworming, flea/tick treatment, meet-and-greet before the first visit
   - Founder story (the founder section uses a pack photo, `img/k9-0727.webp`; swap in a photo of the founder if you have one)

## Structure

```
index.html          all page content (Spanish + English side by side: class="es" / class="en")
css/styles.css      design tokens (colors, spacing, type) + layout
js/main.js          language toggle, WhatsApp links, gallery, lightbox, booking form → WhatsApp
js/gallery-data.js  gallery photo list: [photo id, category, width, height]
img/                k9-XXXX.webp (large) and k9-XXXX-sm.webp (thumbnail); XXXX = photo number
img/logo*.png       logo (512px and 192px), favicon-32.png, apple-touch-icon.png, og-image.png
video/              hero video + poster image
```

The page works without JavaScript: all text, photos and the first 12 gallery photos are in the
HTML. JavaScript only adds the English toggle, gallery filters, "See more", the lightbox and the
WhatsApp message builder. There is no scroll animation.

## Adding gallery photos

Export a photo to `img/k9-XXXX.webp` (~1440px) and `img/k9-XXXX-sm.webp` (~720px), then add
`[XXXX, "montana", width, height]` to `js/gallery-data.js`. Categories: `montana`, `manada`,
`agua`, `ruta` (all shown under "Hikes") and `hotel`.

## Hosting

It's a plain static site — upload the whole `website` folder to Vercel, Netlify, Cloudflare Pages
or any web host. Then point your domain at it.
