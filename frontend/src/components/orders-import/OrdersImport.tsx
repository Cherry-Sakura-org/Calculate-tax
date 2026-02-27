import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Stack,
} from '@mui/material';
import { useFileUpload } from './hooks/use-file-upload';
import { Dropzone } from './components/Dropzone';
import { ImportActions } from './components/ImportActions';
import { ImportResult } from './components/ImportResult';
import * as styles from './orders-import-dialog.styles';

interface OrdersImportDialogProps {
    open: boolean;
    onClose: () => void;
}

export const OrdersImportDialog: React.FC<OrdersImportDialogProps> = ({ open, onClose }) => {
    const {
        inputRef,
        selectedFiles,
        dragOver,
        fileError,
        isLoading,
        isSuccess,
        isError,
        handleInputChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleSubmit,
        handleRemoveFile,
        handleReset,
        openFilePicker,
    } = useFileUpload();

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>Import Orders</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={styles.content}>
                    <Dropzone
                        inputRef={inputRef}
                        dragOver={dragOver}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={openFilePicker}
                        onInputChange={handleInputChange}
                    />
                    <ImportActions
                        selectedFiles={selectedFiles}
                        isSuccess={isSuccess}
                        isError={isError}
                        onRemoveFile={handleRemoveFile}
                        onReset={handleReset}
                    />
                    <ImportResult isSuccess={isSuccess} fileError={fileError} />
                </Stack>
            </DialogContent>
            <DialogActions sx={styles.dialogActions}>
                <Button onClick={onClose} variant='text'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={!selectedFiles.length || isSuccess || isError}
                >
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrdersImportDialog;
