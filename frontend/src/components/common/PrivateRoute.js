import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (adminOnly && user.role !== 'admin') {
        // Redirect to home if not admin but admin access is required
        router.push('/');
      } else {
        // User is authenticated and authorized
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, adminOnly]);

  if (loading || !isAuthorized) {
    // Show loading spinner or placeholder
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
