import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const API_BASE = 'https://api.ya3.uk';

export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: string; fieldErrors?: Record<string, string> }>) => {
        if (error.response) {
            const { status, data } = error.response;
            const message = data?.message || data?.error || `Request failed (${status})`;

            if (data?.fieldErrors) {
                const fields = Object.entries(data.fieldErrors)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('\n');
                toast.error(`${message}\n${fields}`, { autoClose: 6000 });
            } else if (status === 401) {
                // silent — auth flow handles this
            } else if (status >= 500) {
                toast.error(`Server error: ${message}`);
            } else if (status >= 400) {
                toast.warn(message);
            }
        } else if (error.request) {
            toast.error('Network error — unable to reach the server');
        }
        return Promise.reject(error);
    },
);
