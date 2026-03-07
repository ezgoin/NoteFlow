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
        "relative flex items-center rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30",
        className,
      ].join(" ")}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3 text-gray-400"
      />

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent py-2 pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        aria-label="Search"
      />

      {internalValue.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute right-2 rounded p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
