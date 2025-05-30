import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from 'context/AppContext';
import { checkAuthAndRole } from 'utils/authUtils';
import Loader from 'components/shared/Loader/Loader';

/**
 * Higher-Order Component to protect routes that require authentication
 * @param {React.Component} WrappedComponent - The component to protect
 * @param {Object} options - Options for route protection
 * @param {string|Array} options.requiredRole - Required role(s) to access the route
 * @param {string} options.redirectPath - Custom redirect path when unauthorized
 * @param {boolean} options.loadingComponent - Custom loading component to show while checking auth
 * @returns {React.Component} Protected component
 */
const withAuth = (
  WrappedComponent,
  { requiredRole = null, redirectPath = null, loadingComponent: LoadingComponent = null } = {}
) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const { user, loading: userLoading } = useAppContext();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Only check auth once user data is loaded
      if (!userLoading) {
        const { isAuthorized: authorized, redirectPath: authRedirectPath } = 
          checkAuthAndRole(user, requiredRole);
        
        setIsAuthorized(authorized);
        
        // Redirect if not authorized
        if (!authorized) {
          const redirectTo = redirectPath || authRedirectPath || '/';
          router.push(redirectTo);
        }
        
        setIsLoading(false);
      }
    }, [user, userLoading, router, requiredRole, redirectPath]);

    // Show loading state
    if (isLoading || userLoading) {
      return LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <div className="auth-loading">
          <Loader />
          <style jsx>{`
            .auth-loading {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 50vh;
            }
          `}</style>
        </div>
      );
    }

    // Render the protected component if authorized
    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  // Set display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuth.displayName = `withAuth(${displayName})`;

  return WithAuth;
};

export default withAuth;
