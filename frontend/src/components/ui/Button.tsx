import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-[20px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-96",
                    {
                        "bg-primary text-white shadow-xl shadow-blue-900/20 hover:bg-primary-light": variant === "primary",
                        "bg-slate-100 text-slate-800 hover:bg-slate-200": variant === "secondary",
                        "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-900/20": variant === "danger",
                        "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-900/20": variant === "success",
                        "bg-transparent hover:bg-slate-100 text-slate-600": variant === "ghost",
                        "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600": variant === "outline",
                        "h-14 px-8 py-5 text-lg": size === "default",
                        "h-10 px-4 text-sm rounded-xl": size === "sm",
                        "h-16 px-8 text-xl": size === "lg",
                        "h-14 w-14 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
