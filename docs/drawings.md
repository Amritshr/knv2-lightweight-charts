# Drawing tools

Nine tools, hit-tested, selectable, draggable, with undo/redo — drawn by the
engine, not by your JavaScript.

| tool | |
|---|---|
| `trendline` | two anchors, segment between them |
| `ray` | two anchors, extends past the second |
| `extended` | two anchors, extends both ways |
| `hline` | horizontal, full width |
| `vline` | vertical, full height |
| `hray` | horizontal, extends right |
| `arrow` | two anchors, arrowhead at the second |
| `text` | a label at one anchor |
| `callout` | a label with a leader line |

---

## Arming a tool

```js
chart.setTool('trendline');    // the next click/tap places an anchor
chart.setTool('none');         // disarm
chart.setMagnet(true);         // snap new anchors to the hovered O/H/L/C
```

A two-point tool completes on the second click, fires `finished`, and disarms
itself. On touch it also works as a single drag.

## Placing from code

```js
const id = chart.addDrawing({
  tool: 'trendline',
  points: [{ x: 1200, y: 705 }, { x: 1400, y: 730 }],
  color: '#f5a623',
  widthPx: 2,
  style: 'dashed',
});
```

⚠ **`x` is a fractional bar index and `y` is a price — not pixels.** That is what
makes a drawing ride the camera instead of sliding off the data on the first
pan. Convert from pixels through the engine if you need to:

```js
const x = chart.engine().MapXToIndex(clientX - rect.left);
const y = chart.engine().MapYToValue(clientY - rect.top);
```

⚠ **Never re-derive the projection in JavaScript.** It depends on camera state
the engine owns and changes every frame. A transcribed copy drifts, and the
symptom is drawings landing near — but not on — the cursor.

## ⚠ Restoring many at once

```js
chart.addDrawings(saved);          // ✅
saved.forEach((d) => chart.addDrawing(d));   // ❌ quadratic
```

`addDrawings` wraps the replay in the engine's bulk region. The difference is
linear versus quadratic: the full engine measured **93 seconds** for 3,000
objects added one at a time.

---

## ⚠ Text objects need your help

A text or callout object is placed with a **placeholder**, because C++ cannot
open a UI. The engine fires `created` and it is the host's job to prompt and
fill it in — and to remove the object if the user cancels, or you leave a
placeholder on the chart.

```js
chart.subscribeDrawingChange((id, event) => {
  if (event !== 'created') return;
  const d = chart.drawing(id);
  if (d?.tool !== 'text' && d?.tool !== 'callout') return;

  const text = window.prompt('Label');
  if (text) chart.setDrawingText(id, text);
  else chart.removeDrawing(id);
});
```

Use a real modal in production; `prompt` is shown here because it is one line.

---

## Selection, editing, undo

```js
chart.selectedDrawing();               // id, or -1
chart.updateDrawing(id, { color: '#ef4444', widthPx: 3, style: 'dotted' });
chart.deleteSelected();
chart.removeDrawing(id);
chart.clearDrawings();

chart.undo();   chart.redo();
chart.canUndo(); chart.canRedo();
```

Clicking an object selects it; dragging a selected object or one of its anchors
moves it. All of that is inside the engine — you get events, not work.

## Events

```js
chart.subscribeDrawingChange((id, event) => { … });
```

| event | |
|---|---|
| `created` | the object exists; for text, prompt now |
| `finished` | the last anchor was placed and the tool disarmed |
| `moved` | dragged, or an anchor was moved |
| `selected` | clicked |
| `properties` | colour/width/style/text changed |
| `deleted` | removed |

---

## Persistence

`drawings()` returns everything in a shape `addDrawings()` accepts, so a round
trip is two calls:

```js
// Save
localStorage.setItem(key(symbol, tf), JSON.stringify(chart.drawings()));

// Restore
const saved = JSON.parse(localStorage.getItem(key(symbol, tf)) || '[]');
chart.addDrawings(saved);
```

⚠ **Key it by symbol *and* timeframe.** Anchors are bar indices: bar 1,200 of
AAPL daily is not bar 1,200 of AAPL hourly, and it is certainly not bar 1,200 of
MSFT. Restoring across either boundary puts objects in the wrong place, plausibly
enough that nobody notices for a week.

If you need drawings that survive a timeframe change, store the anchor's
**time** alongside its index and re-map on load:

```js
const withTimes = chart.drawings().map((d) => ({
  ...d,
  points: d.points.map((p) => ({ ...p, t: bars[Math.round(p.x)]?.time })),
}));

// on restore, against a different bar array:
const remapped = withTimes.map((d) => ({
  ...d,
  points: d.points.map((p) => ({ x: indexOfTime(bars, p.t), y: p.y })),
}));
chart.addDrawings(remapped);
```

---

## A tool dock

```js
const TOOLS = ['none', 'trendline', 'ray', 'hline', 'vline', 'arrow', 'text'];

dock.addEventListener('click', (e) => {
  const tool = e.target.dataset.tool;
  if (!tool) return;
  chart.setTool(tool);
  [...dock.children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === tool));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chart.setTool('none');
  if (e.key === 'Delete' || e.key === 'Backspace') chart.deleteSelected();
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') e.shiftKey ? chart.redo() : chart.undo();
});
```

---

**Next:** [API reference](api.md) · [Data sources](data-sources.md)
