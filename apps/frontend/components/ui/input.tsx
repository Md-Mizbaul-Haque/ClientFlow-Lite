import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  requiredMark?: boolean;
  error?: string;
};

export function Input({ label, requiredMark, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-0.5">
        <label className="text-sm font-medium text-neutral-900">{label}</label>
        {requiredMark && <span className="text-error text-sm">*</span>}
      </div>
      <div
        className={`flex items-center gap-2.5 rounded-md border bg-white px-5 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${
          error ? "border-error" : "border-border"
        }`}
      >
        <input
          className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none autofill:bg-white"
          {...props}
        />
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
