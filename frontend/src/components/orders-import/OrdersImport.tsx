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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const { importOrders, isLoading, isSuccess, isError, error, data, reset } = useImportOrders();

    const handleFileChange = (file: File) => {
        const error = validateCsvFile(file);
        if (error) {
            setFileError(error);
            return;
        }
        setFileError(null);
        reset();
        setSelectedFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileChange(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileChange(file);
    };

    const handleSubmit = () => {
        if (!selectedFile) return;
        importOrders(selectedFile);
    };

    const handleReset = () => {
        reset();
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Box sx={{ maxWidth: 520, mx: 'auto', p: 3 }}>
            <Typography variant='h5' fontWeight={600} gutterBottom>
                Import Orders
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={3}>
                Upload a CSV file for bulk order import
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
                    hidden
                    onChange={handleInputChange}
                />
                <UploadFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant='body1' fontWeight={500}>
                    Drag and drop a CSV file here
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    or click to select
                </Typography>
            </Paper>

            {/* Selected file */}
            {selectedFile && (
                <Stack direction='row' alignItems='center' spacing={1} mt={2}>
                    <Chip
                        label={selectedFile.name}
                        size='small'
                        color='primary'
                        variant='outlined'
                        onDelete={handleReset}
                    />
                    <Typography variant='caption' color='text.secondary'>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                </Stack>
            )}

            {/* Action buttons */}
            <Stack direction='row' spacing={2} mt={3}>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    startIcon={
                        isLoading ? <CircularProgress size={18} color='inherit' /> : undefined
                    }
                >
                    {isLoading ? 'Importing...' : 'Import'}
                </Button>
                {(isSuccess || isError) && (
                    <Button variant='text' onClick={handleReset}>
                        Reset
                    </Button>
                )}
            </Stack>

            {/* Success */}
            {isSuccess && data && (
                <Alert severity='success' icon={<CheckCircleOutlineIcon />} sx={{ mt: 3 }}>
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
                            {data.errors.map((err, i) => (
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
