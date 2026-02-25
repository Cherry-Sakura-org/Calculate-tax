
const ACCEPTED_TYPES = ['text/csv', 'application/vnd.ms-excel'];

export const validateCsvFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
    return 'Невірний формат файлу. Дозволено лише CSV';
  }
  if (file.size === 0) {
    return 'Файл пошкоджений або порожній';
  }
  return null;
};