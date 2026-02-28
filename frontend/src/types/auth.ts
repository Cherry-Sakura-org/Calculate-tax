export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    oauthProvider?: string;
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

export interface AuthError {
    code: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'USER_EXISTS' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
    message: string;
    details?: Record<string, any>;
}
