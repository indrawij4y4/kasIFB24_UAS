import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    rightIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ className, type, label, error, rightIcon, leftIcon, placeholder: _placeholder, ...props }, ref) => {
        return (
            <div className="relative mb-6">
                <div className="floating-label-group relative">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "peer block w-full rounded-xl border-2 border-border bg-background px-4 pt-6 pb-2 text-base font-medium text-foreground outline-none transition-all placeholder-shown:border-border focus:border-primary focus:bg-background disabled:opacity-50",
                            leftIcon && "pl-12",
                            rightIcon && "pr-10",
                            error && "border-destructive focus:border-destructive bg-destructive/10",
                            className
                        )}
                        placeholder=" "
                        ref={ref}
                        {...props}
                    />
                    <label
                        className={cn(
                            "absolute text-muted-foreground transition-all pointer-events-none bg-background px-1",
                            leftIcon ? "left-11" : "left-3",
                            // Default position (when empty/placeholder shown)
                            "top-4 text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-base",
                            // Focused position
                            "peer-focus:top-1 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary",
                            // When has value (not placeholder shown)
                            "peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-primary",
                            error && "text-rose-500 peer-focus:text-rose-500 peer-[:not(:placeholder-shown)]:text-rose-500"
                        )}
                    >
                        {label}
                    </label>
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
