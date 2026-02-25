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

interface NewOrderDialogProps {
    open: boolean;
    onClose: () => void;
}

const NewOrderDialog = ({ open, onClose }: NewOrderDialogProps) => {
    const { control, onSubmit, isSubmitting, submitDisabled } = useNewOrderDialogController({
        onSuccess: onClose,
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle>New Order</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <NumberFormField
                        name='latitude'
                        control={control}
                        label='Latitude'
                        fullWidth
                        min={LATITUDE_MIN}
                        max={LATITUDE_MAX}
                        decimalScale={COORDINATES_DECIMAL_SCALE}
                    />
                    <NumberFormField
                        name='longitude'
                        control={control}
                        label='Longitude'
                        fullWidth
                        min={LONGITUDE_MIN}
                        max={LONGITUDE_MAX}
                        decimalScale={COORDINATES_DECIMAL_SCALE}
                    />
                    <NumberFormField
                        name='subtotal'
                        control={control}
                        label='Subtotal'
                        fullWidth
                        min={0.01}
                        prefix='$'
                        decimalScale={2}
                        fixedDecimalScale
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant='contained'
                    onClick={onSubmit}
                    loading={isSubmitting}
                    disabled={submitDisabled}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewOrderDialog;
