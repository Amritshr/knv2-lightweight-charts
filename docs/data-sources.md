# Data sources — wiring any market

The package takes an **array**. It fetches nothing, knows no symbols, has no
timeframe concept, and holds no opinion about your exchange or vendor. That is
deliberate: your data layer is yours, and a chart that tried to own it would be
wrong for most people.

This page is the bridge — from whatever your feed hands you, to
`{ time, open, high, low, close }`.

---

## The contract

```ts
interface Bar {
  time: number;    // UNIX seconds OR milliseconds, ascending
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number; // not drawn; shown in the crosshair readout
}
```

Three rules, and all three are the kind of thing that produces a chart that
looks plausible and is wrong:

1. ⚠ **Do not mix seconds and milliseconds in one array.** The package decides
   per value by magnitude (below `1e11` is seconds). A mixed array is silently
   wrong. Normalise once, at your adapter boundary.
2. ⚠ **Sort ascending.** `setData` rejects a non-monotonic series.
3. ⚠ **No gaps for missing sessions.** The time axis is index-based: bar *n+1*
   sits one slot right of bar *n* whatever their timestamps say. Do not pad
   weekends or holidays with null bars — just omit them, which is what every
   exchange feed does anyway.

## A normaliser worth copying

Every adapter below is a variation on this:

```js
/** Anything → the chart's bar shape. Returns a new, sorted array. */
function toBars(rows, map) {
  return rows
    .map(map)
    .filter((b) => Number.isFinite(b.open) && Number.isFinite(b.close))
    .sort((a, b) => a.time - b.time);
}
```

---

## REST — your own backend

The common case. Your server already has the data.

```js
async function load(symbol, timeframe) {
  const res = await fetch(`/api/bars?symbol=${symbol}&tf=${timeframe}`);
  if (!res.ok) throw new Error(`bars: HTTP ${res.status}`);
  return res.json();               // already [{time, open, high, low, close}]
}

const chart = await createChart(el, { type: 'candles', theme: 'dark' });
const n = chart.setData(await load('AAPL', '1D'));
if (n === 0) console.warn('series refused — too large for the shared heap');
```

### Column-oriented responses

Many backends return parallel arrays. Zip them at the boundary:

```js
// { t: [...], o: [...], h: [...], l: [...], c: [...], v: [...] }
function fromColumns(d) {
  return d.t.map((t, i) => ({
    time: t, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v?.[i],
  }));
}
```

### CSV

```js
function fromCsv(text) {
  const [head, ...rows] = text.trim().split('\n');
  const col = head.split(',').map((s) => s.trim().toLowerCase());
  const at = (r, name) => r[col.indexOf(name)];
  return rows.map((line) => {
    const r = line.split(',');
    return {
      time: Date.parse(at(r, 'date') || at(r, 'time')) / 1000,
      open: +at(r, 'open'),
      high: +at(r, 'high'),
      low: +at(r, 'low'),
      close: +at(r, 'close'),
      volume: +at(r, 'volume') || undefined,
    };
  }).sort((a, b) => a.time - b.time);
}
```

---

## Live data — the tick loop

⚠ **Use `update()`, never `setData()`, on a tick.** `setData` re-uploads the
whole series; `update` rewrites one instance in place and allocates nothing.
This is the difference between a chart that idles at 0% CPU and one that does
not.

```js
const socket = new WebSocket('wss://your-feed.example/stream?symbol=AAPL');

socket.onmessage = (ev) => {
  const t = JSON.parse(ev.data);
  chart.update({
    time: t.timestamp,
    open: t.open, high: t.high, low: t.low, close: t.close,
    volume: t.volume,
  });
};
```

Same `time` as the current last bar → it updates in place. A newer `time` → a
new bar is appended.

### Building bars from a trade stream

If your feed sends trades rather than bars, aggregate before you call:

```js
const TF_MS = 60_000;                       // 1-minute bars
let forming = null;

function onTrade(price, size, tsMs) {
  const slot = Math.floor(tsMs / TF_MS) * TF_MS;
  if (!forming || forming.time !== slot) {
    forming = { time: slot, open: price, high: price, low: price, close: price, volume: 0 };
  } else {
    forming.high = Math.max(forming.high, price);
    forming.low  = Math.min(forming.low, price);
    forming.close = price;
  }
  forming.volume += size;
  chart.update(forming);
}
```

