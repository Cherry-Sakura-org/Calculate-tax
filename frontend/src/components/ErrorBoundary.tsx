import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, p: 4 }}>
                    <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Something went wrong
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, wordBreak: 'break-word' }}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </Typography>
                        <Button variant="contained" onClick={this.handleReset}>
                            Try Again
                        </Button>
                    </Paper>
                </Box>
            );
        }
        return this.props.children;
    }
}
