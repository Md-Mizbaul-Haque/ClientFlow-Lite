export const ICON_VIEWBOX = "0 0 24 24";

export const DEFAULT_ICON_SIZE = 24;
export const ICON_SIZES = [16, 20, 24, 28, 32] as const;

export const PRIMARY_STROKE_WIDTH = 1.75;
export const SMALL_STROKE_WIDTH = 1.5;
export const SMALL_STROKE_THRESHOLD = 16;

export const FLOW_NODE_RADIUS = 1.1;
export const SMALL_FLOW_NODE_RADIUS = 1;

export function strokeForSize(size: number) {
  return size <= SMALL_STROKE_THRESHOLD ? SMALL_STROKE_WIDTH : PRIMARY_STROKE_WIDTH;
}

export function nodeRadiusForSize(size: number) {
  return size <= SMALL_STROKE_THRESHOLD ? SMALL_FLOW_NODE_RADIUS : FLOW_NODE_RADIUS;
}