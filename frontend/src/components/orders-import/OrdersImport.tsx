import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    AlertTitle,
    Paper,
    Stack,
    Chip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useImportOrders } from '../../hooks/use-import-hook';
import { validateCsvFile } from '../../utils/file-utils';

export const OrdersImport: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const { importOrders, isLoading, isSuccess, isError, data, reset } = useImportOrders();

    const handleFileChange = (files: FileList | File[]) => {
        const filesArray = Array.from(files);

        const validFiles: File[] = [];

        for (const file of filesArray) {
            const error = validateCsvFile(file);
            if (error) {
                setFileError(error);
                return;
            }
            validFiles.push(file);
        }

        setFileError(null);
        reset();
        setSelectedFiles(validFiles);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileChange(e.target.files);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const handleSubmit = () => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        
        // Import files one by one
        selectedFiles.forEach(file => {
            importOrders(file);
        });
    };

    const handleReset = () => {
        reset();
        setSelectedFiles([]);
        setFileError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Box sx={{ maxWidth: 520, mx: 'auto', p: 3 }}>
            <Typography variant='h5' fontWeight={600} gutterBottom>
                Імпорт замовлень
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={3}>
                Завантажте один або декілька CSV файлів для масового імпорту замовлень
            </Typography>

            {/* Dropzone */}
            <Paper
                variant='outlined'
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    borderColor: dragOver ? 'primary.main' : 'divider',
                    bgcolor: dragOver ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <input
                    ref={inputRef}
                    type='file'
                    accept='.csv'
                    multiple
                    hidden
                    onChange={handleInputChange}
                />
                <UploadFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant='body1' fontWeight={500}>
                    Перетягніть CSV файли сюди
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    або натисніть для вибору файлів
                </Typography>
            </Paper>

            {/* Selected files */}
            {selectedFiles.length > 0 && (
                <Box mt={3}>
                    <Typography variant='h6' mb={2}>Обрані файли ({selectedFiles.length})</Typography>
                    <Stack spacing={1}>
                        {selectedFiles.map((file, index) => (
                            <Stack direction='row' alignItems='center' spacing={1} key={index}>
                                <Chip
                                    label={file.name}
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    onDelete={() => {
                                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                />
                                <Typography variant='caption' color='text.secondary'>
                                    {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Action buttons */}
            <Stack direction='row' spacing={2} mt={3}>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={selectedFiles.length === 0 || isLoading}
                    startIcon={
                        isLoading ? <CircularProgress size={18} color='inherit' /> : undefined
                    }
                >
                    {isLoading ? 'Імпортуємо...' : `Імпортувати (${selectedFiles.length})`}
                </Button>
                {(isSuccess || isError) && (
                    <Button variant='text' onClick={handleReset}>
                        Скинути
                    </Button>
                )}
            </Stack>

            {/* Success */}
            {isSuccess && data && (
                <Alert severity='success' icon={<CheckCircleOutlineIcon />} sx={{ mt: 3 }}>
                    <AlertTitle>Імпорт завершено</AlertTitle>
                    Успішно імпортовано: <strong>{data.imported}</strong> замовлень.
                    {data.failed > 0 && (
                        <>
                            {' '}
                            Пропущено рядків із помилками: <strong>{data.failed}</strong>.
                        </>
                    )}
                    {data.errors && data.errors.length > 0 && (
                        <Box mt={1}>
                            {data.errors.map((err: string, i: number) => (
                                <Typography key={i} variant='caption' display='block'>
                                    • {err}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Alert>
            )}

            {/* Error */}
            {fileError && (
                <Alert severity='error' sx={{ mt: 1 }}>
                    {fileError}
                </Alert>
            )}
        </Box>
    );
};

export default OrdersImport;
