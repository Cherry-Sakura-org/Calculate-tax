import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    ListItemText,
    MenuList,
    MenuItem,
    Paper,
    Popper,
    Tooltip,
    Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { CsvFileEntry } from './types';
import * as styles from './csv-file-selector.styles';

interface CsvFileSelectorProps {
    files: CsvFileEntry[];
    selectedIds: Set<string>;
    includeManual: boolean;
    isDeleting?: boolean;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onSelectOnly: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleIncludeManual: () => void;
}

const CsvFileSelector: React.FC<CsvFileSelectorProps> = ({
    files,
    selectedIds,
    includeManual,
    isDeleting,
    onToggle,
    onSelectAll,
    onDeselectAll,
    onSelectOnly,
    onDelete,
    onToggleIncludeManual,
}) => {
    const [open, setOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CsvFileEntry | null>(null);
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

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const label =
        files.length === 0
            ? 'No CSV files selected'
            : `CSV files selected: ${selectedCount} of ${files.length}`;

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
                        <MenuList dense disablePadding>
                            <MenuItem onClick={onToggleIncludeManual} sx={styles.selectAllItem}>
                                <Checkbox size='small' checked={includeManual} />
                                <ListItemText primary='Include manual transactions' />
                            </MenuItem>
                            <Divider />
                        </MenuList>
                        {files.length === 0 ? (
                            <Typography variant='body2' sx={styles.emptyText}>
                                Import CSV files to get started
                            </Typography>
                        ) : (
                            <MenuList dense disablePadding>
                                <MenuItem onClick={handleToggleAll} sx={styles.selectAllItem}>
                                    <Checkbox
                                        size='small'
                                        checked={allSelected}
                                        indeterminate={selectedCount > 0 && !allSelected}
                                    />
                                    <ListItemText primary='Select all' />
                                </MenuItem>
                                <Divider />
                                {files.map((file) => (
                                    <MenuItem
                                        key={file.id}
                                        onClick={() => onToggle(file.id)}
                                        sx={styles.menuItem}
                                    >
                                        <Checkbox size='small' checked={selectedIds.has(file.id)} />
                                        <ListItemText primary={file.original_filename} />
                                        <Box
                                            component='span'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectOnly(file.id);
                                            }}
                                            sx={styles.onlyButton}
                                        >
                                            Only
                                        </Box>
                                        <Tooltip title='Delete file and its orders' arrow>
                                            <IconButton
                                                size='small'
                                                disabled={isDeleting}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(file);
                                                }}
                                                sx={styles.deleteButton}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </MenuItem>
                                ))}
                            </MenuList>
                        )}
                    </Paper>
                </ClickAwayListener>
            </Popper>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete import file?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete all orders from{' '}
                        <strong>{deleteTarget?.original_filename}</strong>. This action cannot be
                        undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color='error' variant='contained'>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CsvFileSelector;
