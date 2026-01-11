import { Home, Grid3x3, ClipboardList, Trophy, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

const navItems = [
    { id: "dashboard", label: "Home", icon: Home, path: "/" },
    { id: "matrix", label: "Matrix", icon: Grid3x3, path: "/matrix" },
    { id: "report", label: "Laporan", icon: ClipboardList, path: "/report" },
    { id: "leaderboard", label: "Leader", icon: Trophy, path: "/leaderboard" },
    { id: "settings", label: "Setup", icon: Settings, path: "/settings" },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[80px] flex justify-around items-center z-50 pb-[env(safe-area-inset-bottom)] md:hidden px-2 backdrop-blur-xl bg-background/80 dark:bg-background/80 border-t border-border shadow-lg">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-1 flex-1 h-14 rounded-2xl transition-all cursor-pointer",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}

                        <div className="relative z-10 flex flex-col items-center gap-0.5">
                            <item.icon className={cn("w-6 h-6 transition-all", isActive && "stroke-[2.5px] scale-105")} />
                            <span className={cn("text-[10px] font-bold transition-all", isActive ? "scale-105" : "scale-100")}>
                                {item.label}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
