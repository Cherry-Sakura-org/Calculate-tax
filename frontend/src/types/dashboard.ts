export interface CountySummary {
    county: string;
    order_count: number;
    total_revenue: number;
}

export interface RegionSummary {
    region: string;
    order_count: number;
    total_subtotal: number;
    total_revenue: number;
    average_tax_rate: number;
}

export interface TaxRateBucket {
    range: string;
    count: number;
}

export interface DashboardResponse {
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
    top_counties: CountySummary[];
    tax_rate_distribution: TaxRateBucket[];
    region_breakdown: RegionSummary[];
}
