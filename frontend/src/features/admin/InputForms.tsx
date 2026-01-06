import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from 'lucide-react';
import { usersApi, pemasukanApi, pengeluaranApi } from "../../services/api";

// Helper to get current month and year
const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

// Get current week of the month (1-5)
const getCurrentWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const firstDayOfWeek = firstDay.getDay();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

export function InputInScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });

    // Form state
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().toString());
    const [selectedYear, setSelectedYear] = useState(getCurrentYear().toString());
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek().toString());
    const [nominal, setNominal] = useState('10000');

    // Fetch users for dropdown
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    // Set default user when users load
    useEffect(() => {
        if (users && users.length > 0 && !selectedUser) {
            setSelectedUser(users[0].id.toString());
        }
    }, [users, selectedUser]);

    // Mutation for saving pemasukan
    const mutation = useMutation({
        mutationFn: async () => {
            return pemasukanApi.store({
                user_id: parseInt(selectedUser),
                bulan: parseInt(selectedMonth),
                tahun: parseInt(selectedYear),
                minggu_ke: parseInt(selectedWeek),
                nominal: parseInt(nominal),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            queryClient.invalidateQueries({ queryKey: ['arrears'] });
            setModalOpen(false);
            setSuccessModal(true);
        },
        onError: (error: any) => {
            setModalOpen(false);
            setErrorModal({
                open: true,
                message: error.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'
            });
        },
    });

    const handleSave = () => {
        if (!selectedUser || !nominal) {
            setErrorModal({ open: true, message: 'Lengkapi semua field!' });
            return;
        }
        setModalOpen(true);
    };

    const months = [
        { label: 'Januari', value: '1' }, { label: 'Februari', value: '2' },
        { label: 'Maret', value: '3' }, { label: 'April', value: '4' },
        { label: 'Mei', value: '5' }, { label: 'Juni', value: '6' },
        { label: 'Juli', value: '7' }, { label: 'Agustus', value: '8' },
        { label: 'September', value: '9' }, { label: 'Oktober', value: '10' },
        { label: 'November', value: '11' }, { label: 'Desember', value: '12' },
    ];

    return (
        <div className="p-4 md:p-6 bg-background min-h-screen animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="w-10 h-10 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold text-foreground">Input Iuran</h2>
            </div>

            {loadingUsers ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="bg-card p-6 rounded-3xl shadow-sm space-y-4 border border-border">
                    <Select
                        label="Nama Mahasiswa"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        options={users?.map(u => ({ label: u.nama, value: u.id.toString() })) || []}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Select
                            label="Bulan"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={months}
                        />
                        <Select
                            label="Tahun"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={[
                                { label: '2024', value: '2024' },
                                { label: '2025', value: '2025' },
                                { label: '2026', value: '2026' },
                            ]}
                        />
                    </div>

                    <Select
                        label="Minggu Ke"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        options={[
                            { label: 'Minggu 1', value: '1' },
                            { label: 'Minggu 2', value: '2' },
                            { label: 'Minggu 3', value: '3' },
                            { label: 'Minggu 4', value: '4' },
                            { label: 'Minggu 5', value: '5' },
                        ]}
                    />

                    <Input
                        label="Nominal (Rp)"
                        type="number"
                        value={nominal}
                        onChange={(e) => setNominal(e.target.value)}
                        placeholder="10000"
                    />

                    <Button
                        onClick={handleSave}
                        variant="success"
                        className="w-full"
                        isLoading={mutation.isPending}
                    >
                        Simpan Iuran
                    </Button>
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={() => mutation.mutate()}
                title="Konfirmasi"
                description="Simpan data iuran ke sistem?"
                type="confirm"
                confirmLabel={mutation.isPending ? "Menyimpan..." : "Ya, Simpan"}
            />

            {/* Success Modal */}
            <Modal
                isOpen={successModal}
                onClose={() => { setSuccessModal(false); navigate('/'); }}
                title="Berhasil"
                description="Data iuran berhasil disimpan!"
                type="success"
            />

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Gagal"
                description={errorModal.message}
                type="error"
            />
        </div>
    );
}

export function InputOutScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });

    // Form state
    const [judul, setJudul] = useState('');
    const [nominal, setNominal] = useState('');

    // Fetch current balance for validation
    const { data: stats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const response = await fetch('http://127.0.0.1:8000/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                }
            });
            return response.json();
        },
    });

    // Mutation for saving pengeluaran
    const mutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('judul', judul);
            formData.append('nominal', nominal);
            formData.append('tanggal', new Date().toISOString().split('T')[0]);
            return pengeluaranApi.store(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            setModalOpen(false);
            setSuccessModal(true);
        },
        onError: (error: any) => {
            setModalOpen(false);
            setErrorModal({
                open: true,
                message: error.message || 'Gagal menyimpan data belanja.'
            });
        },
    });

    const handleSave = () => {
        if (!judul || !nominal) {
            setErrorModal({ open: true, message: 'Lengkapi judul dan nominal!' });
            return;
        }

        const amount = parseInt(nominal);
        const currentBalance = stats?.balance || 0;

        if (amount > currentBalance) {
            setErrorModal({
                open: true,
                message: `Saldo tidak cukup! Saldo saat ini: Rp ${currentBalance.toLocaleString('id-ID')}, nominal belanja: Rp ${amount.toLocaleString('id-ID')}.`
            });
            return;
        }

        setModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 bg-background min-h-screen animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="w-10 h-10 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold text-foreground">Input Belanja</h2>
            </div>

            <div className="bg-card p-6 rounded-3xl shadow-sm space-y-4 border border-border">
                {/* Show current balance */}
                {stats && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Saldo Tersedia</p>
                        <p className="text-lg font-black text-blue-800">Rp {(stats.balance || 0).toLocaleString('id-ID')}</p>
                    </div>
                )}

                <Input
                    label="Kebutuhan / Judul"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                />

                <Input
                    label="Nominal (Rp)"
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                />

                <Button
                    onClick={handleSave}
                    variant="danger"
                    className="w-full"
                    isLoading={mutation.isPending}
                >
                    Simpan Belanja
                </Button>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={() => mutation.mutate()}
                title="Konfirmasi"
                description="Simpan data belanja ke sistem?"
                type="confirm"
                confirmLabel={mutation.isPending ? "Menyimpan..." : "Ya, Simpan"}
            />

            {/* Success Modal */}
            <Modal
                isOpen={successModal}
                onClose={() => { setSuccessModal(false); navigate('/'); }}
                title="Berhasil"
                description="Data belanja berhasil disimpan!"
                type="success"
            />

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Gagal"
                description={errorModal.message}
                type="error"
            />
        </div>
    );
}
