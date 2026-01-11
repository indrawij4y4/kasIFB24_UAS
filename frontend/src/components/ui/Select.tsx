import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: { label: string; value: string | number }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, value, ...props }, ref) => {
        const isFloating = value !== "" && value !== undefined;
        return (
            <div className="relative mb-6">
                <div className="floating-label-group relative">
                    <select
                        className={cn(
                            "peer block w-full rounded-xl border-2 border-border bg-background px-4 pt-6 pb-2 pr-10 text-lg font-medium text-foreground outline-none transition-all focus:border-primary focus:bg-background disabled:opacity-50 appearance-none hover:border-muted-foreground/20 truncate",
                            error && "border-destructive focus:border-destructive bg-destructive/10",
                            className
                        )}
                        ref={ref}
                        value={value}
                        {...props}
                    >
                        <option value="" disabled hidden></option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <label
                        className={cn(
                            "absolute left-4 top-4 text-muted-foreground transition-all pointer-events-none",
                            "peer-focus:top-[0.4rem] peer-focus:text-[0.7rem] peer-focus:font-bold peer-focus:text-primary",
                            // If floating manually (due to value) or via valid peer (fallback)
                            (isFloating) && "top-[0.4rem] text-[0.7rem] font-bold text-primary",
                            // Keep peer-valid as backup (though manual check covers it)
                            "peer-valid:top-[0.4rem] peer-valid:text-[0.7rem] peer-valid:font-bold peer-valid:text-primary",
                            error && "text-destructive peer-focus:text-destructive peer-valid:text-destructive"
                        )}
                    >
                        {label}
                    </label>
                    <div className="absolute right-4 top-6 pointer-events-none text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1 text-xs font-bold text-rose-500 flex items-center gap-1 animate-shake">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
