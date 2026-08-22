// Type definitions for knv2-lightweight-charts
// A WebGL2 + WebAssembly financial charting engine.
//
// This file is the published API contract. Everything the package exports is
// declared here; nothing else is public or supported.

// ─── Data ────────────────────────────────────────────────────────────────────

/**
 * One bar.
 *
 * `time` may be UNIX **seconds or milliseconds** — the package decides per
 * value by magnitude (anything below 1e11 is read as seconds). Do not mix the
 * two units inside one array: `setData` rejects a series that is not monotonic
 * after conversion, but a series that stays monotonic and is wrong will simply
 * render wrong. `lightweight-charts`' `{ year, month, day }` business-day
 * objects are not accepted — convert to a number first.
 */
export interface LWBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Optional. No volume histogram is drawn; this rides along for the readout. */
  volume?: number;
}

/** The five chart types. */
export type LWChartType = 'candles' | 'bars' | 'line' | 'area' | 'heikin';

/** One vocabulary for the grid, the crosshair and every drawing. */
export type LWLineStyle = 'solid' | 'dashed' | 'dotted';

/** The drawing tools this package ships: the line family, and text. */
export type LWTool =
  | 'none'
  | 'trendline'
  | 'ray'
  | 'hline'
  | 'vline'
  | 'extended'
  | 'hray'
  | 'arrow'
  | 'text'
  | 'callout';

// ─── Options ─────────────────────────────────────────────────────────────────

/**
 * Six values are the whole palette: two direction colours and four neutrals.
 * Plain CSS colour strings. Anything carrying alpha is flattened against the
 * background before it reaches the engine, which holds no alpha on the theme.
 */
export interface LWTheme {
  /**
   * A CSS `background` value, not only a colour — the host paints it and the
   * engine clears its buffer transparent over the top, so a gradient or an
   * image works as-is.
   *
   * When it is **not** a plain colour, set `backgroundBase` too: the engine
   * composites the grid's and crosshair's alpha against one solid colour and
   * cannot parse a gradient into one.
   */
  background: string;
  /** The solid colour translucent chrome is composited against. */
  backgroundBase?: string;
  grid: string;
  axis: string;
  text: string;
  /** Up candle — and the line/area colour unless `lineColor` overrides it. */
  up: string;
  /** Down candle. */
  down: string;
}

export interface LWGridOptions {
  vertical?: boolean;
  horizontal?: boolean;
  color?: string;
  style?: LWLineStyle;
  /** 0–1, applied by compositing over the background. */
  opacity?: number;
}

export interface LWCrosshairOptions {
  /** `magnet` snaps the readout to the hovered candle's O/H/L/C. */
  mode?: 'normal' | 'magnet' | 'hidden';
  style?: LWLineStyle;
  color?: string;
  opacity?: number;
  widthPx?: number;
}

export interface LWPriceScaleOptions {
  /** Fraction of the plot left empty above / below the data. 0–0.45 each. */
  marginTop?: number;
  marginBottom?: number;
  /** Digits after the point. Omit or pass < 0 to derive from the visible span. */
  decimals?: number;
  logarithmic?: boolean;
  percent?: boolean;
  inverted?: boolean;
  /** Off freezes the value range, so scrolling sideways stops rescaling it. */
  autoFit?: boolean;
  lastPriceLabel?: boolean;
  highLowLabels?: boolean;
}

export interface LWTimeScaleOptions {
  /** Bars of empty space held at the right edge. < 0 restores the default. */
  rightMarginBars?: number;
}

/**
 * Candle styling. These override `theme.up` / `theme.down` **for the candles
 * only** — use the theme for a theme and these for a style.
 */
export interface LWCandleStyleOptions {
  upColor?: string;
  downColor?: string;
  bodyVisible?: boolean;
  /** 0–1 on the body fill only, so an outline stays readable. */
  bodyOpacity?: number;
  borderVisible?: boolean;
  borderUpColor?: string;
  borderDownColor?: string;
  wickVisible?: boolean;
  wickUpColor?: string;
  wickDownColor?: string;
}

export interface LWChartOptions {
  type?: LWChartType;
  /** The line and area colour. Defaults to `theme.up`. */
  lineColor?: string;
  /** A built-in palette by name, or an object overriding only the keys it names. */
  theme?: 'dark' | 'light' | Partial<LWTheme>;
  grid?: LWGridOptions;
  crosshair?: LWCrosshairOptions;
  priceScale?: LWPriceScaleOptions;
  timeScale?: LWTimeScaleOptions;
  candles?: LWCandleStyleOptions;
  /** Follow the container with a ResizeObserver. On by default; with it off the
   *  host must call `resize()` itself or the chart draws into a 0×0 buffer. */
  autoSize?: boolean;
  /** Cap on the device-pixel ratio. Halving DPR quarters fill cost. */
  maxDevicePixelRatio?: number;
}

