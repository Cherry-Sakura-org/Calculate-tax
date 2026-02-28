import { Box, Link, Stack, Typography } from '@mui/material';
import { useLoginPage } from './hooks';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import * as styles from './LoginPage.styles';

export default function LoginPage() {
    const {
        isLogin,
        title,
        subtitle,
        switchLabel,
        switchAction,
        switchMode,
        login,
        register,
        onLoginSuccess,
        onRegisterSuccess,
    } = useLoginPage();

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
                        {title}
                    </Typography>
                    <Typography variant='body2' sx={styles.formSubtitle}>
                        {subtitle}
                    </Typography>

                    {isLogin ? (
                        <LoginForm login={login} onSuccess={onLoginSuccess} />
                    ) : (
                        <RegisterForm register={register} onSuccess={onRegisterSuccess} />
                    )}

                    <Typography variant='body2' sx={styles.switchLink}>
                        {switchLabel}
                        <Link
                            component='button'
                            type='button'
                            onClick={switchMode}
                            underline='hover'
                        >
                            {switchAction}
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Stack>
    );
}
