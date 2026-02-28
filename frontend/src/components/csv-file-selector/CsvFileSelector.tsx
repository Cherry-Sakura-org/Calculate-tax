import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    ClickAwayListener,
    ListItemText,
    MenuList,
    MenuItem,
    Paper,
    Popper,
    Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { CsvFileEntry } from './types';
import * as styles from './csv-file-selector.styles';

interface CsvFileSelectorProps {
    files: CsvFileEntry[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onSelectOnly: (id: string) => void;
}

const CsvFileSelector: React.FC<CsvFileSelectorProps> = ({
    files,
    selectedIds,
    onToggle,
    onSelectAll,
    onDeselectAll,
    onSelectOnly,
}) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    const selectedCount = selectedIds.size;
    const allSelected = files.length > 0 && selectedCount === files.length;

    const handleToggleAll = () => {
        if (allSelected) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    const label = files.length === 0
        ? 'No files'
        : `${selectedCount} of ${files.length} files`;

    return (
        <>
            <Button
                ref={anchorRef}
                variant='outlined'
                size='small'
                onClick={() => setOpen((prev) => !prev)}
                endIcon={<ArrowDropDownIcon />}
                sx={styles.selectButton}
            >
                {label}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement='bottom-start'
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <Paper sx={{ minWidth: 240, maxHeight: 320, overflow: 'auto' }}>
                        {files.length === 0 ? (
                            <Typography variant='body2' sx={styles.emptyText}>
                                Import CSV files to get started
                            </Typography>
                        ) : (
                            <MenuList dense>
                                <MenuItem
                                    onClick={handleToggleAll}
                                    sx={styles.selectAllItem}
                                >
                                    <Checkbox
                                        size='small'
                                        checked={allSelected}
                                        indeterminate={selectedCount > 0 && !allSelected}
                                    />
                                    <ListItemText primary='Select all' />
                                </MenuItem>
                                {files.map((file) => (
                                    <MenuItem
                                        key={file.id}
                                        onClick={() => onToggle(file.id)}
                                        sx={styles.menuItem}
                                    >
                                        <Checkbox
                                            size='small'
                                            checked={selectedIds.has(file.id)}
                                        />
                                        <ListItemText primary={file.original_filename} />
                                        <Box
                                            component='span'
                                            onClick={(e) => { e.stopPropagation(); onSelectOnly(file.id); }}
                                            sx={styles.onlyButton}
                                        >
                                            Only
                                        </Box>
                                    </MenuItem>
                                ))}
                            </MenuList>
                        )}
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
};

export default CsvFileSelector;
