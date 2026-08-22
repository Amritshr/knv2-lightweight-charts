# Getting started

From nothing to a working chart. Five minutes, no build step.

---

## 1. Get the files

```bash
# Download the latest release and copy dist/ into your project:
#   https://github.com/Amritshr/knv2-lightweight-charts/releases
#
# Or clone it:
git clone https://github.com/Amritshr/knv2-lightweight-charts.git
```

Either way you need one directory — `dist/` — containing three files:

```
dist/
├── knv2-lightweight-charts.js       the SDK you import
├── knv2lw.js                          the engine loader
└── knv2lw.wasm                        the engine itself
```

(`dist/` also holds `.d.ts` type definitions and a `.react.js` bundle. Copy the
whole folder; the extra files cost nothing and are never fetched unless used.)

## 2. Serve `dist/` as static files

Copy `dist/` anywhere your web server exposes. There is nothing to configure:

| your framework | put it here | it is served at |
|---|---|---|
| plain HTML / nginx / Apache | next to your `index.html` | `/dist/…` |
| Next.js | `public/knv2/` | `/knv2/…` |
| Vite | `public/knv2/` | `/knv2/…` |
| Create React App | `public/knv2/` | `/knv2/…` |
| Django / Rails / Laravel | your static assets directory | `/static/knv2/…` |

⚠ **The `.wasm` file must be served as `application/wasm`, and the `.js` files
as `application/javascript`.** Every mainstream server does this already. If
yours does not, the symptom is an "incorrect response MIME type" error in the
console — see [troubleshooting](troubleshooting.md#the-engine-refuses-to-load).

⚠ **Do not rename the files or split them up.** The SDK finds `knv2lw.wasm`
beside itself, and verifies both against published digests before running them.
If you genuinely need them elsewhere, use the `enginePath` option — see §6.

## 3. Your first chart

```html
<!doctype html>
<html>
  <body style="margin:0;background:#0b0f16">
    <!-- ⚠ THE CONTAINER NEEDS A REAL HEIGHT. A chart in a zero-height box
         mounts, renders nothing, and reports no error. -->
    <div id="chart" style="width:100%;height:420px"></div>

    <script type="module">
      import { createChart } from '/dist/knv2-lightweight-charts.js';

      const chart = await createChart(document.getElementById('chart'), {
        type: 'candles',
        theme: 'dark',
      });

      if (!chart) {
        document.getElementById('chart').textContent =
          'This browser does not support WebGL2.';
      } else {
        chart.setData(bars);   // see §4
      }
    </script>
  </body>
</html>
```

Three things about that snippet are load-bearing:

1. **`type="module"`** — the package is ESM. A plain `<script>` will not work.
2. **`await`** — `createChart` is async, because loading and verifying the
   engine is. Top-level `await` works inside a module.
3. **The `null` check** — `createChart` resolves to `null` when the browser has
   no WebGL2, rather than throwing, so you can render a message instead of
   catching in an error boundary. It *does* throw an `IntegrityError` if `dist/`
   is missing or corrupt, because that is your bug and you need to see it.

## 4. Give it data

The package takes a plain array. It fetches nothing.

```js
const bars = [
  { time: 1710000000, open: 100.0, high: 101.2, low: 99.4, close: 100.8 },
  { time: 1710086400, open: 100.8, high: 102.5, low: 100.5, close: 102.1 },
  // …
];

chart.setData(bars);
```

| field | |
|---|---|
| `time` | UNIX **seconds or milliseconds** — the package decides by magnitude. Must be ascending. |
| `open` `high` `low` `close` | numbers |
| `volume` | optional; not drawn, but appears in the crosshair readout |

⚠ **`setData` returns the number of bars committed, and `0` means the upload was
refused.** Every chart on the page shares one 64 MiB heap, which holds roughly
1.2 million bars in total. Check the return value if your series can be long.

Loading from your own API:

```js
const bars = await fetch('/api/bars?symbol=AAPL&tf=1D').then((r) => r.json());
chart.setData(bars);
```

Real feeds — REST, WebSocket, CSV, vendor formats — are in
**[data-sources.md](data-sources.md)**.

## 5. Live updates

```js
// Rewrites the FORMING bar in place: one instance, no re-upload.
chart.update({ time: 1710172800, open: 102.1, high: 102.9, low: 101.8, close: 102.6 });
```

Call `update` with the same `time` repeatedly as the price moves; call it with
the next `time` to start a new bar. Do not call `setData` on every tick — it
re-uploads the whole series.

## 6. Configuration you might need

```js
const chart = await createChart(el, {
  type: 'candles',                    // 'candles' | 'bars' | 'line' | 'area' | 'heikin'
  theme: 'dark',                      // 'dark' | 'light' | { …palette }
  priceScale: { logarithmic: true, marginTop: 0.1, marginBottom: 0.1 },
  crosshair: { mode: 'magnet' },
  grid: { vertical: true, horizontal: true },

  // Only if you split dist/ up — otherwise leave it alone.
  enginePath: '/cdn/knv2/',

  // Which corner the attribution mark sits in. It can be moved, not hidden.
  attributionPosition: 'bottom-left',
});
```

Every option: **[api.md](api.md)**. Colours: **[theming.md](theming.md)**.

## 7. ⚠ Clean up

```js
chart.remove();
```

**This is not optional.** Every chart holds its own WebGL2 context, and browsers
evict the oldest once a page has roughly sixteen. A leaked chart makes a
*different* chart go blank later, with no error anywhere — it is one of the
hardest bugs to diagnose from the symptom.

React users: use the [supplied component](frameworks.md#react), which handles
this and the Strict Mode double-mount for you.

## The five mistakes everyone makes once

1. **A container with no height.** The chart fills its container; a container
   that fills nothing shows nothing. Give it a real `height`.
2. **Forgetting `remove()`.** See §7.
3. **Setting `canvas.width` / `canvas.height`.** The engine owns the backing
   store. Writing those attributes gives you a chart that measures correctly and
   is simply blurry. Never touch them.
4. **Mixing seconds and milliseconds in one array.** The package converts per
   value by magnitude; a mixed array produces a chart that is silently wrong.
   Normalise before you call.
5. **Calling `setData` on every tick.** Use `update`.

## Next

- **[API reference](api.md)** — everything the chart can do
- **[Data sources](data-sources.md)** — wiring a real market feed
- **[Frameworks](frameworks.md)** — React, Next.js, Vue, Svelte
- **[Attribution](attribution.md)** — the one licence condition, and how to work with it
