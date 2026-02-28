export interface CsvFileEntry {
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
