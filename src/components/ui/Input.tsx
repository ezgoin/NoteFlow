"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClassName = "", className = "", id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className={["flex flex-col gap-1.5", wrapperClassName].join(" ")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary select-none"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-accent",
            error
              ? "border-danger focus:ring-danger/40 focus:border-danger"
              : "border-border-strong",
            rest.disabled ? "opacity-50 cursor-not-allowed bg-surface-secondary" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
