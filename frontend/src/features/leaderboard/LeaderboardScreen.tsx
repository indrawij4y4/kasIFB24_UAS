import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Loader2, TrendingUp, ShieldCheck, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';


export function LeaderboardScreen() {


    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: api.getLeaderboard,
    });

    if (isLoading || !leaderboard) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Re-order for Podium: 2, 1, 3 (Silver, Gold, Bronze)
    // We need to safely handle cases where there are fewer than 3 items
    const gold = leaderboard[0];
    const silver = leaderboard[1];
    const bronze = leaderboard[2];

    // Filter out undefined items for the podium loop
    const podiumItems = [silver, gold, bronze].filter(item => item !== undefined);

    // The rest of the list
    const rest = leaderboard.slice(3);

    const getPodiumStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return {
                    height: 'h-48 md:h-56',
                    order: 'order-2',
                    gradient: 'bg-gradient-to-b from-yellow-200 via-yellow-100 to-white dark:from-yellow-600/20 dark:via-yellow-700/10 dark:to-transparent',
                    border: 'border-yellow-200 dark:border-yellow-600/30',
                    text: 'text-yellow-700 dark:text-yellow-500',
                    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600/30',
                    shadow: 'shadow-yellow-500/10',
                    ring: 'ring-4 ring-yellow-50 dark:ring-yellow-900/20',
                    label: '1st'
                };
            case 2:
                return {
                    height: 'h-40 md:h-44',
                    order: 'order-1',
                    gradient: 'bg-gradient-to-b from-slate-200 via-slate-100 to-white dark:from-slate-700/30 dark:via-slate-800/20 dark:to-transparent',
                    border: 'border-slate-200 dark:border-slate-700/50',
                    text: 'text-slate-600 dark:text-slate-400',
                    badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
                    shadow: 'shadow-slate-500/10',
                    ring: 'ring-0',
                    label: '2nd'
                };
            case 3:
                return {
                    height: 'h-36 md:h-40',
                    order: 'order-3',
                    gradient: 'bg-gradient-to-b from-orange-200 via-orange-100 to-white dark:from-orange-800/20 dark:via-orange-900/10 dark:to-transparent',
                    border: 'border-orange-200 dark:border-orange-700/30',
                    text: 'text-orange-700 dark:text-orange-500',
                    badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/30',
                    shadow: 'shadow-orange-500/10',
                    ring: 'ring-0',
                    label: '3rd'
                };
            default:
                return { height: '', order: '', gradient: '', border: '', text: '', badge: '', shadow: '', ring: '', label: '' };
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32 max-w-7xl mx-auto font-sans">
            {/* Professional Header */}
            <div className="bg-card px-6 pt-8 pb-10 border-b border-border">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Periode {new Date().getFullYear()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Top Contributors</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                            Apresiasi untuk siswa dengan kontribusi iuran paling konsisten.
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-xs font-semibold text-muted-foreground">Total Participants</span>
                        <p className="text-lg font-bold text-foreground">{leaderboard.length} Siswa</p>
                    </div>
                </div>
            </div>

            {/* Podium Section */}
            {podiumItems.length > 0 && (
                <div className="px-6 -mt-6 mb-8">
                    <div className="flex items-end justify-center gap-3 md:gap-6 max-w-lg mx-auto">
                        {podiumItems.map((item) => {
                            // Find actual original rank from the main list
                            const originalIndex = leaderboard.indexOf(item);
                            const rank = originalIndex + 1;

                            const style = getPodiumStyle(rank);

                            return (
                                <motion.div
                                    key={item.nim}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: rank * 0.15, type: "spring", stiffness: 100 }}
                                    className={cn(
                                        "relative flex-1 min-w-[100px] flex flex-col justify-end",
                                        style.order
                                    )}
                                >
                                    {/* Avatar Floating */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                                        <div className={cn(
                                            "w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold border-4 bg-white shadow-lg",
                                            style.border,
                                            style.text,
                                            style.ring
                                        )}>
                                            {item.name.charAt(0)}
                                        </div>
                                        {rank === 1 && (
                                            <div className="absolute -top-6">
                                                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Podium Block */}
                                    <div className={cn(
                                        "w-full rounded-t-2xl p-4 pt-10 flex flex-col items-center text-center border-t border-x bg-card",
                                        style.height,
                                        style.gradient,
                                        style.border,
                                        style.shadow
                                    )}>
                                        <h3 className={cn("text-2xl font-black mb-1 opacity-20 select-none", style.text)}>
                                            {style.label}
                                        </h3>

                                        <div className="mt-auto pb-2 w-full">
                                            <p className="text-sm font-bold text-foreground line-clamp-1 px-1 mb-1 truncate w-full">
                                                {item.name.split(' ')[0]}
                                            </p>
                                            <p className={cn("text-xs font-bold", style.text)}>
                                                Rp {(item.amount / 1000)}k
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List Section (Rank 4+) */}
            {rest.length > 0 && (
                <div className="px-4 max-w-2xl mx-auto pb-20">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Runner Ups</span>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        {rest.map((item, index) => (
                            <div
                                key={item.nim}
                                className={cn(
                                    "flex items-center px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-default",
                                    index !== rest.length - 1 ? "border-b border-border" : ""
                                )}
                            >
                                {/* Rank */}
                                <div className="w-8 font-mono text-sm font-medium text-slate-400">
                                    {String(index + 4).padStart(2, '0')}
                                </div>

                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-lg bg-slate-100 mr-3 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {item.name.charAt(0)}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {item.name}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground font-mono">
                                        Rp {item.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {leaderboard.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Data leaderboard belum tersedia</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">Belum ada transaksi yang tercatat</p>
                </div>
            )}
        </div>
    );
}
