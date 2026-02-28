import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Button, Alert, CircularProgress } from '@mui/material';
import { UseMutationResult } from '@tanstack/react-query';
import TextFormField from '../../shared/form-fields/TextFormField';
import PasswordFormField from '../../shared/form-fields/PasswordFormField';
import { getErrorMessage } from '../../utils/auth-errors';
import { AuthError, AuthResponse, RegisterPayload } from '../../types/auth';
import * as styles from './LoginPage.styles';

const registerSchema = z.object({
    username: z.string().min(2),
    email: z.email(),
    password: z.string().min(4),
});

type RegisterValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    register: UseMutationResult<AuthResponse, AuthError, RegisterPayload>;
    onSuccess: () => void;
}

export default function RegisterForm({ register: registerMutation, onSuccess }: RegisterFormProps) {
    const { control, handleSubmit } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: '', email: '', password: '' },
    });

    const onSubmit = handleSubmit((data) => {
        registerMutation.mutate(data, { onSuccess });
    });

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
