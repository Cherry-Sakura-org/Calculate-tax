import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

interface DeleteConfirmDialogProps {
    open: boolean;
    count: number;
    onClose: () => void;
    /** Called when the user confirms deletion. Connect to your backend API here. */
    onConfirm: () => void;
}

export default function DeleteConfirmDialog({
    open,
    count,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
            <DialogTitle>Delete orders</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete {count}{' '}
                    {count === 1 ? 'order' : 'orders'}? This action cannot be
                    undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} color='error' variant='contained'>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
