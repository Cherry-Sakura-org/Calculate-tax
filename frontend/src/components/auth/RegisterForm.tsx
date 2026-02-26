import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useRegister } from '../../hooks/auth';
import { getErrorMessage } from '../../utils/auth-errors';

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
      <Typography variant="h5" sx={{ color: '#fff' }}>Register</Typography>

      {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth required sx={fieldSx} />
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required sx={fieldSx} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required sx={fieldSx} />

      <Button type="submit" disabled={isPending}>
        {isPending ? <CircularProgress size={20} /> : 'Register'}
      </Button>

      <Button
        type="button"
        variant="text"
        onClick={onSwitchToLogin}
        sx={{ cursor: 'pointer', color: '#00d4aa', textTransform: 'none', alignSelf: 'flex-start', padding: 0, minWidth: 'auto' }}
      >
        Login
      </Button>
    </Box>
  );
}