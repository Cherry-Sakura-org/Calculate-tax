import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as styles from '../orders-import.styles';

interface ImportResultProps {
    isSuccess: boolean;
    fileError: string | null;
}

export const ImportResult: React.FC<ImportResultProps> = ({ isSuccess, fileError }) => (
    <>
        {isSuccess && (
            <Alert severity='success' icon={<CheckCircleOutlineIcon />} sx={styles.successAlert}>
                <AlertTitle>Import Complete</AlertTitle>
                Orders imported successfully.
            </Alert>
        )}

        {fileError && (
            <Alert severity='error' sx={styles.errorAlert}>
                {fileError}
            </Alert>
        )}
    </>
);
