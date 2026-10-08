/* ==========================================================================
   The K9 Boutique Hotel — interactions
   ========================================================================== */

/* ---- EDIT YOUR CONTACT DETAILS HERE ---- */
const CONFIG = {
  whatsapp: "523300000000",          // full number with country code, digits only (52 = México)
  phoneDisplay: "+52 33 0000 0000",  // how the number is shown on the page
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- Language ---------- */
  const lang = () => root.lang;
  function setLang(l) {
    root.lang = l;
    $$(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
    store.set("k9-lang", l);
  }
  const saved = store.get("k9-lang");
  setLang(saved || ((navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es"));
  $$(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ---------- Contact links ---------- */
  const waLink = (text = "") => `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  $$("[data-wa]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const msg = lang() === "en"
        ? "Hi! I'd like information about The K9 Boutique Hotel 🐾"
        : "¡Hola! Me gustaría información sobre The K9 Boutique Hotel 🐾";
      window.open(waLink(msg), "_blank", "noopener");
    });
  });
  $$("[data-phone]").forEach(el => (el.textContent = CONFIG.phoneDisplay));
  $$("[data-social]").forEach(a => { a.href = CONFIG[a.dataset.social]; a.target = "_blank"; a.rel = "noopener"; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Load-in ---------- */
  const markLoaded = () => document.body.classList.add("loaded");
  requestAnimationFrame(() => setTimeout(markLoaded, 120));

  /* ---------- Header ---------- */
  const header = $("#header");
  let lastY = 0;
  function onScrollHeader() {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hide", y > lastY && y > 600 && !document.body.classList.contains("menu-open"));
    lastY = y;
    $(".wa-float").classList.toggle("show", y > innerHeight * 0.8);
  }

  /* ---------- Mobile menu ---------- */
  $(".menu-toggle").addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    $(".mobile-menu").setAttribute("aria-hidden", String(!open));
  });
  $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    $(".mobile-menu").setAttribute("aria-hidden", "true");
  }));

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      revealIO.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const observeReveals = (scope = document) => $$(".reveal, .reveal-img", scope).forEach(el => revealIO.observe(el));
  observeReveals();

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      reduceMotion ? (el.textContent = end) : requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => countIO.observe(el));

  /* ---------- Manifesto: words light up while scrolling ---------- */
  const wordsBlock = $("[data-words]");
  function splitWords(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement("span");
          s.className = "w"; s.textContent = part; frag.appendChild(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) splitWords(child);
    });
  }
  if (wordsBlock) splitWords(wordsBlock);
  function onScrollWords() {
    if (!wordsBlock) return;
    const r = wordsBlock.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const words = $$(`.${lang()} .w`, wordsBlock);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  }
  if (reduceMotion && wordsBlock) $$(".w", wordsBlock).forEach(w => w.classList.add("on"));

  /* ---------- Lazy, in-view-only videos ---------- */
  const vidIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
        if (!reduceMotion) v.play().catch(() => {});
      } else v.pause();
    });
  }, { threshold: 0.15 });
  $$("video[data-src]").forEach(v => vidIO.observe(v));
  const heroVideo = $("#heroVideo");
  if (reduceMotion && heroVideo) heroVideo.pause();

  /* ---------- Scroll-driven effects ---------- */
  const packVideo = $("#packVideo");
  const strip = $("#strip"), stripTrack = strip && $(".strip-track", strip);
  const parallaxEls = $$("[data-parallax]");
  const heroMedia = $(".hero-media");

  function onScrollEffects() {
    if (reduceMotion) return;
    const vh = innerHeight;

    if (heroMedia && scrollY < vh * 1.2) {
      heroMedia.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0) scale(${1 + scrollY / vh * 0.08})`;
    }
    if (packVideo) {
      const r = packVideo.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      packVideo.style.transform = `scale(${0.86 + p * 0.14})`;
      packVideo.style.borderRadius = `${40 - p * 18}px`;
    }
    if (stripTrack) {
      const r = strip.getBoundingClientRect();
      const p = (vh - r.top) / (vh + r.height);
      const max = stripTrack.scrollWidth - innerWidth;
      stripTrack.style.transform = `translate3d(${-Math.max(0, Math.min(1, p)) * max}px, 0, 0)`;
    }
    parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2 - vh / 2;
      el.style.translate = `0 ${c * +el.dataset.parallax}px`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader(); onScrollWords(); onScrollEffects();
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("load", onScroll);
  onScroll();

  /* ---------- A day: sticky visual follows the steps ---------- */
  const steps = $$(".day-step"), dayImgs = $$(".day-visual img"), clock = $("#dayClock");
  const dayIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = steps.indexOf(en.target);
      steps.forEach((s, k) => s.classList.toggle("active", k === i));
      dayImgs.forEach((img, k) => img.classList.toggle("active", k === i));
      if (clock) clock.textContent = en.target.dataset.time;
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach(s => dayIO.observe(s));

  /* ---------- Gallery ---------- */
  const masonry = $("#masonry"), loadMore = $("#loadMore");
  const PAGE = 20;
  let filter = "all", shown = PAGE, list = [];
  const file = (id, sm) => `img/k9-${String(id).padStart(4, "0")}${sm ? "-sm" : ""}.webp`;

  function renderGallery() {
    list = (window.GALLERY || []).filter(g => filter === "all" || g[1] === filter);
    masonry.innerHTML = "";
    list.slice(0, shown).forEach(([id, , w, h], idx) => {
      const fig = document.createElement("figure");
      fig.className = "tile reveal";
      fig.dataset.cursor = "ver";
      fig.innerHTML = `<img src="${file(id, true)}" width="${w}" height="${h}" loading="lazy" alt="The K9 Boutique Hotel">`;
      fig.addEventListener("click", () => openLightbox(idx));
      masonry.appendChild(fig);
    });
    loadMore.parentElement.style.display = shown >= list.length ? "none" : "";
    observeReveals(masonry);
    bindCursor(masonry);
  }
  $$(".filters button").forEach(b => b.addEventListener("click", () => {
    $$(".filters button").forEach(x => x.classList.toggle("active", x === b));
    filter = b.dataset.filter; shown = PAGE; renderGallery();
  }));
  loadMore.addEventListener("click", () => { shown += PAGE; renderGallery(); });
  renderGallery();

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCount = $(".lb-count", lb);
  let lbIndex = 0;
  function showLb(i) {
    lbIndex = (i + list.length) % list.length;
    const id = list[lbIndex][0];
    lbImg.src = file(id, true);
    const full = new Image();
    full.onload = () => { if (list[lbIndex][0] === id) lbImg.src = full.src; };
    full.src = file(id, false);
    lbCount.textContent = `${lbIndex + 1} / ${list.length}`;
  }
  function openLightbox(i) { showLb(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeLightbox() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  $(".lb-close", lb).addEventListener("click", closeLightbox);
  $(".lb-prev", lb).addEventListener("click", e => { e.stopPropagation(); showLb(lbIndex - 1); });
  $(".lb-next", lb).addEventListener("click", e => { e.stopPropagation(); showLb(lbIndex + 1); });
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
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

  /* ---------- FAQ ---------- */
  $$(".faq-item button").forEach(btn => btn.addEventListener("click", () => {
    const item = btn.parentElement, open = !item.classList.contains("open");
    $$(".faq-item").forEach(i => { i.classList.remove("open"); $("button", i).setAttribute("aria-expanded", "false"); });
    if (open) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  }));

  /* ---------- Booking form -> WhatsApp ---------- */
  const form = $("#bookingForm");
  $$("[data-service]").forEach(a => a.addEventListener("click", () => {
    const r = form.querySelector(`input[value="${a.dataset.service}"]`);
    if (r) r.checked = true;
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const missing = ["name", "dog"].filter(k => !String(d[k] || "").trim());
    missing.forEach(k => form.elements[k].style.borderColor = "var(--clay)");
    if (missing.length) { form.elements[missing[0]].focus(); return; }
    const en = lang() === "en";
    const services = en
      ? { hotel: "Hotel stay", caminata: "Pack mountain hike", paseos: "Pick-up dog walks" }
      : { hotel: "Estancia en hotel", caminata: "Caminata en manada", paseos: "Paseos con recolección" };
    const lines = en ? [
      "Hi! I'd like to book at The K9 Boutique Hotel 🐾", "",
      `• Service: ${services[d.service]}`, `• My name: ${d.name}`, `• Dog: ${d.dog}`,
      (d.breed ? `• Breed / age: ${d.breed}` : null), (d.area ? `• Area: ${d.area}` : null),
      (d.from || d.to ? `• Dates: ${d.from || "?"} → ${d.to || "?"}` : null), (d.notes ? `• About my dog: ${d.notes}` : null),
    ] : [
      "¡Hola! Quiero reservar en The K9 Boutique Hotel 🐾", "",
      `• Servicio: ${services[d.service]}`, `• Mi nombre: ${d.name}`, `• Perro: ${d.dog}`,
      (d.breed ? `• Raza / edad: ${d.breed}` : null), (d.area ? `• Zona: ${d.area}` : null),
      (d.from || d.to ? `• Fechas: ${d.from || "?"} → ${d.to || "?"}` : null), (d.notes ? `• Sobre mi perro: ${d.notes}` : null),
    ];
    window.open(waLink(lines.filter(l => l !== null).join("\n")), "_blank", "noopener");
  });
  $$("input, textarea", form).forEach(i => i.addEventListener("input", () => (i.style.borderColor = "")));

  /* ---------- Cursor bubble (desktop) ---------- */
  const cursor = $(".cursor");
  let cx = 0, cy = 0, tx = 0, ty = 0;
  function bindCursor(scope = document) {
    if (!finePointer || reduceMotion) return;
    $$("[data-cursor]", scope).forEach(el => {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener("mouseenter", () => cursor.classList.add("on"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("on"));
    });
  }
  if (finePointer && !reduceMotion) {
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.translate = `${cx}px ${cy}px`;
      requestAnimationFrame(loop);
    })();
    bindCursor();
  }
})();
