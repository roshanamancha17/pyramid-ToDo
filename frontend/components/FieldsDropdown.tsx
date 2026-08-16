'use client';

import { useState, useRef, useEffect } from 'react';
import { Columns3 } from 'lucide-react';

export interface FieldOption {
  key: string;
  label: string;
}

export function FieldsDropdown({
  options,
  visible,
  onToggle,
}: {
  options: FieldOption[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-surface-2"
      >
        <Columns3 className="h-3.5 w-3.5" />
        Fields
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-20">
          {options.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visible.has(opt.key)}
                onChange={() => onToggle(opt.key)}
                className="accent-current"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