⚠ **Throttle if your feed is faster than the screen.** A 1000 msg/s stream does
not need 1000 `update()` calls per second — the engine redraws at the display's
refresh rate regardless. Coalesce to one call per animation frame:

```js
let pending = null, queued = false;
function push(bar) {
  pending = bar;
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; if (pending) chart.update(pending); });
}
```

### Reconnecting

On reconnect, refetch history and `setData` — do not try to splice. It is one
upload and it guarantees you have not missed a bar during the gap.

```js
socket.onclose = () => setTimeout(async () => {
  chart.setData(await load(symbol, timeframe));
  connect();
}, 1000);
```

---

## Vendor adapters

Sketches, not endorsements — check each vendor's terms and rate limits, and keep
your API keys **on your server**, never in browser code.

### Binance (crypto, public REST + WebSocket, no key)

```js
// GET /api/v3/klines → [[openTime, o, h, l, c, v, closeTime, …], …]
const raw = await fetch(
  'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=1000',
).then((r) => r.json());

chart.setData(raw.map((k) => ({
  time: k[0],                    // ms — fine, the package converts
  open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5],
})));

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1h');
ws.onmessage = (ev) => {
  const k = JSON.parse(ev.data).k;
  chart.update({ time: k.t, open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v });
};
```

### Polygon.io (US equities)

```js
// Proxy this through YOUR server so the key never reaches the browser.
const d = await fetch('/api/polygon/aggs/AAPL/1/day/2024-01-01/2024-12-31').then((r) => r.json());
chart.setData(d.results.map((b) => ({
  time: b.t, open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v,
})));
```

### Alpaca (US equities)

```js
const d = await fetch('/api/alpaca/bars?symbol=AAPL&timeframe=1Day').then((r) => r.json());
chart.setData(d.bars.map((b) => ({
  time: Date.parse(b.t), open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v,
})));
```

### Alpha Vantage / Yahoo-style keyed objects

```js
const s = d['Time Series (Daily)'];
chart.setData(Object.entries(s).map(([date, v]) => ({
  time: Date.parse(date) / 1000,
  open: +v['1. open'], high: +v['2. high'], low: +v['3. low'], close: +v['4. close'],
  volume: +v['5. volume'],
})).sort((a, b) => a.time - b.time));
```

### Broker / exchange feeds generally

Almost every feed is one of three shapes — an array of objects, an array of
arrays, or parallel columns. Write one `toBars()` per vendor, unit-test it
against a saved response, and the rest of your app never sees the difference.

---

## Switching symbol and timeframe

The chart holds one series. Switching is one call:

```js
async function show(symbol, timeframe) {
  const bars = await load(symbol, timeframe);
  chart.setData(bars);      // replaces everything, autoscales and fits
  chart.scrollToEnd();
}
```

⚠ **Drawings are stored in bar-index space and do not follow a symbol change.**
Bar 1,200 of AAPL is not bar 1,200 of MSFT. Save and restore them yourself:

```js
const saved = chart.drawings();      // persist against (symbol, timeframe)
chart.clearDrawings();
chart.setData(newBars);
chart.addDrawings(saved);            // ⚠ addDrawings, not a loop — see drawings.md
```

## Paging in history

Prepend older bars and re-upload the whole array. There is no incremental
prepend — an index-based camera would have to renumber every drawing anchor,
and silently moving a user's trend lines is worse than one upload.

```js
async function loadOlder() {
  const older = await load(symbol, timeframe, { before: bars[0].time });
  bars = older.concat(bars);
  chart.setData(bars);
}
```

## What the package will never do

No symbol search, no timeframe buttons, no exchange calendars, no session
handling, no data caching, no request scheduling, no retries. Those belong to
your application, where they can be right for your data. The package draws.

---

**Next:** [Frameworks](frameworks.md) · [API reference](api.md) · [Troubleshooting](troubleshooting.md)
