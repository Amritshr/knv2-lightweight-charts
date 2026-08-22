// Type definitions for knv2-lightweight-charts/react
import type { CSSProperties, Ref } from 'react';
import type {
  ChartApi,
  ChartOptions,
  LWBar,
  LWDrawingEvent,
  LWHover,
  LWTool,
} from './knv2-lightweight-charts';

export interface KNv2ChartProps extends Omit<ChartOptions, 'autoSize'> {
  bars?: readonly LWBar[];
  /** Armed drawing tool. `'none'` disarms. */
  tool?: LWTool;
  /** Fires on a change of hovered bar, not per mouse move. `null` on leave. */
  onCrosshairMove?: (hover: LWHover | null) => void;
  onDrawingChange?: (id: number, event: LWDrawingEvent, api: ChartApi) => void;
  /** Called once the chart exists — `null` when WebGL2 is missing or the
   *  engine failed to load. */
  onReady?: (api: ChartApi | null) => void;
  className?: string;
  /** The container needs a real height; the component defaults to 400px. */
  style?: CSSProperties;
  ref?: Ref<ChartApi | null>;
}

/**
 * A React wrapper over `createChart`. `react` and `react-dom` are peer
 * dependencies and are not bundled.
 */
export default function KNv2Chart(props: KNv2ChartProps): JSX.Element;

export type { ChartApi, ChartOptions, LWBar, LWDrawingEvent, LWHover, LWTool };
