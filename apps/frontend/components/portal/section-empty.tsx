import type { LucideIcon } from "lucide-react";

export function SectionEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <p className="max-w-[380px] text-sm text-neutral-500">{description}</p>
    </div>
  );
}
