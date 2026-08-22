# Migrating from `lightweight-charts`

The API was shaped deliberately to make this a small diff. The main structural
difference: **there are no series objects.** One chart draws one series, so
`chart.addCandlestickSeries().setData(bars)` collapses to `chart.setData(bars)`.

> **Credit where it is due:** this package's API is inspired by
> [Lightweight Charts](https://github.com/tradingview/lightweight-charts), which
> is why the migration below is as small as it is. It is a very good library,
> and for plenty of projects it remains the right choice — the comparison in the
> next section says where, honestly.
>
> TradingView™ and Lightweight Charts™ are trade marks of TradingView, Inc. This
> project is not affiliated with or endorsed by TradingView, Inc. Every
> reference here is nominative and descriptive, to help you evaluate and
> migrate.

---

## Decide first

| | `lightweight-charts` | **knv2-lightweight-charts** |
|---|---|---|
| renderer | Canvas2D, JavaScript | WebGL2, C++ → WebAssembly |
| payload | ~45 KB gz | 100 KB gz |
| JS per frame | proportional to visible bars | none |
| 100k bars | struggles | designed for it |
| drawing tools | none — you build overlays | nine, hit-tested, undo/redo |
| indicators / extra series | yes | **no** |
| licence | Apache 2.0 | free with required attribution |
| source | open | not published |

**Do not migrate** if you need those 45 KB, an OSI-approved licence, the source,
or indicator series on the same chart. **Do migrate** if you want the drawing
tools, large-series performance, or a main thread that stays free.

There is no wrong answer here. Lightweight Charts is smaller, open, and
battle-tested across a very large number of sites; this package trades bytes for
a GPU renderer and a drawing layer. Pick on your requirement.

---

## Call by call

| `lightweight-charts` | **knv2-lightweight-charts** |
|---|---|
| `createChart(el, opts)` | `await createChart(el, opts)` — **async**, returns `null` on failure |
| `chart.addCandlestickSeries()` then `series.setData(bars)` | `chart.setData(bars)` |
| `series.update(bar)` | `chart.update(bar)` |
| `chart.applyOptions({…})` | `chart.applyOptions({…})` — different option names, see below |
| `chart.timeScale().fitContent()` | `chart.fitContent()` |
| `chart.timeScale().scrollToRealTime()` | `chart.scrollToEnd()` |
| `chart.timeScale().setVisibleLogicalRange({from,to})` | `chart.setVisibleRange(from, to)` |
| `chart.subscribeCrosshairMove(cb)` | `chart.subscribeCrosshairMove(cb)` — fires per **bar**, `null` on leave |
| `chart.resize(w, h)` | `chart.resize(w, h)` — only with `autoSize: false` |
| `chart.remove()` | `chart.remove()` |
| `series.setMarkers([...])` | no equivalent — use `chart.addDrawing({ tool: 'text', … })` |
| `chart.addLineSeries()` / indicators | **not available** |
| `priceScale().applyOptions({ scaleMargins })` | `applyOptions({ priceScale: { marginTop, marginBottom } })` |
| `LineStyle.Dashed` | the string `'dashed'` |
| `watermark` option | draw it yourself behind the canvas — the engine clears transparent, so it shows through |

## Data

Compatible in practice. `{ time, open, high, low, close }` is the same shape.

⚠ **`time` must be a number** — UNIX seconds or milliseconds. The
`{ year, month, day }` business-day objects `lightweight-charts` accepts are
**not** supported; convert first:

```js
const time = Date.UTC(b.year, b.month - 1, b.day) / 1000;
```

## Options

```js
// lightweight-charts
createChart(el, {
  layout: { background: { color: '#0b0f16' }, textColor: '#d1d5db' },
  grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
  crosshair: { mode: CrosshairMode.Magnet },
  rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
});

// knv2-lightweight-charts
await createChart(el, {
  theme: { background: '#0b0f16', text: '#d1d5db', grid: '#1f2937',
           axis: '#374151', up: '#26a69a', down: '#ef5350' },
  crosshair: { mode: 'magnet' },
  priceScale: { marginTop: 0.1, marginBottom: 0.1 },
});
```

| `lightweight-charts` | here |
|---|---|
| `layout.background.color` | `theme.background` |
| `layout.textColor` | `theme.text` |
| `grid.vertLines` / `horzLines` | `grid.vertical` / `grid.horizontal`, one `grid.color` |
| `crosshair.mode: CrosshairMode.Magnet` | `crosshair: { mode: 'magnet' }` |
| `rightPriceScale.scaleMargins` | `priceScale.marginTop` / `marginBottom` |
| `rightPriceScale.mode: PriceScaleMode.Logarithmic` | `priceScale.logarithmic: true` |
| `timeScale.rightOffset` | `timeScale.rightMarginBars` |
| `upColor` / `downColor` on the series | `theme.up` / `theme.down`, or `candles.upColor` / `downColor` |
| `wickUpColor` / `borderUpColor` | `candles.wickUpColor` / `candles.borderUpColor` |
| `autoSize` | `autoSize` — same meaning, on by default |

---

## A complete before / after

```js
// ─── before ────────────────────────────────────────────────────────────────
import { createChart } from 'lightweight-charts';

const chart = createChart(el, {
  layout: { background: { color: '#0b0f16' }, textColor: '#d1d5db' },
  autoSize: true,
});
const series = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350' });
series.setData(bars);
chart.timeScale().fitContent();

socket.onmessage = (e) => series.update(JSON.parse(e.data));
// teardown
chart.remove();
```

```js
// ─── after ─────────────────────────────────────────────────────────────────
import { createChart } from 'knv2-lightweight-charts';

const chart = await createChart(el, {
  type: 'candles',
  theme: { background: '#0b0f16', text: '#d1d5db', grid: '#1f2937',
           axis: '#374151', up: '#26a69a', down: '#ef5350' },
  autoSize: true,
});
if (!chart) { /* no WebGL2 — render a fallback */ }

chart.setData(bars);
chart.fitContent();

socket.onmessage = (e) => chart.update(JSON.parse(e.data));
// teardown
chart.remove();
```

---

## The four things that will surprise you

1. ⚠ **`createChart` is `async` and can resolve to `null`.** A top-level `await`
   or a `.then` — and a fallback for browsers without WebGL2.
2. ⚠ **You must serve `dist/`.** The engine is a real file fetched at runtime,
   not something your bundler inlines. See
   [getting-started.md](getting-started.md#2-serve-dist-as-static-files).
3. ⚠ **`setData` returns a number and `0` means refused.** Every chart in the tab
   shares one 64 MiB heap.
4. ⚠ **The attribution mark must stay visible.** It is the licence condition —
   see [attribution.md](attribution.md). You may move it to any corner.

## What you gain on the way over

- drawing tools you no longer have to build as DOM overlays
- 100k-bar series that pan at frame rate
- a main thread that stays free while the chart is being used
- pinch/pan/tap touch handling inside the engine

## What you give up

- roughly 100 KB against lightweight-charts’ ~45 KB
- indicator series and histograms on the same chart
- the Apache 2.0 licence and the source code

---

**Next:** [Getting started](getting-started.md) · [API reference](api.md) · [Licence](../LICENSE.md)
