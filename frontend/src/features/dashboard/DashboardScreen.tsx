import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { api, pemasukanApi } from "../../services/api";
import { Loader2, AlertCircle, Plus, UserPlus, Receipt, Wallet, ArrowUpCircle, ArrowDownCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { REALTIME_INTERVAL } from "../../config";

// Styled Components
function StatCard({
    title,
    value,
    icon: Icon,
    type = "neutral",
    trend
}: {
    title: string;
    value: string;
    icon: any;
    type?: "neutral" | "income" | "expense" | "balance";
    trend?: string;
}) {
    const iconStyles = {
        neutral: "bg-muted text-muted-foreground",
        income: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
        expense: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500",
        balance: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500"
    };

    const valueColor = {
        neutral: "text-foreground",
        income: "text-emerald-700 dark:text-emerald-400",
        expense: "text-rose-700 dark:text-rose-400",
        balance: "text-blue-700 dark:text-blue-400"
    };

    return (
        <div className="group relative p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-[0_0_20px_rgba(30,58,138,0.1)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 hover:scale-[1.02] h-full flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", iconStyles[type])}>
                    <Icon className="w-6 h-6 stroke-[2px]" />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold px-2 py-1 bg-muted text-muted-foreground rounded-full border border-border">
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {title}
                </p>
                <h3 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight", valueColor[type])}>
                    {value}
                </h3>
            </div>
            {/* Decorative gradient blob with linear gradient for smoothness */}
            <div className={cn(
                "absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20",
                type === 'balance' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                    type === 'income' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                        type === 'expense' ? 'bg-gradient-to-br from-rose-400 to-rose-600' :
                            'bg-gradient-to-br from-slate-200 to-slate-400'
            )} />
        </div>
    );
}

function PaymentStatusCard({ unpaidWeeks, weeklyFee }: { unpaidWeeks: number; weeklyFee: number }) {
    const hasSettings = weeklyFee > 0;
    const isPaid = unpaidWeeks === 0;

    return (
        <div className={cn(
            "p-6 rounded-3xl border shadow-sm flex flex-col justify-center h-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-card border-border"
        )}>
            <div className="flex items-start gap-5 relative z-10">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                    !hasSettings ? "bg-muted text-muted-foreground" :
                        isPaid ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500"
                )}>
                    {!hasSettings ? <AlertCircle className="w-7 h-7 stroke-[2.5px]" /> :
                        isPaid ? <CheckCircle2 className="w-7 h-7 stroke-[2.5px]" /> : <XCircle className="w-7 h-7 stroke-[2.5px]" />}
                </div>
                <div>
                    <p className={cn(
                        "text-xs font-bold uppercase tracking-widest mb-2",
                        !hasSettings ? "text-muted-foreground" :
                            isPaid ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"
                    )}>
                        Tagihan Kas Pribadi
                    </p>
                    <h3 className={cn(
                        "text-xl font-black mb-1",
                        !hasSettings ? "text-foreground" :
                            isPaid ? "text-emerald-950 dark:text-emerald-50" : "text-rose-950 dark:text-rose-50"
                    )}>
                        {!hasSettings ? "Belum Ada Tagihan" :
                            isPaid ? "Lunas Semua" : `Tunggakan ${unpaidWeeks} Minggu`}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                        {!hasSettings ? "Menunggu pengaturan dari admin" :
                            isPaid
                                ? "Terima kasih, pembayaran aman!"
                                : `Tagihan: Rp ${(unpaidWeeks * weeklyFee).toLocaleString('id-ID')}`
                        }
                    </p>
                </div>
            </div>
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2",
                !hasSettings ? "bg-slate-400" :
                    isPaid ? "bg-emerald-500" : "bg-rose-500"
            )} />
        </div>
    );
}


