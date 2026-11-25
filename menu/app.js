/* ------------------------------------------------------------------
   Configuración del formulario
   Rellena formAction y cada entry.XXXX con los datos del Google Form.
   Si quedan vacíos, la página funciona en modo demo (no envía nada).
------------------------------------------------------------------- */
const CONFIG = {
  formAction: "",
  entries: {
    name: "",
    party: "",
    a: "",
    b: "",
    c: "",
    d: "",
    e: "",
    notes: ""
  }
};

const DISHES = [
  {
    id: "a", cat: "Arroces", name: "Stroganoff de lomo",
    img: "fotos/platos/stroganoff.webp", alt: "Stroganoff de lomo con arroz blanco",
    desc: "Delicioso lomo de res salteado con champiñones, cebolla y pimentón, acompañado de arroz blanco y una ensalada fresca de temporada."
  },
  {
    id: "b", cat: "Pescados", name: "Trucha marinera",
    img: "fotos/platos/trucha.webp", alt: "Trucha marinera con hierbas y tomate",
    desc: "Trucha fresca con un toque de cítricos y hierbas, jugosa y ligera."
  },
  {
    id: "c", cat: "Cerdo", name: "Costillas en BBQ de tamarindo",
    img: "fotos/platos/costillas.webp", alt: "Costillas BBQ con ensalada",
    desc: "Costillas de cerdo al horno, bañadas en una salsa BBQ con tamarindo que equilibra lo dulce y lo ácido. Se sirven con chips de berenjena y ensalada griega fresca."
  },
  {
    id: "d", cat: "Pollo", name: "Pollo Shakshuka",
    img: "fotos/platos/shakshuka.webp", alt: "Shakshuka con pan pita",
    desc: "Pollo al horno sobre salsa napolitana especiada con cebolla y hierbas. Acompañado de pan pita crocante."
  },
  {
    id: "e", cat: "Pasta", name: "Fettuccine con estofado de res",
    img: "fotos/platos/fettuccine.webp", alt: "Fettuccine con estofado de res",
    desc: "Pasta al dente con estofado de res cocinado a fuego lento."
  }
];

const PARTY_MAX = 12;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  party: 1,
  counts: { a: 0, b: 0, c: 0, d: 0, e: 0 }
};

/* ---------------------------- menú ---------------------------- */

const cardsEl = document.getElementById("cards");
const dishStage = document.getElementById("dish-stage");
const dotsEl = document.getElementById("dots");
const partyOut = document.getElementById("party-n");
const descEl = document.getElementById("detail-desc");
const detailN = document.getElementById("detail-n");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const dishState = { active: 0, drag: 0, dragging: false, moved: false, step: 186 };

