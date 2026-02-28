import { useState, useCallback, useEffect } from 'react';
import { useImportFiles, useDeleteImportFile } from '../../api/use-orders';
import type { CsvFileEntry } from './types';

export const useCsvFileSelector = () => {
    const { data: files = [], isLoading } = useImportFiles();
    const deleteImportFile = useDeleteImportFile();
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

    const selectOnly = useCallback((id: string) => {
        setSelectedIds(new Set([id]));
    }, []);

    const deleteFile = useCallback((id: string) => {
        deleteImportFile.mutate(id, {
            onSuccess: () => {
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            },
        });
    }, [deleteImportFile]);

    const selectedFiles = files.filter((f: CsvFileEntry) => selectedIds.has(f.id));

    return {
        files,
        selectedIds,
        selectedFiles,
        isLoading,
        isDeleting: deleteImportFile.isPending,
        toggleFile,
        selectAll,
        deselectAll,
        selectOnly,
        deleteFile,
    };
};
