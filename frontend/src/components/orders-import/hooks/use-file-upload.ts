import { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../../api/orders';
import { validateCsvFile } from '../../../utils/file-utils';

export const useFileUpload = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (files: File[]) => ordersApi.import(files),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const addFiles = useCallback(
        (files: FileList) => {
            const newFiles: File[] = [];
            const errors: string[] = [];

            Array.from(files).forEach((file) => {
                const error = validateCsvFile(file);
                if (error) {
                    errors.push(`${file.name}: ${error}`);
                } else {
                    newFiles.push(file);
                }
            });

            if (errors.length) {
                setFileError(errors.join('\n'));
            } else {
                setFileError(null);
            }

            if (newFiles.length) {
                mutation.reset();
                setSelectedFiles((prev) => [...prev, ...newFiles]);
            }
        },
        [mutation],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) addFiles(e.target.files);
        },
        [addFiles],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        },
        [addFiles],
    );

    const handleSubmit = useCallback(() => {
        if (!selectedFiles.length) return;
        mutation.mutate(selectedFiles);
    }, [selectedFiles, mutation]);

    const handleRemoveFile = useCallback((index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleReset = useCallback(() => {
        mutation.reset();
        setSelectedFiles([]);
        setFileError(null);
        if (inputRef.current) inputRef.current.value = '';
    }, [mutation]);

    const openFilePicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return {
        inputRef,
        selectedFiles,
        dragOver,
        fileError,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        handleInputChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleSubmit,
        handleRemoveFile,
        handleReset,
        openFilePicker,
    };
};
