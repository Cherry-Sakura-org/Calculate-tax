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
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useImportOrders } from '../../hooks/use-import-hook';
import { validateCsvFile } from '../../utils/file-utils';
import type { ImportResponse } from '../../types/order';

interface FileItem {
    file: File;
    id: string;
    selected: boolean;
    error?: string;
}

export const OrdersImport: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const { importOrders, isLoading, isSuccess, isError, data, reset } = useImportOrders();

    const handleFileChange = (fileList: FileList) => {
        const newFiles: FileItem[] = [];
        const errors: string[] = [];
        
        Array.from(fileList).forEach(file => {
            const error = validateCsvFile(file);
            const fileItem: FileItem = {
                file,
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                selected: true,
                error: error || undefined
            };
            
            if (error) {
                errors.push(`${file.name}: ${error}`);
            }
            
            newFiles.push(fileItem);
        });
        
        setFiles(prev => [...prev, ...newFiles]);
        
        if (errors.length > 0) {
            setFileError(errors.join('; '));
        } else {
            setFileError(null);
        }
        
        reset();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const handleSubmit = () => {
        const selectedFiles = files.filter(f => f.selected && !f.error);
        if (selectedFiles.length === 0) return;
        
        // Import files one by one
        selectedFiles.forEach(fileItem => {
            importOrders(fileItem.file);
        });
    };

    const handleReset = () => {
        reset();
        setFiles([]);
        setFileError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const toggleFileSelection = (id: string) => {
        setFiles(prev => prev.map(file => 
            file.id === id ? { ...file, selected: !file.selected } : file
        ));
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    };

    const toggleAllFiles = (selected: boolean) => {
        setFiles(prev => prev.map(file => ({ ...file, selected: !file.error ? selected : file.selected })));
    };

    const selectedValidFiles = files.filter(f => f.selected && !f.error);
    const hasValidFiles = files.some(f => !f.error);
    const allValidSelected = hasValidFiles && files.filter(f => !f.error).every(f => f.selected);

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
            {files.length > 0 && (
                <Box mt={3}>
                    <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                        <Typography variant='h6'>Обрані файли ({files.length})</Typography>
                        {hasValidFiles && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={allValidSelected}
                                        onChange={(e) => toggleAllFiles(e.target.checked)}
                                    />
                                }
                                label="Обрати всі"
                            />
                        )}
                    </Stack>
                    
                    <Paper variant='outlined' sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <List dense>
                            {files.map((fileItem) => (
                                <ListItem
                                    key={fileItem.id}
                                    sx={{
                                        bgcolor: fileItem.error ? 'error.light' : 'inherit',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={fileItem.selected}
                                            disabled={!!fileItem.error}
                                            onChange={() => toggleFileSelection(fileItem.id)}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={fileItem.file.name}
                                        secondary={
                                            <Stack direction='row' spacing={1}>
                                                <Typography variant='caption' color='text.secondary'>
                                                    {(fileItem.file.size / 1024).toFixed(1)} KB
                                                </Typography>
                                                {fileItem.error && (
                                                    <Typography variant='caption' color='error'>
                                                        Помилка: {fileItem.error}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        }
                                    />
                                    <IconButton
                                        edge='end'
                                        onClick={() => removeFile(fileItem.id)}
                                        size='small'
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Box>
            )}

            {/* Action buttons */}
            <Stack direction='row' spacing={2} mt={3}>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={selectedValidFiles.length === 0 || isLoading}
                    startIcon={
                        isLoading ? <CircularProgress size={18} color='inherit' /> : undefined
                    }
                >
                    {isLoading ? 'Імпортуємо...' : `Імпортувати (${selectedValidFiles.length})`}
                </Button>
                {(isSuccess || isError) && (
                    <Button variant='text' onClick={handleReset}>
                        Скинути
                    </Button>
                )}
            </Stack>

            {/* Success */}
            {isSuccess && data && (
                <Alert
                    severity='success'
                    icon={<CheckCircleOutlineIcon />}
                    sx={{ mt: 2.5 }}
                >
                    <AlertTitle>Import Complete</AlertTitle>
                    Successfully imported: <strong>{data.imported}</strong> orders.
                    {data.failed > 0 && (
                        <>
                            {' '}
                            Skipped rows with errors: <strong>{data.failed}</strong>.
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
                <Alert severity='error' sx={{ mt: 2 }}>
                    {fileError}
                </Alert>
            )}
        </Paper>
    );
};

export default OrdersImport;
