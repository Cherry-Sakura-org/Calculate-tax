import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useRegister } from '../../hooks/auth';
import { getErrorMessage } from '../../utils/auth-errors';
import * as styles from './auth.styles';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: register, isPending, error } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ username, email, password }, { onSuccess });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
      <Typography variant="h5" sx={styles.registerTitle}>Register</Typography>

      {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth sx={styles.fieldSx} />
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={styles.fieldSx} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={styles.fieldSx} />

      <Button type="submit" disabled={isPending}>
        {isPending ? <CircularProgress size={20} /> : 'Register'}
      </Button>

      <Typography variant="body2" onClick={onSwitchToLogin} sx={styles.switchLink}>
        Login
      </Typography>
    </Box>
  );
}
