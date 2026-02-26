import { AuthUser, LoginPayload, RegisterPayload, AuthResponse, AuthError } from '../types/auth';

// Helper function to create typed errors
const createAuthError = (code: AuthError['code'], message: string, details?: Record<string, any>): AuthError => ({
    code,
    message,
    details
});

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Mock user storage
const mockUsers: AuthUser[] = [
    {
        id: '1',
        username: 'demo_user',
        email: 'demo@example.com',
        createdAt: new Date().toISOString(),
    },
];

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        try {
            await delay(1000);

            const user = mockUsers.find((u) => u.email === payload.email);
            if (!user) {
                throw createAuthError('USER_NOT_FOUND', 'Користувача з таким email не знайдено');
            }
            if (payload.password.length < 4) {
                throw createAuthError('INVALID_PASSWORD', 'Невірний пароль');
            }

            const token = `mock-token-${user.id}-${Date.now()}`;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            return { token, user };
        } catch (error) {
            if (error && typeof error === 'object' && 'code' in error) {
                throw error;
            }
            throw createAuthError('UNKNOWN_ERROR', 'Помилка входу', { originalError: error });
        }
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            await delay(1200);

            const exists = mockUsers.find((u) => u.email === payload.email);
            if (exists) {
                throw createAuthError('USER_EXISTS', 'Користувач з таким email вже існує');
            }

            const newUser: AuthUser = {
                id: String(mockUsers.length + 1),
                username: payload.username,
                email: payload.email,
                createdAt: new Date().toISOString(),
            };

            mockUsers.push(newUser);

            const token = `mock-token-${newUser.id}-${Date.now()}`;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(newUser));

            return { token, user: newUser };
        } catch (error) {
            if (error && typeof error === 'object' && 'code' in error) {
                throw error;
            }
            throw createAuthError('UNKNOWN_ERROR', 'Помилка реєстрації', { originalError: error });
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    getCurrentUser: (): AuthUser | null => {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },
};