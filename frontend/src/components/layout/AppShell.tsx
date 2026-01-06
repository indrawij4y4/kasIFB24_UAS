import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { cn } from "../../lib/utils";

export function AppShell() {
    const location = useLocation();
    const isAuthPage = ["/login", "/change-password"].includes(location.pathname);

    return (
        <div className="min-h-screen font-sans flex text-slate-900">
            {!isAuthPage && <Sidebar />}

            <main className={cn("flex-1 min-w-0 transition-all duration-300 ease-in-out", !isAuthPage && "md:ml-64")}>
                <div className={cn(
                    "min-h-screen mx-auto",
                    !isAuthPage && "pb-[100px] md:pb-0 md:pt-6 md:px-8 max-w-7xl"
                )}>
                    <Outlet />
                </div>
            </main>

            {!isAuthPage && <BottomNav />}
        </div>
    );
}
