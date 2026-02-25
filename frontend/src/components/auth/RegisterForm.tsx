import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useRegister } from '../../hooks/auth';

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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant="h5" sx={{ color: '#fff' }}>Register</Typography>

      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
      <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />

      <Button type="submit" disabled={isPending}>
        {isPending ? <CircularProgress size={20} /> : 'Register'}
      </Button>

      <Typography variant="body2" onClick={onSwitchToLogin} sx={{ cursor: 'pointer', color: '#00d4aa' }}>
        Login
      </Typography>
    </Box>
  );
}