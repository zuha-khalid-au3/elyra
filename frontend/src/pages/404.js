import { Error } from 'components/Error/Error';
import { PublicLayout } from 'layout/PublicLayout';

export default function Custom404() {
  return (
    <PublicLayout breadcrumbTitle='404 Page' description='Oops! Page not found'>
      <Error statusCode={404} />
    </PublicLayout>
  );
}
