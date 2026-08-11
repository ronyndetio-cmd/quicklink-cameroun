import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * A field that works both ways: type freely, or click the chevron / focus
 * the field to pick from a dropdown list. Selecting an option always sets
 * the exact option text; typing without picking just passes the raw text
 * through (the caller decides what to do with an unmatched value).
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const q = value.trim().toLowerCase();
  const filtered = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 80);

  return (
    <div ref={rootRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border border-ink-200 bg-white pl-3.5 pr-8 text-sm text-ink-900
          placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:bg-surface ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 transition-transform"
        style={{ transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)` }}
        aria-hidden
      >
        <ChevronDown size={14} />
      </button>

      {open && filtered.length > 0 && (
        <div className="a-rise absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-ink-200 bg-white p-1 shadow-lift dark:bg-surface">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
