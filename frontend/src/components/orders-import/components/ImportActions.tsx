import React from 'react';
import { Button, Chip, Stack } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import * as styles from '../orders-import.styles';

interface ImportActionsProps {
    selectedFiles: File[];
    isSuccess: boolean;
    isError: boolean;
    onRemoveFile: (index: number) => void;
    onReset: () => void;
}

export const ImportActions: React.FC<ImportActionsProps> = ({
    selectedFiles,
    isSuccess,
    isError,
    onRemoveFile,
    onReset,
}) => {
    if (!selectedFiles.length) return null;

    return (
        <Stack spacing={1.5} sx={styles.actionsStack}>
            {selectedFiles.map((file, index) => (
                <Chip
                    key={`${file.name}-${file.lastModified}`}
                    icon={<InsertDriveFileIcon sx={styles.fileIcon} />}
                    label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                    size='medium'
                    color='primary'
                    variant='outlined'
                    onDelete={() => onRemoveFile(index)}
                    sx={styles.fileChip}
                />
            ))}

            {(isSuccess || isError) && (
                <Button variant='outlined' size='small' onClick={onReset}>
                    Reset
                </Button>
            )}
        </Stack>
    );
};
