<div align="center">

# KNv2 Lightweight Charting Engine

`knv2-lightweight-charts`

**A financial charting engine written in C++, compiled to WebAssembly, drawn with WebGL2.**

Free to use in commercial products. Keep the attribution mark, and that is the whole price.

*API inspired by TradingView's Lightweight Charts. Engine written from scratch in C++.*

[Getting started](docs/getting-started.md) · [API](docs/api.md) · [Live data](docs/data-sources.md) · [Migrating from lightweight-charts](docs/migrating-from-lightweight-charts.md) · [Licence](LICENSE.md)

</div>

---

## What this is

Most web charting libraries draw with Canvas2D from JavaScript, which means
every pan, every zoom and every incoming tick re-runs a JavaScript render loop.
This one does not. The chart engine — the projection, the hit-testing, the text
layout, the input handling and the render loop — is compiled C++ running inside
WebAssembly, drawing through WebGL2. **No JavaScript runs on a frame.** Panning
a 100,000-bar series uploads nothing and allocates nothing.

**It is inspired by TradingView's Lightweight Charts**, deliberately: one small
artifact, a small API, many charts on a page. That library set the standard for
what a lean web charting library should feel like, and this one follows its
shape on purpose — if you have used it, you already know this one. See the
[migration guide](docs/migrating-from-lightweight-charts.md).

The inspiration is the **API and the packaging**. The renderer underneath is a
different animal: an independent C++ engine compiled to WebAssembly and drawing
through WebGL2, rather than Canvas2D driven from JavaScript.

```js
import { createChart } from './dist/knv2-lightweight-charts.js';

const chart = await createChart(document.getElementById('chart'), {
  type: 'candles',
  theme: 'dark',
});

chart.setData(bars);   // [{ time, open, high, low, close }]
```

That is a complete, working chart. There is no build step, no bundler, no
account, no API key, and no server component.

## What you get

|  |  |
|---|---|
| **Chart types** | candlestick · OHLC bars · line · area · Heikin-Ashi |
| **Chrome** | time axis, price axis, grid, crosshair with OHLC readout, last-price tag, high/low tags |
| **Price scale** | logarithmic, percent, inverted, auto-fit, manual margins, fixed or derived precision |
| **Drawing tools** | trend line, ray, horizontal line, vertical line, extended line, horizontal ray, arrow, text, callout — with hit-testing, selection, drag, undo/redo |
| **Interaction** | mouse pan/zoom, axis scaling, one-finger pan, pinch zoom, tap-to-read, double-tap-to-fit |
| **Live data** | `update()` rewrites the forming bar in place — no re-upload, no reallocation |
| **Multi-chart** | many charts per page sharing one WASM module |
| **Themes** | dark, light, or any six-colour palette; gradient and image backgrounds |
| **Types** | full TypeScript definitions |
| **Frameworks** | works anywhere — plain HTML, React, Vue, Svelte, Angular, Next.js |

**Not included:** technical indicators, volume histograms, sub-panes, symbol
search, and a toolbar UI. This package draws a chart and gets out of the way;
indicators are the full product's job. If you need indicator series on the same
canvas, this is not the right package for you — see §"Is this the right
choice?" below.

## Install

```bash
# Download the latest release and copy dist/ into your project:
#   https://github.com/Amritshr/knv2-lightweight-charts/releases
#
# Or clone it:
git clone https://github.com/Amritshr/knv2-lightweight-charts.git
```

Then copy `dist/` somewhere your web server serves as static files. That is the
entire installation — the SDK bundle finds the engine binary beside itself.

```
your-app/public/knv2/
├── knv2-lightweight-charts.js       the SDK
├── knv2lw.js                          the engine loader
└── knv2lw.wasm                        the engine
```

```html
<div id="chart" style="width:100%;height:420px"></div>
<script type="module">
  import { createChart } from '/knv2/knv2-lightweight-charts.js';
  const chart = await createChart(document.getElementById('chart'), { theme: 'dark' });
  chart.setData(await fetch('/api/bars').then((r) => r.json()));
</script>
```

Full walkthrough: **[docs/getting-started.md](docs/getting-started.md)**.

## Size

| file | raw | gzipped |
|---|---|---|
| `knv2lw.wasm` — the engine | 189,003 B | 78 KB |
| `knv2lw.js` — the loader | 35,074 B | 14 KB |
| `knv2-lightweight-charts.js` — the SDK | 19,618 B | 8 KB |
| **total** | | **100 KB** |

