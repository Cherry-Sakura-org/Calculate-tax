import { apiClient } from './client';
import { AuthUser, LoginPayload, RegisterPayload, AuthResponse, AuthError } from '../types/auth';

const createAuthError = (
    code: AuthError['code'],
    message: string,
    details?: Record<string, any>,
): AuthError => ({
    code,
    message,
    details,
});

const handleAuthError = (error: any): never => {
    if (error?.response?.status === 401) {
        throw createAuthError(
            'INVALID_PASSWORD',
            error.response.data?.message ?? 'Invalid credentials',
        );
    }
    if (error?.response?.status === 404) {
        throw createAuthError('USER_NOT_FOUND', error.response.data?.message ?? 'User not found');
    }
    if (error?.response?.status === 409) {
        throw createAuthError('USER_EXISTS', error.response.data?.message ?? 'User already exists');
    }
    if (error?.response?.status === 422 || error?.response?.status === 400) {
        throw createAuthError(
            'VALIDATION_ERROR',
            error.response.data?.message ?? 'Validation failed',
            error.response.data,
        );
    }
    if (!error?.response) {
        throw createAuthError('NETWORK_ERROR', 'Network error — please check your connection');
    }
    throw createAuthError(
        'UNKNOWN_ERROR',
        error.response.data?.message ?? 'Something went wrong',
        error.response.data,
    );
};

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            return handleAuthError(error);
        }
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            return handleAuthError(error);
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    getCurrentUser: async (): Promise<AuthUser | null> => {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;

        try {
            const { data } = await apiClient.get<AuthUser>('/auth/me');
            localStorage.setItem('auth_user', JSON.stringify(data));
            return data;
        } catch {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            return null;
        }
    },
};
