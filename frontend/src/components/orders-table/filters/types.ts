export interface RangeFilterValue {
    from: string;
    to: string;
}

export interface JurisdictionNode {
    id: string;
    label: string;
    children?: JurisdictionNode[];
}

export type FilterType = 'range-number' | 'range-currency' | 'range-percent' | 'range-date' | 'jurisdiction';

export type SortDirection = 'asc' | 'desc' | null;
