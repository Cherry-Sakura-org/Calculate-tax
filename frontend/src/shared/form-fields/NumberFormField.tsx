import { NumericFormat, NumericFormatProps, NumberFormatValues } from 'react-number-format';
import { TextField, TextFieldProps } from '@mui/material';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

interface NumberFormFieldProps<TFieldValues extends FieldValues> extends Omit<
    NumericFormatProps<TextFieldProps>,
    'onValueChange' | 'value'
> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    min?: number;
    max?: number;
}

const NumberFormField = <TFieldValues extends FieldValues>({
    name,
    control,
    min,
    max,
    isAllowed,
    ...props
}: NumberFormFieldProps<TFieldValues>) => {
    const {
        field: { onBlur, onChange, value, ref },
        fieldState: { error, invalid },
    } = useController({ name, control });

    const resolvedIsAllowed = (values: NumberFormatValues) => {
        const { floatValue } = values;
        if (floatValue !== undefined) {
            if (min !== undefined && floatValue < min) return false;
            if (max !== undefined && floatValue > max) return false;
        }
        return isAllowed ? isAllowed(values) : true;
    };

    return (
        <NumericFormat
            {...props}
            customInput={TextField}
            value={value ?? ''}
            onBlur={onBlur}
            inputRef={ref}
            error={invalid}
            helperText={error?.message}
            isAllowed={resolvedIsAllowed}
            onValueChange={({ floatValue }) => onChange(floatValue)}
        />
    );
};

export default NumberFormField;
