# API reference

Everything the package exports. Full TypeScript definitions ship in
`dist/knv2-lightweight-charts.d.ts`.

---

## `createChart(container, options?) → Promise<ChartApi | null>`

Mounts a chart into `container` and resolves once the engine is running.

```js
import { createChart } from 'knv2-lightweight-charts';

const chart = await createChart(el, { type: 'candles', theme: 'dark' });
```

**Resolves to `null`** when the browser has no WebGL2 or the context was
refused. Render your own fallback.

**Throws `IntegrityError`** when `knv2lw.js` / `knv2lw.wasm` cannot be fetched,
or do not match the digests this build was published with. That is a deployment
fault — see [integrity.md](integrity.md).

The container must have a real height, and gets `position: relative` if it is
`static`. The engine creates its own `<canvas>` inside it.

---

## Options

Every option is optional. Pass a partial object; unnamed keys keep their
defaults, and nested objects merge key by key.

### Top level

| option | type | default | |
|---|---|---|---|
| `type` | `'candles' \| 'bars' \| 'line' \| 'area' \| 'heikin'` | `'candles'` | the series style |
| `lineColor` | CSS colour | `theme.up` | line and area colour only |
| `theme` | `'dark' \| 'light' \| Partial<LWTheme>` | `'dark'` | see [theming.md](theming.md) |
| `autoSize` | boolean | `true` | follow the container with a `ResizeObserver` |
| `maxDevicePixelRatio` | number | `2` | cap DPR; halving it quarters fill cost |
| `enginePath` | string | beside the SDK bundle | where `dist/` is served from, trailing slash |
| `attributionPosition` | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-left'` | see [attribution.md](attribution.md) |

⚠ With `autoSize: false` you must call `resize()` yourself. A chart never told
its size draws into a 0×0 buffer and reads as a dead canvas.

### `grid`

| | type | |
|---|---|---|
| `vertical` | boolean | time gridlines |
| `horizontal` | boolean | price gridlines |
| `color` | CSS colour | defaults to `theme.grid` |
| `style` | `'solid' \| 'dashed' \| 'dotted'` | |
| `opacity` | 0–1 | composited over the background |

### `crosshair`

| | type | |
|---|---|---|
| `mode` | `'normal' \| 'magnet' \| 'hidden'` | `magnet` snaps the readout to the hovered candle's O/H/L/C |
| `style` | line style | |
| `color` | CSS colour | defaults to `theme.text` |
| `opacity` | 0–1 | scales whichever colour wins — "the theme's colour, fainter" |
| `widthPx` | number | |

### `priceScale`

| | type | |
|---|---|---|
| `marginTop` / `marginBottom` | 0–0.45 | fraction of the plot left empty |
| `decimals` | number | digits after the point; omit or pass `< 0` to derive from the visible span |
| `logarithmic` | boolean | |
| `percent` | boolean | percent change from the left edge |
| `inverted` | boolean | |
| `autoFit` | boolean | off freezes the range, so scrolling sideways stops rescaling |
| `lastPriceLabel` | boolean | the last-price tag on the gutter |
| `highLowLabels` | boolean | visible high and low tags |

### `timeScale`

| | type | |
|---|---|---|
| `rightMarginBars` | number | empty bars held at the right edge; `< 0` restores the default (8% of the view) |

### `candles`

Overrides `theme.up` / `theme.down` **for the candles only** — use the theme for
a theme and these for a style.

| | type | |
|---|---|---|
| `upColor` / `downColor` | CSS colour | body colour |
| `bodyVisible` | boolean | |
| `bodyOpacity` | 0–1 | on the fill only, so an outline stays readable |
| `borderVisible` | boolean | |
| `borderUpColor` / `borderDownColor` | CSS colour | omit to follow the body |
| `wickVisible` | boolean | |
| `wickUpColor` / `wickDownColor` | CSS colour | |

---

## `ChartApi`

### Data

#### `setData(bars) → number`

Replace the series. Returns the number of bars committed.

⚠ **`0` means the upload was refused.** One WASM module holds every chart in the
tab and its 64 MiB heap cannot grow — roughly 1.2 million bars across the whole
page. Check the return value on long series; the chart stays alive and simply
draws nothing.

```js
if (chart.setData(bars) === 0 && bars.length) {
  console.warn('series too large for the shared heap');
}
```

