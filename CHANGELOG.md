# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

The engine artifacts (`knv2lw.wasm`, `knv2lw.js`) are versioned together with
the SDK. Their SHA-256 digests are published in `checksums.sha256` for every
release, and the SDK verifies them at load — so **copy `dist/` from a single
release**; mixing files across versions fails with an `IntegrityError`.

---

## 1.0.4

### Added

- **A landing page** (`index.html`) with a live, interactive 20,000-bar chart,
  ready to serve from GitHub Pages. Every internal link and asset path on it is
  relative, so the same files work from a project subpath *and* from a custom
  domain with no edits.
- `.nojekyll`, so Pages serves the site verbatim.

### Fixed

- **The install instructions promised an npm package that does not exist yet.**
  `npm install` was the first command in the README and it failed with a 404.
  Every install instruction now shows the download/clone path that works today;
  a single `NPM_PUBLISHED` flag in the build flips them all back on publish.

### Changed

- **The closed-source status is now stated explicitly rather than implied.** The
  comparison row read `source code | open | not published`, which could be
  misread at a glance as describing this package. Every comparison now says
  **closed — compiled WebAssembly only, never the C++**, and the README, the
  landing page and the migration guide each say plainly that what ships is the
  compiled binary and that the engine source is not distributed.
- The demos now carry recognisable symbols — AAPL 15m on the landing page, and
  AAPL 1D, TSLA 1D and BTCUSDT 1m in the examples — each labelled as simulated,
  because the series is generated in the page and is not a live quote.

---

## 1.0.3

### Changed

- The credit to **TradingView's Lightweight Charts** is now written as a proper
  acknowledgement rather than a disclaimer: what that library got right, the
  five specific things this package's API took from it, thanks to its team and
  contributors, and a straight recommendation to use it instead where it is the
  better fit. The trade mark and non-affiliation notices are unchanged in
  substance and still present.

---

## 1.0.2

### Added

- Explicit credit to **TradingView's Lightweight Charts** as the inspiration for
  this package's API design and packaging, in the README and in `NOTICE`.
- A clear statement of what that inspiration covers and does not: the public
  interface and the distribution shape, **not** the code. No TradingView source,
  assets, fonts or trade marks are used, copied, decompiled or redistributed,
  and no part of this project is derived from TradingView software.
- A strengthened non-affiliation notice. TradingView™ and Lightweight Charts™
  are trade marks of TradingView, Inc.; this project is not affiliated with,
  endorsed by, sponsored by or connected to TradingView, Inc.

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
