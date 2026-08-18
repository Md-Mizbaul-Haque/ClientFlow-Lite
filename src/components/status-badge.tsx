import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {label ?? status.replaceAll("_", " ")}
    </Badge>
  );
}