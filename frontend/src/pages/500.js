import { Error } from 'components/Error/Error';
import { PublicLayout } from 'layout/PublicLayout';

export default function Custom500() {
  return (
    <PublicLayout breadcrumbTitle='Server Error' description='Something went wrong'>
      <Error statusCode={500} message="Oops! Something went wrong on our end. Please try again later." />
    </PublicLayout>
  );
}

// No need for getInitialProps in error pages in Next.js 12+
