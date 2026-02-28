import { Box, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { FilterType, JurisdictionNode, RangeFilterValue, SortDirection } from './types';
import RangeFilter from './RangeFilter';
import JurisdictionFilter from './JurisdictionFilter';
import * as styles from './filters.styles';

interface ColumnHeaderProps {
    label: string;
    filterType?: FilterType;
    rangeValue?: RangeFilterValue;
    onRangeChange?: (value: RangeFilterValue) => void;
    jurisdictionValue?: Set<string>;
    onJurisdictionChange?: (value: Set<string>) => void;
    jurisdictionTree?: JurisdictionNode[];
    jurisdictionLoading?: boolean;
    sortDirection?: SortDirection;
    onSort?: () => void;
    align?: 'left' | 'right' | 'center';
}

const ColumnHeader = ({
    label,
    filterType,
    rangeValue,
    onRangeChange,
    jurisdictionValue,
    onJurisdictionChange,
    jurisdictionTree,
    jurisdictionLoading,
    sortDirection,
    onSort,
    align,
}: ColumnHeaderProps) => {
    const isRight = align === 'right';

    const filterElement = filterType && filterType !== 'jurisdiction' && rangeValue && onRangeChange ? (
        <RangeFilter
            label={label}
            filterType={filterType}
            value={rangeValue}
            onChange={onRangeChange}
        />
    ) : filterType === 'jurisdiction' && jurisdictionValue && onJurisdictionChange ? (
        <JurisdictionFilter
            selectedIds={jurisdictionValue}
            onChange={onJurisdictionChange}
            tree={jurisdictionTree ?? []}
            isLoading={jurisdictionLoading}
        />
    ) : null;

    const sortIcon = sortDirection === 'asc'
        ? <ArrowUpwardIcon sx={styles.sortArrowInline} />
        : sortDirection === 'desc'
            ? <ArrowDownwardIcon sx={styles.sortArrowInline} />
            : null;

    return (
        <Box sx={{ ...styles.headerCellContent, ...(isRight && { justifyContent: 'flex-end' }) }}>
            {sortIcon}
            <Typography
                component='span'
                onClick={onSort}
                sx={onSort ? styles.sortableLabel : { fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}
            >
                {label}
            </Typography>
            {filterElement}
        </Box>
    );
};

export default ColumnHeader;
