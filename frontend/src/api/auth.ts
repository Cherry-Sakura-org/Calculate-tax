import { apiClient } from './client';
import { AuthUser, LoginPayload, RegisterPayload, AuthResponse, AuthError } from '../types/auth';

const createAuthError = (code: AuthError['code'], message: string, details?: Record<string, any>): AuthError => ({
    code,
    message,
    details,
});

const toAuthError = (error: unknown): AuthError => {
    if (error && typeof error === 'object' && 'code' in error) return error as AuthError;
    if (error && typeof error === 'object' && 'response' in error) {
        const resp = (error as any).response;
        if (resp?.status === 400 || resp?.status === 401) {
            const msg = resp.data?.message || 'Invalid credentials';
            if (msg.includes('already exists') || msg.includes('already taken'))
                return createAuthError('USER_EXISTS', msg);
            if (msg.includes('Invalid'))
                return createAuthError('INVALID_PASSWORD', msg);
            return createAuthError('VALIDATION_ERROR', msg);
        }
        return createAuthError('UNKNOWN_ERROR', resp.data?.message || 'Request failed');
    }
    if (error && typeof error === 'object' && 'request' in error) {
        return createAuthError('NETWORK_ERROR', 'Network error');
    }
    return createAuthError('UNKNOWN_ERROR', 'Unknown error');
};

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<AuthUser>('/auth/login', payload);
            return { token: '', user: data };
        } catch (error) {
            throw toAuthError(error);
        }
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<AuthUser>('/auth/register', payload);
            return { token: '', user: data };
        } catch (error) {
            throw toAuthError(error);
        }
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout');
        } catch {
            // ignore
        }
    },

    getCurrentUser: async (): Promise<AuthUser | null> => {
        try {
            const { data } = await apiClient.get<AuthUser>('/auth/me');
            return data;
        } catch {
            return null;
        }
    },
};