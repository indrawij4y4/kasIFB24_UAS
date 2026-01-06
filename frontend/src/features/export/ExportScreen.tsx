import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Loader2, Calendar, Download } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { exportApi, api } from '../../services/api';

export function ExportScreen() {
    const [loadingType, setLoadingType] = useState<string | null>(null);
    const [modal, setModal] = useState({ isOpen: false, type: 'success' as const, title: '', desc: '' });

    // State for filters
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

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

    const years = [
        { label: '2024', value: '2024' },
        { label: '2025', value: '2025' },
        { label: '2026', value: '2026' },
    ];

    const handleExportGlobalExcel = () => {
        setLoadingType('global_excel');
        const url = exportApi.downloadGlobal('excel', parseInt(selectedMonth), parseInt(selectedYear));
        window.open(url, '_blank');
        setTimeout(() => {
            setLoadingType(null);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Download Dimulai',
                desc: `Laporan iuran global bulan ${months[parseInt(selectedMonth) - 1].label} ${selectedYear} sedang diunduh.`
            });
        }, 1000);
    };

    const handleExportGlobalPDF = () => {
        setLoadingType('global_pdf');
        const url = exportApi.downloadGlobal('pdf', parseInt(selectedMonth), parseInt(selectedYear));
        window.open(url, '_blank');
        setTimeout(() => {
            setLoadingType(null);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Download Dimulai',
                desc: `Laporan PDF global bulan ${months[parseInt(selectedMonth) - 1].label} ${selectedYear} sedang diunduh.`
            });
        }, 1000);
    };

    const handleExportPengeluaranExcel = () => {
        setLoadingType('pengeluaran_excel');
        const url = exportApi.downloadPengeluaran('excel', parseInt(selectedMonth), parseInt(selectedYear));
        window.open(url, '_blank');
        setTimeout(() => {
            setLoadingType(null);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Download Dimulai',
                desc: `Laporan pengeluaran bulan ${months[parseInt(selectedMonth) - 1].label} ${selectedYear} sedang diunduh.`
            });
        }, 1000);
    };

    const handleExportPengeluaranPDF = () => {
        setLoadingType('pengeluaran_pdf');
        const url = exportApi.downloadPengeluaran('pdf', parseInt(selectedMonth), parseInt(selectedYear));
        window.open(url, '_blank');
        setTimeout(() => {
            setLoadingType(null);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Download Dimulai',
                desc: `Laporan PDF pengeluaran bulan ${months[parseInt(selectedMonth) - 1].label} ${selectedYear} sedang diunduh.`
            });
        }, 1000);
    };

    // Check for data availability
    const { data: students } = useQuery({
        queryKey: ['students', selectedMonth, selectedYear],
        queryFn: () => api.getStudents(parseInt(selectedMonth), parseInt(selectedYear)),
    });

    // Check if this period has actual payment data
    const hasDataForPeriod = students && students.length > 0 && students.some(s =>
        (s.m1 || 0) + (s.m2 || 0) + (s.m3 || 0) + (s.m4 || 0) + (s.m5 || 0) > 0
    );

    const isLoadingByAny = loadingType !== null;

    return (
        <div className="p-4 md:p-8 bg-background min-h-screen animate-fadeIn pb-32">

            {/* Header Section */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Pusat Ekspor</h2>
                    <p className="text-muted-foreground mt-1">Unduh laporan keuangan dan kartu kendali dalam format digital.</p>
                </div>

                {/* Compact Period Filter */}
                <div className="bg-card p-3 rounded-2xl shadow-sm border border-border flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 flex-1 md:min-w-[300px]">
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

            <div className="max-w-4xl mx-auto space-y-10">
                {/* Empty State */}
                {!hasDataForPeriod && (
                    <div className="bg-card rounded-3xl border-2 border-dashed border-border p-6 md:p-12 text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Data</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Belum ada transaksi yang tercatat untuk periode <span className="font-semibold text-foreground">{months[parseInt(selectedMonth) - 1].label} {selectedYear}</span>.
                            Silakan pilih periode lain atau hubungi admin.
                        </p>
                    </div>
                )}

                {hasDataForPeriod && (
                    <>
                        {/* Income Report Section - accessible to all */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-[1px] flex-1 bg-border"></div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Laporan Pemasukan</h3>
                                <div className="h-[1px] flex-1 bg-border"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={handleExportGlobalExcel}
                                    disabled={isLoadingByAny}
                                    className="relative group flex items-start gap-5 p-6 bg-card rounded-[2rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {loadingType === 'global_excel' ? (
                                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                        ) : (
                                            <Download className="w-6 h-6 text-emerald-500" />
                                        )}
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <FileSpreadsheet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Laporan Pemasukan Excel</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold">EXCEL</span>
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold">.XLSX</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Rekapitulasi pemasukan iuran seluruh anggota.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportGlobalPDF}
                                    disabled={isLoadingByAny}
                                    className="relative group flex items-start gap-5 p-6 bg-card rounded-[2rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {loadingType === 'global_pdf' ? (
                                            <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                                        ) : (
                                            <Download className="w-6 h-6 text-rose-500" />
                                        )}
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">Laporan Pemasukan PDF</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-md text-[10px] font-bold">PDF</span>
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold">RESMI</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Format dokumen pemasukan resmi siap cetak.</p>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* Expense Report Section - accessible to all */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-[1px] flex-1 bg-border"></div>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Laporan Pengeluaran</h3>
                                <div className="h-[1px] flex-1 bg-border"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={handleExportPengeluaranExcel}
                                    disabled={isLoadingByAny}
                                    className="relative group flex items-start gap-5 p-6 bg-card rounded-[2rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {loadingType === 'pengeluaran_excel' ? (
                                            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                        ) : (
                                            <Download className="w-6 h-6 text-orange-500" />
                                        )}
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <FileSpreadsheet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">Laporan Pengeluaran Excel</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md text-[10px] font-bold">EXCEL</span>
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold">.XLSX</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Rekapitulasi seluruh pengeluaran kas.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportPengeluaranPDF}
                                    disabled={isLoadingByAny}
                                    className="relative group flex items-start gap-5 p-6 bg-card rounded-[2rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {loadingType === 'pengeluaran_pdf' ? (
                                            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                                        ) : (
                                            <Download className="w-6 h-6 text-red-500" />
                                        )}
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">Laporan Pengeluaran PDF</h4>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-[10px] font-bold">PDF</span>
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold">RESMI</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Format dokumen pengeluaran resmi siap cetak.</p>
                                    </div>
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                description={modal.desc}
                type={modal.type}
            />
        </div>
    );
}
