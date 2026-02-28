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
    allSelected?: boolean;
    isDeleting?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmDialog({
    open,
    count,
    allSelected,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={isDeleting ? undefined : onClose} maxWidth='xs' fullWidth>
            <DialogTitle>Delete orders</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {allSelected
                        ? 'Are you sure you want to delete all orders? This action cannot be undone.'
                        : `Are you sure you want to delete ${count} ${count === 1 ? 'order' : 'orders'}? This action cannot be undone.`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting}>Cancel</Button>
                <Button onClick={onConfirm} color='error' variant='contained' disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
