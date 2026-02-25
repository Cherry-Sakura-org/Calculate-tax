export interface AuthUser {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

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
        await delay(1000);

        const user = mockUsers.find((u) => u.email === payload.email);
        if (!user) {
            throw new Error('Користувача з таким email не знайдено');
        }
        if (payload.password.length < 4) {
            throw new Error('Невірний пароль');
        }

        const token = `mock-token-${user.id}-${Date.now()}`;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        return { token, user };
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        await delay(1200);

        const exists = mockUsers.find((u) => u.email === payload.email);
        if (exists) {
            throw new Error('Користувач з таким email вже існує');
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