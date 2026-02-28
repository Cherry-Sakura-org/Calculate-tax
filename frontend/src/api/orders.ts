import { apiClient } from './client';
import type {
    CreateOrderPayload,
    ImportFile,
    Order,
    OrdersParams,
    PaginatedResponse,
    ImportResponse,
} from '../types/order';

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

    exportCsv: async (params: Omit<OrdersParams, 'page' | 'size'> = {}) => {
        const response = await apiClient.get('/orders/export', {
            params,
            responseType: 'blob',
        });
        const disposition = response.headers['content-disposition'];
        const match = disposition?.match(/filename="?([^"]+)"?/);
        const filename = match?.[1] || 'orders-export.csv';

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    import: (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('file', file));
        return apiClient
            .post<ImportResponse>('orders/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data);
    },

    listImportFiles: async (): Promise<ImportFile[]> => {
        const response = await apiClient.get<PaginatedResponse<ImportFile>>('/orders/import-files', {
            params: { size: 100 },
        });
        return response.data.content;
    },

    deleteByFilter: async (params: Omit<OrdersParams, 'page' | 'size' | 'sort'>): Promise<number> => {
        const response = await apiClient.delete<{ deletedCount: number }>('/orders/by-filter', {
            params,
        });
        return response.data.deletedCount;
    },

    deleteByImportFile: async (importFileId: string): Promise<number> => {
        const response = await apiClient.delete<{ deletedCount: number }>(
            `/orders/by-import-file/${importFileId}`,
        );
        return response.data.deletedCount;
    },
};
