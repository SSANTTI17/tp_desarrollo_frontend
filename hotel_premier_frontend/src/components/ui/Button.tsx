import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-legacy-primary text-white hover:brightness-110",
    secondary: "bg-legacy-secondary text-legacy-text hover:brightness-95",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`
        px-6 py-2 rounded-full font-medium transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
