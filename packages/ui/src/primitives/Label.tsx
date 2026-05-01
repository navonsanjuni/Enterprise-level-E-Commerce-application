import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Floating label — sits above the input when focused or filled, drops into
 * placeholder position when empty. Uses peer selectors driven by the
 * sibling `<Input />` (which carries `placeholder-transparent`).
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "pointer-events-none absolute left-0 top-2 text-xs uppercase tracking-[0.16em] text-slate-muted transition-all duration-300 ease-editorial",
          "peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-placeholder-shown:text-slate-muted/70",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.16em] peer-focus:text-charcoal",
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";
