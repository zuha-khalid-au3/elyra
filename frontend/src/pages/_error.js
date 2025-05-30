import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PublicLayout } from 'layout/PublicLayout';
import { Error as ErrorComponent } from 'components/Error/Error';

function Error({ statusCode = 500, message }) {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home if the error is 404 after 5 seconds
    if (statusCode === 404) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusCode, router]);

  // Default message if none provided
  if (!message) {
    switch (statusCode) {
      case 404:
        message = 'The page you are looking for cannot be found.';
        break;
      case 500:
        message = 'Something went wrong on our end. Please try again later.';
        break;
      case 403:
        message = 'You do not have permission to access this page.';
        break;
      case 401:
        message = 'You need to be logged in to access this page.';
        break;
      default:
        message = 'An error occurred. Please try again later.';
    }
  }

  return (
    <PublicLayout>
      <ErrorComponent 
        statusCode={statusCode} 
        message={message}
        showRedirect={statusCode === 404}
      />
    </PublicLayout>
  );
}

// This is the recommended way to handle status codes in Next.js 12+
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
