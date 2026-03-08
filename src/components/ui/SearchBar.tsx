"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  /** Current value (controlled). Falls back to internal state when omitted. */
  value?: string;
  /** Called with the debounced search value. */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce delay in milliseconds. @default 300 */
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = "Search\u2026",
  debounceMs = 300,
  className = "",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync if the parent changes the controlled value.
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const emitChange = useCallback(
    (next: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(next);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Cleanup timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInternalValue(next);
    emitChange(next);
  };

  const handleClear = () => {
    setInternalValue("");
    onChange("");
    if (timerRef.current) clearTimeout(timerRef.current);
    inputRef.current?.focus();
  };

  return (
    <div
      className={[
        "relative flex items-center rounded-lg border border-border bg-surface-secondary transition-colors focus-within:border-accent focus-within:bg-surface focus-within:ring-2 focus-within:ring-ring/30",
        className,
      ].join(" ")}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3 text-text-tertiary"
      />

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none"
        aria-label="Search"
      />

      {internalValue.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute right-2 rounded p-0.5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
