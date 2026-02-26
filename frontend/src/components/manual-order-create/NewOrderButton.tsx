import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDialog } from '../../hooks/use-dialog';
import NewOrderDialog from './NewOrderDialog';

const NewOrderButton = () => {
    const [showNewOrderDialog, openNewOrderDialog, closeNewOrderDialog, mountNewOrderDialog] =
        useDialog();

    return (
        <>
            <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={openNewOrderDialog}
                sx={{
                    whiteSpace: 'nowrap',
                }}
            >
                New Order
            </Button>
            {mountNewOrderDialog && (
                <NewOrderDialog open={showNewOrderDialog} onClose={closeNewOrderDialog} />
            )}
        </>
    );
};

export default NewOrderButton;
