const { DateTime, Interval } = luxon;

// === Dates ===
const targetLocalCanada = DateTime.fromISO("2025-12-20T16:00:00", {
  zone: "America/Toronto",
});
const startDateCH = DateTime.fromISO("2025-08-24T10:00:00", {
  zone: "Europe/Zurich",
});
const tripInterval = Interval.fromDateTimes(startDateCH, targetLocalCanada);

// === Elements UI ===
const countdownEl = document.getElementById("countdown");
const progressEl = document.getElementById("progress");
const progressLabelEl = document.getElementById("progressLabel");
const loveMessageEl = document.getElementById("loveMessage");
const lausEl = document.getElementById("lausanneTime");
const quebEl = document.getElementById("quebecTime");
const realDistanceEl = document.getElementById("realDistance");
const symbolicDistanceEl = document.getElementById("symbolicDistance");
const toggleHeartsBtn = document.getElementById("toggleHearts");
const particleModeSel = document.getElementById("particleMode");
const showOverlayBtn = document.getElementById("showOverlayPhotos");

// === Messages ===
const msgs = [
  "Chaque seconde nous rapproche 💗",
  "Encore un câlin de plus bientôt 🤗",
  "La distance n’arrête pas l’amour ✈️❤️",
  "Nos deux fuseaux, un seul cœur 🌍💞",
];
let msgIndex = 0;

function renderCountdown() {
  const now = DateTime.now();
  const diff = targetLocalCanada
    .toUTC()
    .diff(now.toUTC(), ["days", "hours", "minutes", "seconds"]);
  const d = Math.max(0, Math.floor(diff.days));
  const h = Math.max(0, Math.floor(diff.hours));
  const m = Math.max(0, Math.floor(diff.minutes));
  const s = Math.max(0, Math.floor(diff.seconds));
  countdownEl.textContent = `${d} jours ${h} h ${m} min ${s} s`;
  if (diff.as("seconds") <= 0) triggerFireworks();
}
setInterval(renderCountdown, 1000);
renderCountdown();

function renderProgress() {
  const now = DateTime.now();
  const total = targetLocalCanada
    .toUTC()
    .diff(startDateCH.toUTC())
    .as("seconds");
  const elapsed = now.toUTC().diff(startDateCH.toUTC()).as("seconds");
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  progressEl.style.width = pct.toFixed(1) + "%";
  const leftHours = Math.max(0, Math.floor((total - elapsed) / 3600));
  progressLabelEl.textContent = `Progression: ${pct.toFixed(
    1
  )}% — ~${leftHours} h restantes`;
}
setInterval(renderProgress, 1000);
renderProgress();

function rotateMessage() {
  loveMessageEl.textContent = msgs[msgIndex % msgs.length];
  msgIndex++;
}
setInterval(rotateMessage, 4000);
rotateMessage();

function fmt(d, zone) {
  return d.setZone(zone).toFormat("cccc dd LLL yyyy -  HH:mm:ss 'GMT'ZZ");
}
function renderClocks() {
  const now = DateTime.now();
  lausEl.textContent = fmt(now, "Europe/Zurich");
  quebEl.textContent = fmt(now, "America/Toronto");
}
setInterval(renderClocks, 1000);
renderClocks();

// === Map + plane animation ===
const lausanne = { name: "Lausanne", coords: [46.5197, 6.6323] };
const quebec = { name: "Québec", coords: [46.8139, -71.208] };
const map = L.map("map", { zoomControl: true });
const bounds = L.latLngBounds([lausanne.coords, quebec.coords]);
map.fitBounds(bounds, { padding: [20, 20] });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);
L.marker(lausanne.coords).addTo(map).bindPopup("Lausanne 🇨🇭");
L.marker(quebec.coords).addTo(map).bindPopup("Québec 🇨🇦");
const path = L.polyline([lausanne.coords, quebec.coords], {
  color: "#ec4899",
  weight: 3,
  opacity: 0.8,
}).addTo(map);

