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
    sort?: string;

    // Bounding box
    minLat?: number;
    maxLat?: number;
    minLon?: number;
    maxLon?: number;

    // Amount ranges
    minSubtotal?: number;
    maxSubtotal?: number;
    minTotal?: number;
    maxTotal?: number;

    // Tax rate range (e.g. 0.04 to 0.09)
    minTaxRate?: number;
    maxTaxRate?: number;

    // Date range (ISO 8601)
    from?: string;
    to?: string;

    // Location filters
    withinNewYork?: boolean;
    county?: string;
    region?: string;

    // Import file filters
    importFileId?: string;
    importFileIds?: string;
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

export interface ImportResponse {
    imported: number;
    failed: number;
    errors?: string[];
}
