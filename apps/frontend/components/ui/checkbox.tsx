"use client";

import { Check } from "lucide-react";
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
        <Check
          size={12}
          strokeWidth={3}
          aria-hidden="true"
          className="pointer-events-none absolute hidden text-white peer-checked:block"
        />
      </div>
      {label && <span className="text-sm text-neutral-700">{label}</span>}
    </label>
  );
}
