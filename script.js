const FLEET = [
  { name: "Swift Dzire", type: "Sedan", seats: "4 + Driver", fare: "₹14/km", img: "/img/fleet-dzire.webp", w: 600, h: 338, alt: "White Maruti Suzuki Swift Dzire sedan — the ₹14/km taxi class at Drop Zone Travels, Sangam Vihar" },
  { name: "Hyundai Aura", type: "Sedan", seats: "4 + Driver", fare: "₹14/km", img: "/img/fleet-aura.webp", w: 600, h: 338, alt: "Hyundai Aura sedan taxi for rent with driver in South Delhi" },
  { name: "Maruti Ertiga", type: "SUV", seats: "6 + Driver", fare: "₹24/km", img: "/img/fleet-ertiga.webp", w: 600, h: 338, alt: "Maruti Suzuki Ertiga 6-seater SUV taxi — ₹24/km class from Sangam Vihar" },
  { name: "Innova Crysta", type: "SUV", seats: "6 + Driver", fare: "₹24/km", img: "/img/fleet-innova.webp", w: 600, h: 391, alt: "Toyota Innova Crysta on rent in Delhi for family and outstation trips" },
  { name: "Force Urbania 9S", type: "Urbania", seats: "9 + Driver", fare: "₹32/km", img: "/img/fleet-urbania-9.webp", w: 600, h: 419, alt: "Force Traveller luxury van (representative image of the Force Urbania 9-seater class) for group taxi hire in Delhi" },
  { name: "Force Urbania 12S", type: "Urbania", seats: "12 + Driver", fare: "₹32/km", img: "/img/fleet-urbania-12.webp", w: 600, h: 399, alt: "Force Traveller van on the road (representative image of the Force Urbania 12-seater class)" },
  { name: "Tempo Traveller 17S", type: "Tempo Traveller", seats: "17 + Driver", fare: "₹32/km", img: "/img/fleet-tempo-17.webp", w: 600, h: 450, alt: "Force Traveller — the 17-seater Tempo Traveller for rent in Delhi at ₹32/km" },
  { name: "Toyota Fortuner", type: "Luxury SUV", seats: "6 + Driver", fare: "On Request", img: "/img/fleet-fortuner.webp", w: 600, h: 354, alt: "Toyota Fortuner luxury SUV for premium travel from Drop Zone Travels" }
];

function buildFleet() {
  const track = document.getElementById("fleetTrack");
  if (!track) return;
  const cards = FLEET.map(v => `
    <div class="fleet-card">
      <img src="${v.img}" alt="${v.alt}" width="${v.w}" height="${v.h}" loading="lazy" decoding="async" onerror="this.style.display='none'">
      <h3 style="color:var(--gold)">${v.name}</h3>
      <p style="color:var(--grey);font-size:0.85rem">${v.type} • ${v.seats}</p>
      <p style="color:#fff;font-weight:700;margin-top:6px">${v.fare}</p>
    </div>`).join("");
  track.innerHTML = cards + cards;
}

const EST = { mode: "outstation", rate: 14, localBase: 2500, vehLabel: "Sedan", vehOut: 14, km: 250 };
const inr = n => "₹" + n.toLocaleString("en-IN");

// ── Analytics bridge ─────────────────────────────────────────
// inject-analytics.mjs sets window.__DZ_ANALYTICS to "gtm" or "ga4".
// That flag matters: both GTM and the plain gtag.js snippet create
// window.dataLayer, so sniffing the globals at click time would send
// GTM events straight to gtag and bypass every GTM trigger.
// With no analytics configured the flag is undefined and this is a no-op.
function track(event, params) {
  try {
    const mode = window.__DZ_ANALYTICS;
    const payload = Object.assign({ event }, params || {});
    if (mode === "gtm" && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    } else if (mode === "ga4" && typeof window.gtag === "function") {
      window.gtag("event", event, params || {});
    } else if (typeof window.gtag === "function") {
      // Fallback: tag added by hand, outside the build.
      window.gtag("event", event, params || {});
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  } catch (_) { /* analytics must never break the page */ }
}

function initAnalytics() {
  if (document.documentElement.dataset.analyticsBound) return;
  document.documentElement.dataset.analyticsBound = "1";
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      track("call_click", { link_url: href, page_path: location.pathname });
    } else if (href.indexOf("wa.me/") !== -1) {
      track("whatsapp_click", { link_url: href, page_path: location.pathname });
    }
  }, { passive: true });
}

