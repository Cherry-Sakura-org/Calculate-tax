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
    is_within_new_york: boolean;
    county: string | null;
    region: string | null;
    taxBreakdown: TaxBreakdown;
    jurisdictions: string[];
}

export interface OrdersParams {
    page?: number;
    size?: number;
    sort?: string[];
    from?: string;
    to?: string;
    minLat?: number;
    maxLat?: number;
    minLon?: number;
    maxLon?: number;
    minSubtotal?: number;
    maxSubtotal?: number;
    minTotal?: number;
    maxTotal?: number;
    minTaxRate?: number;
    maxTaxRate?: number;
    withinNewYork?: boolean;
    county?: string;
    region?: string;
    importFileId?: string;
    importFileIds?: string[];
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
