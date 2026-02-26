import { useState } from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  const handleClose = () => {
    onClose();
    setTimeout(() => setMode('login'), 300);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
        <CloseIcon />
      </IconButton>

      <DialogContent>
        {mode === 'login' ? (
          <LoginForm onSuccess={handleClose} onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSuccess={handleClose} onSwitchToLogin={() => setMode('login')} />
        )}
      </DialogContent>
    </Dialog>
  );
}