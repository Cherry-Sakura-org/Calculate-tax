import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'https://api.ya3.uk',
    headers: { 'Content-Type': 'application/json' },
});
