const ACCEPTED_TYPES = ['text/csv', 'application/vnd.ms-excel'];

export const validateCsvFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
        return 'Invalid file format. Only CSV files are allowed';
    }
    if (file.size === 0) {
        return 'File is corrupted or empty';
    }
    return null;
};
