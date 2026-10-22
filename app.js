/* ============================================================
   PRODUCTS
   The product list lives in index.html, inside <template id="catalogue">.
   Each <article> is one wig and each <img> is one view in its gallery.
   To change a name, price or photo, edit it there. This code only reads it.
   ============================================================ */

const P = [
  ...document.querySelector("#catalogue").content.querySelectorAll("article"),
].map((a) => {
  const views = [...a.querySelectorAll("img")].map((img) => ({
    src: img.getAttribute("src"),
    label: img.dataset.label,
    pos: img.dataset.pos || "center 25%",
    zoom: img.dataset.zoom ? Number(img.dataset.zoom) : 0,
    fit: img.dataset.fit || "cover",
  }));
  return {
    id: a.dataset.id,
    name: a.dataset.name,
    mat: a.dataset.material,
    len: a.dataset.length,
    price: a.dataset.price === "" ? null : Number(a.dataset.price),
    c: a.dataset.colours.split(","),
    d: a.querySelector("p").textContent.trim(),
    views,
    img: views[0].src, // main photo, used on cards, in the bag and in the PDF
    pos: views[0].pos,
  };
});
/* ============================================================
   SITE IMAGES
   The home page hero and story photos live in index.html, inside
   <template id="site-images">. Edit the file names there.
   ============================================================ */

const siteImg = (id) =>
  document.querySelector("#site-images").content.querySelector("#" + id)
    .outerHTML;

/* ============================================================
   HELPERS and BAG STATE (saved in the browser)
   ============================================================ */

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
let bag = {};
try {
  bag = JSON.parse(localStorage.getItem("gb_bag")) || {};
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem("gb_bag", JSON.stringify(bag));
  } catch (e) {}
};
const R = (n) =>
  "R\u00a0" +
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
const by = (id) => P.find((p) => p.id === id),
  pr = (p) => (p.price == null ? "Price to be confirmed" : R(p.price));
const cnt = () => Object.values(bag).reduce((a, b) => a + b, 0),
  tot = () =>
    Object.entries(bag).reduce((s, [i, q]) => s + (by(i).price || 0) * q, 0);
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
/* ============================================================
   SMALL TEMPLATES: product art, card, progress ring, bag lines
   ============================================================ */

const art = (p) =>
  `<img class="photo" src="${p.img}" alt="Sample image for ${p.name}" loading="lazy" decoding="async" style="object-position: ${p.pos || "center 25%"}">` +
  `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Placeholder image for ${p.name}"><defs><linearGradient id="g${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c[0]}"/><stop offset="1" stop-color="${p.c[1]}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g${p.id})"/><circle cx="200" cy="230" r="86" fill="none" stroke="#c2a15f" stroke-width="2"/><circle cx="200" cy="230" r="70" fill="none" stroke="#c2a15f" stroke-opacity=".4"/><text x="200" y="236" text-anchor="middle" fill="#f3ede1" font-family="Fraunces,serif" font-size="22">${p.name}</text><text x="200" y="470" text-anchor="middle" fill="#f3ede1" fill-opacity=".7" font-family="DM Sans,sans-serif" font-size="13">Placeholder image</text></svg>`;
const card = (p, c = "") =>
  `<a class="card ${c}" href="#/p/${p.id}"><div class="art">${art(p)}</div><div class="info"><h3>${p.name}</h3><div class="mat">${p.mat}</div><div class="price">${pr(p)}</div></div></a>`;
const ring = (n) =>
  `<svg class="ring" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Step ${n} of 3"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="32" cy="32" r="26" fill="none" stroke="var(--gold)" stroke-width="4" stroke-dasharray="${(163.4 * n) / 3} 163.4" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" fill="currentColor" font-size="15" font-family="Fraunces,serif">${n}/3</text></svg>`;