function renderEstimator() {
  let total, note;
  if (EST.mode === "outstation") {
    total = EST.vehOut * EST.km;
    note = EST.vehLabel + " • ₹" + EST.vehOut + "/km × " + EST.km.toLocaleString("en-IN") + " km • tolls extra at actuals";
  } else {
    const extra = Math.max(0, EST.km - 80);
    total = EST.localBase + extra * EST.vehOut;
    note = extra === 0
      ? EST.vehLabel + " • ₹" + EST.localBase.toLocaleString("en-IN") + " flat package (8h/80km) • tolls extra"
      : EST.vehLabel + " • ₹" + EST.localBase.toLocaleString("en-IN") + " + " + extra.toLocaleString("en-IN") + " extra km × ₹" + EST.vehOut + " • tolls extra";
  }
  document.getElementById("estKmOut").textContent = EST.km.toLocaleString("en-IN") + " km";
  document.getElementById("estTotal").textContent = inr(total);
  document.getElementById("estNote").textContent = note;
  document.getElementById("estKmLabel").textContent = EST.mode === "local" ? "EXPECTED RUNNING DISTANCE" : "JOURNEY DISTANCE";
  const journey = EST.mode === "outstation" ? "Outstation Drop" : "Full Day Local (8h/80km)";
  const msg = "Hi Drop Zone Travels! Booking request from your website:" +
    "%0A• Journey: " + encodeURIComponent(journey) +
    "%0A• Vehicle: " + encodeURIComponent(EST.vehLabel) +
    "%0A• Distance: " + encodeURIComponent(EST.km + " km") +
    "%0A• Estimated fare: " + encodeURIComponent(inr(total)) +
    "%0APlease confirm availability and dispatch time.";
  document.getElementById("estBookBtn").href = "https://wa.me/917210669203?text=" + msg;
}

function initEstimator() {
  const tabOut = document.getElementById("tabOut");
  const tabLocal = document.getElementById("tabLocal");
  const km = document.getElementById("estKm");
  if (!tabOut || !km) return;
  tabOut.addEventListener("click", () => {
    EST.mode = "outstation";
    tabOut.classList.add("active"); tabOut.setAttribute("aria-selected", "true");
    tabLocal.classList.remove("active"); tabLocal.setAttribute("aria-selected", "false");
    renderEstimator();
    track("estimator_mode", { mode: "outstation" });
  });
  tabLocal.addEventListener("click", () => {
    EST.mode = "local";
    tabLocal.classList.add("active"); tabLocal.setAttribute("aria-selected", "true");
    tabOut.classList.remove("active"); tabOut.setAttribute("aria-selected", "false");
    renderEstimator();
    track("estimator_mode", { mode: "local" });
  });
  document.querySelectorAll(".est-veh").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".est-veh").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      EST.vehLabel = (btn.querySelector("h3, h4") || {}).textContent || EST.vehLabel;
      EST.vehOut = Number(btn.dataset.out);
      EST.localBase = Number(btn.dataset.local);
      renderEstimator();
      track("fare_estimate", { vehicle: EST.vehLabel, mode: EST.mode, km: EST.km });
    });
  });
  km.addEventListener("input", e => { EST.km = Number(e.target.value); renderEstimator(); });
  km.addEventListener("change", () => track("fare_estimate", { vehicle: EST.vehLabel, mode: EST.mode, km: EST.km }));
  renderEstimator();
}

function initBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const g = id => (document.getElementById(id)?.value || "").trim();
    const lines = [
      "Hi Drop Zone Travels! New booking enquiry from your website:",
      "• Name: " + encodeURIComponent(g("name")),
      "• Phone: " + encodeURIComponent(g("phone")),
      "• Pickup: " + encodeURIComponent(g("pickup")),
      "• Drop: " + encodeURIComponent(g("drop")),
      "• Date & time: " + encodeURIComponent(g("tripDate"))
    ].join("%0A");
    track("booking_request", { method: "whatsapp", page_path: location.pathname });
    window.open("https://wa.me/917210669203?text=" + lines, "_blank", "noopener");
  });
}

function initMobileNav() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mobileNav");
  if (!toggle || !nav) return;
  if (toggle.dataset.navBound) return;
  toggle.dataset.navBound = "1";
  const setOpen = open => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    toggle.textContent = open ? "✕" : "☰";
  };
  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("open"));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

buildFleet();
initEstimator();
initBookingForm();
initMobileNav();
initAnalytics();
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
