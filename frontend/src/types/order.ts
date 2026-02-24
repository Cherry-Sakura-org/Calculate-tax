export interface Order {
    id: string;
    latitude: number;
    longitude: number;
    subtotal: number;
    tax_amount: number;
    total: number;
    composite_rate: number;
    state_rate: number;
    county_rate: number;
    city_rate: number;
    special_rates: number;
    jurisdictions: string[];
    created_at: string;
}

export interface OrdersParams {
    page?: number;
    page_size?: number;
    date_from?: string;
    date_to?: string;
    latitude?: number;
    longitude?: number;
    min_tax_rate?: number;
    max_tax_rate?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

export interface CreateOrderPayload {
    latitude: number;
    longitude: number;
    subtotal: number;
}
