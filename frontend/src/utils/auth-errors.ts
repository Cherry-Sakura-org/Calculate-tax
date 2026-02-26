import { AuthError } from '../types/auth';

export const isAuthError = (error: unknown): error is AuthError => {
    return error !== null && typeof error === 'object' && 'code' in error && 'message' in error;
};

export const getErrorMessage = (error: unknown): string => {
    if (isAuthError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Невідома помилка';
};

export const getErrorCode = (error: unknown): AuthError['code'] => {
    if (isAuthError(error)) {
        return error.code;
    }
    return 'UNKNOWN_ERROR';
};

export const getErrorDetails = (error: unknown): Record<string, any> | undefined => {
    if (isAuthError(error)) {
        return error.details;
    }
    return undefined;
};