function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="bg-card w-full rounded-t-[40px] p-8 pb-12 shadow-2xl relative z-10 border-t border-border"
                    >
                        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { navigate('/admin/in'); onClose(); }} className="group p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                                <div className="w-12 h-12 bg-background dark:bg-card rounded-2xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Input Iuran</span>
                            </button>
                            <button onClick={() => { navigate('/arrears'); onClose(); }} className="group p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                <div className="w-12 h-12 bg-background dark:bg-card rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 tracking-wider">Quick Iuran</span>
                            </button>
                            <button onClick={() => { navigate('/admin/out'); onClose(); }} className="group p-5 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/40 col-span-2">
                                <div className="w-12 h-12 bg-background dark:bg-card rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-sm group-hover:scale-110 transition-transform">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-rose-800 dark:text-rose-300 tracking-wider">Belanja</span>
                            </button>
                        </div>
                        <button onClick={onClose} className="w-full mt-10 py-4 text-muted-foreground font-bold uppercase text-xs hover:text-foreground transition-colors">Tutup Menu</button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DashboardScreen() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const navigate = useNavigate();

    // Auto-refresh interval for realtime updates
    // Imported from config to ensure consistency across the app


    const { data, isLoading } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: api.getStats,
        staleTime: 1000, // Reduced to 1s for snappier feeling
        refetchInterval: REALTIME_INTERVAL, // 3000ms from config
    });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data: students } = useQuery({
        queryKey: ["students", currentMonth, currentYear],
        queryFn: () => api.getStudents(currentMonth, currentYear),
        staleTime: 1000,
        refetchInterval: REALTIME_INTERVAL,
    });

    const { data: settings } = useQuery({
        queryKey: ["settings", currentMonth, currentYear],
        queryFn: () => api.getSettings(currentMonth, currentYear),
        staleTime: 30 * 1000, // Settings change less frequently
        refetchInterval: 30 * 1000, // Refresh settings every 30 seconds
    });

    // Fetch recent transactions for history section
    const { data: transactions } = useQuery({
        queryKey: ["recentTransactions"],
        queryFn: () => api.getTransactions(),
        staleTime: 1000,
        refetchInterval: REALTIME_INTERVAL, // Realtime updates for activities
    });

    // Fetch recent income for history section
    const { data: incomeList } = useQuery({
        queryKey: ["recentIncome", currentMonth, currentYear],
        queryFn: () => pemasukanApi.getList(currentMonth, currentYear),
        staleTime: 1000,
        refetchInterval: REALTIME_INTERVAL, // Realtime updates for activities
    });

    // Combine income and expense transactions, sorted by date (newest first)
    const combinedTransactions = (() => {
        const incomeItems = (incomeList || []).map((item: any) => ({
            id: `income-${item.id}`,
            title: item.nama,
            date: item.tanggal || '-',
            amount: item.nominal,
            type: 'income' as const,
            week: item.minggu_ke,
            createdAt: item.created_at,
        }));

        const expenseItems = (transactions || []).map((t: any) => ({
            id: `expense-${t.id}`,
            title: t.title,
            date: t.date,
            amount: t.amount,
            type: 'expense' as const,
            createdAt: t.createdAt,
        }));

        // Combine and sort by createdAt (newest first), falling back to date if missing
        return [...incomeItems, ...expenseItems]
            .sort((a, b) => {
                // Try to sort by full timestamp first
                const timeA = new Date(a.createdAt || a.date).getTime();
                const timeB = new Date(b.createdAt || b.date).getTime();
                return timeB - timeA;
            })
            .slice(0, 3); // Show only 3 latest
    })();

    // Calculate unpaid weeks count
    const unpaidWeeks = (() => {
        if (!students || !user || !settings) return 0;
        const student = students.find(s => s.nim === user.nim);
        if (!student) return 0;

        const fee = settings.weeklyFee;
        let count = 0;

        // Check each week
        if (student.m1 < fee) count++;
        if (student.m2 < fee) count++;
        if (student.m3 < fee) count++;
        if (student.m4 < fee) count++;
        if (settings.weeksPerMonth === 5 && student.m5 < fee) count++;

        return count;
    })();

    if (isLoading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 pb-32 animate-fadeIn max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[20px] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        {user?.name?.[0]}
                    </div>
                    <div>
                        <span
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block border",
                                isAdmin ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-blue-50 text-blue-500 border-blue-100"
                            )}
                        >
                            {isAdmin ? "Bendahara" : "Anggota"}
                        </span>
                        <h3 className="font-bold text-foreground text-xl leading-none">
                            Halo, {user?.name?.split(' ')[0]} 👋
                        </h3>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>
                                Iuran {new Date().toLocaleString('id-ID', { month: 'long' })}: Rp {(settings?.weeklyFee ?? 0).toLocaleString('id-ID')} / minggu
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Stats Grid - Mobile Carousel */}
            {/* Mobile: Horizontal Scroll, Desktop: 3 Columns Grid */}
            {/* Main Stats Grid - Mobile Carousel */}
            {/* Mobile: Horizontal Scroll, Desktop: 3 Columns Grid */}
            <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:pb-0 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide mb-8">
                {/* Balance Card */}
                <div className="min-w-[85vw] md:min-w-0 md:col-span-1 snap-center h-full">
                    <StatCard
                        title="Saldo Kas"
                        value={`Rp ${data.balance.toLocaleString("id-ID")}`}
                        icon={Wallet}
                        type="balance"
                    />
                </div>

                {/* Income Card */}
                <div className="min-w-[85vw] md:min-w-0 md:col-span-1 snap-center h-full">
                    <StatCard
                        title="Pemasukan (Bln)"
                        value={`Rp ${data.incomeThisMonth?.toLocaleString("id-ID") ?? 0}`}
                        icon={ArrowUpCircle}
                        type="income"
                    />
                </div>

                {/* Expense Card */}
                <div className="min-w-[85vw] md:min-w-0 md:col-span-1 snap-center h-full">
                    <StatCard
                        title="Pengeluaran (Bln)"
                        value={`Rp ${data.expenseThisMonth?.toLocaleString("id-ID") ?? 0}`}
                        icon={ArrowDownCircle}
                        type="expense"
                    />
                </div>
            </div>

            {/* Status and Shortcuts Grid - Balanced 50/50 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
                {/* Payment Status */}
                <div className="h-full">
                    <PaymentStatusCard unpaidWeeks={unpaidWeeks} weeklyFee={settings?.weeklyFee ?? 0} />
                </div>

                {/* Admin Shortcuts / Toggles */}
                <div className="h-full">
                    {isAdmin ? (
                        <div
                            onClick={() => navigate('/arrears')}
                            className="group h-full bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                                    !settings?.weeklyFee ? "bg-muted text-muted-foreground" :
                                        data.arrearsCount === 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" :
                                            "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                                )}>
                                    {!settings?.weeklyFee ? (
                                        <AlertCircle className="w-7 h-7" />
                                    ) : data.arrearsCount === 0 ? (
                                        <CheckCircle2 className="w-7 h-7" />
                                    ) : (
                                        <AlertCircle className="w-7 h-7" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-lg mb-1">
                                        {!settings?.weeklyFee ? "Atur Kas Dulu" :
                                            data.arrearsCount === 0 ? "Lunas Semua 🎉" :
                                                "Cek Tunggakan"}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {!settings?.weeklyFee ? (
                                            <span className="text-muted-foreground">Silakan atur pengaturan kas terlebih dahulu</span>
                                        ) : data.arrearsCount === 0 ? (
                                            <span className="text-emerald-500 font-bold">Semua anggota sudah lunas!</span>
                                        ) : (
                                            <><span className="text-rose-500 font-bold">{data.arrearsCount} Siswa</span> belum lunas minggu ini</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 rounded-full bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                                <ArrowUpCircle className="w-5 h-5 rotate-90" />
                            </div>
                        </div>
                    ) : (
                        // Placeholder for non-admins to keep balance if needed, or maybe just a quote
                        <div className="h-full bg-muted/50 p-6 rounded-3xl border border-border flex flex-col justify-center items-center text-center">
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xs">
                                "Transparansi adalah fondasi kepercayaan. Kami berkomitmen untuk pengelolaan kas yang terbuka dan akuntabel."
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transaction History */}
            <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="font-black text-muted-foreground text-xs tracking-widest uppercase flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Aktivitas Terbaru
                    </h4>
                    <button
                        onClick={() => navigate('/report')}
                        className="text-primary text-xs font-bold hover:underline bg-primary/10 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/20"
                    >
                        Lihat Semua
                    </button>
                </div>

                <div className="space-y-4">
                    {combinedTransactions && combinedTransactions.length > 0 ? (
                        combinedTransactions.map((t) => {
                            // Format date for display
                            let displayDate = t.date;
                            try {
                                const dateObj = new Date(t.date);
                                if (!isNaN(dateObj.getTime())) {
                                    displayDate = dateObj.toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    });
                                }
                            } catch (e) {
                                // Keep original
                            }

                            return (
                                <div
                                    key={t.id}
                                    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-accent/50 dark:hover:bg-accent/20 transition-colors border border-transparent hover:border-border"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            t.type === 'expense'
                                                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                                                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            {t.type === 'expense'
                                                ? <ArrowDownCircle className="w-5 h-5" />
                                                : <ArrowUpCircle className="w-5 h-5" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground mb-0.5">
                                                {t.title}
                                                {t.type === 'income' && t.week && (
                                                    <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">M{t.week}</span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md w-fit">{displayDate}</p>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-sm font-black",
                                        t.type === 'expense' ? "text-rose-500" : "text-emerald-500"
                                    )}>
                                        {t.type === 'expense' ? '-' : '+'} Rp {t.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Receipt className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground">Belum ada aktivitas</p>
                            <p className="text-xs text-muted-foreground/50 mt-1">Transaksi terbaru akan muncul di sini</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin FAB - Lifted for Mobile Nav */}
            {isAdmin && (
                <>
                    <button
                        onClick={() => setShowAdminPanel(true)}
                        className="fixed bottom-24 right-4 md:bottom-12 md:right-12 w-14 h-14 md:w-16 md:h-16 bg-blue-600 dark:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-40 border-[4px] border-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                    >
                        <Plus className="w-6 h-6 md:w-7 md:h-7 stroke-[3px]" />
                    </button>
                    <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
                </>
            )}
        </div>
    );
}
