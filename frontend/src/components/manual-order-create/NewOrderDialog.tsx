import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    alpha,
    Box,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
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
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction='row' alignItems='center' spacing={1.5}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: (t) =>
                                `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.15)} 0%, ${alpha(t.palette.primary.dark, 0.1)} 100%)`,
                            border: (t) =>
                                `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <MyLocationIcon
                            sx={{ fontSize: 18, color: 'primary.main' }}
                        />
                    </Box>
                    <Box>
                        <Typography variant='h6' sx={{ fontSize: '1.1rem' }}>
                            New Delivery Order
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            GPS coordinates + amount
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <Stack direction='row' spacing={2}>
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
                    </Stack>
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
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                <Button onClick={onClose} variant='text'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    onClick={onSubmit}
                    loading={isSubmitting}
                    disabled={submitDisabled}
                >
                    Create Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewOrderDialog;
