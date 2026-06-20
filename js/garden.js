// Garden — render plant inventory + care calendar from data files.
const ZONE_LABELS = {};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

async function load(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  kids.flat().forEach(c => node.append(c?.nodeType ? c : document.createTextNode(c ?? "")));
  return node;
}

function plantCard(p) {
  const card = el("div", { class: "card", "data-type": p.type, "data-zone": p.zone });
  card.append(el("h3", {}, p.name));
  if (p.latin) card.append(el("div", { class: "latin" }, p.latin));
  const tags = el("div");
  tags.append(el("span", { class: "tag" }, p.type));
  if (p.zone && ZONE_LABELS[p.zone]) tags.append(" ", el("span", { class: "tag zone" }, ZONE_LABELS[p.zone]));
  if (p.count && p.count > 1) tags.append(" ", el("span", { class: "tag count" }, `×${p.count}`));
  card.append(tags);
  if (p.notes) card.append(el("p", { class: "notes" }, p.notes));
  return card;
}

// Returns an API so the map can drive a zone filter.
function renderPlants(data) {
  data.zones.forEach(z => (ZONE_LABELS[z.id] = z.label.split(" (")[0]));
  const grid = document.getElementById("plant-grid");
  const controls = document.getElementById("plant-controls");
  const countEl = document.getElementById("plant-count");
  const zoneNote = document.getElementById("zone-filter-note");

  let typeFilter = "all";
  let zoneFilter = "all";

  const draw = () => {
    grid.innerHTML = "";
    const shown = data.plants.filter(p =>
      (typeFilter === "all" || p.type === typeFilter) &&
      (zoneFilter === "all" || p.zone === zoneFilter)
    );
    shown.forEach(p => grid.append(plantCard(p)));
    countEl.textContent = `${shown.length} of ${data.plants.length}`;

    if (zoneFilter === "all") {
      zoneNote.hidden = true;
    } else {
      zoneNote.hidden = false;
      zoneNote.innerHTML = "";
      zoneNote.append(`Showing the ${ZONE_LABELS[zoneFilter] || zoneFilter} bed · `);
      const clear = el("button", { class: "link-btn" }, "show all beds");
      clear.addEventListener("click", () => api.setZone("all"));
      zoneNote.append(clear);
    }
  };

  const types = [...new Set(data.plants.map(p => p.type))].sort();
  const mkBtn = (label, value) => {
    const b = el("button", value === "all" ? { class: "active" } : {}, label);
    b.addEventListener("click", () => {
      controls.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      typeFilter = value;
      draw();
    });
    return b;
  };
  controls.append(mkBtn("All", "all"));
  types.forEach(t => controls.append(mkBtn(t[0].toUpperCase() + t.slice(1), t)));

  const api = {
    onZoneReset: null,
    setZone(zone) {
      zoneFilter = zone;
      draw();
      if (zone === "all" && typeof api.onZoneReset === "function") {
        api.onZoneReset();
      }
      if (zone !== "all") {
        document.getElementById("plants").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  draw();
  return api;
}

function renderCare(data) {
  const cal = document.getElementById("care-cal");
  const nowMonth = MONTHS[new Date().getMonth()];
  data.months.forEach(m => {
    const box = el("div", { class: "month" + (m.month === nowMonth ? " now" : "") });
    box.append(el("h4", {}, m.month));
    const ul = el("ul");
    m.jobs.forEach(j => ul.append(el("li", {}, j)));
    box.append(ul);
    cal.append(box);
  });
  const rules = document.getElementById("care-rules");
  data.rules_of_thumb.forEach(r => rules.append(el("li", {}, r)));
}

(async function init() {
  try {
    const [plants, care] = await Promise.all([load("data/plants.json"), load("data/care.json")]);
    document.getElementById("garden-note").textContent = plants.meta.notes;
    const plantApi = renderPlants(plants);
    if (typeof renderMap === "function") {
      const mapApi = renderMap(plants, (zoneId) => plantApi.setZone(zoneId));
      plantApi.onZoneReset = () => { if (mapApi) mapApi.clearSelection(); };
    }
    renderCare(care);
  } catch (err) {
    document.getElementById("plant-grid").innerHTML =
      `<p style="color:#b5651d">Couldn't load garden data: ${err.message}</p>`;
    console.error(err);
  }
})();
