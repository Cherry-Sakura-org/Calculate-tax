import { useState } from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import * as styles from './auth.styles';

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
      <IconButton onClick={handleClose} sx={styles.closeButton}>
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
