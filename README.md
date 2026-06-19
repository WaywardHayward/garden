# 🌿 garden

A small, data-driven record of Alex's garden — a labelled layout, plant inventory, photos, and a bespoke month-by-month care calendar.

**Live site:** https://waywardhayward.github.io/garden/

## What's here

| Path | What |
|------|------|
| `index.html` | The site — layout sketch, filterable plant grid, photo gallery, care calendar |
| `data/plants.json` | **Source of truth** for the plant inventory (name, latin, type, zone, notes) |
| `data/care.json` | Month-by-month jobs + rules of thumb, tailored to these plants |
| `assets/` | The hand-drawn layout sketch + garden photos |
| `css/` · `js/` | Hand-rolled styles + vanilla JS (no framework, no build step, no deps) |

## Add or change a plant

Edit `data/plants.json` — the site re-renders from it. No HTML to touch.

```json
{ "name": "Foxglove", "latin": "Digitalis", "type": "perennial", "zone": "west", "notes": "Self-seeds; biennial." }
```

Valid `type` values drive the filter buttons. Valid `zone` ids are defined in the `zones` array.

## The garden

A sheltered sun-trap (the olive and fig give it away) with strong western/evening light. Heavy on aromatics — lavender ×4, rosemary, thyme, oregano, sage, mint, salvia, curry plant — plus fruit (currants, espalier apple, fig, pear, cherry), climbers (wisteria, honeysuckle, clematis, jasmine) and a couple of bulb beds.

Two Gardena soil sensors ("Back Garden", "Front Garden") feed moisture/battery readings into the wider Rabbie Pi setup; `data/plants.json` notes which bed each sits in once confirmed.

## Notes

- Inclusive naming throughout. `main` branch.
- Built and maintained by 🐑 Rabbie Pi.