// Plane marker (emoji) and animation loop
const planeIcon = L.divIcon({
  html: "✈️",
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const plane = L.marker(lausanne.coords, { icon: planeIcon }).addTo(map);
const loopMs = 12000; // one loop duration
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function alongLine(t) {
  const [lat1, lng1] = lausanne.coords;
  const [lat2, lng2] = quebec.coords;
  return [lerp(lat1, lat2, t), lerp(lng1, lng2, t)];
}
function animatePlane(ts) {
  const t = (ts % loopMs) / loopMs; // 0..1
  const f = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2; // go and back (ping-pong)
  plane.setLatLng(alongLine(f));
  requestAnimationFrame(animatePlane);
}
requestAnimationFrame(animatePlane);

// === Distances ===
function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
const realKm = haversineKm(lausanne.coords, quebec.coords);
realDistanceEl.textContent = realKm.toFixed(0) + " km";
function renderSymbolic() {
  const now = DateTime.now();
  const total = targetLocalCanada
    .toUTC()
    .diff(startDateCH.toUTC())
    .as("seconds");
  const left = Math.max(
    0,
    targetLocalCanada.toUTC().diff(now.toUTC()).as("seconds")
  );
  const frac = left / total; // 1 -> 0
  const symbolicKm = realKm * frac; // linear to 0
  symbolicDistanceEl.textContent = symbolicKm.toFixed(0) + " km";
}
setInterval(renderSymbolic, 1000);
renderSymbolic();

// === Quote of the day ===
const quotes = [
  "Loin des yeux, près du cœur.",
  "Le temps passe, l'amour reste.",
  "Chaque jour nous rapproche.",
  "Nos minutes comptent double.",
  "Nos deux étoiles brillent ensemble.",
  "Ton absence écrit mon manque.",
  "Je trace ta main dans le ciel.",
  "Notre horizon se rejoint.",
  "Le cœur connaît le chemin.",
  "Bientôt: toi et moi, ici.",
];
function dailyQuote() {
  const today = DateTime.now().setZone("Europe/Zurich");
  const idx = (today.ordinal + today.year) % quotes.length;
  document.getElementById("dailyQuote").textContent = "“" + quotes[idx] + "”";
}
dailyQuote();

// === Timeline overlay avec bouton Fermer ===
const timeline = document.getElementById("timeline");

// Crée l'overlay et le bouton fermer
const overlay = document.createElement("div");
overlay.className = "overlay";
overlay.style.zIndex = "1"; // derrière par défaut
overlay.style.opacity = 0;
overlay.style.transition = "opacity 0.4s";
document.body.appendChild(overlay); // derrière par défaut

// Bouton fermer
const closeBtn = document.createElement("button");
closeBtn.textContent = "×";
closeBtn.className =
  "absolute top-6 right-8 text-3xl text-white bg-transparent border-none cursor-pointer z-50";
overlay.appendChild(closeBtn);

closeBtn.addEventListener("click", () => {
  overlay.style.opacity = 0;
  overlay.style.zIndex = "1"; // remet derrière
});

// Tableau de photos à faire tourner
const photos = [
  "./src/img/1.jpg",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600",
  "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600",
];
let photoIndex = 0;

// Fonction pour afficher la photo suivante
function showNextPhoto() {
  const src = photos[photoIndex];
  overlay.innerHTML = `
    <div class="flex flex-col items-center justify-center max-w-3xl p-4 text-center relative">
      <img src="${src}" alt="Photo ${
    photoIndex + 1
  }" class="rounded-lg max-h-[80vh] max-w-full mb-4" />
      <button class="absolute top-6 right-8 text-3xl text-white bg-transparent border-none cursor-pointer">×</button>
    </div>
  `;
  // Re-ajoute le listener du bouton fermer
  overlay.querySelector("button").addEventListener("click", () => {
    overlay.style.opacity = 0;
    overlay.style.zIndex = "1";
  });

  overlay.style.zIndex = "10000"; // devant
  overlay.style.opacity = 1;

  photoIndex = (photoIndex + 1) % photos.length; // boucle
}

// Bouton pour déclencher
const showBtn = document.getElementById("showOverlayPhotos");
showBtn.addEventListener("click", showNextPhoto);

// Clic sur overlay pour fermer si clic en dehors de la photo
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.style.opacity = 0;
    overlay.style.zIndex = "1";
  }
});

document.body.appendChild(overlay);
overlay.appendChild(closeBtn);

function openOverlay(src, title, text) {
  overlay.innerHTML = `
    <div style="text-align:center;color:#fff;max-width:900px;padding:16px;position:relative">
      <img src="${src}" alt="${title}" style="max-width:90%;border-radius:12px"/>
      <h3 style="margin:12px 0 6px 0">${title}</h3>
      <p style="color:#e5e7eb">${text || ""}</p>
    </div>`;
  overlay.appendChild(closeBtn); // garde le bouton visible au-dessus
  overlay.style.zIndex = "10000"; // passe devant
  overlay.classList.add("visible");
}

function closeOverlay() {
  overlay.classList.remove("visible");
  // attendre la fin de la transition pour repasser derrière
  overlay.addEventListener(
    "transitionend",
    () => {
      overlay.style.zIndex = "1";
    },
    { once: true }
  );
}

// Fermer sur bouton ou clic en dehors
closeBtn.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

// === Background: stars ===
const stars = document.getElementById("starsCanvas");
const sctx = stars.getContext("2d");
let starArr = [];
function resizeCanvases() {
  [stars, particles, fireworks].forEach((c) => {
    c.width = innerWidth;
    c.height = innerHeight;
  });
  starArr = Array.from({ length: 180 }, () => ({
    x: Math.random() * stars.width,
    y: Math.random() * stars.height,
    r: Math.random() * 1.2 + 0.3,
    a: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.02 + 0.005,
  }));
}
window.addEventListener("resize", resizeCanvases);

