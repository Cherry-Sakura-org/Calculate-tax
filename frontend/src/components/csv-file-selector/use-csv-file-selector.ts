import { useState, useCallback, useEffect } from 'react';
import { useImportFiles } from '../../api/use-orders';
import type { CsvFileEntry } from './types';

export const useCsvFileSelector = () => {
    const { data: files = [], isLoading } = useImportFiles();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [initialized, setInitialized] = useState(false);

    // Select all files by default once data loads
    useEffect(() => {
        if (!initialized && files.length > 0) {
            setSelectedIds(new Set(files.map((f: CsvFileEntry) => f.id)));
            setInitialized(true);
        }
    }, [files, initialized]);

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
        setSelectedIds(new Set(files.map((f: CsvFileEntry) => f.id)));
    }, [files]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const selectedFiles = files.filter((f: CsvFileEntry) => selectedIds.has(f.id));

    return {
        files,
        selectedIds,
        selectedFiles,
        isLoading,
        toggleFile,
        selectAll,
        deselectAll,
    };
};