const lines = () =>
  Object.entries(bag)
    .map(([i, q]) => {
      const p = by(i);
      return `<div class="line"><img class="line-img" src="${p.img}" alt="${p.name}" style="object-position: ${p.pos}"><div><strong>${p.name}</strong><div class="mat">${p.mat}</div></div><div class="price">${R(p.price * q)}</div><div class="qty" role="group" aria-label="Quantity for ${p.name}"><button data-dec="${i}" aria-label="Decrease quantity">−</button><output>${q}</output><button data-inc="${i}" aria-label="Increase quantity">+</button></div><button class="link" data-rm="${i}">Remove</button></div>`;
    })
    .join("");
/* ============================================================
   REFRESH: updates the bag count, drawer and checkout totals
   ============================================================ */

function refresh() {
  $("#cnt").textContent = cnt();
  $("#bagBody").innerHTML = cnt()
    ? lines() +
      `<div class="tot"><span>Subtotal</span><span>${R(tot())}</span></div><p class="help">Delivery is calculated after you order (to be confirmed).</p><a class="btn" style="width:100%" href="#/checkout" data-close>Review your order</a>`
    : `<p>Your bag is empty.</p><a class="btn" href="#/shop" data-close>Browse wigs</a>`;
  const c = $("#co");
  if (c) {
    if (!cnt()) return route();
    c.innerHTML =
      lines() +
      `<div class="tot"><span>Subtotal</span><span>${R(tot())}</span></div>`;
  }
}
/* ============================================================
   PAGES: home, shop, product, checkout, thank-you
   ============================================================ */

