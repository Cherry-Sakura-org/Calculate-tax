import { AuthError } from '../types/auth';

const AUTH_ERROR_CODES = [
    'USER_NOT_FOUND',
    'INVALID_PASSWORD',
    'USER_EXISTS',
    'NETWORK_ERROR',
    'VALIDATION_ERROR',
    'UNKNOWN_ERROR',
] as const;

export const isAuthError = (error: unknown): error is AuthError => {
    return (
        error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error &&
        typeof error.code === 'string' &&
        AUTH_ERROR_CODES.includes(error.code as AuthError['code'])
    );
};

export const getErrorMessage = (error: unknown): string => {
    if (isAuthError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Unknown error';
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
