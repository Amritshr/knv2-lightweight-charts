# Troubleshooting

Ordered by how often each one actually happens.

---

## Nothing renders — the container is empty

**The container has no height.** The chart fills its container; a container that
fills nothing shows nothing, and neither the engine nor the browser reports
anything.

```html
<div id="chart" style="height:420px"></div>   <!-- not just width -->
```

If the container starts collapsed — a hidden tab, a closed accordion — the chart
refits when it first gets a real size, but it must eventually get one.

## `createChart` resolved to `null`

The browser has no WebGL2, or the context was refused. Check
`chart === null` and render a fallback:

```js
if (!chart) el.textContent = 'This browser does not support WebGL2.';
```

WebGL2 needs Chrome/Edge 56+, Firefox 51+, **Safari 15+ / iOS 15+**. Also
possible: too many live contexts on the page — see "a *different* chart went
blank" below.

## The engine refuses to load

### `IntegrityError: ... does not match the digest`

Almost always **mixed versions** — an SDK bundle from one release beside an
engine from another. Copy the whole `dist/` from a single release.

If they *are* from the same release, the file was modified or corrupted in
transit. Re-download and check it:

```bash
shasum -a 256 -c checksums.sha256
```

### `IntegrityError: could not fetch ... / returned HTTP 404`

`dist/` is not being served where the SDK is looking. It looks *beside itself* by
default. If your bundler moved the SDK bundle, say where the engine lives:

```js
createChart(el, { enginePath: '/knv2/' });    // trailing slash
```

### `Incorrect response MIME type. Expected 'application/wasm'`

Your server is sending the `.wasm` as `text/plain` or `application/octet-stream`.

```nginx
types { application/wasm wasm; }
```

### `CompileError: WebAssembly.instantiate(): Refused to compile`

Your Content-Security-Policy is missing **`'wasm-unsafe-eval'`** in
`script-src`. See [integrity.md](integrity.md#content-security-policy).

### `createKNv2LW is not a function`

`knv2lw.js` was replaced with a non-ESM build, or a server rewrote it. It must
be served verbatim with `Content-Type: application/javascript`.

---

## The chart is blurry

⚠ **Something set `canvas.width` or `canvas.height`.** The engine owns the
backing store; writing those attributes resizes the drawing buffer behind its
back. The result measures correctly in every way and is simply soft.

Do not set them — not from your code, not from a CSS-in-JS library, not from a
"responsive canvas" helper. The engine already handles device-pixel ratio.

If it is blurry on a high-DPI screen only, check you have not lowered
`maxDevicePixelRatio` (default `2`).

---

## A *different* chart went blank, with no error

⚠ **A leaked WebGL2 context.** Every chart holds one, and browsers evict the
oldest past roughly sixteen. The chart that goes blank is not the one that
leaked.

```js
chart.remove();     // always, on unmount
```

In React, the usual cause is Strict Mode's double mount racing an async
`createChart`. Use the [supplied component](frameworks.md#react), or copy its
`cancelled` flag:

```js
let cancelled = false, live = null;
createChart(el, opts).then((c) => { if (cancelled) { c?.remove(); return; } live = c; });
return () => { cancelled = true; live?.remove(); };
```

Eight simultaneous charts is comfortable. Past that, mount and unmount as they
scroll into view.

---

## `setData` returned 0

The shared heap refused the reservation. One WASM module holds **every chart in
the tab**, its 64 MiB cannot grow, and that is roughly 1.2 million bars in
total across the page.

- reduce the series, or
- reduce the number of live charts, or
- aggregate to a coarser timeframe before charting.

The chart stays alive and simply draws nothing, so check the return value:

```js
if (chart.setData(bars) === 0 && bars.length) { /* too large */ }
```

---

## The chart is wrong by decades / bars are stacked

⚠ **Seconds and milliseconds mixed in one array.** The package converts per
value by magnitude (below `1e11` is seconds). Normalise at your adapter
boundary — see [data-sources.md](data-sources.md#the-contract).

`setData` rejects a series that is not ascending after conversion, so a mixed
array that *stays* ascending is the dangerous one: it renders, and it is wrong.

---

## Live updates are slow or the tab burns CPU

- **Do not call `setData` on a tick.** Use `update()`.
- **Throttle a fast feed to one call per animation frame** — a 1000 msg/s stream
  does not need 1000 updates per second. See
  [data-sources.md](data-sources.md#live-data--the-tick-loop).
- ⚠ **Heikin-Ashi has no fast tick path.** `update()` on a `'heikin'` chart
  forces a rebuild, because the candle is a chain. That is correct, not a bug —
  batch instead of ticking if it matters.

---

## Drawings land near, but not on, the cursor

The projection was re-derived in JavaScript somewhere. Use the engine's:

```js
chart.engine().MapXToIndex(px);
chart.engine().MapYToValue(py);
```

## Drawings ended up in the wrong place after a symbol or timeframe change

Anchors are **bar indices**. Bar 1,200 is a different bar on a different series.
Key your saved drawings by `(symbol, timeframe)`, or store times alongside the
indices and re-map — see [drawings.md](drawings.md#persistence).

## A text object shows a placeholder

You did not prompt on `created`. The engine cannot open UI; the host must call
`setDrawingText(id, text)` — or `removeDrawing(id)` if the user cancels. See
[drawings.md](drawings.md#-text-objects-need-your-help).

---

## The page scrolls instead of the chart panning (mobile)

That is the intended behaviour of the canvas — it sets `touch-action: none`, so
a swipe that starts on the chart pans the chart.

⚠ **A mobile layout therefore needs somewhere else to grab for page scrolling.**
Leave margin around the chart, or make it less than full-height.

If panning does *not* work at all on a phone, something in your app is calling
`preventDefault` on touch events before they reach the canvas.

---

## The chart turned into an "attribution removed" notice

The attribution mark has been hidden for long enough to count as deliberate. The
console names the exact cause. This is almost always a CSS conflict rather than
intent — see **[attribution.md](attribution.md#if-it-trips-by-accident)**, which
lists the five usual causes and their fixes. Fixing it restores the licence
automatically.

---

## Still stuck

[Open an issue](https://github.com/Amritshr/knv2-lightweight-charts/issues) with:

- the console output, in full
- your browser and OS
- how you serve `dist/` (framework, path, any CDN)
- a minimal reproduction if you can manage one

`chart.metrics()` is useful to include:

```js
console.log(chart.metrics());
// { fps, frameMs, retainedBuilds, barCount, visibleBars }
```