const views = {
  "/": () => `<section class="hero">${siteImg("hero-img")}<svg viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190" fill="none" stroke="#c2a15f" stroke-width="2"/><circle cx="200" cy="200" r="150" fill="none" stroke="#c2a15f" stroke-opacity=".45"/><circle cx="200" cy="200" r="110" fill="#2b2b2b"/></svg><div class="wrap"><h1 tabindex="-1">Beauty,<br>Given.</h1><p>Accessibly luxurious hair. Switch your look without the R3,000 price tag.</p><a class="btn gold" href="#/shop">Shop wigs</a></div></section>
<section class="sec"><div class="wrap"><h2>The first edit</h2><div class="feat">${card(P[1], "big")}${P.slice(
    0,
    1,
  )
    .concat(P.slice(3, 5))
    .map((p) => card(p))
    .join("")}</div></div></section>
<section class="sec dark" id="story"><div class="wrap two"><div><h2>Honest about what you’re wearing</h2><p>Every wig is labelled for what it is: high-grade fibre, a blend, or human hair. No guessing, no surprises.</p></div><div>${siteImg("story-img")}<p>Given Beauty is built for the woman who loves to switch things up. Premium looks, priced so you can own more than one.</p><p class="help" style="color:#b3aa9a">Sample story copy. Final wording to come from the founder.</p></div></div></section>`,
  "/shop": () =>
    `<section class="sec"><div class="wrap"><h1 style="font-size:clamp(2.2rem,7vw,3.6rem)" tabindex="-1">All wigs</h1><p class="help">Sample products and prices.</p><div class="grid">${P.map((p) => card(p)).join("")}</div></div></section>`,
  "/p": (id) => {
    const p = by(id);
    if (!p)
      return `<div class="wrap sec"><h1 tabindex="-1">Wig not found</h1><a class="btn" href="#/shop">Back to shop</a></div>`;
    return `<section class="sec"><div class="wrap two">${gallery(p)}<div><h1 style="font-size:clamp(2.2rem,6vw,3.6rem)" tabindex="-1">${p.name}</h1><p class="mat">${p.mat}</p><p class="price" style="font-size:1.5rem">${pr(p)}</p><p>${p.d}</p><dl><dt>Material</dt><dd>${p.mat}</dd><dt>Length</dt><dd>${p.len}</dd><dt>Fit</dt><dd>To be confirmed</dd><dt>Availability</dt><dd>To be confirmed</dd></dl><button class="btn" data-add="${p.id}" ${p.price == null ? "disabled" : ""}>${p.price == null ? "Price to be confirmed" : "Add to bag"}</button><p><a href="#/shop">Continue shopping</a></p></div></div></section>`;
  },
  "/checkout": () =>
    !cnt()
      ? `<div class="wrap sec"><h1 tabindex="-1">Your bag is empty</h1><a class="btn" href="#/shop">Browse wigs</a></div>`
      : `<section class="sec"><div class="wrap"><div style="display:flex;gap:1rem;align-items:center">${ring(2)}<h1 style="font-size:clamp(2rem,6vw,3rem);margin:0" tabindex="-1">Review and order</h1></div><div class="two" style="margin-top:2rem"><div><h2>Your items</h2><div id="co">${lines()}<div class="tot"><span>Subtotal</span><span>${R(tot())}</span></div></div><a href="#/shop">Continue shopping</a></div>
<form id="f"><h2>Your details</h2><label for="n">Full name</label><input id="n" name="n" required autocomplete="name"><label for="e">Email</label><input id="e" type="email" required autocomplete="email"><label for="t">Phone or WhatsApp</label><input id="t" type="tel" required autocomplete="tel"><label for="a">Delivery address</label><textarea id="a" rows="3" required autocomplete="street-address"></textarea><p class="help">We only use these details to process and deliver your order.</p><div class="note">This is an order request. Payment is by EFT after you submit, and your order is confirmed once payment is received.</div><button class="btn gold" type="submit" style="width:100%">Place order request</button></form></div></div></section>`,
  "/thanks": () => {
    let o;
    try {
      o = JSON.parse(sessionStorage.getItem("gb_last"));
    } catch (e) {}
    if (!o)
      return `<div class="wrap sec"><h1 tabindex="-1">No recent order</h1><a class="btn" href="#/shop">Browse wigs</a></div>`;
    return `<section class="sec"><div class="wrap" style="max-width:44rem"><div style="display:flex;gap:1rem;align-items:center">${ring(3)}<h1 style="font-size:clamp(2rem,6vw,3rem);margin:0" tabindex="-1">Order request received</h1></div><p>Thank you, ${o.n}. Pay by EFT using this reference so we can match your payment.</p><p class="ref" id="ref">${o.ref}</p><div class="noprint"><button class="btn ghost" data-copy>Copy reference</button> <button class="btn gold" data-pdf>Download PDF</button> <button class="btn ghost" data-print>Print</button></div>
<div class="note"><strong>Sample banking details</strong><dl><dt>Bank</dt><dd>Sample Bank</dd><dt>Account name</dt><dd>Given Beauty</dd><dt>Account number</dt><dd>0000 000 0000</dd><dt>Branch code</dt><dd>000000</dd><dt>Reference</dt><dd>${o.ref}</dd><dt>Amount</dt><dd>${R(o.total)}</dd></dl></div><h2>Your order</h2>${o.items.map((i) => `<div class="line"><img class="line-img" src="${i.img}" alt="${i.name}" style="object-position: ${i.pos}"><span>${i.q} × ${i.name}</span><span class="price">${R(i.q * i.price)}</span></div>`).join("")}<div class="tot"><span>Subtotal</span><span>${R(o.total)}</span></div><p class="help">Delivery cost, stock hold time and confirmation email are to be confirmed. Nothing was sent or saved on a server in this preview.</p><a class="btn" href="#/shop">Continue shopping</a></div></section>`;
  },
};
/* ============================================================
   ROUTER: switches page when the # address changes
   ============================================================ */

function route() {
  const h = location.hash.slice(1) || "/";
  if (h.startsWith("/#"))
    return (
      (location.hash = "#/"),
      setTimeout(() => $("#story")?.scrollIntoView(), 50)
    );
  const [, k, a] = h.match(/^(\/[a-z]*)\/?(.*)$/) || [, "/"];
  const v = views[k] || views["/"];
  $("#app").innerHTML = v(a);
  scrollTo(0, 0);
  const t = $("#app h1");
  document.title =
    (t ? t.textContent.replace(/\s+/g, " ") : "Given Beauty") +
    " | Given Beauty (MVP)";
  if (t && k !== "/") t.focus({ preventScroll: true });
  if (!reduced && window.gsap)
    gsap.from("#app h1,#app .hero p,#app .hero .btn", {
      opacity: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.12,
    });
  refresh();
}
/* ============================================================
   EVENTS: buttons (add, quantity, remove, open, close, copy, PDF, print)
   ============================================================ */

