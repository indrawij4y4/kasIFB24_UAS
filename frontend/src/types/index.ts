export type Role = 'admin' | 'user';

export interface User {
    nim: string;
    name: string;
    role: Role;
    needsPasswordChange?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}
