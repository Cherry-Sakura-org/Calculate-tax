import React from 'react';
import { Alert } from '@mui/material';
import * as styles from '../orders-import.styles';

interface ImportResultProps {
    fileError: string | null;
}

export const ImportResult: React.FC<ImportResultProps> = ({ fileError }) => (
    <>
        {fileError && (
            <Alert severity='error' sx={styles.errorAlert}>
                {fileError}
            </Alert>
        )}
    </>
);
