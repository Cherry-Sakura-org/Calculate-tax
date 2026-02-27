import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDialog } from '../../hooks/use-dialog';
import NewOrderDialog from './NewOrderDialog';
import * as styles from './new-order.styles';

const NewOrderButton = () => {
    const [showNewOrderDialog, openNewOrderDialog, closeNewOrderDialog, mountNewOrderDialog] =
        useDialog();

    return (
        <>
            <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={openNewOrderDialog}
                sx={styles.newOrderButton}
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