document.addEventListener("click", (e) => {
  const b = e.target.closest("button,a");
  if (!b) return;
  const d = b.dataset,
    live = (m) => ($("#live").textContent = m);
  if ("add" in d) {
    bag[d.add] = Math.min(10, (bag[d.add] || 0) + 1);
    save();
    refresh();
    live(by(d.add).name + " added to bag");
    if (!reduced && window.gsap)
      gsap.fromTo("#cnt", { scale: 1.6 }, { scale: 1, duration: 0.4 });
    $("#bag").showModal();
  }
  if ("inc" in d) bag[d.inc] = Math.min(10, bag[d.inc] + 1);
  if ("dec" in d) bag[d.dec] = Math.max(1, bag[d.dec] - 1);
  if ("rm" in d) {
    delete bag[d.rm];
    live("Item removed");
  }
  if ("inc" in d || "dec" in d || "rm" in d) {
    save();
    refresh();
  }
  if ("open" in d) $("#bag").showModal();
  if ("close" in d) $("#bag").close();
  if ("copy" in d) {
    navigator.clipboard?.writeText($("#ref").textContent).then(
      () => live("Reference copied"),
      () => {},
    );
  }
  if ("pdf" in d) makePdf();
  if ("print" in d) print();
});
$("#bag").addEventListener("click", (e) => {
  if (e.target.id === "bag") e.target.close();
});
/* ============================================================
   ORDER SUBMIT: creates a sample reference (nothing is sent to a server)
   ============================================================ */

document.addEventListener("submit", (e) => {
  if (e.target.id !== "f") return;
  e.preventDefault();
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789",
    x = [...Array(5)]
      .map(() => A[Math.floor(Math.random() * A.length)])
      .join(""),
    dt = new Date(),
    ref = `GB-${String(dt.getFullYear()).slice(2)}${String(dt.getMonth() + 1).padStart(2, "0")}-${x}`;
  const o = {
    ref,
    at: dt.toISOString(),
    n: $("#n").value,
    total: tot(),
    items: Object.entries(bag).map(([i, q]) => ({
      name: by(i).name,
      mat: by(i).mat,
      img: by(i).img,
      pos: by(i).pos,
      price: by(i).price,
      q,
    })),
  };
  try {
    sessionStorage.setItem("gb_last", JSON.stringify(o));
  } catch (er) {}
  bag = {};
  save();
  location.hash = "#/thanks";
});
/* ============================================================
   PRODUCT GALLERY and LIGHTBOX
   Each product page shows several views, built from the product's photo:
   front, full view, close up, and "on model" (the product's `model` photo).
   To add real extra photos to a product, give it an `extra` list, e.g.
   extra: [{ src: "assets/back.jpeg", label: "Back view" }]
   ============================================================ */

// All the views for one product, in the order they appear
const viewsOf = (p) => p.views;

// One <img> for a view (handles crop, zoom and "contain" for the far view)
const viewImg = (v, alt) => {
  const pos = v.pos || "center 25%";
  const zoom = v.zoom
    ? `transform: scale(${v.zoom}); transform-origin: ${pos};`
    : "";
  return `<img src="${v.src}" alt="${alt}" style="object-fit: ${v.fit || "cover"}; object-position: ${pos}; ${zoom}">`;
};

// The gallery on the product page: big view plus thumbnails
const gallery = (p) => {
  const views = viewsOf(p);
  const thumbs = views
    .map(
      (v, i) => `
      <button class="thumb" data-view="${i}" aria-pressed="${i === 0}" aria-label="${v.label}">
        <span class="frame">${viewImg(v, "")}</span>
        <span>${v.label}</span>
      </button>`,
    )
    .join("");

  return `
    <div class="gallery" data-gallery="${p.id}">
      <button class="stage" data-lightbox="0" aria-label="Open larger view of ${p.name}">
        <span class="frame">${viewImg(views[0], `${p.name}, ${views[0].label}`)}</span>
        <span class="hint">Sample image. Tap to enlarge</span>
      </button>
      <div class="thumbs" role="group" aria-label="Choose a view">${thumbs}</div>
    </div>`;
};