function buildDishes() {
  DISHES.forEach((d, i) => {
    const card = document.createElement("article");
    card.className = "dish";
    card.dataset.id = d.id;
    card.dataset.i = String(i);
    card.innerHTML = `
      <img src="${d.img}" alt="${d.alt}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
      <span class="dish-cat">${d.cat}</span>
      <span class="dish-count" data-count>×0</span>
      <div class="dish-title"><h3>${d.name}</h3></div>
      <button class="dish-hit" type="button" aria-label="Ver ${d.name}"></button>`;
    cardsEl.appendChild(card);

    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver ${d.name}`);
    dot.addEventListener("click", () => setDish(i));
    dotsEl.appendChild(dot);
  });

  prevBtn.addEventListener("click", () => setDish(Math.max(0, dishState.active - 1)));
  nextBtn.addEventListener("click", () => setDish(Math.min(DISHES.length - 1, dishState.active + 1)));
  dishStage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setDish(Math.max(0, dishState.active - 1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setDish(Math.min(DISHES.length - 1, dishState.active + 1)); }
  });
  dishStage.addEventListener("click", (e) => {
    const hit = e.target.closest(".dish-hit");
    if (!hit || dishState.moved) return;
    setDish(Number(hit.closest(".dish").dataset.i));
  });

  layoutDishes();
  setDish(0);
}

function layoutDishes() {
  const w = dishStage.clientWidth || window.innerWidth;
  const cw = Math.round(Math.min(320, Math.max(250, Math.min(w - 52, window.innerHeight * 0.42))));
  dishStage.style.setProperty("--cw", `${cw}px`);
  dishState.step = cw * 0.78;
}

function setDish(i) {
  dishState.active = Math.max(0, Math.min(DISHES.length - 1, i));
  renderDishes();
  renderDetail();
}

function renderDishes() {
  const cards = cardsEl.children;
  for (let i = 0; i < cards.length; i++) {
    const el = cards[i];
    const o = i - dishState.active - dishState.drag;
    const a = Math.abs(o);
    const x = o * dishState.step;
    const z = -Math.min(2, a) * 130;
    const ry = Math.max(-30, Math.min(30, o * 20));
    const sc = 1 - Math.min(0.18, a * 0.065);
    el.style.transform =
      `translate(-50%, -50%) translateX(${x.toFixed(1)}px) ` +
      `translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    el.style.opacity = a > 2.3 ? "0" : String(Math.max(0.12, 1 - a * 0.38));
    el.style.zIndex = String(100 - Math.round(a * 10));
    el.classList.toggle("is-active", i === dishState.active);
    const hit = el.querySelector(".dish-hit");
    if (hit) hit.tabIndex = a > 1.5 ? -1 : 0;
    if (a > 2.3) el.setAttribute("aria-hidden", "true");
    else el.removeAttribute("aria-hidden");
  }
  [...dotsEl.children].forEach((dot, i) => {
    dot.classList.toggle("on", i === dishState.active);
    if (i === dishState.active) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

function renderDetail() {
  const d = DISHES[dishState.active];
  descEl.textContent = d.desc;
  const n = state.counts[d.id];
  detailN.textContent = n;
  document.querySelector('.dish-detail [data-step="-1"]').disabled = n <= 0;
  document.querySelector('.dish-detail [data-step="1"]').disabled = total() >= state.party;
  prevBtn.disabled = dishState.active === 0;
  nextBtn.disabled = dishState.active === DISHES.length - 1;
}

const total = () => DISHES.reduce((s, d) => s + state.counts[d.id], 0);

function change(id, delta) {
  if (delta > 0 && total() >= state.party) return;
  state.counts[id] = Math.max(0, Math.min(state.party, state.counts[id] + delta));
  renderAll();
}

document.querySelector(".dish-detail").addEventListener("click", (e) => {
  const step = e.target.closest("[data-step]");
  if (step) change(DISHES[dishState.active].id, Number(step.dataset.step));
});

let dragX = 0, dragY = 0, lastX = 0, lastT = 0, velX = 0, dragDX = 0;
dishStage.addEventListener("pointerdown", (e) => {
  if (e.button !== undefined && e.button !== 0) return;
  dishState.dragging = true;
  dishState.moved = false;
  dragX = e.clientX;
  dragY = e.clientY;
  lastX = e.clientX;
  lastT = performance.now();
  velX = 0;
  dragDX = 0;
  dishStage.classList.add("dragging");
});
window.addEventListener("pointermove", (e) => {
  if (!dishState.dragging) return;
  const dx = e.clientX - dragX;
  const dy = e.clientY - dragY;
  if (!dishState.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
    dishState.moved = true;
  }
  if (!dishState.moved) return;
  const now = performance.now();
  const dt = Math.max(8, now - lastT);
  velX = (e.clientX - lastX) / dt;
  lastX = e.clientX;
  lastT = now;
  dragDX = dx;
  const lo = -dishState.active - 0.4;
  const hi = DISHES.length - 1 - dishState.active + 0.4;
  dishState.drag = Math.max(lo, Math.min(hi, -dx / dishState.step));
  renderDishes();
});

function endDishDrag(e) {
  if (!dishState.dragging) return;
  dishState.dragging = false;
  dishStage.classList.remove("dragging");
  const slide = dishState.moved && Math.abs(dragDX) > 26;
  const flick = dishState.moved && Math.abs(dragDX) > 12 && Math.abs(velX) > 0.3;
  const next = (slide || flick)
    ? dishState.active + (dragDX < 0 ? 1 : -1)
    : Math.round(dishState.active + dishState.drag);
  const changed = dishState.moved && next !== dishState.active;
  dishState.drag = 0;
  dragDX = 0;
  velX = 0;
  if (changed) navigator.vibrate?.(8);
  setDish(next);
}
window.addEventListener("pointerup", endDishDrag);
window.addEventListener("pointercancel", endDishDrag);

document.querySelectorAll("[data-party]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = state.party + Number(btn.dataset.party);
    setParty(next);
  });
});

function setParty(n) {
  state.party = Math.max(1, Math.min(PARTY_MAX, n));
  let excess = total() - state.party;
  if (excess > 0) {
    for (const d of [...DISHES].reverse()) {
      while (excess > 0 && state.counts[d.id] > 0) {
        state.counts[d.id]--;
        excess--;
      }
    }
  }
  renderAll();
}

/* ---------------------------- resumen y dock ---------------------------- */

const recapEl = document.getElementById("recap");
const dock = document.getElementById("dock");
const dockN = document.getElementById("dock-n");
const dockTotal = document.getElementById("dock-total");
const dockBar = document.getElementById("dock-bar");
const dockBtn = document.getElementById("dock-btn");
const rsvp = document.getElementById("rsvp");

function recapRows() {
  return DISHES
    .filter((d) => state.counts[d.id] > 0)
    .map((d) => `<div class="recap-row"><span>${d.name}</span><b>×${state.counts[d.id]}</b></div>`)
    .join("");
}

function renderRecap() {
  const rows = recapRows();
  const t = total();
  recapEl.innerHTML = rows
    ? `${rows}<div class="recap-row"><span>Total</span><b>${t} de ${state.party}</b></div>`
    : `<p class="recap-empty">Aún no has elegido platos.</p>`;
}

function renderCards() {
  document.querySelectorAll(".dish").forEach((card) => {
    const n = state.counts[card.dataset.id];
    const badge = card.querySelector("[data-count]");
    badge.textContent = `×${n}`;
    badge.classList.toggle("on", n > 0);
  });
}

function renderParty() {
  partyOut.textContent = state.party;
  document.querySelector('[data-party="-1"]').disabled = state.party <= 1;
  document.querySelector('[data-party="1"]').disabled = state.party >= PARTY_MAX;
}

function renderDock() {
  const t = total();
  dockN.textContent = t;
  dockTotal.textContent = state.party;
  dockBar.style.width = `${(t / state.party) * 100}%`;
  const done = t === state.party;
  dockBtn.disabled = !done;
  dockBtn.textContent = "Continuar";
}

function renderAll() {
  renderParty();
  renderCards();
  renderDetail();
  renderRecap();
  renderDock();
}

/* ---------------------------- formulario ---------------------------- */

const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const notesInput = document.getElementById("notes");
const submitBtn = document.getElementById("submit");
const formNote = document.getElementById("form-note");
const thanks = document.getElementById("thanks");
const thanksName = document.getElementById("thanks-name");
const thanksSummary = document.getElementById("thanks-summary");
const thanksEdit = document.getElementById("thanks-edit");

function configured() {
  return Boolean(CONFIG.formAction) &&
    ["name", "party", "a", "b", "c", "d", "e"].every((k) => CONFIG.entries[k]);
}

function note(text, warn = false) {
  formNote.textContent = text;
  formNote.classList.toggle("warn", warn);
}

async function send(payload) {
  const fd = new FormData();
  for (const [key, entry] of Object.entries(CONFIG.entries)) {
    if (entry && key in payload) fd.append(entry, String(payload[key]));
  }
  await fetch(CONFIG.formAction, { method: "POST", mode: "no-cors", body: fd });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    note("Escribe tu nombre para confirmar.", true);
    nameInput.focus();
    return;
  }
  if (total() !== state.party) {
    note(`Elige ${state.party - total()} plato(s) más antes de confirmar.`, true);
    return;
  }

  const payload = {
    name,
    party: state.party,
    a: state.counts.a,
    b: state.counts.b,
    c: state.counts.c,
    d: state.counts.d,
    e: state.counts.e,
    notes: notesInput.value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";
  try {
    if (configured()) {
      await send(payload);
    } else {
      console.info("[menú] Modo demo, respuesta no enviada:", payload);
    }
    showThanks(payload);
    note("Al confirmar, tu respuesta queda guardada.");
  } catch (err) {
    console.error(err);
    note("No se pudo enviar. Revisa tu conexión e inténtalo otra vez.", true);
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirmar asistencia";
  }
});

