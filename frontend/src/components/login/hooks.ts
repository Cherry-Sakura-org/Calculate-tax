import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogin, useRegister } from '../../hooks/auth';

export const useLoginPage = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();
    const login = useLogin();
    const register = useRegister();

    const error = login.error || register.error;
    const isSubmitting = login.isPending || register.isPending;

    const switchMode = () => {
        login.reset();
        register.reset();
        setMode((m) => (m === 'login' ? 'register' : 'login'));
    };

    const onLoginSuccess = () => navigate('/');
    const onRegisterSuccess = () => navigate('/');

    return {
        mode,
        error,
        isSubmitting,
        switchMode,
        login,
        register,
        onLoginSuccess,
        onRegisterSuccess,
    };
};
