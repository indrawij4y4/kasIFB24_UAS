import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User as ApiUser } from '../../services/api';

// Frontend User type
interface User {
    nim: string;
    name: string;
    role: 'admin' | 'user';
    needsPasswordChange?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (nim: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updatePassword: (currentPass: string, newPass: string) => Promise<void>;
    checkStrength: (pass: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map API user to frontend user
function mapUser(apiUser: ApiUser): User {
    return {
        nim: apiUser.nim,
        name: apiUser.nama,
        role: apiUser.role,
        needsPasswordChange: apiUser.needs_password_change,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (authApi.hasToken()) {
                try {
                    const apiUser = await authApi.me();
                    setUser(mapUser(apiUser));
                } catch {
                    // Token invalid, clear it
                    authApi.clearToken();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (nim: string, pass: string): Promise<boolean> => {
        try {
            const response = await authApi.login(nim, pass);
            setUser(mapUser(response.user));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Still clear local state even if API fails
        }
        setUser(null);
    };

    const updatePassword = async (currentPass: string, newPass: string) => {
        await authApi.changePassword(currentPass, newPass);
        // Update user state to reflect password change
        if (user) {
            setUser({ ...user, needsPasswordChange: false });
        }
    };

    const checkStrength = (pass: string): string => {
        if (pass.length === 0) return '';
        if (pass.length < 6) return 'Terlalu Pendek';
        if (pass.length < 8) return 'Lemah';
        if (pass.length < 12 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 'Kuat';
        if (pass.length >= 12 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) return 'Sangat Kuat';
        return 'Cukup';
    };

    // Show nothing while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updatePassword, checkStrength }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
