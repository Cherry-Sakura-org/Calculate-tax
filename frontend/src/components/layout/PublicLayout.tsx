import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '../../hooks/auth';

export default function PublicLayout() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) return null;
    if (user) return <Navigate to='/' replace />;

    return <Outlet />;
}
