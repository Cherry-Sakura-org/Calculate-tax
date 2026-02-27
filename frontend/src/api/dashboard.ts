import { apiClient } from './client';

export interface RegionBreakdown {
    region: string;
    order_count: number;
    total_subtotal: number;
    total_revenue: number;
    average_tax_rate: number;
}

export interface TopCounty {
    county: string;
    order_count: number;
    total_subtotal: number;
    total_revenue: number;
}

export interface TaxRateBucket {
    rate_label: string;
    order_count: number;
}

export interface DashboardStats {
    total_orders: number;
    valid_orders: number;
    invalid_orders: number;
    total_subtotal: number;
    total_tax: number;
    total_revenue: number;
    average_order_value: number;
    average_tax_rate: number;
    min_subtotal: number;
    max_subtotal: number;
    top_counties: TopCounty[];
    region_breakdown: RegionBreakdown[];
    tax_rate_distribution: TaxRateBucket[];
}

export interface MapCounty {
    county: string;
    order_count: number;
    total_subtotal: number;
    total_tax: number;
    total_revenue: number;
    average_tax_rate: number;
    average_order_value: number;
}

export interface ImportFile {
    id: string;
    original_filename: string;
    file_size_bytes: number;
    total_records: number;
    successful_records: number;
    failed_records: number;
    out_of_ny_records: number;
    duration_ms: number;
    records_per_second: number;
    imported_at: string;
    status: string;
}

export const dashboardApi = {
    getStats: () =>
        apiClient.get<DashboardStats>('/dashboard').then((r) => r.data),

    evictCaches: () =>
        apiClient.post<{ message: string }>('/dashboard/cache/evict').then((r) => r.data),
};

export const mapApi = {
    getCounties: () =>
        apiClient.get<MapCounty[]>('/map/counties').then((r) => r.data),

    getCacheStats: () =>
        apiClient.get<{ geoTaxCacheSize: number }>('/map/cache/stats').then((r) => r.data),
};

export const importFilesApi = {
    list: (page = 0, size = 10) =>
        apiClient
            .get<{ content: ImportFile[]; page: { totalElements: number; totalPages: number } }>(
                '/orders/import-files',
                { params: { page, size } },
            )
            .then((r) => r.data),
};
