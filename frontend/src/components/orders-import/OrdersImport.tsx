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
    alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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
        <Paper
            sx={{
                p: { xs: 2.5, md: 3.5 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: (t) =>
                        `linear-gradient(90deg, transparent, ${t.palette.primary.main}, transparent)`,
                    opacity: 0.5,
                },
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems='flex-start'>
                {/* Dropzone */}
                <Box
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        flex: 1,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 2.5,
                        border: '2px dashed',
                        borderColor: (t) =>
                            dragOver
                                ? t.palette.primary.main
                                : alpha(t.palette.divider, 1),
                        bgcolor: (t) =>
                            dragOver
                                ? alpha(t.palette.primary.main, 0.06)
                                : 'transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            borderColor: (t) => alpha(t.palette.primary.main, 0.5),
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                            '& .upload-icon': {
                                transform: 'translateY(-4px)',
                                color: 'primary.main',
                            },
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
                    <CloudUploadIcon
                        className='upload-icon'
                        sx={{
                            fontSize: 40,
                            color: 'text.disabled',
                            mb: 1,
                            transition: 'all 0.3s ease',
                        }}
                    />
                    <Typography variant='body1' fontWeight={500} sx={{ mb: 0.5 }}>
                        Drop CSV file here
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem' }}>
                        or click to browse
                    </Typography>
                </Box>

                {/* Right side: file info + actions */}
                <Stack
                    spacing={2}
                    sx={{
                        minWidth: { md: 220 },
                        alignSelf: { xs: 'stretch', md: 'center' },
                    }}
                >
                    {selectedFile ? (
                        <Chip
                            icon={<InsertDriveFileIcon sx={{ fontSize: '16px !important' }} />}
                            label={`${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`}
                            size='small'
                            color='primary'
                            variant='outlined'
                            onDelete={handleReset}
                            sx={{ justifyContent: 'flex-start' }}
                        />
                    ) : (
                        <Typography variant='caption' color='text.secondary'>
                            No file selected
                        </Typography>
                    )}

                    <Stack direction='row' spacing={1.5}>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={handleSubmit}
                            disabled={!selectedFile || isLoading}
                            startIcon={
                                isLoading ? (
                                    <CircularProgress size={16} color='inherit' />
                                ) : undefined
                            }
                            sx={{ flex: 1 }}
                        >
                            {isLoading ? 'Importing...' : 'Import'}
                        </Button>
                        {(isSuccess || isError) && (
                            <Button variant='outlined' size='small' onClick={handleReset}>
                                Reset
                            </Button>
                        )}
                    </Stack>
                </Stack>
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
                <Alert severity='error' sx={{ mt: 2 }}>
                    {fileError}
                </Alert>
            )}
        </Paper>
    );
};

export default OrdersImport;
