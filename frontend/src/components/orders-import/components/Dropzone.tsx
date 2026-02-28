import React from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as styles from '../orders-import.styles';

interface DropzoneProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    dragOver: boolean;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
    inputRef,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onClick,
    onInputChange,
}) => (
    <Box
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        sx={styles.dropzone(dragOver)}
    >
        <input ref={inputRef} type='file' accept='.csv' multiple hidden onChange={onInputChange} />
        <CloudUploadIcon className='upload-icon' sx={styles.uploadIcon} />
        <Typography variant='body1' fontWeight={500} sx={styles.dropzoneTitle}>
            Drop CSV files here
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={styles.dropzoneSubtitle}>
            or click to browse
        </Typography>
    </Box>
);
