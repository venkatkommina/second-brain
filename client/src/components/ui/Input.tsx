import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{
            borderWidth: "1px",
            borderColor: "hsl(var(--input))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            borderStyle: "solid",
            "--tw-ring-color": "hsl(var(--ring))",
            "--tw-ring-offset-color": "hsl(var(--background))",
          } as React.CSSProperties}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input }; 