import Link from 'next/link';
import { useRouter } from 'next/router';

const ErrorMessages = {
  404: {
    title: 'Page Not Found',
    message: 'The page you are looking for might have been removed or is temporarily unavailable.',
    showSearch: true,
  },
  500: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later or contact support if the problem persists.',
    showSearch: false,
  },
  403: {
    title: 'Access Forbidden',
    message: 'You do not have permission to access this page.',
    showSearch: false,
  },
  401: {
    title: 'Unauthorized',
    message: 'Please log in to access this page.',
    showSearch: false,
  },
};

export const Error = ({ statusCode = 404, message, title }) => {
  const router = useRouter();
  const errorInfo = ErrorMessages[statusCode] || {
    title: title || 'Error',
    message: message || 'An unexpected error occurred.',
    showSearch: false,
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className='error-page'>
      <div className='wrapper'>
        <div className='error-page__content'>
          <div className='error-page__info'>
            <div className='error-page__title'>
              <span>{statusCode}</span>
              {errorInfo.title}
            </div>
            <div className='error-page__subtitle'>
              {errorInfo.message} Go back to{' '}
              <Link href='/' className='link'>
                Homepage
              </Link>
              {statusCode === 401 && (
                <>
                  {' '}or{' '}
                  <Link href='/login' className='link'>
                    Log In
                  </Link>
                </>
              )}
              .
            </div>
            
            {errorInfo.showSearch && (
              <form onSubmit={handleSearch} className='box-field__row box-field__row-search'>
                <div className='box-field'>
                  <input
                    type='search'
                    name='search'
                    className='form-control'
                    placeholder='Search our store...'
                    required
                  />
                </div>
                <button type='submit' className='btn btn-icon'>
                  <i className='icon-search'></i>
                </button>
              </form>
            )}
            
            <div className='error-page__actions'>
              <Link href='/' className='btn btn--primary'>
                Back to Home
              </Link>
              {statusCode === 401 && (
                <Link href='/login' className='btn btn--secondary'>
                  Log In
                </Link>
              )}
            </div>
          </div>
          <div className='error-page__img'>
            <img 
              src={`/assets/img/error-${statusCode === 404 ? '404' : 'generic'}.jpg`} 
              className='js-img' 
              alt={errorInfo.title} 
              onError={(e) => {
                e.target.src = '/assets/img/error-generic.jpg';
              }}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .error-page__title {
          margin-bottom: 1.5rem;
        }
        .error-page__title span {
          display: block;
          font-size: 8rem;
          line-height: 1;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }
        .error-page__subtitle {
          margin-bottom: 2rem;
          font-size: 1.25rem;
          max-width: 600px;
        }
        .error-page__actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .link {
          color: var(--primary-color);
          text-decoration: underline;
          font-weight: 500;
        }
        .link:hover {
          text-decoration: none;
        }
        @media (max-width: 768px) {
          .error-page__title span {
            font-size: 6rem;
          }
          .error-page__actions {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
