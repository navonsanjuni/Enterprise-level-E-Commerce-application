import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "../cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean;
}

/**
 * Editorial checkbox — neutral square outline that fills charcoal when
 * checked. Custom-rendered (visually hidden native input + decorative
 * box) so we keep keyboard/screen-reader semantics intact.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, hasError, checked, ...props }, ref) => {
    return (
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none flex h-4 w-4 items-center justify-center border transition-colors duration-300 ease-editorial",
            hasError
              ? "border-burgundy"
              : "border-charcoal/40 peer-hover:border-charcoal peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-cream",
            checked && !hasError && "border-charcoal bg-charcoal",
            className,
          )}
        >
          {checked ? (
            <Check className="h-3 w-3 text-cream" strokeWidth={3} />
          ) : null}
        </span>
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
