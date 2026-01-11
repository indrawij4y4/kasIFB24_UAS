import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Loader2, CheckCircle2, Clock, AlertTriangle, Calendar, Search, Filter, MinusCircle } from 'lucide-react';

import { Select } from '../../components/ui/Select';
import { cn, getWeeksInMonth } from '../../lib/utils';
// Get current month and year
const currentMonth = new Date().getMonth() + 1; // 1-12
const currentYear = new Date().getFullYear();

// Week date ranges helper (Simulation for demo/aesthetic purposes)
const getWeekRange = (week: number, month: number, _year: number) => {
    // This is a simplified logic. In a real app, you'd calculate exact dates.
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const mName = monthNames[month - 1];
    if (week === 1) return `1-7 ${mName}`;
    if (week === 2) return `8-14 ${mName}`;
    if (week === 3) return `15-21 ${mName}`;
    if (week === 4) return `22-28 ${mName}`;
    return `29-End ${mName}`;
};

export function MatrixScreen() {
    // const { user } = useAuth(); // Unused
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid'>('all');

    // Calculate weeks for selected month (use current year)
    const weeksInSelectedMonth = getWeeksInMonth(currentYear, parseInt(selectedMonth) - 1);

    // Auto-refresh interval for realtime updates (10 seconds)
    const REALTIME_INTERVAL = 10 * 1000;

    const { data: students, isLoading } = useQuery({
        queryKey: ['students', selectedMonth, currentYear],
        queryFn: () => api.getStudents(parseInt(selectedMonth), currentYear),
        staleTime: 5 * 1000,
        refetchInterval: REALTIME_INTERVAL, // Realtime updates
    });

    const { data: settings } = useQuery({
        queryKey: ['settings', selectedMonth, currentYear],
        queryFn: () => api.getSettings(parseInt(selectedMonth), currentYear),
        staleTime: 30 * 1000, // Settings change less frequently
        refetchInterval: 30 * 1000, // Refresh every 30 seconds
    });

    // Check if this period is configured (has settings) OR has payment data
    const hasPayments = students && students.length > 0 && students.some(s =>
        (s.m1 || 0) + (s.m2 || 0) + (s.m3 || 0) + (s.m4 || 0) + (s.m5 || 0) > 0
    );
    const isPeriodConfigured = (settings && settings.weeklyFee > 0) || hasPayments;

    const getStatus = (amount: number) => {
        if (!settings) return 'pending';
        if (amount >= settings.weeklyFee) return 'paid';
        if (amount > 0) return 'partial';
        return 'unpaid';
    };


    // Filtered Students
    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter(s => {
            const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery);

            if (filterStatus === 'all') return matchesSearch;

            // Check if student has ANY unpaid weeks in current month
            if (!settings) return matchesSearch;
            const fee = settings.weeklyFee;
            const hasUnpaid = s.m1 < fee || s.m2 < fee || s.m3 < fee || s.m4 < fee || (weeksInSelectedMonth === 5 && s.m5 < fee);

            return matchesSearch && hasUnpaid;
        });
    }, [students, searchQuery, filterStatus, settings, weeksInSelectedMonth]);

    // Stats for Summary Cards
    const stats = useMemo(() => {
        if (!students || !settings) return { total: 0, fullyPaid: 0, hasArrears: 0 };

        const fee = settings.weeklyFee;
        let fullyPaidCount = 0;
        let arrearsCount = 0;

        students.forEach(s => {
            const isFullyPaid = s.m1 >= fee && s.m2 >= fee && s.m3 >= fee && s.m4 >= fee && (weeksInSelectedMonth < 5 || s.m5 >= fee);
            if (isFullyPaid) fullyPaidCount++;
            else arrearsCount++;
        });

        return {
            total: students.length,
            fullyPaid: fullyPaidCount,
            hasArrears: arrearsCount
        };
    }, [students, settings, weeksInSelectedMonth]);


    const renderStatus = (amount: number, weekIndex: number) => {
        if (!settings) return <span className="text-slate-300">-</span>;

        // Hide M5 if not active for this month
        if (weekIndex === 5 && weeksInSelectedMonth < 5) {
            return <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto" />;
        }

        const status = getStatus(amount);

        if (status === 'paid') {
            return (
                <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all hover:scale-110 cursor-pointer">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                </div>
            );
        }
        if (status === 'partial') {
            return (
                <div className="flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-all hover:scale-110 cursor-pointer" title="Dicicil (Belum Lunas)">
                        <Clock className="w-3.5 h-3.5" />
                    </div>
                </div>
            );
        }

        // Unpaid - Less intrusive style
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground cursor-pointer">
                    <MinusCircle className="w-4 h-4" />
                </div>
            </div>
        );
    };

    const months = [
        { label: 'Januari', value: '1' },
        { label: 'Februari', value: '2' },
        { label: 'Maret', value: '3' },
        { label: 'April', value: '4' },
        { label: 'Mei', value: '5' },
        { label: 'Juni', value: '6' },
        { label: 'Juli', value: '7' },
        { label: 'Agustus', value: '8' },
        { label: 'September', value: '9' },
        { label: 'Oktober', value: '10' },
        { label: 'November', value: '11' },
        { label: 'Desember', value: '12' },
    ];



    const selectedMonthLabel = months[parseInt(selectedMonth) - 1]?.label || 'Unknown';

    return (
        <div className="p-4 md:p-8 bg-background min-h-screen animate-fadeIn pb-32 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header & Filter Section */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="pb-2">
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Matriks Iuran</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm md:text-base max-w-md font-medium">
                                Monitor status pembayaran anggota secara real-time.
                            </p>
                        </div>

                        {/* Compact Period Filter */}
                        <div className="bg-card p-2 rounded-2xl shadow-sm border border-border flex items-center gap-3 w-full lg:w-auto self-start lg:self-auto">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="grid grid-cols-1 gap-2 flex-1 md:min-w-[180px]">
                                <Select
                                    label=""
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    options={months}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : !isPeriodConfigured ? (
                        /* Period Not Configured */
                        <div className="bg-card rounded-[2rem] border border-dashed border-border p-12 text-center">
                            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Data Belum Tersedia</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Periode <span className="font-semibold text-foreground">{selectedMonthLabel}</span> belum memiliki data iuran.
                                Silakan konfigurasikan kas di menu Settings.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards - Redesigned to match ReportScreen */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total Members */}
                                <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                            <Filter className="w-6 h-6 stroke-[2px]" />
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                            Total
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Anggota</p>
                                        <h3 className="text-2xl font-extrabold text-foreground">{stats.total}</h3>
                                    </div>
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                                </div>

                                {/* Paid Members */}
                                <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 stroke-[2px]" />
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                                            Lunas
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Lunas Semua</p>
                                        <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.fullyPaid}</h3>
                                    </div>
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                                </div>

                                {/* Members with Arrears */}
                                <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 stroke-[2px]" />
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full">
                                            Tunggakan
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Ada Tunggakan</p>
                                        <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.hasArrears}</h3>
                                    </div>
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                                </div>
                            </div>

                            {/* Search & Filter Bar */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau NIM mahasiswa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                            filterStatus === 'all'
                                                ? "bg-foreground text-background border-foreground"
                                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                                        )}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('unpaid')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                                            filterStatus === 'unpaid'
                                                ? "bg-destructive text-destructive-foreground border-destructive"
                                                : "bg-card text-destructive border-destructive/20 hover:bg-destructive/10"
                                        )}
                                    >
                                        <Filter className="w-3 h-3" />
                                        Tunggakan
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Matrix Table (Hidden on Mobile) */}
                            <div className="hidden md:block bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm relative z-0">
                                <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="sticky top-0 z-30">
                                            <tr className="bg-muted/95 backdrop-blur-sm border-b border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <th className="p-5 text-[10px] font-black uppercase text-muted-foreground sticky left-0 bg-muted z-30 min-w-[180px] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                                                    Mahasiswa
                                                </th>
                                                {[1, 2, 3, 4, 5].map((week) => (
                                                    <th key={week} className={cn("p-4 text-center min-w-[80px] group relative", week === 5 && weeksInSelectedMonth < 5 && "opacity-30")}>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground">M{week}</span>
                                                            <span className="hidden lg:inline-block text-[9px] font-medium text-muted-foreground mt-0.5 whitespace-nowrap bg-background/50 px-1.5 py-0.5 rounded">
                                                                {getWeekRange(week, parseInt(selectedMonth), currentYear)}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs font-bold">
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((s, index) => (
                                                    <tr key={s.nim} className={cn(
                                                        "border-b border-border last:border-0 transition-colors group",
                                                        index % 2 === 0 ? "bg-card" : "bg-muted/30",
                                                        "hover:!bg-primary/5"
                                                    )}>
                                                        <td className={cn(
                                                            "p-4 text-foreground sticky left-0 z-20 border-r border-border shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] transition-colors",
                                                            "bg-card group-hover:bg-card"
                                                        )}>
                                                            <div className="flex flex-col">
                                                                <span className="truncate font-bold text-foreground">{s.name}</span>
                                                                <span className="text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">{s.nim}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">{renderStatus(s.m1, 1)}</td>
                                                        <td className="p-4 text-center">{renderStatus(s.m2, 2)}</td>
                                                        <td className="p-4 text-center">{renderStatus(s.m3, 3)}</td>
                                                        <td className="p-4 text-center">{renderStatus(s.m4, 4)}</td>
                                                        <td className={cn("p-4 text-center", weeksInSelectedMonth < 5 && "opacity-30")}>{renderStatus(s.m5, 5)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <Search className="w-8 h-8 opacity-20" />
                                                            <p className="text-sm font-medium">Tidak ada data mahasiswa ditemukan</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card List (Visible on Mobile) */}
                            <div className="md:hidden space-y-4">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((s) => (
                                        <div key={s.nim} className="bg-card p-4 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-foreground">{s.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{s.nim}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center gap-2 p-3 bg-muted/30 rounded-2xl">
                                                {[1, 2, 3, 4, 5].map((week) => {
                                                    if (week === 5 && weeksInSelectedMonth < 5) return null;
                                                    return (
                                                        <div key={week} className="flex flex-col items-center gap-1 flex-1">
                                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">M{week}</span>
                                                            <div className="scale-90 transform-origin-center">
                                                                {renderStatus(s[`m${week}` as keyof typeof s] as number, week)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/30 rounded-[2rem]">
                                        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-sm">
                                            <Search className="w-6 h-6 text-muted-foreground/50" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Tidak Ditemukan</h3>
                                            <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                                                Tidak ada data mahasiswa yang cocok dengan pencarian.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend (Shared) */}
                            <div className="flex flex-wrap justify-center gap-6 mt-4 opacity-70">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Lunas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Clock className="w-2.5 h-2.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Dicicil</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                        <MinusCircle className="w-2.5 h-2.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Belum Bayar</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