// Lightbox state: which views are showing, and which one
let lb = { views: [], i: 0, name: "" };

function lbShow() {
  const v = lb.views[lb.i];
  const img = $("#lbImg");
  img.src = v.src;
  img.alt = `${lb.name}, ${v.label}`;
  img.style.transform = v.zoom ? `scale(${v.zoom})` : "none";
  img.style.transformOrigin = v.pos || "center";
  $("#lbCap").textContent =
    `${lb.name}: ${v.label} (${lb.i + 1} of ${lb.views.length}). Sample image.`;
}

function lbStep(direction) {
  lb.i = (lb.i + direction + lb.views.length) % lb.views.length;
  lbShow();
}

// Clicks: thumbnails, opening the lightbox, and the lightbox buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-view], [data-lightbox], [data-lb]");
  if (!btn) return;
  const box = btn.closest(".gallery");

  // Thumbnail: switch the big view
  if (btn.dataset.view !== undefined) {
    const p = by(box.dataset.gallery);
    const views = viewsOf(p);
    const i = Number(btn.dataset.view);
    box.querySelector(".stage .frame").innerHTML = viewImg(
      views[i],
      `${p.name}, ${views[i].label}`,
    );
    box.querySelector(".stage").dataset.lightbox = i;
    box.querySelectorAll(".thumb").forEach((t) => {
      t.setAttribute("aria-pressed", t === btn);
    });
  }

  // Big view: open the lightbox
  if (btn.dataset.lightbox !== undefined) {
    const p = by(box.dataset.gallery);
    lb = { views: viewsOf(p), i: Number(btn.dataset.lightbox), name: p.name };
    lbShow();
    $("#lightbox").showModal();
  }

  // Lightbox buttons
  if (btn.dataset.lb === "close") $("#lightbox").close();
  if (btn.dataset.lb === "prev") lbStep(-1);
  if (btn.dataset.lb === "next") lbStep(1);
});

// Click on the dark area around the photo closes the lightbox
$("#lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.classList.contains("lb-stage")) {
    $("#lightbox").close();
  }
});

// Arrow keys move between views (Escape closes, built into <dialog>)
document.addEventListener("keydown", (e) => {
  if (!$("#lightbox").open) return;
  if (e.key === "ArrowRight") lbStep(1);
  if (e.key === "ArrowLeft") lbStep(-1);
});

/* ============================================================
   PDF DOWNLOAD: builds the order PDF in the browser (jsPDF)
   ============================================================ */

