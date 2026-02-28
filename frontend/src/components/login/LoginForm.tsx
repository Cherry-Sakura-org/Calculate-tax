import { Stack, Button, Alert } from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import TextFormField from '../../shared/form-fields/TextFormField';
import PasswordFormField from '../../shared/form-fields/PasswordFormField';
import { getErrorMessage } from '../../utils/auth-errors';
import { AuthError, AuthResponse, LoginPayload } from '../../types/auth';
import { useLoginForm } from './hooks';
import * as styles from './LoginPage.styles';

interface LoginFormProps {
    login: UseMutationResult<AuthResponse, AuthError, LoginPayload>;
    onSuccess: () => void;
}

export default function LoginForm({ login, onSuccess }: LoginFormProps) {
    const { control, onSubmit } = useLoginForm(login, onSuccess);

    return (
        <Stack component='form' onSubmit={onSubmit} spacing={3}>
            {login.error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {getErrorMessage(login.error)}
                </Alert>
            )}

            <TextFormField
                name='email'
                control={control}
                label='Email'
                autoComplete='email'
                fullWidth
            />

            <PasswordFormField name='password' control={control} label='Password' fullWidth />

            <Button
                type='submit'
                variant='contained'
                fullWidth
                loading={login.isPending}
                disabled={login.isPending}
                sx={styles.submitButton}
            >
                Sign In
            </Button>
        </Stack>
    );
}
