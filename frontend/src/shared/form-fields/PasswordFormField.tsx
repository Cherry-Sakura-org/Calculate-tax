import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import TextFormField from './TextFormField';

interface PasswordFormFieldProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    label?: string;
    fullWidth?: boolean;
}

const PasswordFormField = <TFieldValues extends FieldValues>({
    ...props
}: PasswordFormFieldProps<TFieldValues>) => {
    const [visible, setVisible] = useState(false);

    return (
        <TextFormField
            {...props}
            type={visible ? 'text' : 'password'}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton
                                onClick={() => setVisible((v) => !v)}
                                edge='end'
                                size='small'
                            >
                                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default PasswordFormField;
