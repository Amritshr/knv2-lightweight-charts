# KNv2 Lightweight Charting Engine — Licence Agreement

*Package: `knv2-lightweight-charts`*

**Version 1.0.2 · Copyright © 2026 Amrit Shrestha. All rights reserved.**

This is a **proprietary licence**, not an open-source one. The software is free
to use, including in commercial and closed-source products, on the conditions
set out below. Read §3 in particular: it is the condition the rest of the grant
depends on.

By downloading, installing, embedding, linking to or otherwise using the
Software, You accept this Agreement. If You do not accept it, do not use the
Software.

---

## 1. Definitions

- **"Software"** — the compiled WebAssembly engine (`knv2lw.wasm`), its
  JavaScript loader (`knv2lw.js`), the SDK bundles distributed in `dist/`, the
  accompanying type definitions, documentation and example code, and any update
  Amrit Shrestha makes available under this Agreement.
- **"Licensor"** — Amrit Shrestha.
- **"You"** — the individual or legal entity exercising the rights granted here.
- **"Application"** — a website, web application, mobile or desktop application,
  or embedded product developed by You in which the Software is used to display
  charts to end users.
- **"Attribution Mark"** — the visual mark the Software renders inside every
  chart container, consisting of **all three** of the following together, plus
  its hyperlink:

  | | |
  |---|---|
  | the **K2 logo** | the monogram badge at the left of the mark |
  | the **product text** | the words "Charts by KNv2" |
  | the **author credit** | the words "Amrit Shrestha" |

  Rendered, it reads: **K2  Charts by KNv2 · Amrit Shrestha**

  ⚠ Each of the three is a required part. A mark displaying some but not all of
  them is not the Attribution Mark and does not satisfy §3.

## 2. Grant of licence

Subject to Your continuous compliance with this Agreement, Licensor grants You a
worldwide, royalty-free, non-exclusive, non-transferable, revocable licence to:

**(a)** download and reproduce the Software;

**(b)** embed and use the Software in an unlimited number of Applications,
including Applications You sell, license, or operate commercially, and including
Applications whose own source code is closed;

**(c)** host the Software's files on Your own servers, on a CDN You control, or
on a third-party hosting service used to serve Your Application; and

**(d)** distribute the Software **as an incorporated component of Your
Application**, to Your end users, for the purpose of running that Application.

No fee is payable. There is no limit on the number of developers, charts,
domains, page views, or end users.

## 3. ⚠ Attribution — the condition of the grant

**The Attribution Mark must remain visible, legible and unobstructed on every
chart the Software renders, at all times, in every Application — including the
K2 logo, the text "Charts by KNv2", and the credit to Amrit Shrestha,
all three.**

This is the consideration for a licence that is otherwise free. Specifically,
You must not:

**(a)** remove, delete, disable, or prevent the rendering of the Attribution
Mark, **or of any one of its three parts** — removing the K2 logo
while keeping the text, or removing the credit to Amrit Shrestha while keeping
the logo, is a breach of this clause exactly as removing the whole mark is;

**(b)** hide or degrade it by any means — including but not limited to CSS
(`display`, `visibility`, `opacity`, `clip-path`, `transform`, `text-indent`,
negative offsets, zero dimensions, or z-order), DOM manipulation, overlaying
another element on top of it, or rendering it in a colour that makes it
illegible against its background;

**(c)** alter the K2 logo, the product text, the author credit, or
the destination of the hyperlink; substitute Your own name, logo, or branding
for any of them; or present the Software in a way that suggests any party other
than Amrit Shrestha authored it;

**(d)** modify, patch, re-bundle, or otherwise circumvent the mechanism in the
Software that renders and monitors the Attribution Mark; or

**(e)** distribute a build of the Software in which any of the above has been
done, or instruct, assist, or encourage another person to do any of the above.

**What You may do:** the Attribution Mark may be **moved** between the four
corners of the chart using the documented `attributionPosition` option. You may
place Your own branding, logo, watermark, or UI anywhere else on or around the
chart, including behind the chart data — Your branding and the Attribution Mark
are expected to coexist, and nothing here restricts how prominently You present
Your own. See `docs/attribution.md`.

**Enforcement.** The Software monitors the Attribution Mark at runtime, checking
the K2 logo, the product text and the author credit **each
separately**. When any one of them has been hidden or removed, the Software
emits a console warning naming this clause and, if the condition persists, stops
rendering that chart and displays a notice in its place. This behaviour is a designed and disclosed
feature of the Software, not a defect, and interfering with it is a breach of
§3(d).

**Breach of §3 terminates this licence automatically** — see §7.

## 4. ⚠ Restrictions

You must **not**:

**(a)** reverse engineer, decompile, disassemble, lift, translate, or otherwise
attempt to derive the source code, algorithms, or internal structure of the
WebAssembly engine or of any compiled or minified file in `dist/`, except and
only to the extent that this restriction is expressly prohibited by applicable
law;

**(b)** modify, patch, recompile, instrument, or create derivative works of any
file in `dist/`. The files are distributed with published SHA-256 digests and
the Software verifies them before execution; defeating that verification is a
breach of this clause;

**(c)** redistribute, publish, sublicense, sell, rent, lease, or lend the
Software **on its own** — that is, other than as an incorporated component of an
Application under §2(d). Re-publishing the Software to a package registry, a
CDN, a public repository, or a file-sharing service is not permitted;

