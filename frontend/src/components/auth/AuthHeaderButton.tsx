import { useState } from 'react';
import { Button, Avatar, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDialog } from '../../hooks/use-dialog';
import { useCurrentUser, useLogout } from '../../hooks/auth';
import { AuthDialog } from './Auth-dialog';
import { AuthUser } from '../../types/auth';

function UserDropdown({ user }: { user: AuthUser }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const logout = useLogout();

  return (
    <>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)} endIcon={<ArrowDownIcon />}>
        <Avatar>{user.username.slice(0, 2)}</Avatar>
        <Typography>{user.username}</Typography>
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>Profile</MenuItem>
        <MenuItem>History</MenuItem>
        <MenuItem onClick={() => logout()}>Exit</MenuItem>
      </Menu>
    </>
  );
}

export function AuthHeaderButton() {
  const [showDialog, openDialog, closeDialog, mountDialog] = useDialog();
  const { data: user } = useCurrentUser();

  if (user) return <UserDropdown user={user} />;

  return (
    <>
      <Button onClick={openDialog}>Login</Button>
      {mountDialog && <AuthDialog open={showDialog} onClose={closeDialog} />}
    </>
  );
}

export default AuthHeaderButton;