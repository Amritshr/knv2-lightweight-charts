# Attribution

This package is free — for commercial products, closed-source products,
unlimited developers, unlimited domains, unlimited users, with no fee and no
account. **The price is a small mark in the corner of the chart.**

That is the whole deal, and this page is everything you need to know about
living with it comfortably.

---

## What the mark is

A small element the SDK adds as the last child of your chart container:

> ▎▍▌ **Charts by KNv2**

- about 110 × 18 px, 11 px type
- a link to `https://github.com/Amritshr/knv2-lightweight-charts`, opening in a new tab
- colour and background adapt to your chart's background — light text on dark,
  dark text on light
- inline SVG glyph, no image request, no font download, no network call
- `pointer-events` only on itself; it never intercepts a pan, a zoom, or a
  drawing gesture

## What you may do

✅ **Move it to any corner.**

```js
const chart = await createChart(el, {
  attributionPosition: 'bottom-right',   // or 'bottom-left' (default), 'top-left', 'top-right'
});
```

The offsets are chosen so the mark clears the time strip and the price gutter in
every corner.

✅ **Put your own branding anywhere else.** Your logo, your watermark, your
symbol title, your legend, your toolbar — on top of the chart, beside it, or
*behind* the candles. The engine clears its buffer transparent, so anything you
paint on the container shows through the plot:

```html
<div id="chart" style="position:relative;height:420px">
  <img src="/logo.svg" style="position:absolute;inset:0;margin:auto;opacity:.06;width:40%">
</div>
```

That watermark sits *under* the candles and is entirely yours. The engine draws
over it.

✅ **Give it room.** Add padding to your container, keep your own UI out of the
corner you put it in, or move it to a corner you are not using.

✅ **Say more.** Crediting the project in an "about" or "licences" screen as well
is welcome. `NOTICE` has suggested wording. It is not required.

## What you may not do

❌ Remove it, delete it, or stop it rendering.
❌ Hide it with CSS — `display`, `visibility`, `opacity`, `clip-path`,
`transform`, `text-indent`, negative offsets, zero size, or z-order.
❌ Cover it with another element.
❌ Change its text, its glyph, or its link.
❌ Patch the bundle to disable the mechanism.
❌ Ship a build to anyone else with any of the above done.

These are §3 of [LICENSE.md](../LICENSE.md), and **breaching them terminates the
licence automatically.**

## ⚠ The runtime check — what it does, and why you should not be nervous

The SDK watches the mark while the chart is alive. If it becomes invisible, it:

1. **Prints a console warning** naming the exact cause (`opacity:0`,
   `display:none`, "covered by another element", …) and this clause.
2. **Tries to repair it** — re-asserts its styles, re-inserts it if it was
   detached. Most trips are a CSS reset, not a person, and this fixes them
   silently.
3. **If the condition persists**, hides the chart and replaces it with a notice
   naming the licence.

**The thresholds are deliberately forgiving**, because a false positive that
blanks an honest developer's chart is a far worse outcome than missing one bad
actor:

| situation | grace |
|---|---|
| hidden or restyled | ~6 seconds of *continuous* failure |
| covered by another element | ~15 seconds of *continuous* covering |
| chart scrolled off-screen | not checked at all |
| chart in a background tab | not checked |
| a tooltip or dropdown passing over it | forgiven — it has to *stay* there |

So a modal that covers the chart for two seconds, a hover card that parks over
the corner, a chart inside a collapsed accordion — none of these trip it.

### If it trips by accident

It is almost always one of these:

| symptom in the console | cause |
|---|---|
| `opacity:0` / `visibility:hidden` | a global CSS rule matching `a` or `svg` inside your container |
| `display:none` | an `!important` reset, or a `[hidden]` sweep |
| `rendered 0×0px` | the container has `overflow:hidden` and no room in that corner |
| `positioned outside the chart` | the container is smaller than you think, or has a transform |
| `covered by another element` | your legend, toolbar, or overlay sits in that corner |

The fix is one of: move the mark (`attributionPosition`), move your overlay, or
scope your CSS reset so it does not reach into the chart container. **Fixing it
promptly restores the licence automatically** — see §7 of the licence.

If you cannot work out why it is tripping, [open an
issue](https://github.com/Amritshr/knv2-lightweight-charts/issues) with the console message. That is a bug report we want.

## Honest words about the mechanism

The check runs in your browser, in code we shipped to you. Anyone willing to
patch a minified bundle can defeat it in an afternoon, and no amount of
cleverness on our side changes that — it is a property of client-side software,
not a gap we forgot to close.

So the check is not DRM and we do not present it as such. It exists to do two
things:

1. **Make removal deliberate.** An honest team should not be able to breach §3
   by accident, through a stylesheet nobody read. The warning-then-repair path
   catches almost every real-world case before it becomes a problem.
2. **Make a breach visible.** A stripped mark turns into a notice that your own
   users see, naming the licence.

Beyond that, what protects this project is the licence, not the code — and the
good faith of developers who would rather ship a credit line than take something
that was offered freely. That has worked out fine for a lot of projects, and we
are betting it works out here.

If the mark genuinely does not fit your product, **talk to us**:
**amrit.shr@gmail.com**. Alternative terms exist and are usually cheaper than you expect.
Patching the bundle is not one of them.

---

**Next:** [Integrity & security](integrity.md) · [Licence](../LICENSE.md) · [Theming](theming.md)
