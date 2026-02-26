import { Box, Typography, Stack, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import * as styles from './site-header.styles';

const SiteHeader = () => {
    return (
        <Box component='header' sx={styles.header}>
            <Stack direction='row' alignItems='center' spacing={1.5}>
                <Box sx={styles.iconBox}>
                    <LocalShippingIcon sx={styles.shippingIcon} />
                </Box>
                <Box>
                    <Typography variant='h6' sx={styles.title}>
                        Instant Wellness Kits
                    </Typography>
                    <Typography variant='overline' sx={styles.subtitle}>
                        Drone Delivery Command Center
                    </Typography>
                </Box>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
                <Chip
                    icon={<FiberManualRecordIcon sx={styles.statusDot} />}
                    label='System Online'
                    size='small'
                    variant='outlined'
                    sx={styles.statusChip}
                />
                <Typography variant='caption' sx={styles.regionLabel}>
                    NY Region
                </Typography>
            </Stack>
        </Box>
    );
};

export default SiteHeader;
