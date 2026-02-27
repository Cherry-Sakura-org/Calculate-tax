import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { setToken } from '../../api/client';
import { AUTH_QUERY_KEY } from '../../hooks/auth';

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            setToken(token);
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        }

        navigate('/', { replace: true });
    }, [navigate, queryClient]);

    return (
        <Stack alignItems='center' justifyContent='center' sx={{ height: '100vh' }}>
            <CircularProgress size={32} />
            <Typography variant='caption' color='text.secondary' sx={{ mt: 2 }}>
                Completing sign-in…
            </Typography>
        </Stack>
    );
}
