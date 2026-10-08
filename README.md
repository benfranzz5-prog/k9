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

2. **Facts to double-check** (written from what you described — adjust in `index.html` if any are off):
   - "3h+" of mountain hiking every morning
   - Requirements: vaccines, deworming, flea/tick treatment, meet-and-greet before first stay
   - "By appointment" for drop-off/pick-up times
   - Founder photo (`img/k9-0750.webp`) and quote

## Structure

```
index.html          all page content (Spanish + English side by side: class="es" / class="en")
css/styles.css      design system + layout
js/main.js          language toggle, animations, gallery, lightbox, booking → WhatsApp
js/gallery-data.js  gallery photo list: [photo id, category, width, height]
img/                k9-XXXX.webp (large) and k9-XXXX-sm.webp (thumbnail); XXXX = photo number
video/              hero montage, pack walk and van clips (+ poster images)
```

## Adding gallery photos

Export a photo to `img/k9-XXXX.webp` (~1440px) and `img/k9-XXXX-sm.webp` (~720px), then add
`[XXXX, "montana", width, height]` to `js/gallery-data.js`. Categories: `montana`, `manada`,
`hotel`, `agua`, `ruta`.

## Hosting

It's a plain static site — upload the whole `website` folder to Vercel, Netlify, Cloudflare Pages
or any web host. Then point your domain at it.
