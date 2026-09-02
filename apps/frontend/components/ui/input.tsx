import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  requiredMark?: boolean;
  error?: string;
};

export function Input({ label, requiredMark, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        {requiredMark && <span className="text-error text-sm">*</span>}
      </div>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${
          error ? "border-error" : "border-border"
        }`}
      >
        <input
          className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none autofill:bg-white"
          {...props}
        />
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
