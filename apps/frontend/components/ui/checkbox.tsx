"use client";

import * as React from "react";

type CheckboxProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  id?: string;
};

export function Checkbox({ checked, onCheckedChange, label, id }: CheckboxProps) {
  const checkboxId = id ?? React.useId();
  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer h-5 w-5 appearance-none rounded border border-border-strong bg-white checked:bg-primary checked:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        />
        <svg
          className="pointer-events-none absolute hidden h-3 w-3 text-white peer-checked:block"
          viewBox="0 0 12 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {label && <span className="text-sm text-neutral-700">{label}</span>}
    </label>
  );
}
