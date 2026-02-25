export interface TaxBreakdown {
    state_rate: number;
    county_rate: number;
    city_rate: number;
    special_rates: number;
}

export interface Order {
    id: string;
    latitude: number;
    longitude: number;
    subtotal: number;
    composite_tax_rate: number;
    tax_amount: number;
    total_amount: number;
    timestamp: string;
    taxBreakdown: TaxBreakdown;
    jurisdictions: string[];
}

export interface OrdersParams {
    page?: number;
    size?: number;
    sort?: string[];
    date_from?: string;
    date_to?: string;
    latitude?: number;
    longitude?: number;
    min_tax_rate?: number;
    max_tax_rate?: number;
}

export interface PageMetadata {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    page: PageMetadata;
}

export interface CreateOrderPayload {
    latitude: number;
    longitude: number;
    subtotal: number;
}
