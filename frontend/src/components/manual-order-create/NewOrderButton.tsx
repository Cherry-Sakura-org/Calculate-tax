import { Button } from '@mui/material';
import { useDialog } from '../../hooks/use-dialog';
import NewOrderDialog from './NewOrderDialog';

const NewOrderButton = () => {
    const [showNewOrderDialog, openNewOrderDialog, closeNewOrderDialog, mountNewOrderDialog] =
        useDialog();

    return (
        <>
            <Button variant='contained' color='primary' onClick={openNewOrderDialog}>
                New Order
            </Button>
            {mountNewOrderDialog && (
                <NewOrderDialog open={showNewOrderDialog} onClose={closeNewOrderDialog} />
            )}
        </>
    );
};

export default NewOrderButton;
