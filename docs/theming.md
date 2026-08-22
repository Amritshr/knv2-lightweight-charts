# Theming

Two built-in palettes, and six values if you want your own.

---

## The built-ins

```js
await createChart(el, { theme: 'dark' });    // default
await createChart(el, { theme: 'light' });
```

## Your own palette

The whole theme is six colours: two direction colours and four neutrals.

```js
await createChart(el, {
  theme: {
    background: '#0b0f16',
    grid:       'rgba(255,255,255,0.06)',
    axis:       'rgba(255,255,255,0.28)',
    text:       'rgba(255,255,255,0.68)',
    up:         '#22c55e',
    down:       '#ef4444',
  },
});
```

A **partial** object overrides only the keys it names, on top of the dark
palette:

```js
{ theme: { up: '#00b8d4', down: '#ff5252' } }   // dark, with your two colours
```

| key | |
|---|---|
| `background` | ⚠ a CSS `background` value, not only a colour — see below |
| `backgroundBase` | the solid colour translucent chrome composites against |
| `grid` | gridlines |
| `axis` | axis lines and tick marks |
| `text` | axis labels, the crosshair, the readout |
| `up` | ⚠ **the up candle *and* the line/area colour** |
| `down` | the down candle |

### ⚠ `up` and `down` are the chart's direction colours, not just candle colours

They colour the candles, and they are also what a `line` or `area` chart
follows. Override `lineColor` to break that link:

```js
{ theme: { up: '#22c55e', down: '#ef4444' }, type: 'area', lineColor: '#60a5fa' }
```

And override `candles.upColor` / `downColor` to restyle the candles *only* —
"use the theme for a theme, `candles` for a style":

```js
{
  theme: { up: '#22c55e', down: '#ef4444' },   // the line chart stays green/red
  candles: { upColor: '#ffffff', downColor: '#111111', bodyOpacity: 0 },
}
```

---

## Gradients and images

⚠ **`theme.background` is painted by the DOM, not the engine.** The engine
clears its buffer transparent and composites over whatever is behind the canvas,
so anything CSS accepts works:

```js
{ theme: { background: 'linear-gradient(180deg, #10151d 0%, #070a0e 100%)',
           backgroundBase: '#0b1017' } }
```

⚠ **When `background` is not a plain colour, set `backgroundBase` too.** The
engine needs *one* solid colour to composite the grid's and crosshair's alpha
against, and it cannot parse a gradient into one. Without it the grid comes out
a plausible but wrong shade.

The same property is what lets a watermark sit **under** the candles:

```html
<div id="chart" style="position:relative;height:420px">
  <img src="/logo.svg" style="position:absolute;inset:0;margin:auto;opacity:.06;width:40%">
</div>
```

---

## Alpha

Colours may carry alpha — `#rrggbbaa`, `rgba()` — and it is **flattened against
the background** before it reaches the engine, which carries no alpha on the
theme.

That flattening is why `grid: 'rgba(255,255,255,0.05)'` works and produces a
faint grey, rather than the pure white you would get if the alpha were dropped.

`grid.opacity` and `crosshair.opacity` scale whichever colour wins, so "the
theme's colour, only fainter" is expressible without restating the colour:

```js
{ grid: { opacity: 0.4 }, crosshair: { opacity: 0.7 } }
```

---

## Candle styling

```js
{
  candles: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    bodyVisible: true,
    bodyOpacity: 1,         // 0 gives hollow candles with a solid outline
    borderVisible: true,
    borderUpColor: undefined,   // omit to follow the body colour
    borderDownColor: undefined,
    wickVisible: true,
    wickUpColor: undefined,
    wickDownColor: undefined,
  },
}
```

**Hollow candles:**

```js
{ candles: { bodyOpacity: 0, borderVisible: true } }
```

**Bars-only look (no bodies):** use `type: 'bars'`.

---

## Grid, crosshair, axes

```js
{
  grid: { vertical: true, horizontal: true, style: 'dotted', opacity: 0.5 },
  crosshair: { mode: 'magnet', style: 'dashed', widthPx: 1, opacity: 0.8 },
  priceScale: { lastPriceLabel: true, highLowLabels: true, marginTop: 0.08 },
}
```

`crosshair.mode`:

| | |
|---|---|
| `'normal'` | follows the pointer |
| `'magnet'` | snaps the readout to the hovered candle's O/H/L/C |
| `'hidden'` | no crosshair; `subscribeCrosshairMove` still fires |

---

## Switching theme at runtime

`applyOptions` re-applies the whole resolved set. It is a human-action call — a
handful of engine calls, never per frame — so it is safe from a React effect or
a media-query listener.

```js
const dark = window.matchMedia('(prefers-color-scheme: dark)');
dark.addEventListener('change', (e) => {
  chart.applyOptions({ theme: e.matches ? 'dark' : 'light' });
});
```

⚠ **The attribution mark picks its colours from the container's background when
the chart is created**, so after a theme flip it keeps the contrast it started
with. If you support runtime theme switching and want it to follow, recreate the
chart on the flip rather than calling `applyOptions` — or simply leave it; it
stays legible either way because it carries its own translucent backplate.

---

## A worked brand palette

```js
const BRAND = {
  background: '#0a0e14',
  backgroundBase: '#0a0e14',
  grid: 'rgba(148,163,184,0.08)',
  axis: 'rgba(148,163,184,0.25)',
  text: 'rgba(226,232,240,0.72)',
  up: '#00c9a7',
  down: '#ff5c8a',
};

await createChart(el, {
  theme: BRAND,
  grid: { style: 'dotted' },
  crosshair: { mode: 'magnet', opacity: 0.75 },
  priceScale: { marginTop: 0.1, marginBottom: 0.1, lastPriceLabel: true },
  candles: { borderVisible: false, wickUpColor: '#00c9a7', wickDownColor: '#ff5c8a' },
});
```

---

**Next:** [Drawing tools](drawings.md) · [API reference](api.md)