function showThanks(payload) {
  thanksName.textContent = payload.name;
  const rows = recapRows() + `<div class="recap-row"><span>Personas</span><b>${payload.party}</b></div>`;
  thanksSummary.innerHTML = rows;
  thanks.hidden = false;
  document.body.classList.add("locked");
  submitBtn.disabled = false;
  submitBtn.textContent = "Confirmar asistencia";
  thanksEdit.focus();
}

function closeThanks() {
  thanks.hidden = true;
  document.body.classList.remove("locked");
  document.getElementById("menu").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

thanksEdit.addEventListener("click", closeThanks);
thanks.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeThanks(); return; }
  if (e.key === "Tab") { e.preventDefault(); thanksEdit.focus(); }
});

dockBtn.addEventListener("click", () => {
  if (dockBtn.disabled) return;
  rsvp.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  setTimeout(() => nameInput.focus({ preventScroll: true }), reduced ? 0 : 550);
});

/* ---------------------------- scroll ---------------------------- */

window.addEventListener("resize", () => { layoutDishes(); renderDishes(); sizeLights(); });

/* ---------------------------- luces y confeti ---------------------------- */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const LIGHT_RGB = [[238, 214, 171], [243, 238, 228], [150, 178, 226]];
let lights = [], confetti = [], W = 0, H = 0, lastPaint = 0;