function drawStars() {
  sctx.clearRect(0, 0, stars.width, stars.height);
  sctx.fillStyle = "#0b1020";
  sctx.fillRect(0, 0, stars.width, stars.height);
  for (const st of starArr) {
    st.a += st.sp;
    const tw = (Math.sin(st.a) + 1) / 2; // 0..1
    sctx.beginPath();
    sctx.arc(st.x, st.y, st.r * (0.5 + tw * 0.5), 0, Math.PI * 2);
    sctx.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`;
    sctx.fill();
  }
  requestAnimationFrame(drawStars);
}

// === Particles: hearts/snow/petals ===
const particles = document.getElementById("particlesCanvas");
const pctx = particles.getContext("2d");
let particleRunning = false;
let particleKind = "hearts";
let P = [];
function spawnParticle() {
  const x = Math.random() * particles.width;
  const y = -20;
  const s = Math.random() * 1.2 + 0.6;
  const vy = Math.random() * 0.7 + 0.6;
  const vx = (Math.random() - 0.5) * 0.5;
  P.push({ x, y, s, vy, vx, a: Math.random() * Math.PI * 2 });
}
function drawParticle(p) {
  pctx.save();
  pctx.translate(p.x, p.y);
  pctx.scale(p.s * 16, p.s * 16);
  pctx.rotate(Math.sin(p.a) * 0.2);
  if (particleKind === "hearts") {
    // simple heart path
    pctx.fillStyle = "#ec4899";
    pctx.beginPath();
    pctx.moveTo(0, -0.2);
    pctx.bezierCurveTo(-0.5, -0.8, -1, -0.1, 0, 0.6);
    pctx.bezierCurveTo(1, -0.1, 0.5, -0.8, 0, -0.2);
    pctx.fill();
  } else if (particleKind === "snow") {
    pctx.fillStyle = "white";
    pctx.beginPath();
    pctx.arc(0, 0, 0.25, 0, Math.PI * 2);
    pctx.fill();
  } else {
    // petals
    pctx.fillStyle = "#f472b6";
    pctx.beginPath();
    pctx.ellipse(0, 0.15, 0.18, 0.35, 0, 0, Math.PI * 2);
    pctx.fill();
    pctx.beginPath();
    pctx.ellipse(0, -0.15, 0.18, 0.35, 0, 0, Math.PI * 2);
    pctx.fill();
  }
  pctx.restore();
}
function stepParticles() {
  if (!particleRunning) return;
  if (P.length < 120) for (let i = 0; i < 4; i++) spawnParticle();
  pctx.clearRect(0, 0, particles.width, particles.height);
  for (const p of P) {
    p.a += 0.03;
    p.x += p.vx + Math.sin(p.a) * 0.2;
    p.y += p.vy;
    drawParticle(p);
  }
  P = P.filter((p) => p.y < particles.height + 40);
  requestAnimationFrame(stepParticles);
}
toggleHeartsBtn.addEventListener("click", () => {
  particleRunning = !particleRunning;
  if (particleRunning) {
    P = [];
    stepParticles();
  }
});
particleModeSel.addEventListener("change", (e) => {
  particleKind = e.target.value;
});

// === Fireworks when countdown hits 0 ===
const fireworks = document.getElementById("fireworksCanvas");
const fctx = fireworks.getContext("2d");
let fwActive = false;
let shells = [];
let sparks = [];
let fwEndTime = 0;
function launch() {
  const x = Math.random() * fireworks.width * 0.8 + fireworks.width * 0.1;
  const y = fireworks.height;
  const vy = -(Math.random() * 6 + 9);
  const color = `hsl(${Math.floor(Math.random() * 360)},90%,60%)`;
  shells.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy,
    color,
    life: Math.random() * 20 + 40,
  });
}
function burst(x, y, color) {
  for (let i = 0; i < 80; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = Math.random() * 4 + 2;
    sparks.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      life: 60,
      color,
    });
  }
}

function stepFW() {
  if (!fwActive) return;
  fctx.fillStyle = "rgba(0,0,0,0.2)";
  fctx.fillRect(0, 0, fireworks.width, fireworks.height);
  if (Math.random() < 0.05) launch();
  shells.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.15;
    s.life--;
    if (s.life <= 0) {
      burst(s.x, s.y, s.color);
      s.life = Infinity;
    }
  });
  shells = shells.filter((s) => s.y < fireworks.height && s.life !== Infinity);
  sparks.forEach((sp) => {
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.vy += 0.05;
    sp.life--;
    fctx.fillStyle = sp.color;
    fctx.fillRect(sp.x, sp.y, 2, 2);
  });
  sparks = sparks.filter((sp) => sp.life > 0);
  if (Date.now() > fwEndTime && sparks.length === 0 && shells.length === 0) {
    fwActive = false;
    fctx.clearRect(0, 0, fireworks.width, fireworks.height);
    return;
  }
  requestAnimationFrame(stepFW);
}
function triggerFireworks() {
  if (fwActive) return;
  fwActive = true;
  fwEndTime = Date.now() + 10000; // 10s
  stepFW();
}

// Init sizes and start background stars
resizeCanvases();
drawStars();
