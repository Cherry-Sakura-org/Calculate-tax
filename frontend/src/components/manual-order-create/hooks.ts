import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    LATITUDE_MIN,
    LATITUDE_MAX,
    LONGITUDE_MIN,
    LONGITUDE_MAX,
} from '../../constants/coordinates';
import { useCreateOrder } from '../../api/use-orders';

const newOrderSchema = z.object({
    latitude: z
        .number({ error: 'Latitude is required' })
        .min(LATITUDE_MIN)
        .max(LATITUDE_MAX),
    longitude: z
        .number({ error: 'Longitude is required' })
        .min(LONGITUDE_MIN)
        .max(LONGITUDE_MAX),
    subtotal: z
        .number({ error: 'Subtotal is required' })
        .min(0.01),
});

export type NewOrderFormValues = z.infer<typeof newOrderSchema>;

type NewOrderDialogControllerParams = {
    onSuccess?: VoidFunction;
};

export const useNewOrderDialogController = ({ onSuccess }: NewOrderDialogControllerParams) => {
    const { mutate: createOrder, isPending } = useCreateOrder();

    const {
        handleSubmit,
        control,
        reset,
        formState: { isValid, isDirty },
    } = useForm<NewOrderFormValues>({
        resolver: zodResolver(newOrderSchema),
        mode: 'all',
    });

    const onSubmit = handleSubmit((values) => {
        createOrder(values, {
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    });

    return { onSubmit, control, isSubmitting: isPending, submitDisabled: !isDirty || !isValid };
};
