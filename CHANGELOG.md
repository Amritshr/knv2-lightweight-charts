# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

The engine artifacts (`knv2lw.wasm`, `knv2lw.js`) are versioned together with
the SDK. Their SHA-256 digests are published in `checksums.sha256` for every
release, and the SDK verifies them at load — so **copy `dist/` from a single
release**; mixing files across versions fails with an `IntegrityError`.

---

## 1.0.1

### Changed

- **The attribution mark now has three required parts** — the **K2** logo, the
  text "Charts by KNv2", and the author credit to **Amrit Shrestha**. The
  licence (§1, §3) requires all three, and the runtime check inspects each one
  separately: hiding just the logo or just the credit is the same breach as
  removing the whole mark.
- The logo is a text monogram rather than an SVG glyph, so it renders in any
  font stack, needs no asset request, and can be verified by the guard.

---

## 1.0.0

First public release.

### Added

- **Chart types** — candlestick, OHLC bars, line, area, Heikin-Ashi.
- **Chrome** — time axis, price axis, grid, crosshair with an OHLC readout,
  last-price tag, high/low tags.
- **Price scale** — logarithmic, percent, inverted, auto-fit, manual margins,
  fixed or derived precision.
- **Drawing tools** — trend line, ray, horizontal line, vertical line, extended
  line, horizontal ray, arrow, text, callout; hit-testing, selection, drag,
  undo/redo, and programmatic placement in bar-index/price space.
- **Touch** — one-finger pan, pinch zoom, tap to read, double-tap to fit,
  tap-tap and drag placement for drawing tools, axis scaling from the gutters.
- **Live data** — `update()` rewrites the forming bar in place with no
  re-upload and no allocation.
- **Multi-chart** — many charts per page sharing one WASM module.
- **Theming** — dark and light palettes, six-colour custom palettes, gradient
  and image backgrounds, full candle styling.
- **React** — an optional component at `knv2-lightweight-charts/react` handling the
  async mount, teardown and the Strict Mode double-mount.
- **TypeScript** — full definitions for the public API.
- **Integrity** — published SHA-256 digests for every shipped file, verified in
  the browser before the engine is allowed to instantiate.
- **Attribution** — the required mark, positionable to any of the four corners,
  with a forgiving runtime visibility check.

### Known limitations

- No technical indicators, volume histograms, or sub-panes. This package draws
  a chart; indicators are a separate product.
- One series per chart. There are no series objects to add.
- Heikin-Ashi has no fast tick path — `update()` forces a rebuild, because the
  candle is a chain and cannot be recomputed from one raw bar.
- The shared WASM heap is 64 MiB and cannot grow: roughly 1.2 million bars
  across every chart in a tab. `setData` returns `0` when a reservation is
  refused.
- WebGL2 contexts, not memory, are the practical ceiling on simultaneous
  charts. Eight is comfortable; browsers evict the oldest past roughly sixteen.
- `{ year, month, day }` business-day timestamps are not accepted — pass a
  number.
- Verified in Chrome, Edge, Firefox and Safari on desktop, and with browser
  touch emulation. Not yet verified on physical iOS or Android hardware.
