import { useState, useCallback } from 'react';
import type { CsvFileEntry } from './types';

let nextId = 1;

export const useCsvFileSelector = () => {
    // TODO: remove mock data
    const mockFiles: CsvFileEntry[] = [
        { id: '1', name: 'orders_jan_2025.csv', uploadedAt: new Date('2025-01-15') },
        { id: '2', name: 'orders_feb_2025.csv', uploadedAt: new Date('2025-02-10') },
        { id: '3', name: 'bulk_import_march.csv', uploadedAt: new Date('2025-03-01') },
        { id: '4', name: 'wellness_kits_q1.csv', uploadedAt: new Date('2025-03-20') },
    ];

    const [files, setFiles] = useState<CsvFileEntry[]>(mockFiles);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(mockFiles.map((f) => f.id)));

    const addFiles = useCallback((newFiles: CsvFileEntry[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            newFiles.forEach((f) => next.add(f.id));
            return next;
        });
    }, []);

    const addFromUpload = useCallback((fileNames: string[]) => {
        const entries: CsvFileEntry[] = fileNames.map((name) => ({
            id: String(nextId++),
            name,
            uploadedAt: new Date(),
        }));
        addFiles(entries);
    }, [addFiles]);

    const toggleFile = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(files.map((f) => f.id)));
    }, [files]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const selectedFiles = files.filter((f) => selectedIds.has(f.id));

    return {
        files,
        selectedIds,
        selectedFiles,
        addFiles,
        addFromUpload,
        toggleFile,
        selectAll,
        deselectAll,
    };
};
