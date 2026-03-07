"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1.5 rounded-md",
  md: "px-3.5 py-1.5 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base gap-2.5 rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 select-none",
          variantStyles[variant],
          sizeStyles[size],
          isDisabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading && (
          <Loader2
            className="animate-spin shrink-0"
            size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