// Crops a product photo to a small JPEG so it can go in the PDF.
// Needs the site to be opened from a web address (browsers block local files).
function pdfImage(src, pos = "center 25%") {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const W = 240,
          H = 300; // 4:5 portrait
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const focus = parseFloat(pos.split(" ")[1] || "25") / 100;
        canvas
          .getContext("2d")
          .drawImage(img, (W - w) / 2, (H - h) * focus, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        resolve(null); // image blocked: the PDF still works, just without it
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function makePdf() {
  let o;
  try {
    o = JSON.parse(sessionStorage.getItem("gb_last"));
  } catch (e) {}
  const J = window.jspdf && window.jspdf.jsPDF;
  if (!o || !J) {
    print();
    return;
  }

  const photos = await Promise.all(o.items.map((i) => pdfImage(i.img, i.pos)));
  const d = new J({ unit: "mm", format: "a4" });
  const text = (t, x, y, opt) => d.text(t, x, y, opt);
  const money = (n) => R(n).replace(/\u00a0/g, " ");
  const dark = [28, 26, 23],
    grey = [98, 91, 80],
    gold = [194, 161, 95];

  // Header band
  d.setFillColor(20, 20, 20);
  d.rect(0, 0, 210, 38, "F");
  d.setTextColor(243, 237, 225);
  d.setFont("times", "bold");
  d.setFontSize(20);
  text("GIVEN BEAUTY", 20, 22);
  d.setFont("helvetica", "normal");
  d.setFontSize(9);
  text("Beauty, Given. Accessibly Luxurious Hair.", 20, 29);
  d.setFillColor(...gold);
  d.rect(0, 38, 210, 1.2, "F");

  // Title and reference
  d.setTextColor(...dark);
  d.setFont("times", "normal");
  d.setFontSize(24);
  text("Order request", 20, 56);
  d.setFont("helvetica", "normal");
  d.setFontSize(10);
  d.setTextColor(...grey);
  text("Payment reference", 20, 66);
  d.setFont("times", "bold");
  d.setFontSize(22);
  d.setTextColor(122, 92, 30);
  text(o.ref, 20, 76);
  d.setFont("helvetica", "normal");
  d.setFontSize(10);
  d.setTextColor(...dark);
  text(
    "Prepared for " +
      o.n +
      "   |   " +
      new Date(o.at).toLocaleDateString("en-ZA"),
    20,
    85,
  );

  // Items, each with its photo
  let y = 100;
  d.setFont("helvetica", "bold");
  text("Item", 20, y);
  text("Qty", 135, y);
  text("Amount", 190, y, { align: "right" });
  d.setDrawColor(...gold);
  d.line(20, y + 2, 190, y + 2);
  y += 8;

  o.items.forEach((item, k) => {
    if (y > 235) {
      d.addPage();
      y = 25;
    }
    if (photos[k]) d.addImage(photos[k], "JPEG", 20, y, 16, 20);
    else {
      d.setFillColor(43, 43, 43);
      d.rect(20, y, 16, 20, "F");
    }
    d.setTextColor(...dark);
    d.setFont("helvetica", "bold");
    d.setFontSize(10);
    text(item.name, 42, y + 8);
    d.setFont("helvetica", "normal");
    d.setFontSize(8.5);
    d.setTextColor(...grey);
    text(item.mat || "", 42, y + 14);
    d.setFontSize(10);
    d.setTextColor(...dark);
    text(String(item.q), 135, y + 8);
    text(money(item.q * item.price), 190, y + 8, { align: "right" });
    y += 26;
    d.setDrawColor(221, 213, 199);
    d.line(20, y - 3, 190, y - 3);
  });

  d.setFont("helvetica", "bold");
  d.setFontSize(11);
  text("Subtotal", 20, y + 5);
  text(money(o.total), 190, y + 5, { align: "right" });

  // EFT box
  y += 18;
  if (y + 75 > 285) {
    d.addPage();
    y = 25;
  }
  d.setFillColor(247, 243, 236);
  d.rect(20, y, 170, 52, "F");
  d.setFillColor(...gold);
  d.rect(20, y, 1.5, 52, "F");
  d.setTextColor(...dark);
  d.setFont("helvetica", "bold");
  d.setFontSize(10);
  text("Pay by EFT (sample banking details)", 27, y + 9);
  d.setFont("helvetica", "normal");
  [
    ["Bank", "Sample Bank"],
    ["Account name", "Given Beauty"],
    ["Account number", "0000 000 0000"],
    ["Branch code", "000000"],
    ["Reference", o.ref],
    ["Amount", money(o.total)],
  ].forEach((row, k) => {
    text(row[0], 27, y + 18 + k * 6);
    text(row[1], 75, y + 18 + k * 6);
  });
  d.setFontSize(8.5);
  d.setTextColor(...grey);
  text(
    "This is an order request. Your order is confirmed once payment is received. Delivery cost and stock hold time: to be confirmed.",
    20,
    y + 64,
    { maxWidth: 170 },
  );
  text("MVP preview. All details above are samples.", 20, 285);
  d.save("GivenBeauty-" + o.ref + ".pdf");
}
addEventListener("hashchange", route);
route();