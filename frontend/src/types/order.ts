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
    counties?: string;
    regions?: string;

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

export interface ImportFileResponse {
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

export interface MapCountyResponse {
    county: string;
    order_count: number;
    total_subtotal: number;
    total_tax: number;
    total_revenue: number;
    average_tax_rate: number;
    average_order_value: number;
}
