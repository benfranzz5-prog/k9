/* ==========================================================================
   The K9 Boutique Hotel — interactions
   The page is fully readable without JavaScript; this file adds the
   language switch, WhatsApp links, gallery filters, lightbox and booking form.
   ========================================================================== */

/* ---- EDIT YOUR CONTACT DETAILS HERE ---- */
const CONFIG = {
  whatsapp: "523314236767",          // full number with country code, digits only (52 = México)
  phoneDisplay: "+52 33 1423 6767",  // how the number is shown on the page
  instagram: "https://www.instagram.com/thek9boutiquehotel/",
  facebook: "https://www.facebook.com/people/The-k9-boutique-hotel/100063778140840/",
};

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The page language comes from the address: / is Spanish, /en/ is English (built by tools/build.py).
  const lang = () => (root.lang === "en" ? "en" : "es");
  const base = root.dataset.root || "";  // "../" on /en/, so image paths still work

  /* ---------- Contact links ---------- */
  const waLink = (text = "") => `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  function updateWaLinks() {
    const msg = lang() === "en"
      ? "Hi! I'd like information about The K9 Boutique Hotel 🐾"
      : "¡Hola! Me gustaría información sobre The K9 Boutique Hotel 🐾";
    $$("[data-wa]").forEach(a => { a.href = waLink(msg); a.target = "_blank"; a.rel = "noopener"; });
  }
  $$("[data-phone]").forEach(el => (el.textContent = CONFIG.phoneDisplay));
  $$("[data-social]").forEach(a => { a.href = CONFIG[a.dataset.social]; a.target = "_blank"; a.rel = "noopener"; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu (<details>) ---------- */
  const menu = $(".menu");
  const closeMenu = () => menu.removeAttribute("open");
  $$(".menu-panel a").forEach(a => a.addEventListener("click", closeMenu));
  addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.open) { closeMenu(); $(".menu-btn").focus(); }
  });
  document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) closeMenu(); });

  /* ---------- Hero video: stay still for people who prefer less motion ---------- */
  const heroVideo = $(".hero-video");
  if (reduceMotion && heroVideo) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }
  else if (heroVideo && heroVideo.dataset.next) {
    // Play the banner clip first, then the montage, then repeat. A second <video> waits behind
    // the first so the switch is an instant cut. Without JavaScript the first clip simply loops.
    const next = document.createElement("video");
    Object.assign(next, { muted: true, playsInline: true, preload: "none", hidden: true, src: base + heroVideo.dataset.next });
    next.className = "hero-video";
    next.setAttribute("aria-hidden", "true");
    heroVideo.after(next);
    heroVideo.loop = false;
    heroVideo.addEventListener("playing", () => (next.preload = "auto"), { once: true });
    const clips = [heroVideo, next];
    clips.forEach((v, i) => v.addEventListener("ended", () => {
      const other = clips[1 - i];
      other.currentTime = 0;
      other.hidden = false;
      other.play().catch(() => {});
      v.hidden = true;
    }));
  }

  /* ---------- Gallery ---------- */
  const PAGE = 12;
  const GROUPS = { all: null, caminatas: ["montana", "manada", "agua", "ruta"], hotel: ["hotel"] };
  const ALT = {
    montana: { es: "Perros caminando en la montaña", en: "Dogs hiking in the mountains" },
    manada: { es: "La manada en la montaña", en: "The pack in the mountains" },
    agua: { es: "Perros refrescándose en el agua", en: "Dogs cooling off in the water" },
    hotel: { es: "Perros en el hotel", en: "Dogs at the hotel" },
    ruta: { es: "Perros en una caminata", en: "Dogs on a hike" },
  };
  const gallery = $("#gallery"), loadMore = $("#loadMore"), filters = $(".filters");
  const file = (id, sm) => `${base}img/k9-${String(id).padStart(4, "0")}${sm ? "-sm" : ""}.webp`;
  let filter = "all", shown = PAGE, list = [];

  function renderGallery() {
    const group = GROUPS[filter];
    list = (window.GALLERY || []).filter(g => !group || group.includes(g[1]));
    gallery.replaceChildren(...list.slice(0, shown).map(([id, cat, w, h], idx) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = file(id, false);
      const img = new Image(w > h ? 720 : 540, w > h ? 540 : 720);
      img.src = file(id, true); img.loading = "lazy"; img.alt = ALT[cat][lang()];
      a.appendChild(img);
      a.addEventListener("click", e => { e.preventDefault(); openLightbox(idx, a); });
      li.appendChild(a);
      return li;
    }));
    loadMore.hidden = shown >= list.length;
  }
  if (window.GALLERY) {
    filters.hidden = false;
    $$("button", filters).forEach(b => b.addEventListener("click", () => {
      $$("button", filters).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      filter = b.dataset.filter; shown = PAGE; renderGallery();
    }));
    loadMore.addEventListener("click", () => {
      const first = shown;
      shown += PAGE; renderGallery();
      // move keyboard focus to the first new photo
      const next = $$("a", gallery)[first];
      if (next) next.focus({ preventScroll: true });
    });
    renderGallery();  // replaces the 12 static photos with interactive ones
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCount = $(".lb-count", lb);
  let lbIndex = 0, lbReturn = null;
  function showLb(i) {
    lbIndex = (i + list.length) % list.length;
    const [id, cat] = list[lbIndex];
    lbImg.src = file(id, true);
    lbImg.alt = ALT[cat][lang()];
    const full = new Image();
    full.onload = () => { if (list[lbIndex][0] === id) lbImg.src = full.src; };
    full.src = file(id, false);
    lbCount.textContent = `${lbIndex + 1} / ${list.length}`;
  }
  function openLightbox(i, from) { lbReturn = from; showLb(i); lb.showModal(); }
  lb.addEventListener("close", () => { if (lbReturn) lbReturn.focus(); });
  $(".lb-close", lb).addEventListener("click", () => lb.close());
  $(".lb-prev", lb).addEventListener("click", () => showLb(lbIndex - 1));
  $(".lb-next", lb).addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", e => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Booking form -> WhatsApp ---------- */
  const form = $("#bookingForm");
  $$("[data-service]").forEach(a => a.addEventListener("click", () => {
    const r = form.querySelector(`input[value="${a.dataset.service}"]`);
    if (r) r.checked = true;
  }));
  function setError(name, on) {
    const input = form.elements[name];
    input.setAttribute("aria-invalid", String(on));
    $(`#${input.id}-err`).hidden = !on;
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const missing = ["name", "dog"].filter(k => !String(d[k] || "").trim());
    ["name", "dog"].forEach(k => setError(k, missing.includes(k)));
    if (missing.length) { form.elements[missing[0]].focus(); return; }
    const en = lang() === "en";
    const services = en
      ? { hotel: "Hotel stay", caminata: "Pack mountain hike" }
      : { hotel: "Estancia en hotel", caminata: "Caminata en manada" };
    const lines = en ? [
      "Hi! I'd like to book at The K9 Boutique Hotel 🐾", "",
      `• Service: ${services[d.service]}`, `• My name: ${d.name}`, `• Dog: ${d.dog}`,
      (d.breed ? `• Breed / age: ${d.breed}` : null),
      (d.from || d.to ? `• Dates: ${d.from || "?"} → ${d.to || "?"}` : null), (d.notes ? `• About my dog: ${d.notes}` : null),
    ] : [
      "¡Hola! Quiero reservar en The K9 Boutique Hotel 🐾", "",
      `• Servicio: ${services[d.service]}`, `• Mi nombre: ${d.name}`, `• Perro: ${d.dog}`,
      (d.breed ? `• Raza / edad: ${d.breed}` : null),
      (d.from || d.to ? `• Fechas: ${d.from || "?"} → ${d.to || "?"}` : null), (d.notes ? `• Sobre mi perro: ${d.notes}` : null),
    ];
    window.open(waLink(lines.filter(l => l !== null).join("\n")), "_blank", "noopener");
  });
  ["name", "dog"].forEach(k => form.elements[k].addEventListener("input", () => {
    if (form.elements[k].value.trim()) setError(k, false);
  }));

  /* ---------- Start ---------- */
  updateWaLinks();
})();
