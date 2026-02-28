import { apiClient } from './client';
import type { CreateOrderPayload, Order, OrdersParams, PaginatedResponse, ImportResponse } from '../types/order';

export const ordersApi = {
    list: async (params: OrdersParams): Promise<{ items: Order[]; total: number }> => {
        const response = await apiClient.get<PaginatedResponse<Order>>('/orders', { params });
        const data = response.data;
        return { items: data.content, total: data.page.totalElements };
    },

    downloadCsv: async () => {
        const response = await apiClient.get('/orders/export', { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.csv';
        a.click();
        URL.revokeObjectURL(url);
    },

    create: async (payload: CreateOrderPayload) => {
        return apiClient.post<Order>('/orders', payload).then((r) => r.data);
    },

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient
            .post<ImportResponse>('/orders/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },
};
