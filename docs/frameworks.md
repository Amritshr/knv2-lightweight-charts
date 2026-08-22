# Frameworks

The package is framework-agnostic — `createChart` takes a DOM element. This page
is the wiring for the common ones, plus the one hazard each of them has.

---

## Plain HTML

No build step, no bundler, no npm.

```html
<div id="chart" style="width:100%;height:420px"></div>

<script type="module">
  import { createChart } from '/dist/knv2-lightweight-charts.js';

  const chart = await createChart(document.getElementById('chart'), {
    type: 'candles',
    theme: 'dark',
  });
  chart?.setData(await fetch('/api/bars').then((r) => r.json()));
</script>
```

⚠ `type="module"` is required — the package is ESM only.

---

## React

```bash
npm install knv2-lightweight-charts
```

```jsx
import KNv2Chart from 'knv2-lightweight-charts/react';

export function Chart({ bars }) {
  return (
    <KNv2Chart
      bars={bars}
      type="candles"
      theme="dark"
      style={{ height: 420 }}
    />
  );
}
```

The component handles the async mount, the `ResizeObserver`, teardown, and the
Strict Mode double-mount.

### Props

| | |
|---|---|
| `bars` | the series; re-uploaded when the reference changes |
| `tool` | armed drawing tool |
| `onCrosshairMove(hover)` | fires on a change of hovered **bar**; `null` on leave |
| `onDrawingChange(id, event, api)` | |
| `onReady(api)` | called once; `null` if WebGL2 is missing |
| `ref` | receives the `ChartApi` |
| `className` · `style` | on the container |
| *…plus every `ChartOptions` key* | `theme`, `grid`, `crosshair`, `priceScale`, … |

### With a legend and a tool dock

```jsx
import { useRef, useState } from 'react';
import KNv2Chart from 'knv2-lightweight-charts/react';

export function Workspace({ bars }) {
  const chart = useRef(null);
  const [legend, setLegend] = useState(null);
  const [tool, setTool] = useState('none');

  return (
    <div>
      <div className="toolbar">
        {['none', 'trendline', 'hline', 'text'].map((t) => (
          <button key={t} onClick={() => setTool(t)} aria-pressed={tool === t}>{t}</button>
        ))}
        <button onClick={() => chart.current?.undo()}>Undo</button>
        <button onClick={() => chart.current?.fitContent()}>Fit</button>
      </div>

      {legend && <div className="legend">O {legend.open} H {legend.high} L {legend.low} C {legend.close}</div>}

      <KNv2Chart
        ref={chart}
        bars={bars}
        tool={tool}
        theme="dark"
        onCrosshairMove={setLegend}
        onDrawingChange={(id, ev, api) => {
          // ⚠ A text object is created with a placeholder — the engine cannot
          //   open UI. Prompt and fill it in, or remove it if cancelled.
          if (ev === 'created' && api.drawing(id)?.tool === 'text') {
            const text = window.prompt('Label');
            if (text) api.setDrawingText(id, text);
            else api.removeDrawing(id);
          }
        }}
        style={{ height: 480 }}
      />
    </div>
  );
}
```

### ⚠ The React hazards

1. **Do not build `bars` inline.** `bars={raw.map(toBar)}` is a new array on
   every render, which re-uploads the series every render. `useMemo` it.
2. **Strict Mode mounts twice in development.** The supplied component handles
   it; a hand-rolled `useEffect` that ignores the async race leaks one WebGL2
   context per mount, and the symptom is an unrelated chart going blank.
3. **Give the container a height.** The component defaults to 400px; if you
   override `style`, keep a height in it.

### Rolling your own

If you need something the component does not do, copy this shape — the
`cancelled` flag is the part that matters:

```jsx
useEffect(() => {
  let cancelled = false;
  let live = null;

  createChart(ref.current, options).then((chart) => {
    if (cancelled) { chart?.remove(); return; }   // ⚠ Strict Mode lands here
    live = chart;
    setApi(chart);
  });

  return () => { cancelled = true; live?.remove(); };
}, []);
```

---

## Next.js

The chart is browser-only — it needs `document` and a WebGL2 context — so it
must not run during server rendering.

**App Router:**

```tsx
'use client';

import dynamic from 'next/dynamic';

const KNv2Chart = dynamic(() => import('knv2-lightweight-charts/react'), { ssr: false });

export default function Page({ bars }) {
  return <KNv2Chart bars={bars} theme="dark" style={{ height: 480 }} />;
}
```

**Serving the engine:** put `dist/` in `public/knv2/`. It is then served at
`/knv2/…` and the SDK finds `knv2lw.wasm` beside itself with no configuration.

⚠ **If you import the SDK from `node_modules` rather than from `public/`,** the
bundler rewrites the module URL and `import.meta.url` no longer points at the
engine files. Set the path explicitly:

```jsx
<KNv2Chart enginePath="/knv2/" … />
```

⚠ **Do not put the engine behind `next/image` or an API route.** It is a static
asset; `public/` is correct and is cached properly.

---

## Vue 3

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { createChart } from 'knv2-lightweight-charts';

const host = ref(null);
const props = defineProps({ bars: Array });
let chart = null;

onMounted(async () => {
  chart = await createChart(host.value, { type: 'candles', theme: 'dark' });
  if (chart && props.bars) chart.setData(props.bars);
});

watch(() => props.bars, (b) => { if (chart && b) chart.setData(b); });

onBeforeUnmount(() => { chart?.remove(); chart = null; });
</script>

<template>
  <div ref="host" style="width:100%;height:420px" />
</template>
```

---

## Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { createChart } from 'knv2-lightweight-charts';

  export let bars = [];
  let host, chart;

  onMount(() => {
    let live;
    createChart(host, { type: 'candles', theme: 'dark' }).then((c) => {
      live = chart = c;
      if (c && bars.length) c.setData(bars);
    });
    return () => live?.remove();
  });

  $: chart && bars.length && chart.setData(bars);
</script>

<div bind:this={host} style="width:100%;height:420px"></div>
```

---

## Angular

```ts
@Component({ template: '<div #host style="width:100%;height:420px"></div>' })
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host') host!: ElementRef<HTMLElement>;
  private chart: ChartApi | null = null;
  private dead = false;

  async ngAfterViewInit() {
    const c = await createChart(this.host.nativeElement, { theme: 'dark' });
    if (this.dead) { c?.remove(); return; }
    this.chart = c;
  }

  ngOnDestroy() { this.dead = true; this.chart?.remove(); }
}
```

⚠ Run it outside Angular's zone if you subscribe to the crosshair — the callback
fires per hovered bar and would otherwise trigger change detection on each one:

```ts
this.zone.runOutsideAngular(() => chart.subscribeCrosshairMove(handler));
```

---

## Bundlers

The package is a plain ESM module with no dependencies, so Vite, webpack, Rollup,
esbuild and Parcel all handle it without configuration.

The one thing to know: **the engine artifacts are fetched at runtime by URL, not
imported.** Your bundler will not see them, will not copy them, and will not
fingerprint them. Copy `dist/` into your static output yourself, and — if your
bundler moves the SDK bundle somewhere the engine files are not — pass
`enginePath`.

---

**Next:** [Data sources](data-sources.md) · [Theming](theming.md) · [Troubleshooting](troubleshooting.md)