**(d)** use the Software, in whole or in part, to build, train, or improve a
charting library, charting engine, charting component, or charting product that
competes with the Software;

**(e)** remove, obscure, or alter any copyright notice, licence header, banner
comment, or proprietary marking contained in the Software;

**(f)** use Licensor's name, logo, or trade marks to endorse or promote Your
Application, or in a way that implies a partnership, sponsorship, or approval
that does not exist. Factual statements — "charts powered by Charts by KNv2" —
are permitted and welcome; or

**(g)** use the Software in violation of any applicable law, export control
regulation, or sanctions programme.

## 5. Ownership

The Software is **licensed, not sold**. Licensor and its suppliers retain all
right, title and interest in and to the Software, including all copyright,
patent, trade secret, trade mark and other intellectual property rights. No
rights are granted other than those expressly stated in §2. In particular, no
source code is provided, and nothing in this Agreement obliges Licensor to
provide any.

You retain all rights in Your Application and in Your own data. Licensor claims
no interest in the market data, chart configurations, drawings, or any other
content You display using the Software, and the Software transmits none of it —
see §11.

## 6. No support, no obligation to update

The Software is provided as-is. Licensor is under no obligation to provide
support, maintenance, updates, bug fixes, or new versions under this Agreement,
and may change, deprecate, or discontinue the Software at any time. Commercial
support and service-level agreements are available separately; see §10.

## 7. Term and termination

This Agreement takes effect when You first use the Software and continues until
terminated.

It terminates **automatically and immediately**, without notice, if You breach
any term — and a breach of §3 or §4 is a material breach. On termination You
must cease all use of the Software and remove it from every Application You
control and from every distribution channel You operate.

§4, §5, §7, §8, §9 and §12 survive termination.

Licensor may reinstate a terminated licence in writing. If a breach was
inadvertent — a CSS conflict that hid the Attribution Mark, say — and You cure
it promptly after becoming aware of it, this licence is reinstated
automatically on the cure.

## 8. Disclaimer of warranty

> **THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY
> KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND
> NON-INFRINGEMENT. LICENSOR DOES NOT WARRANT THAT THE SOFTWARE WILL BE
> UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS, OR THAT IT WILL
> OPERATE ON ANY PARTICULAR HARDWARE, BROWSER, OR PLATFORM.**

⚠ **The Software renders charts. It does not verify, correct, or vouch for the
market data You supply to it, and it is not financial advice.** Any decision
made on the basis of a chart drawn by the Software is Yours alone. Do not use
the Software as the sole basis for a trading, investment, or risk-management
decision.

## 9. Limitation of liability

> **TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
> LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
> EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA,
> GOODWILL, OR TRADING LOSSES, ARISING OUT OF OR RELATING TO THE SOFTWARE OR
> THIS AGREEMENT, ON ANY THEORY OF LIABILITY, WHETHER OR NOT LICENSOR HAS BEEN
> ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.**
>
> **LICENSOR'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED
> THE GREATER OF (a) THE AMOUNT YOU PAID LICENSOR FOR THE SOFTWARE IN THE TWELVE
> MONTHS PRECEDING THE CLAIM, OR (b) USD 100.**

Some jurisdictions do not allow the exclusion of implied warranties or the
limitation of liability for certain damages; in those jurisdictions the above
applies to the fullest extent permitted, and nothing here limits liability for
fraud, or for death or personal injury caused by negligence.

## 10. Commercial and alternative terms

This Agreement is the only licence under which the Software is offered free of
charge, and its terms — including §3 — cannot be varied by conduct, by an
Application's own terms, or by any purchase order.

If You require terms this Agreement does not grant — a source-code licence, an
OEM or redistribution arrangement, an indemnity, a warranty, a service-level
agreement, or any variation of §3 — contact **amrit.shr@gmail.com**. Any such variation
is effective only in a written agreement signed by Licensor.

## 11. Privacy and telemetry

⚠ **The Software collects nothing and transmits nothing.**

It performs no analytics, no telemetry, no licence call-home, no beacon, and no
network request of any kind other than fetching its own two artifacts —
`knv2lw.js` and `knv2lw.wasm` — from the location You serve them from. It does
not fetch market data; You supply that. The Attribution Mark's hyperlink is a
plain, unmodified `<a href>` and is followed only if an end user clicks it.

The runtime attribution monitoring described in §3 is entirely local to the
browser and reports to nobody.

## 12. General

**Governing law.** This Agreement is governed by the laws of the jurisdiction in
which Licensor is established, without regard to its conflict-of-laws rules, and
the courts of that jurisdiction have exclusive jurisdiction over any dispute.

**Entire agreement.** This Agreement, together with `NOTICE`, is the entire
agreement between the parties concerning the Software and supersedes all prior
proposals and communications.

**Severability.** If any provision is held unenforceable, it is modified to the
minimum extent necessary to make it enforceable, and the remaining provisions
stay in full force.

**No waiver.** A failure to enforce any provision is not a waiver of it.

**Assignment.** You may not assign this Agreement without Licensor's prior
written consent, except to a successor in interest to all or substantially all
of Your business. Licensor may assign freely.

**Third-party components.** See `NOTICE`.

---

**Questions about what this licence permits: amrit.shr@gmail.com**

If You are unsure whether Your intended use is allowed, ask before You ship. The
answer is usually yes, and it is always cheaper than finding out afterwards.
