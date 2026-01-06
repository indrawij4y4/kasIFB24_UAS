import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, rightIcon, ...props }, ref) => {
        return (
            <div className="relative mb-6">
                <div className="floating-label-group relative">
                    <input
                        type={type}
                        className={cn(
                            "peer block w-full rounded-t-xl border-b-2 border-border bg-background px-4 pt-6 pb-2 text-lg font-medium text-foreground outline-none transition-all placeholder-shown:border-border focus:border-primary focus:bg-background disabled:opacity-50",
                            error && "border-destructive focus:border-destructive bg-destructive/10",
                            className
                        )}
                        placeholder=" "
                        ref={ref}
                        {...props}
                    />
                    <label
                        className={cn(
                            "absolute left-4 top-4 text-muted-foreground transition-all peer-placeholder-shown:top-[1.1rem] peer-placeholder-shown:text-base peer-focus:top-[0.4rem] peer-focus:text-[0.7rem] peer-focus:font-bold peer-focus:text-primary pointer-events-none",
                            // Handle non-empty value if controlled externally (React logic needs careful peer usage or explicit controlled state styling, but placeholder=' ' trick works for native value presence)
                            "peer-[:not(:placeholder-shown)]:top-[0.4rem] peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-primary",
                            error && "text-rose-500 peer-focus:text-rose-500 peer-[:not(:placeholder-shown)]:text-rose-500"
                        )}
                    >
                        {label}
                    </label>
                    {rightIcon && (
                        <div className="absolute right-2 top-3">
                            {rightIcon}
                        </div>
                    )}
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
Input.displayName = "Input";

export { Input };
