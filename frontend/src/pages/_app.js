import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppProvider } from '../context/AppContext';
import '../styles/styles.scss';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Handle scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