/** Which corner the attribution mark sits in. It may be moved, never hidden. */
export type AttributionPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export interface ChartOptions extends LWChartOptions {
  /**
   * Where `dist/` is served from, with a trailing slash. Defaults to the folder
   * this bundle was loaded from, so copying `dist/` anywhere needs no config.
   */
  enginePath?: string;
  /** See §3 of LICENSE.md and `docs/attribution.md`. */
  attributionPosition?: AttributionPosition;
}

// ─── Events ──────────────────────────────────────────────────────────────────

/** What the crosshair callback reports. */
export interface LWHover {
  index: number;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * One drawing. Coordinates are the anchor's own space — `x` is a **fractional
 * bar index** and `y` is a **price** — which is what makes an object ride the
 * camera instead of sliding off the data on the first pan.
 */
export interface LWDrawing {
  id: number;
  tool: LWTool;
  points: { x: number; y: number }[];
  color: string;
  widthPx: number;
  style: LWLineStyle;
  text: string;
}

/** A drawing to place from code — a restore, a signal, a saved layout. */
export interface LWDrawingSpec {
  tool: LWTool;
  points: { x: number; y: number }[];
  color?: string;
  widthPx?: number;
  style?: LWLineStyle;
  text?: string;
  fontPx?: number;
  bold?: boolean;
  italic?: boolean;
}

export type LWDrawingEvent =
  | 'created'
  | 'moved'
  | 'selected'
  | 'deleted'
  | 'finished'
  | 'properties';

export type LWUnsubscribe = () => void;

// ─── The chart ───────────────────────────────────────────────────────────────

export interface ChartApi {
  /** Replace the series. Returns the number of bars committed — **0 means the
   *  shared heap refused the reservation**, so check it on long series. */
  setData(bars: readonly LWBar[]): number;
  /** A live tick on the forming bar. Partial: one instance, no re-upload. */
  update(bar: LWBar): void;
  /** Re-applies the whole resolved option set. Cheap; safe from an effect. */
  applyOptions(patch: LWChartOptions): void;
  setChartType(type: LWChartType): void;
  chartType(): LWChartType;
  fitContent(): void;
  scrollToEnd(): void;
  /** Both ends are **fractional bar indices**, not times. */
  setVisibleRange(from: number, to: number): void;
  /** Only needed with `autoSize: false`. */
  resize(cssW?: number, cssH?: number): void;

  setTool(tool: LWTool): void;
  activeTool(): LWTool;
  /** Snap new anchors to the hovered candle's O/H/L/C. */
  setMagnet(on: boolean): void;
  addDrawing(spec: LWDrawingSpec): number;
  /** Use this for a restore, **not** `addDrawing` in a loop — it wraps the
   *  replay in the engine's bulk region, which is the difference between
   *  linear and quadratic. */
  addDrawings(specs: readonly LWDrawingSpec[]): number[];
  drawings(): LWDrawing[];
  drawing(id: number): LWDrawing | null;
  updateDrawing(id: number, patch: Partial<Omit<LWDrawingSpec, 'tool' | 'points'>>): void;
  /** A text object is placed with a placeholder: the engine cannot open UI, so
   *  the host prompts on `created` and calls this. */
  setDrawingText(id: number, text: string): void;
  removeDrawing(id: number): void;
  clearDrawings(): void;
  deleteSelected(): void;
  selectedDrawing(): number;
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;

  /** Fires on a change of hovered **bar**, not per mouse move. `null` on leave. */
  subscribeCrosshairMove(cb: (hover: LWHover | null) => void): LWUnsubscribe;
  subscribeDrawingChange(cb: (id: number, event: LWDrawingEvent) => void): LWUnsubscribe;

  /** The raw engine handle. Everything not wrapped above is here; it is not
   *  covered by semver. `MapXToIndex` / `MapYToValue` convert pixels. */
  engine(): unknown;
  metrics(): {
    fps: number;
    frameMs: number;
    retainedBuilds: number;
    barCount: number;
    visibleBars: number;
  };
  /** Stops the loop, releases the WebGL2 context, removes the canvas and every
   *  listener. **Always call it**: a leaked chart holds a context and browsers
   *  evict the oldest past roughly sixteen — the symptom is a *different*
   *  chart going blank with no error. */
  remove(): void;
}

// ─── Entry points ────────────────────────────────────────────────────────────

/**
 * Mount a chart into `container`.
 *
 * Resolves to `null` when the browser has no WebGL2 — render your own message.
 * **Throws `IntegrityError`** when the engine artifacts are missing or do not
 * match their published digests: that is a deployment fault, not a browser the
 * user is stuck with.
 */
export function createChart(
  container: HTMLElement,
  options?: ChartOptions,
): Promise<ChartApi | null>;

/** Thrown when `knv2lw.wasm` / `knv2lw.js` cannot be fetched or fail their digest check. */
export class IntegrityError extends Error {
  name: 'IntegrityError';
}

export const version: string;
export const ENGINE_VERSION: string;
export const ENGINE_WASM_SHA256: string;
export const ENGINE_GLUE_SHA256: string;