function sizeLights() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const n = Math.min(90, Math.max(34, Math.round((W * H) / 15000)));
  lights = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() < 0.14 ? 2.2 + Math.random() * 1.6 : 0.5 + Math.random() * 1.5,
    a: 0.16 + Math.random() * 0.42,
    p: Math.random() * Math.PI * 2,
    s: 0.5 + Math.random() * 1.1,
    vy: 3 + Math.random() * 9,
    c: LIGHT_RGB[(Math.random() * LIGHT_RGB.length) | 0]
  }));

  confetti = Array.from({ length: W < 620 ? 9 : 16 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    w: 1.4 + Math.random() * 1.8,
    h: 5 + Math.random() * 7,
    vy: 7 + Math.random() * 11,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.7,
    a: 0.1 + Math.random() * 0.14,
    c: LIGHT_RGB[(Math.random() * LIGHT_RGB.length) | 0]
  }));

  if (reduced) drawLights(0);
}

function drawLights(now) {
  if (!reduced) requestAnimationFrame(drawLights);
  const dt = Math.min(0.05, lastPaint ? (now - lastPaint) / 1000 : 0.016);
  lastPaint = now;
  ctx.clearRect(0, 0, W, H);

  for (const f of confetti) {
    f.y += f.vy * dt;
    f.rot += f.vr * dt;
    if (f.y > H + 18) { f.y = -18; f.x = Math.random() * W; }
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.globalAlpha = f.a;
    ctx.fillStyle = `rgb(${f.c[0]},${f.c[1]},${f.c[2]})`;
    ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
    ctx.restore();
  }

  for (const l of lights) {
    l.y -= l.vy * dt;
    if (l.y < -14) { l.y = H + 14; l.x = Math.random() * W; }
    const tw = reduced ? 0.62 : 0.55 + 0.45 * Math.sin(now * 0.00045 * l.s + l.p);
    const a = l.a * tw;
    const rgb = `${l.c[0]},${l.c[1]},${l.c[2]}`;
    ctx.fillStyle = `rgba(${rgb},${(a * 0.04).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r * 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${rgb},${(a * 0.07).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r * 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------- arranque ---------------------------- */

buildDishes();
renderAll();
sizeLights();
requestAnimationFrame(drawLights);

if (!configured()) note("Modo demo: falta conectar el Google Form.", true);

const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