#### `update(bar) → void`

A live tick on the **forming** bar. Partial: rewrites one instance, uploads
nothing, allocates nothing. Same `time` as the last bar updates it; a new `time`
appends.

⚠ **Heikin-Ashi has no fast tick path** — `update` on a `'heikin'` chart forces
a full rebuild, because a Heikin-Ashi candle is a chain and cannot be recomputed
from one raw bar. It is correct, just not free. Prefer `setData` batching if you
tick a Heikin-Ashi chart very fast.

### View

| | |
|---|---|
| `applyOptions(patch)` | re-applies the whole resolved option set; cheap, safe from a React effect |
| `setChartType(type)` / `chartType()` | |
| `fitContent()` | fit the loaded range |
| `scrollToEnd()` | scroll to the most recent bar |
| `setVisibleRange(from, to)` | ⚠ **fractional bar indices, not times** |
| `resize(cssW?, cssH?)` | only needed with `autoSize: false` |

### Drawing tools

```js
chart.setTool('trendline');   // arm — the next click places an anchor
chart.setTool('none');        // disarm
chart.setMagnet(true);        // snap new anchors to the hovered O/H/L/C
```

| | |
|---|---|
| `setTool(tool)` / `activeTool()` | `'none' \| 'trendline' \| 'ray' \| 'hline' \| 'vline' \| 'extended' \| 'hray' \| 'arrow' \| 'text' \| 'callout'` |
| `setMagnet(on)` | |
| `addDrawing(spec) → id` | place one from code |
| `addDrawings(specs) → id[]` | ⚠ **use this to restore many**, not `addDrawing` in a loop |
| `drawings()` / `drawing(id)` | read back, for persistence |
| `updateDrawing(id, patch)` | colour, width, style, text |
| `setDrawingText(id, text)` | |
| `removeDrawing(id)` / `clearDrawings()` / `deleteSelected()` | |
| `selectedDrawing() → id` | `-1` when nothing is selected |
| `undo()` / `redo()` / `canUndo()` / `canRedo()` | |

⚠ **Coordinates are fractional bar index (`x`) and price (`y`)**, not pixels.
That is what makes a drawing ride the camera instead of sliding off the data on
the first pan.

Full guide: **[drawings.md](drawings.md)**.

### Events

```js
const off = chart.subscribeCrosshairMove((hover) => {
  if (!hover) return legend.clear();          // pointer left the plot
  legend.show(hover.open, hover.high, hover.low, hover.close);
});
off();                                         // unsubscribe
```

⚠ **`subscribeCrosshairMove` fires on a change of hovered *bar*, not per mouse
move.** Moving the pointer three pixels inside one candle fires nothing. That is
deliberate — it is what makes a legend cheap.

```js
chart.subscribeDrawingChange((id, event) => {
  // 'created' | 'moved' | 'selected' | 'deleted' | 'finished' | 'properties'
});
```

### Lifecycle and escape hatches

| | |
|---|---|
| `remove()` | ⚠ **always call it.** Stops the loop, releases the WebGL2 context, removes the canvas, every listener and the attribution guard |
| `metrics()` | `{ fps, frameMs, retainedBuilds, barCount, visibleBars }` |
| `engine()` | the raw engine handle — everything not wrapped above. **Not covered by semver** |

`engine()` is where the projection lives, if you need to convert pixels:

```js
const idx   = chart.engine().MapXToIndex(px);
const price = chart.engine().MapYToValue(py);
```

⚠ **Never re-derive the projection in JavaScript.** It depends on camera state
the engine owns and changes every frame; a transcribed copy drifts and the
symptom is drawings that land near, but not on, the cursor.

---

## Module exports

| | |
|---|---|
| `createChart` | the only way to construct a chart |
| `IntegrityError` | thrown when the engine artifacts fail verification |
| `version` · `ENGINE_VERSION` | the release version string |
| `ENGINE_WASM_SHA256` · `ENGINE_GLUE_SHA256` | the digests this build expects |
| *types* | `ChartApi`, `ChartOptions`, `LWBar`, `LWTheme`, `LWTool`, `LWHover`, `LWDrawing`, `LWDrawingSpec`, … |

`knv2-lightweight-charts/react` additionally default-exports the React component — see
**[frameworks.md](frameworks.md)**.
