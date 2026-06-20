// Interactive garden map — renders clickable zone beds as SVG.
// Clicking a zone highlights it and filters the plant grid to that zone.
// Data-driven: zones come from plants.json; plant counts computed live.

// Bed geometry mirrors the hand-drawn plan: north top, east right,
// south bottom, west left, centre middle. viewBox is 1000x740.
const BED_SHAPES = {
  north:  { x: 70,  y: 50,  w: 860, h: 120, label: "North run", sub: "top wall" },
  west:   { x: 70,  y: 185, w: 200, h: 420, label: "West side", sub: "roses · bulbs" },
  east:   { x: 730, y: 185, w: 200, h: 420, label: "East boundary", sub: "climbers · fig" },
  south:  { x: 70,  y: 620, w: 860, h: 70,  label: "South run", sub: "Mediterranean herbs" },
  centre: { x: 285, y: 185, w: 430, h: 420, label: "Centre", sub: "beds · lawn · shed" }
};

// Little glyphs to scatter for character (purely decorative).
const ZONE_GLYPH = { north: "🍎", west: "🌹", east: "🍇", south: "🌿", centre: "🌳" };

function svgEl(tag, attrs = {}) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function renderMap(plantsData, onZoneSelect) {
  const host = document.getElementById("garden-map");
  if (!host) return;

  const counts = {};
  plantsData.plants.forEach(p => (counts[p.zone] = (counts[p.zone] || 0) + 1));

  const svg = svgEl("svg", {
    viewBox: "0 0 1000 740",
    role: "group",
    "aria-label": "Interactive garden map — select a bed to see its plants",
    class: "gardenmap"
  });

  // soft lawn backdrop
  svg.append(svgEl("rect", { x: 0, y: 0, width: 1000, height: 740, rx: 18, class: "map-bg" }));

  // shed + bench + fountain markers (decorative, non-interactive)
  const deco = svgEl("g", { class: "map-deco" });
  const shed = svgEl("rect", { x: 455, y: 360, width: 90, height: 60, rx: 6, class: "map-shed" });
  deco.append(shed);
  const shedT = svgEl("text", { x: 500, y: 395, class: "map-deco-label", "text-anchor": "middle" });
  shedT.textContent = "🏚️ shed";
  deco.append(shedT);
  const fountain = svgEl("circle", { cx: 830, cy: 390, r: 22, class: "map-fountain" });
  deco.append(fountain);
  const fountainT = svgEl("text", { x: 830, y: 430, class: "map-deco-label", "text-anchor": "middle" });
  fountainT.textContent = "⛲";
  deco.append(fountainT);
  svg.append(deco);

  // beds
  const order = ["north", "west", "centre", "east", "south"];
  order.forEach(zoneId => {
    const shape = BED_SHAPES[zoneId];
    if (!shape) return;
    const zone = plantsData.zones.find(z => z.id === zoneId);
    const g = svgEl("g", {
      class: "bed",
      "data-zone": zoneId,
      tabindex: "0",
      role: "button",
      "aria-label": `${shape.label}: ${counts[zoneId] || 0} plants`
    });

    g.append(svgEl("rect", { x: shape.x, y: shape.y, width: shape.w, height: shape.h, rx: 12, class: "bed-rect" }));

    const cx = shape.x + shape.w / 2;
    const cy = shape.y + shape.h / 2;
    const isWideBand = shape.w > 500; // wide bands (north/south) lay text on one line

    if (isWideBand) {
      const line = svgEl("text", { x: cx, y: cy + 6, "text-anchor": "middle", class: "bed-name" });
      const glyph = svgEl("tspan", {});
      glyph.textContent = (ZONE_GLYPH[zoneId] || "🌱") + "  ";
      const nm = svgEl("tspan", {});
      nm.textContent = shape.label;
      const sub = svgEl("tspan", { class: "bed-sub-inline" });
      sub.textContent = `   ·  ${counts[zoneId] || 0} plants · ${shape.sub}`;
      line.append(glyph, nm, sub);
      g.append(line);
    } else {
      const glyph = svgEl("text", { x: cx, y: cy - 14, "text-anchor": "middle", class: "bed-glyph" });
      glyph.textContent = ZONE_GLYPH[zoneId] || "🌱";
      g.append(glyph);

      const name = svgEl("text", { x: cx, y: cy + 12, "text-anchor": "middle", class: "bed-name" });
      name.textContent = shape.label;
      g.append(name);

      const meta = svgEl("text", { x: cx, y: cy + 32, "text-anchor": "middle", class: "bed-sub" });
      meta.textContent = `${counts[zoneId] || 0} plants · ${shape.sub}`;
      g.append(meta);
    }

    const select = () => {
      svg.querySelectorAll(".bed").forEach(b => b.classList.remove("selected"));
      g.classList.add("selected");
      onZoneSelect(zoneId, shape.label);
    };
    g.addEventListener("click", select);
    g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
    });

    svg.append(g);
  });

  // compass
  const compass = svgEl("text", { x: 500, y: 28, "text-anchor": "middle", class: "map-compass" });
  compass.textContent = "▲ N";
  svg.append(compass);

  host.innerHTML = "";
  host.append(svg);

  return {
    clearSelection() {
      svg.querySelectorAll(".bed").forEach(b => b.classList.remove("selected"));
    }
  };
}
