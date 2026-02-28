import { apiClient } from './client';
import type { CreateOrderPayload, Order, OrdersParams, PaginatedResponse, ImportResponse, ImportFileResponse, MapCountyResponse } from '../types/order';

export const ordersApi = {
    list: async (params: OrdersParams): Promise<{ items: Order[]; total: number }> => {
        const response = await apiClient.get<PaginatedResponse<Order>>('/orders', { params });
        const data = response.data;
        return { items: data.content, total: data.page.totalElements };
    },

    downloadCsv: async () => {
        const response = await apiClient.get('/orders/csv', { responseType: 'blob' });
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

    counties: async (): Promise<MapCountyResponse[]> => {
        const response = await apiClient.get<MapCountyResponse[]>('/map/counties');
        return response.data;
    },

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient
            .post<ImportResponse>('/api/v1/native/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },

    importFiles: async (params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ImportFileResponse>> => {
        const response = await apiClient.get<PaginatedResponse<ImportFileResponse>>('/orders/import-files', { params });
        return response.data;
    },
};
