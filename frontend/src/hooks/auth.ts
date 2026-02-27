import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { LoginPayload, RegisterPayload, AuthError, AuthResponse } from '../types/auth';

export const AUTH_QUERY_KEY = ['auth', 'current-user'];

export const useCurrentUser = () => {
    return useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: () => authApi.getCurrentUser(),
        staleTime: Infinity,
        retry: false,
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, AuthError, LoginPayload>({
        mutationFn: (payload: LoginPayload) => authApi.login(payload),
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, AuthError, RegisterPayload>({
        mutationFn: (payload: RegisterPayload) => authApi.register(payload),
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return async () => {
        await authApi.logout();
        queryClient.setQueryData(AUTH_QUERY_KEY, null);
    };
};