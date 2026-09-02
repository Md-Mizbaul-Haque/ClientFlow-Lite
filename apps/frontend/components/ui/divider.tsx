export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-border-light" />
      <span className="text-sm text-neutral-500 whitespace-nowrap">{text}</span>
      <div className="h-px flex-1 bg-border-light" />
    </div>
  );
}
