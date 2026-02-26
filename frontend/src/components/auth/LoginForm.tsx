import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useLogin } from '../../hooks/auth';
import { getErrorMessage } from '../../utils/auth-errors';
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
      <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={styles.fieldSx} />

      <Button type="submit" disabled={isPending}>
        {isPending ? <CircularProgress size={20} /> : 'Login'}
      </Button>

      <Typography variant="body2" onClick={onSwitchToRegister} sx={styles.switchLink}>
        Register
      </Typography>
    </Box>
  );
}
