# Integrity & security

You are being asked to run a WebAssembly binary you cannot read the source of.
This page is what we do about that, what you should do about it, and where the
honest limits are.

---

## What ships, and what it is allowed to do

| file | what it is |
|---|---|
| `knv2lw.wasm` | the compiled engine — 189,003 bytes |
| `knv2lw.js` | Emscripten's loader for it — 35,074 bytes |
| `knv2-lightweight-charts.js` | the SDK you call |
| `knv2-lightweight-charts.react.js` | the optional React wrapper |

### ⚠ The engine makes no network requests at all

Not one. No telemetry, no analytics, no licence call-home, no beacon, no
error reporting, no fingerprinting. The only fetches the package performs are
for its own two artifacts, from the location *you* serve them from.

You can verify this rather than take our word for it:

- **DevTools → Network**, filter to the chart's lifetime. You will see
  `knv2lw.js` and `knv2lw.wasm` and nothing else.
- **CSP** — set `connect-src 'self'` and watch nothing break (§"Locking it
  down" below).
- The WASM module is compiled with no socket, no `XMLHttpRequest` and no
  `fetch` import; its import table is Emscripten's runtime and WebGL, which you
  can dump with `wasm-objdump -x knv2lw.wasm` or in DevTools.

The engine reads: the canvas, pointer and touch events on it, and the bars you
hand it. It writes: pixels. That is the whole surface.

### The attribution check is local

It reads the DOM and calls `console.warn`. It reports to nobody. See
[attribution.md](attribution.md).

---

## Verifying what you downloaded

Every file in `dist/` is published with its SHA-256 digest in
[`checksums.sha256`](../checksums.sha256).

```bash
# macOS / Linux
shasum -a 256 -c checksums.sha256

# Windows (PowerShell)
Get-FileHash dist\knv2lw.wasm -Algorithm SHA256
```

The engine digests for this release:

```
25c2c1515b91eab69400ce21621f2f1d01cd5b8369843d64fa123d4826b68b43  dist/knv2lw.wasm
2f8323b5816cbd1f41418cafe75b6c4a4740411568e6c4a8345dd44f29bdb1b4  dist/knv2lw.js
```

They are also exported from the SDK, so you can assert on them in your own test
suite:

```js
import { ENGINE_WASM_SHA256, version } from 'knv2-lightweight-charts';
```

## The runtime check

The SDK does not let the engine instantiate until it has verified it:

1. fetches `knv2lw.wasm` itself,
2. hashes the bytes with `crypto.subtle.digest('SHA-256', …)`,
3. compares against the digest compiled into the SDK,
4. hands **those exact verified bytes** to the loader as `wasmBinary`.

Step 4 matters: if the loader fetched the wasm again, we would be verifying one
response and executing another. Passing the exact bytes over closes that race
and saves a round trip.

The loader itself (`knv2lw.js`) is verified the same way but cannot be handed
over as bytes — it is a real ES module and has to be `import`ed by URL. So you
will see it in the network panel **twice**: once for the hash, once for the
import, the second served from the HTTP cache. That is the one place where what
is hashed and what is executed are two separate responses; pin the file with
SRI, below, if that matters to you.

A mismatch throws `IntegrityError` with both digests, and the chart does not
start.

```js
import { createChart, IntegrityError } from 'knv2-lightweight-charts';

try {
  const chart = await createChart(el, opts);
} catch (e) {
  if (e instanceof IntegrityError) {
    // dist/ is missing, corrupt, mismatched across versions, or modified
  }
}
```

⚠ **Copy `dist/` from a single release.** The most common cause of an
`IntegrityError` in practice is not tampering — it is an SDK bundle from one
version sitting beside an engine from another.

⚠ **`crypto.subtle` needs a secure context.** On plain HTTP to a non-localhost
address it is absent, so the check is skipped with a console warning rather than
failing — refusing to render on `http://192.168.1.5` would break honest
development on a phone to inconvenience an attacker who could disable the check
anyway. **In production, serve over HTTPS.**

### ⚠ What the runtime check does not prove

The expected digest is a constant inside a bundle that is itself shipped to the
browser. Someone who modifies the engine can modify the digest beside it. This
raises the floor from "rename a file" to "patch two artifacts and keep them in
step"; it is not a cryptographic guarantee, because there is no trusted party in
the room.

**Real assurance about the bytes your users run comes from your server**, and
that is the next section.

---

## Locking it down on your own server

### Subresource Integrity

SRI is checked by the *browser* against a value in *your* HTML, which an
attacker who has only replaced a file on your CDN cannot change:

```html
<script
  type="module"
  src="/knv2/knv2-lightweight-charts.js"
  integrity="sha384-…"
  crossorigin="anonymous"
></script>
```

Generate the value:

```bash
openssl dgst -sha384 -binary dist/knv2-lightweight-charts.js | openssl base64 -A
```

⚠ SRI does not cover the `.wasm` — it is fetched by script, not by a tag. The
SDK's own digest check is what covers that file, which is exactly why it exists.

### Content-Security-Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
  img-src 'self' data:;
  style-src 'self' 'unsafe-inline';
```

| directive | why |
|---|---|
| `'wasm-unsafe-eval'` | ⚠ **required.** Without it the module downloads and then refuses to instantiate. On older browsers you may need `'unsafe-eval'`. |
| `connect-src 'self'` | the package fetches only its own artifacts from your origin — and this proves it |
| `style-src 'unsafe-inline'` | the attribution mark and canvas are styled inline. Use a nonce if you prefer. |

### Serving

- **HTTPS.** Required for `crypto.subtle`, and correct anyway.
- **`Cache-Control: public, max-age=31536000, immutable`** on `dist/` if you
  fingerprint the path per release. The engine is fetched once per version.
- **`Content-Type: application/wasm`** on the `.wasm`, so the browser can use
  streaming compilation.
- **`Content-Encoding: gzip` or `br`.** The wasm compresses to roughly 78 KB.
- **Cross-origin?** Add `Access-Control-Allow-Origin` and load the SDK with
  `crossorigin="anonymous"`, or the digest check cannot read the response body.

### Should the binary be public?

⚠ Anything served to a browser can be downloaded by anyone who can load your
page. If you would rather not have the engine be trivially liftable, serve
`dist/` from a route behind your own session check instead of a static folder,
and point the SDK at it:

```js
createChart(el, { enginePath: '/authenticated/engine/' });
```

That raises the cost of casual copying. It does not make the file secret — a
logged-in user can still save it — and the licence, not the route, is what
governs redistribution.

---

## Reporting a security issue

Please do **not** open a public issue for a vulnerability. Email
**amrit.shr@gmail.com** with a description and, if you have one, a reproduction. We
will acknowledge and keep you posted through to a fix.

---

**Next:** [Attribution](attribution.md) · [Getting started](getting-started.md) · [Troubleshooting](troubleshooting.md)
