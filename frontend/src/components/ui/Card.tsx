import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "bg-white rounded-[24px] border border-slate-100 shadow-sm p-5",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

export { Card };
