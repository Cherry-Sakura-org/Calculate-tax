import { apiClient } from './client';
import type { CreateOrderPayload, Order, OrdersParams, PaginatedResponse } from '../types/order';

// API currently returns array, will return PaginatedResponse when backend pagination is ready
type OrdersResponse = Order[] | PaginatedResponse<Order>;

const isPaginated = (data: OrdersResponse): data is PaginatedResponse<Order> =>
    data && typeof data === 'object' && 'content' in data && 'page' in data;

export const ordersApi = {
    list: async (params: OrdersParams): Promise<{ items: Order[]; total: number }> => {
        const response = await apiClient.get<OrdersResponse>('/orders', { params });
        const data = response.data;

        if (isPaginated(data)) {
            return { items: data.content, total: data.page.totalElements };
        }
        // Fallback: API returns plain array
        return { items: data, total: data.length };
    },

    create: async (payload: CreateOrderPayload) => {
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
