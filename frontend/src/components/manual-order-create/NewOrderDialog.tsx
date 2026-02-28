import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import {
    COORDINATES_DECIMAL_SCALE,
    LATITUDE_MAX,
    LATITUDE_MIN,
    LONGITUDE_MAX,
    LONGITUDE_MIN,
} from '../../constants/coordinates';
import NumberFormField from '../../shared/form-fields/NumberFormField';
import { useNewOrderDialogController } from './hooks';
import * as styles from './new-order.styles';

interface NewOrderDialogProps {
    open: boolean;
    onClose: () => void;
}

const NewOrderDialog = ({ open, onClose }: NewOrderDialogProps) => {
    const { control, onSubmit, isSubmitting } = useNewOrderDialogController({
        onSuccess: onClose,
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle>New Delivery Order</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={styles.formContent}>
                    <Stack direction='row' spacing={2}>
                        <NumberFormField
                            name='latitude'
                            control={control}
                            label='Latitude'
                            fullWidth
                            size='medium'
                            min={LATITUDE_MIN}
                            max={LATITUDE_MAX}
                            decimalScale={COORDINATES_DECIMAL_SCALE}
                        />
                        <NumberFormField
                            name='longitude'
                            control={control}
                            label='Longitude'
                            fullWidth
                            size='medium'
                            min={LONGITUDE_MIN}
                            max={LONGITUDE_MAX}
                            decimalScale={COORDINATES_DECIMAL_SCALE}
                        />
                    </Stack>
                    <NumberFormField
                        name='subtotal'
                        control={control}
                        label='Subtotal'
                        fullWidth
                        min={0.01}
                        prefix='$'
                        size='medium'
                        decimalScale={2}
                        fixedDecimalScale
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={styles.dialogActions}>
                <Button onClick={onClose} variant='text'>
                    Cancel
                </Button>
                <Button variant='contained' onClick={onSubmit} loading={isSubmitting} disabled={submitDisabled}>
                    Create Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewOrderDialog;
