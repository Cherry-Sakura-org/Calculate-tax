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
}: ColumnHeaderProps) => (
    <Box sx={styles.headerCellContent}>
        {sortDirection === 'asc' && <ArrowUpwardIcon sx={styles.sortArrow} />}
        {sortDirection === 'desc' && <ArrowDownwardIcon sx={styles.sortArrow} />}
        <Typography
            component='span'
            onClick={onSort}
            sx={onSort ? styles.sortableLabel : { fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}
        >
            {label}
        </Typography>
        {filterType && filterType !== 'jurisdiction' && rangeValue && onRangeChange && (
            <RangeFilter
                label={label}
                filterType={filterType}
                value={rangeValue}
                onChange={onRangeChange}
            />
        )}
        {filterType === 'jurisdiction' && jurisdictionValue && onJurisdictionChange && (
            <JurisdictionFilter
                selectedIds={jurisdictionValue}
                onChange={onJurisdictionChange}
                tree={jurisdictionTree ?? []}
                isLoading={jurisdictionLoading}
            />
        )}
    </Box>
);

export default ColumnHeader;
