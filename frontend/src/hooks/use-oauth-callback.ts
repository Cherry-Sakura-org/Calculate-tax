import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEY } from './auth';

export function useOAuthCallback() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('oauth') === 'success') {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [queryClient]);
}
