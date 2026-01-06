import { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Lock, Eye, EyeOff, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ForceChangeScreen() {
    const { user, updatePassword, checkStrength } = useAuth();
    const navigate = useNavigate();
    const [currentPass, setCurrentPass] = useState(user?.nim || "");
    const [pass, setPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const strength = checkStrength(pass);

    // Password strength meter
    const strengthInfo = useMemo(() => {
        if (!pass) return { level: 0, label: "", color: "bg-[#333]" };
        if (pass.length < 6) return { level: 1, label: "Lemah", color: "bg-red-500" };
        if (strength === "Lemah") return { level: 1, label: "Lemah", color: "bg-red-500" };
        if (strength === "Sedang") return { level: 2, label: "Sedang", color: "bg-yellow-500" };
        return { level: 3, label: "Kuat", color: "bg-green-500" };
    }, [pass, strength]);

    const handleUpdate = async () => {
        if (pass !== confirm) {
            setError("Sandi baru tidak cocok");
            return;
        }
        if (pass.length < 6) {
            setError("Sandi minimal 6 karakter");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const current = currentPass || user?.nim || "";
            await updatePassword(current, pass);
            navigate("/");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Gagal mengubah sandi";
            setError(message);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fadeIn bg-black font-['Inter'] antialiased">
            {/* Card Container */}
            <div className="w-full max-w-[400px] bg-black border border-white/15 rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-500/30">
                        <Lock className="w-7 h-7" />
                    </div>

                    <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                        Amankan Akun Anda
                    </h2>
                    <p className="text-[#94a3b8] text-sm leading-relaxed">
                        Demi keamanan, Anda wajib mengganti password default (NIM) dengan password pilihan Anda sendiri.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="text-rose-500 text-xs font-medium flex items-center justify-center gap-2 py-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                            <CircleAlert className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Current Password (Read-only style) */}
                    <div>
                        <label className="block text-[0.8rem] font-medium text-slate-400 mb-1.5 ml-1">
                            Sandi Saat Ini (NIM)
                        </label>
                        <Input
                            label=""
                            type="password"
                            value={currentPass}
                            placeholder={user?.nim || "Masukkan NIM"}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            className="!bg-[#1a1a1a] !border !border-[#333] !rounded-[8px] text-sm !text-[#777] !px-4 !py-3 placeholder:text-[#555] !mb-0 !mt-0 transition-all font-medium"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-[0.8rem] font-medium text-slate-200 mb-1.5 ml-1">
                            Sandi Baru
                        </label>
                        <Input
                            label=""
                            type={showNewPass ? "text" : "password"}
                            value={pass}
                            placeholder="Masukkan password baru..."
                            onChange={(e) => setPass(e.target.value)}
                            className="!bg-[#121212] !border !border-[#333] !rounded-[8px] text-sm !text-white focus:!border-blue-500 !px-4 !py-3 placeholder:text-[#444] !mb-0 !mt-0 transition-all font-medium"
                            rightIcon={
                                <button
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="text-[#666] hover:text-white transition-colors p-2 -mr-2 -mt-2"
                                    tabIndex={-1}
                                >
                                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />

                        {/* Password Strength Meter */}
                        {pass && (
                            <div className="mt-2 px-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden flex gap-1">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strengthInfo.level >= 1 ? strengthInfo.color : 'bg-[#333]'}`} style={{ width: '33%' }} />
                                        <div className={`h-full rounded-full transition-all duration-300 ${strengthInfo.level >= 2 ? strengthInfo.color : 'bg-[#333]'}`} style={{ width: '33%' }} />
                                        <div className={`h-full rounded-full transition-all duration-300 ${strengthInfo.level >= 3 ? strengthInfo.color : 'bg-[#333]'}`} style={{ width: '34%' }} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${strengthInfo.level === 1 ? 'text-red-400' :
                                            strengthInfo.level === 2 ? 'text-yellow-400' :
                                                strengthInfo.level === 3 ? 'text-green-400' : 'text-[#555]'
                                        }`}>
                                        {strengthInfo.label || "—"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-[0.8rem] font-medium text-slate-200 mb-1.5 ml-1">
                            Ulangi Sandi Baru
                        </label>
                        <Input
                            label=""
                            type={showConfirmPass ? "text" : "password"}
                            value={confirm}
                            placeholder="Konfirmasi password baru..."
                            onChange={(e) => setConfirm(e.target.value)}
                            className="!bg-[#121212] !border !border-[#333] !rounded-[8px] text-sm !text-white focus:!border-blue-500 !px-4 !py-3 placeholder:text-[#444] !mb-0 !mt-0 transition-all font-medium"
                            rightIcon={
                                <button
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="text-[#666] hover:text-white transition-colors p-2 -mr-2 -mt-2"
                                    tabIndex={-1}
                                >
                                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        {/* Match indicator */}
                        {pass && confirm && (
                            <p className={`text-[11px] mt-1.5 ml-1 font-medium ${pass === confirm ? 'text-green-400' : 'text-red-400'}`}>
                                {pass === confirm ? '✓ Password cocok' : '✗ Password tidak cocok'}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button
                            onClick={handleUpdate}
                            isLoading={loading}
                            disabled={pass.length < 6 || pass !== confirm}
                            className="w-full h-[45px] rounded-[8px] text-sm font-semibold !bg-[#0095F6] hover:!bg-[#1877f2] transition-all active:scale-[0.98] !border-none text-white tracking-wide shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Simpan & Masuk
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-[11px] text-[#444] font-medium tracking-wide">
                    FROM <span className="font-bold text-[#666]">INFORMATIKA 24</span>
                </p>
            </div>
        </div>
    );
}
