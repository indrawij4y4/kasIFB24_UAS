import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, pemasukanApi, pengeluaranApi } from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { Loader2, Wallet, Calendar, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Receipt, Trash2, AlertTriangle } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

// Get current month and year
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export function ReportScreen() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    // Reset modal state
    const [resetModal, setResetModal] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Delete success modal state
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    // Delete item modal state
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'income' | 'expense';
        id: number;
        title: string;
    } | null>(null);

    const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ['transactions', selectedMonth, selectedYear],
        queryFn: () => api.getTransactions(parseInt(selectedMonth), parseInt(selectedYear)),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch students data for the selected period to calculate income
    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students', selectedMonth, selectedYear],
        queryFn: () => api.getStudents(parseInt(selectedMonth), parseInt(selectedYear)),
        staleTime: 5 * 60 * 1000,
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['stats'],
        queryFn: api.getStats,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch detailed income list for the selected period
    const { data: incomeList, isLoading: isLoadingIncomeList } = useQuery({
        queryKey: ['incomeList', selectedMonth, selectedYear],
        queryFn: () => pemasukanApi.getList(parseInt(selectedMonth), parseInt(selectedYear)),
        staleTime: 5 * 60 * 1000,
    });

    // Reset mutation
    const resetMutation = useMutation({
        mutationFn: api.resetAllData,
        onSuccess: () => {
            // Invalidate all relevant queries to sync data across all screens
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['arrears'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['incomeList'] });
            setResetModal(false);
            setResetSuccess(true);
        },
        onError: (error: any) => {
            alert('Gagal menghapus data: ' + (error.message || 'Unknown error'));
            setResetModal(false);
        }
    });

    // Delete income (pemasukan) mutation
    const deleteIncomeMutation = useMutation({
        mutationFn: (id: number) => pemasukanApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomeList'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            queryClient.invalidateQueries({ queryKey: ['arrears'] });
            setDeleteModal(null);
            setDeleteSuccess(true);
        },
        onError: (error: any) => {
            alert('Gagal menghapus pemasukan: ' + (error.message || 'Unknown error'));
        }
    });

    // Delete expense (pengeluaran) mutation
    const deleteExpenseMutation = useMutation({
        mutationFn: (id: number) => pengeluaranApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            setDeleteModal(null);
            setDeleteSuccess(true);
        },
        onError: (error: any) => {
            alert('Gagal menghapus pengeluaran: ' + (error.message || 'Unknown error'));
        }
    });

    const handleDeleteConfirm = () => {
        if (!deleteModal) return;
        if (deleteModal.type === 'income') {
            deleteIncomeMutation.mutate(deleteModal.id);
        } else {
            deleteExpenseMutation.mutate(deleteModal.id);
        }
    };

    const isLoading = isLoadingTransactions || isLoadingStats || isLoadingStudents || isLoadingIncomeList;

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

    // Dynamic years: current year ± 2
    const years = Array.from({ length: 5 }, (_, i) => {
        const y = currentYear - 2 + i;
        return { label: y.toString(), value: y.toString() };
    });

    const selectedMonthLabel = months[parseInt(selectedMonth) - 1]?.label || 'Unknown';

    if (isLoading || !transactions || !stats || !students) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate period-specific income from students data (sum of all weeks payments)
    const income = students.reduce((total, s) => {
        return total + (s.m1 || 0) + (s.m2 || 0) + (s.m3 || 0) + (s.m4 || 0) + (s.m5 || 0);
    }, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = stats.balance;

    // Check if there's actual data for this period
    const hasDataForPeriod = income > 0 || expense > 0;

    return (
        <div className="p-4 md:p-8 bg-background min-h-screen animate-fadeIn pb-32 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header & Filter */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Laporan Keuangan</h2>
                            <p className="text-muted-foreground mt-1">Ringkasan lengkap aktivitas keuangan kas.</p>
                        </div>

                        {/* Compact Period Filter */}
                        <div className="bg-card p-2 rounded-2xl shadow-sm border border-border flex items-center gap-3 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 flex-1 md:min-w-[280px]">
                                <Select
                                    label=""
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    options={months}
                                />
                                <Select
                                    label=""
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    options={years}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {!hasDataForPeriod ? (
                    /* No Data Available - Show Warning */
                    <div className="bg-card rounded-[2rem] border border-dashed border-border p-12 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Data</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Belum ada transaksi yang tercatat untuk periode <span className="font-semibold text-foreground">{selectedMonthLabel} {selectedYear}</span>.
                            Silakan pilih periode lain atau hubungi admin.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Balance */}
                            <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                        <Wallet className="w-6 h-6 stroke-[2px]" />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                        Total Kas
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Saldo Akhir</p>
                                    <h3 className="text-2xl font-extrabold text-foreground">Rp {balance.toLocaleString('id-ID')}</h3>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                            </div>

                            {/* Income */}
                            <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                        <ArrowUpCircle className="w-6 h-6 stroke-[2px]" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Pemasukan</p>
                                    <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+Rp {income.toLocaleString('id-ID')}</h3>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                            </div>

                            {/* Expense */}
                            <div className="group relative p-6 rounded-[2rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                                        <ArrowDownCircle className="w-6 h-6 stroke-[2px]" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Pengeluaran</p>
                                    <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">-Rp {expense.toLocaleString('id-ID')}</h3>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500 rounded-full opacity-5 blur-2xl transition-opacity group-hover:opacity-10" />
                            </div>
                        </div>

                        {/* Mobile Tabs */}
                        <div className="flex md:hidden bg-card p-1 rounded-xl shadow-sm border border-border sticky top-0 z-20">
                            <button
                                onClick={() => setActiveTab('income')}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                                    activeTab === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                Pemasukan
                            </button>
                            <button
                                onClick={() => setActiveTab('expense')}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                                    activeTab === 'expense' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 shadow-sm' : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                Pengeluaran
                            </button>
                        </div>

                        {/* Content Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                            {/* Income List */}
                            <div className={cn("space-y-4", activeTab === 'expense' ? 'hidden md:block' : 'block')}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        Rincian Pemasukan
                                    </h4>
                                    <span className="text-xs text-muted-foreground">{incomeList?.length || 0} transaksi</span>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {incomeList && incomeList.length > 0 ? (
                                        incomeList.map((item: any) => {
                                            // Format date
                                            let formattedDate = '-';
                                            if (item.tanggal) {
                                                try {
                                                    const dateObj = new Date(item.tanggal);
                                                    if (!isNaN(dateObj.getTime())) {
                                                        formattedDate = dateObj.toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        });
                                                    }
                                                } catch (e) {
                                                    formattedDate = item.tanggal;
                                                }
                                            }

                                            return (
                                                <div key={item.id} className="group flex justify-between items-center bg-card p-4 rounded-[1.5rem] border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                            <Wallet className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground text-sm mb-0.5">{item.nama}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Minggu {item.minggu_ke} • {formattedDate}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+Rp {item.nominal.toLocaleString('id-ID')}</p>
                                                        </div>
                                                        {/* Admin Delete Button */}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => setDeleteModal({
                                                                    isOpen: true,
                                                                    type: 'income',
                                                                    id: item.id,
                                                                    title: `${item.nama} - Minggu ${item.minggu_ke}`
                                                                })}
                                                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                                                                title="Hapus pemasukan"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-muted/30 rounded-[1.5rem] min-h-[100px]">
                                            <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <Receipt className="w-6 h-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="font-bold text-muted-foreground text-sm">Belum ada pemasukan</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                                                Tidak ada catatan transaksi masuk untuk periode ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expense List */}
                            <div className={cn("space-y-4", activeTab === 'income' ? 'hidden md:block' : 'block')}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                                        Rincian Pengeluaran
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    {transactions
                                        .filter(t => t.type === 'expense')
                                        .map(t => (
                                            <div key={t.id} className="group flex justify-between items-center bg-card p-5 rounded-[1.5rem] border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                                        <ArrowDownCircle className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm mb-0.5">{t.title}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">{t.date} • {t.category}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="font-black text-rose-600 dark:text-rose-400 text-sm mb-1">-Rp {t.amount.toLocaleString('id-ID')}</p>
                                                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full w-fit ml-auto">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Selesai</span>
                                                        </div>
                                                    </div>
                                                    {/* Admin Delete Button */}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                isOpen: true,
                                                                type: 'expense',
                                                                id: t.id,
                                                                title: t.title
                                                            })}
                                                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                                                            title="Hapus pengeluaran"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    {/* Empty State */}
                                    {transactions.filter(t => t.type === 'expense').length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-muted/30 rounded-[1.5rem] min-h-[100px]">
                                            <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <Receipt className="w-6 h-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="font-bold text-muted-foreground text-sm">Belum ada pengeluaran</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                                                Tidak ada catatan transaksi keluar untuk periode ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                )}

                {/* Admin Only: Reset All Data Button */}
                {isAdmin && (
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 mt-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-rose-800 dark:text-rose-300 mb-1">Zona Bahaya</h3>
                                <p className="text-xs text-rose-600 dark:text-rose-400 mb-4">
                                    Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.
                                </p>
                                <button
                                    onClick={() => setResetModal(true)}
                                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 active:scale-95 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Reset Semua Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Confirmation Modal */}
            <Modal
                isOpen={resetModal}
                onClose={() => setResetModal(false)}
                onConfirm={() => resetMutation.mutate()}
                title="Hapus Semua Data?"
                description="Tindakan ini akan menghapus SEMUA data pemasukan dan pengeluaran dari sistem. Data yang sudah dihapus tidak dapat dikembalikan. Apakah Anda yakin?"
                type="confirm"
                confirmLabel={resetMutation.isPending ? "Menghapus..." : "Ya, Hapus Semua"}
            />

            {/* Delete Single Item Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                onConfirm={handleDeleteConfirm}
                title={`Hapus ${deleteModal?.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}?`}
                description={`Apakah Anda yakin ingin menghapus "${deleteModal?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                type="confirm"
                confirmLabel={
                    (deleteIncomeMutation.isPending || deleteExpenseMutation.isPending)
                        ? "Menghapus..."
                        : "Ya, Hapus"
                }
            />

            {/* Reset Success Modal */}
            <Modal
                isOpen={resetSuccess}
                onClose={() => setResetSuccess(false)}
                title="Data Berhasil Dihapus"
                description="Semua data pemasukan dan pengeluaran telah dihapus dari sistem."
                type="success"
            />

            {/* Delete Success Modal */}
            <Modal
                isOpen={deleteSuccess}
                onClose={() => setDeleteSuccess(false)}
                title="Berhasil Dihapus"
                description="Item telah berhasil dihapus dari sistem."
                type="success"
            />
        </div>
    );
}