⚠ **This is bigger than `lightweight-charts`' ~45 KB and we are not going to
pretend otherwise.** That library is Canvas2D JavaScript; this is WebGL2 and
WebAssembly, where the Emscripten runtime floor alone is around 48 KB before a
single line of chart code. What the extra bytes buy is the thing Canvas2D
cannot do: 100,000 bars panning at frame rate with zero JavaScript on the frame,
and a full drawing-tool layer with hit-testing that you would otherwise build
yourself.

The engine is fetched once and cached. It is shared by every chart on the page.

## Is this the right choice?

| | `lightweight-charts` | **knv2-lightweight-charts** |
|---|---|---|
| renderer | Canvas2D, JavaScript | WebGL2, C++ → WebAssembly |
| payload | ~45 KB gz, self-contained | 100 KB gz, served from your origin |
| JS cost per frame | proportional to visible bars | **none** |
| 100k bars | struggles | designed for it |
| drawing tools | none — you build overlays | nine tools, hit-tested, undo/redo |
| indicators | you compute and add series | **not included** |
| licence | Apache 2.0 | free with required attribution ([terms](LICENSE.md)) |
| source code | open (Apache 2.0) | **closed** — compiled WebAssembly only, never the C++ |

**Choose this** if you want the drawing tools, large-series performance, or a
chart that stays smooth while your app does other work on the main thread.

**Choose `lightweight-charts`** if you need those 45 KB, if you need an
OSI-approved open-source licence, if you need to read or fork the source, or if
you need indicator series and histograms on the same chart.

⚠ **This package is closed source.** What ships is the compiled WebAssembly
engine, its loader, a minified SDK and TypeScript definitions. The C++ source of
the engine is not distributed, and the licence does not permit reverse
engineering or decompiling it. If reading the code matters to you, that is a
real reason to choose differently, and we would rather you knew now.

Both are good libraries. Pick on the requirement, not the pitch.

## Any market, any data source

The package takes an **array**. It fetches nothing, knows no symbols, and has no
opinion about your broker, exchange, or vendor. Stocks, futures, forex, crypto,
commodities, or a CSV a colleague emailed you — if you can get it into
`{ time, open, high, low, close }`, it charts.

```js
// Historical
chart.setData(bars);

// A live tick — rewrites the forming bar in place
socket.onmessage = (e) => {
  const t = JSON.parse(e.data);
  chart.update({ time: t.t, open: t.o, high: t.h, low: t.l, close: t.c });
};
```

Worked adapters for REST endpoints, WebSocket feeds, CSV, and several common
market-data vendors: **[docs/data-sources.md](docs/data-sources.md)**.

## Frameworks

```jsx
import KNv2Chart from 'knv2-lightweight-charts/react';

<KNv2Chart bars={bars} type="candles" theme="dark" style={{ height: 420 }} />
```

React, Next.js (including the App Router), Vue, Svelte and plain HTML:
**[docs/frameworks.md](docs/frameworks.md)**.

## Examples

Runnable, with no build step and no dependencies:

```bash
node examples/serve.mjs        # → http://localhost:8080
```

| | |
|---|---|
| [`examples/vanilla`](examples/vanilla) | one file, plain HTML — chart types, themes, drawing tools |
| [`examples/react`](examples/react) | the React component, crosshair legend, tool dock |
| [`examples/live-websocket`](examples/live-websocket) | a live feed driving `update()` |

## Licence in one paragraph

Free for anything, including commercial and closed-source products, with no
limit on developers, domains, charts, or users. **You must keep the attribution
mark visible on every chart** — all three parts of it: the `K2` logo,
the text "Charts by KNv2", and the credit to **Amrit Shrestha**. You may move it
to any corner you like, and you may put your own branding anywhere else. You must not modify
the compiled engine, reverse engineer it, or republish it as a standalone
package. **It is closed source** — you receive the compiled WebAssembly binary,
not the C++. No warranty; this software draws charts and does not give financial
advice.

The full terms are in **[LICENSE.md](LICENSE.md)** and they are short. §3
(attribution) and §4 (restrictions) are the two that matter.

⚠ **The attribution mark is enforced at runtime**, and each of its three parts
is checked separately — dropping just the logo or just the credit is the same
breach as removing the whole mark. Hide any part and the chart warns in the
console, then stops rendering. This is disclosed, deliberate, and
documented in **[docs/attribution.md](docs/attribution.md)** — which also
explains how to style around it and what to do if a CSS conflict trips it by
accident.

