import { useState } from 'react';
import {
    Box,
    Checkbox,
    CircularProgress,
    Collapse,
    IconButton,
    Popover,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import type { JurisdictionNode } from './types';
import * as styles from './filters.styles';

interface JurisdictionFilterProps {
    selectedIds: Set<string>;
    onChange: (selectedIds: Set<string>) => void;
    tree: JurisdictionNode[];
    isLoading?: boolean;
}

const getAllLeafIds = (nodes: JurisdictionNode[]): string[] =>
    nodes.flatMap((node) =>
        node.children ? getAllLeafIds(node.children) : [node.id],
    );

interface TreeNodeProps {
    node: JurisdictionNode;
    selectedIds: Set<string>;
    onToggle: (id: string, leafIds: string[]) => void;
    searchQuery: string;
}

const TreeNode = ({ node, selectedIds, onToggle, searchQuery }: TreeNodeProps) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = Boolean(node.children?.length);
    const leafIds = hasChildren ? getAllLeafIds(node.children!) : [node.id];

    const checkedCount = leafIds.filter((id) => selectedIds.has(id)).length;
    const isChecked = checkedCount === leafIds.length;
    const isIndeterminate = checkedCount > 0 && checkedCount < leafIds.length;

    // Filter by search
    const matchesSelf = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChild = hasChildren && getAllLeafIds(node.children!).some((id) => {
        const findLabel = (nodes: JurisdictionNode[]): string | undefined => {
            for (const n of nodes) {
                if (n.id === id) return n.label;
                if (n.children) {
                    const found = findLabel(n.children);
                    if (found) return found;
                }
            }
            return undefined;
        };
        const label = findLabel(node.children!);
        return label?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (searchQuery && !matchesSelf && !matchesChild) return null;

    return (
        <Box>
            <Stack direction='row' alignItems='center'>
                {hasChildren ? (
                    <IconButton
                        size='small'
                        onClick={() => setExpanded(!expanded)}
                        sx={{ p: 0.25 }}
                    >
                        {expanded ? (
                            <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
                        ) : (
                            <ChevronRightIcon sx={{ fontSize: '1rem' }} />
                        )}
                    </IconButton>
                ) : (
                    <Box sx={{ width: 20, flexShrink: 0 }} />
                )}
                <Checkbox
                    size='small'
                    checked={isChecked}
                    indeterminate={isIndeterminate}
                    onChange={() => onToggle(node.id, leafIds)}
                    sx={styles.jurisdictionCheckbox}
                />
                <Typography
                    sx={styles.jurisdictionNodeLabel}
                    onClick={() => {
                        if (hasChildren) setExpanded(!expanded);
                    }}
                    style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                >
                    {node.label}
                </Typography>
            </Stack>

            {hasChildren && (
                <Collapse in={expanded || (searchQuery !== '' && matchesChild)}>
                    <Box sx={styles.jurisdictionChildrenContainer}>
                        {node.children!.map((child) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                selectedIds={selectedIds}
                                onToggle={onToggle}
                                searchQuery={searchQuery}
                            />
                        ))}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
};

const JurisdictionFilter = ({ selectedIds, onChange, tree, isLoading }: JurisdictionFilterProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const open = Boolean(anchorEl);

    const hasValue = selectedIds.size > 0;

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSearchQuery('');
    };

    const handleToggle = (_nodeId: string, leafIds: string[]) => {
        const next = new Set(selectedIds);
        const allSelected = leafIds.every((id) => next.has(id));

        if (allSelected) {
            leafIds.forEach((id) => next.delete(id));
        } else {
            leafIds.forEach((id) => next.add(id));
        }

        onChange(next);
    };

    const handleSelectAll = () => {
        const allIds = getAllLeafIds(tree);
        onChange(new Set(allIds));
    };

    const allLeafIds = getAllLeafIds(tree);
    const allSelected = allLeafIds.every((id) => selectedIds.has(id));
    const someSelected = allLeafIds.some((id) => selectedIds.has(id));

    return (
        <>
            <IconButton
                size='small'
                onClick={handleOpen}
                sx={hasValue ? styles.filterIconButtonActive : styles.filterIconButton}
            >
                <FilterListIcon />
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                sx={styles.filterPopover}
            >
                <Box sx={styles.filterPopoverContent}>
                    <Typography sx={styles.filterTitle}>
                        Jurisdictions
                    </Typography>

                    <TextField
                        size='small'
                        fullWidth
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <SearchIcon sx={{ fontSize: '0.875rem', mr: 0.5, color: 'text.secondary' }} />
                                ),
                            },
                        }}
                        sx={styles.jurisdictionSearchInput}
                    />

                    {/* Select All */}
                    <Stack direction='row' alignItems='center' sx={{ mb: 0.25 }}>
                        <Checkbox
                            size='small'
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onChange={() => {
                                if (allSelected) {
                                    onChange(new Set());
                                } else {
                                    handleSelectAll();
                                }
                            }}
                            sx={styles.jurisdictionCheckbox}
                        />
                        <Typography sx={{ ...styles.jurisdictionNodeLabel, fontWeight: 600 }}>
                            Select all
                        </Typography>
                    </Stack>

                    <Box sx={styles.jurisdictionTree}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : tree.map((node) => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                selectedIds={selectedIds}
                                onToggle={handleToggle}
                                searchQuery={searchQuery}
                            />
                        ))}
                    </Box>
                </Box>
            </Popover>
        </>
    );
};

export default JurisdictionFilter;
