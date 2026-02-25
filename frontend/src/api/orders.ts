import { apiClient } from './client';
import type { CreateOrderPayload, Order, OrdersParams, PaginatedResponse } from '../types/order';

export const ordersApi = {
    list: (params: OrdersParams) =>
        apiClient.get<PaginatedResponse<Order>>('/orders', { params }).then((r) => r.data),

    create: async (payload: CreateOrderPayload) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
        return apiClient.post<Order>('/orders', payload).then((r) => r.data);
    },

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient
            .post<void>('/api/v1/native/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },
};
