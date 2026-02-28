import { TextField, TextFieldProps } from '@mui/material';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

interface TextFormFieldProps<TFieldValues extends FieldValues> extends Omit<
    TextFieldProps,
    'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText' | 'inputRef'
> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
}

const TextFormField = <TFieldValues extends FieldValues>({
    name,
    control,
    ...props
}: TextFormFieldProps<TFieldValues>) => {
    const {
        field: { onBlur, onChange, value, ref },
        fieldState: { error, invalid },
    } = useController({ name, control });

    return (
        <TextField
            {...props}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            inputRef={ref}
            error={invalid}
            helperText={error?.message}
        />
    );
};

export default TextFormField;
