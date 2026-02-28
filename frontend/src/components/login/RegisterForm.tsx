import { Stack, Button, Alert, CircularProgress } from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import TextFormField from '../../shared/form-fields/TextFormField';
import PasswordFormField from '../../shared/form-fields/PasswordFormField';
import { getErrorMessage } from '../../utils/auth-errors';
import { AuthError, AuthResponse, RegisterPayload } from '../../types/auth';
import { useRegisterForm } from './hooks';
import * as styles from './LoginPage.styles';

interface RegisterFormProps {
    register: UseMutationResult<AuthResponse, AuthError, RegisterPayload>;
    onSuccess: () => void;
}

export default function RegisterForm({ register: registerMutation, onSuccess }: RegisterFormProps) {
    const { control, onSubmit } = useRegisterForm(registerMutation, onSuccess);

    return (
        <>
            {registerMutation.error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {getErrorMessage(registerMutation.error)}
                </Alert>
            )}

            <Stack component='form' onSubmit={onSubmit} spacing={3}>
                <TextFormField name='username' control={control} label='Username' fullWidth />
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
                    disabled={registerMutation.isPending}
                    sx={styles.submitButton}
                >
                    {registerMutation.isPending ? (
                        <CircularProgress size={24} color='inherit' />
                    ) : (
                        'Sign Up'
                    )}
                </Button>
            </Stack>
        </>
    );
}
