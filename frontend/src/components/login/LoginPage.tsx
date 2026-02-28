import { Box, Link, Stack, Typography } from '@mui/material';
import { useLoginPage } from './hooks';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import * as styles from './LoginPage.styles';

export default function LoginPage() {
    const { mode, switchMode, login, register, onLoginSuccess, onRegisterSuccess } = useLoginPage();

    return (
        <Stack sx={styles.container}>
            {/* Left branding panel */}
            <Box sx={styles.leftPanel}>
                <Typography sx={styles.brandName}>Instant Wellness Kits</Typography>
                <Typography sx={styles.welcomeText}>Welcome back</Typography>
                <Typography sx={styles.description}>
                    Manage drone deliveries, track orders, and monitor real-time sales tax
                    calculations across New York State.
                </Typography>
            </Box>

            {/* Right form panel */}
            <Box sx={styles.rightPanel}>
                <Box sx={styles.formContainer}>
                    <Typography variant='h4' sx={styles.formTitle}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Typography>
                    <Typography variant='body2' sx={styles.formSubtitle}>
                        {mode === 'login'
                            ? 'Enter your credentials to access the dashboard'
                            : 'Fill in the details to create a new account'}
                    </Typography>

                    {mode === 'login' ? (
                        <LoginForm login={login} onSuccess={onLoginSuccess} />
                    ) : (
                        <RegisterForm register={register} onSuccess={onRegisterSuccess} />
                    )}

                    <Typography variant='body2' sx={styles.switchLink}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <Link
                            component='button'
                            type='button'
                            onClick={switchMode}
                            underline='hover'
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Stack>
    );
}
