import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import { useLogin } from '../../hooks/auth';
import { getErrorMessage } from '../../utils/auth-errors';
import { API_BASE } from '../../api/client';
import * as styles from './auth.styles';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, { onSuccess });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
      <Typography variant="h5" sx={styles.formTitle}>Auth</Typography>

      {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={styles.fieldSx} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={styles.fieldSx} />

      <Button type="submit" disabled={isPending} variant="contained">
        {isPending ? <CircularProgress size={20} /> : 'Login'}
      </Button>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }}>or</Divider>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={() => window.location.href = API_BASE + '/oauth2/authorization/github'}
          sx={{ textTransform: 'none' }}
        >
          GitHub
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => window.location.href = API_BASE + '/oauth2/authorization/google'}
          sx={{ textTransform: 'none' }}
        >
          Google
        </Button>
      </Box>

      <Typography variant="body2" onClick={onSwitchToRegister} sx={styles.switchLink}>
        Register
      </Typography>
    </Box>
  );
}