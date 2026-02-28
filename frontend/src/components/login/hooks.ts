import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UseMutationResult } from '@tanstack/react-query';
import { useLogin, useRegister } from '../../hooks/auth';
import { AuthError, AuthResponse, LoginPayload, RegisterPayload } from '../../types/auth';

export const useLoginPage = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();
    const login = useLogin();
    const register = useRegister();

    const switchMode = () => {
        login.reset();
        register.reset();
        setMode((m) => (m === 'login' ? 'register' : 'login'));
    };

    const onLoginSuccess = () => navigate('/');
    const onRegisterSuccess = () => navigate('/');

    const isLogin = mode === 'login';
    const title = isLogin ? 'Sign In' : 'Create Account';
    const subtitle = isLogin
        ? 'Enter your credentials to access the dashboard'
        : 'Fill in the details to create a new account';
    const switchLabel = isLogin ? "Don't have an account? " : 'Already have an account? ';
    const switchAction = isLogin ? 'Sign up' : 'Sign in';

    return {
        isLogin,
        title,
        subtitle,
        switchLabel,
        switchAction,
        switchMode,
        login,
        register,
        onLoginSuccess,
        onRegisterSuccess,
    };
};

const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

type LoginValues = z.infer<typeof loginSchema>;

export const useLoginForm = (
    login: UseMutationResult<AuthResponse, AuthError, LoginPayload>,
    onSuccess: () => void,
) => {
    const { control, handleSubmit } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = handleSubmit((data) => {
        login.mutate(data, { onSuccess });
    });

    return { control, onSubmit };
};

const registerSchema = z.object({
    username: z.string().min(2),
    email: z.email(),
    password: z.string().min(4),
});

type RegisterValues = z.infer<typeof registerSchema>;

export const useRegisterForm = (
    register: UseMutationResult<AuthResponse, AuthError, RegisterPayload>,
    onSuccess: () => void,
) => {
    const { control, handleSubmit } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: '', email: '', password: '' },
    });

    const onSubmit = handleSubmit((data) => {
        register.mutate(data, { onSuccess });
    });

    return { control, onSubmit };
};
