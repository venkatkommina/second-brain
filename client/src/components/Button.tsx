import React from "react";

interface ButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  variant: "primary" | "secondary";
  onClick: () => void;
  icon?: React.ReactNode;
}

export const Button = (props: ButtonProps) => {
  const { text, size = "md", variant = "primary", onClick, icon } = props;
  const baseClasses =
    "rounded-xl font-medium inline-flex items-center gap-2 transition duration-200 cursor-pointer";

  const sizeClasses = {
    sm: "text-sm px-3 py-2",
    md: "text-md px-4 py-2.5",
    lg: "text-lg px-6 py-3",
  };

  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {icon && <span>{icon}</span>}
      {text}
    </button>
  );
};
