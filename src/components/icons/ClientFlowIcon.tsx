import type { SVGProps } from "react";
import {
  DEFAULT_ICON_SIZE,
  ICON_VIEWBOX,
  nodeRadiusForSize,
  strokeForSize,
} from "./icon-config";
import { icons, type IconDefinition } from "./icons";

export type IconName = keyof typeof icons;

export interface ClientFlowIconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ClientFlowIcon({
  name,
  size = DEFAULT_ICON_SIZE,
  strokeWidth,
  label,
  className,
  ...props
}: ClientFlowIconProps) {
  const def = icons[name] as IconDefinition;
  const stroke = strokeWidth ?? strokeForSize(size);
  const nodeRadius = nodeRadiusForSize(size);
  const accessible = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };

  return (
    <svg
      viewBox={ICON_VIEWBOX}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...accessible}
      {...props}
    >
      {def.paths.map((d) => (
        <path key={d} d={d} />
      ))}
      {def.nodes?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r ?? nodeRadius} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}