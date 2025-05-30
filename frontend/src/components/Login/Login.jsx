import { useState } from 'react';
import { useRouter } from 'next/router';
import { SocialLogin } from 'components/shared/SocialLogin/SocialLogin';
import { login as authLogin } from 'services/authService';
import { useAppContext } from 'context/AppContext';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginUser } = useAppContext();

  const { email, password, rememberMe } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await authLogin({ email, password });
      
      // Update user in context
      loginUser(response.user);
      
      // Redirect to the intended page or home
      const redirectUrl = router.query.redirect || '/';
      router.push(redirectUrl);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <!-- BEGIN LOGIN --> */}
      <div className='login'>
        <div className='wrapper'>
          <div
            className='login-form js-img'
            style={{ backgroundImage: `url('/assets/img/login-form__bg.png')` }}
          >
            <form onSubmit={handleSubmit}>
              <h3>log in with</h3>
              <SocialLogin />

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className='box-field'>
                <input
                  type='email'
                  name='email'
                  className='form-control'
                  placeholder='Enter your email'
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='box-field'>
                <input
                  type='password'
                  name='password'
                  className='form-control'
                  placeholder='Enter your password'
                  value={password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              <label className='checkbox-box checkbox-box__sm'>
                <input 
                  type='checkbox' 
                  name='rememberMe'
                  checked={rememberMe}
                  onChange={handleChange}
                />
                <span className='checkmark'></span>
                Remember me
              </label>
              <button 
                className='btn' 
                type='submit'
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
              <div className='login-form__bottom'>
                <span>
                  No account?{' '}
                  <a onClick={() => router.push('/registration')}>
                    Register now
                  </a>
                </span>
                <a href='#'>Lost your password?</a>
              </div>
            </form>
          </div>
        </div>
        <img
          className='promo-video__decor js-img'
          src='/assets/img/promo-video__decor.jpg'
          alt=''
        />
      </div>
      {/* <!-- LOGIN EOF   --> */}
    </>
  );
};