## Integrity

Every file in `dist/` is published with its SHA-256 digest in
[`checksums.sha256`](checksums.sha256), and the SDK verifies the engine
artifacts before it lets them instantiate. A modified or corrupted engine does
not start.

```bash
shasum -a 256 -c checksums.sha256
```

How to verify a download, and how to lock the artifacts down with Subresource
Integrity and CSP on your own server: **[docs/integrity.md](docs/integrity.md)**.

## Browser support

WebGL2 is required: Chrome/Edge 56+, Firefox 51+, **Safari 15+ (iOS 15+)**.
`createChart` resolves to `null` on a browser without it, so you can render your
own fallback rather than catching an exception.

⚠ Your page's Content-Security-Policy needs `'wasm-unsafe-eval'` in
`script-src`. Without it the module downloads and then refuses to instantiate.
See [docs/integrity.md](docs/integrity.md).

## Documentation

| | |
|---|---|
| [Getting started](docs/getting-started.md) | install, serve, first chart, common mistakes |
| [API reference](docs/api.md) | every option, every method, every event |
| [Data sources](docs/data-sources.md) | REST, WebSocket, CSV, vendor adapters, timeframes |
| [Frameworks](docs/frameworks.md) | React, Next.js, Vue, Svelte, plain HTML |
| [Theming](docs/theming.md) | palettes, gradients, candle styling, brand colours |
| [Drawing tools](docs/drawings.md) | arming tools, persistence, programmatic objects |
| [Attribution](docs/attribution.md) | the mark, positioning it, the runtime check |
| [Integrity & security](docs/integrity.md) | checksums, SRI, CSP, serving the binary |
| [Troubleshooting](docs/troubleshooting.md) | blank canvas, blurry chart, leaks, heap limits |
| [Migrating](docs/migrating-from-lightweight-charts.md) | call-by-call mapping |

## Credits

### Inspired by Lightweight Charts

This package would not have the shape it has without
**[TradingView](https://www.tradingview.com/)'s
[Lightweight Charts](https://github.com/tradingview/lightweight-charts)**.

Before it, putting a chart on a web page usually meant adopting a framework — a
plugin system, a widget lifecycle, a configuration object the size of a small
application. Lightweight Charts made the case that a charting library could be
one small file, a handful of methods, and good defaults instead of a hundred
options. It is an excellent piece of software, and it is the reason this one
looks the way it does.

What we learned from it, concretely:

| | |
|---|---|
| a **factory function**, not a framework | `createChart(el, options)` |
| **one chart, one series** | no series objects to juggle |
| the **`setData` / `update` split** | a bulk load and a live tick are different operations |
| **one small artifact, many charts per page** | the whole packaging model |
| option names that read the same way | `crosshair`, `priceScale`, `timeScale`, `autoSize` |

Our [migration guide](docs/migrating-from-lightweight-charts.md) is short
precisely because of that lineage. Thank you to the TradingView team and to
every Lightweight Charts contributor for setting the bar.

**And if their library is the better fit for your project, use it.** It is
smaller, it is Apache-2.0, its source is open, and it supports several series on
one chart — none of which is true here. That comparison is
[in this README](#is-this-the-right-choice), written straight.

### What we did not take

The inspiration is the **API surface and the packaging**. The engine underneath
is our own: an independent implementation written in C++, compiled to
WebAssembly, rendering through WebGL2 — a different approach to a shared
problem, not a reimplementation of theirs.

No TradingView source code, assets, fonts or trade marks are used, copied,
decompiled or redistributed by this project, and no part of it is derived from
TradingView software. Their work is theirs. We admire it; we did not take it.

> TradingView™ and Lightweight Charts™ are trade marks of TradingView, Inc.
> **This project is not affiliated with, endorsed by, sponsored by, or connected
> to TradingView, Inc.** References to Lightweight Charts in this documentation
> are nominative and descriptive only — so that developers can compare the two
> and move between them.

## Support

- **Bugs and questions** — [open an issue](https://github.com/Amritshr/knv2-lightweight-charts/issues)
- **Commercial licensing, OEM, source access, SLAs** — amrit.shr@gmail.com

---

<div align="center">
<sub>© 2026 Amrit Shrestha · Not affiliated with TradingView, Inc.</sub>
</div>
