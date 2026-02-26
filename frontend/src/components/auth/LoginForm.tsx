import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useLogin } from '../../hooks/auth';
import { getErrorMessage } from '../../utils/auth-errors';

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

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(0,212,170,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#00d4aa' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#00d4aa' },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>Auth</Typography>

      {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={fieldSx} />
      <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={fieldSx} />

      <Button type="submit" disabled={isPending}>
        {isPending ? <CircularProgress size={20} /> : 'Login'}
      </Button>

      <Typography variant="body2" onClick={onSwitchToRegister} sx={{ cursor: 'pointer', color: '#00d4aa' }}>
        Register
      </Typography>
    </Box>
  );
}