import { useState } from 'react';
import { useRouter } from 'next/router';
import { SocialLogin } from 'components/shared/SocialLogin/SocialLogin';
import { register as authRegister } from 'services/authService';
import { useAppContext } from 'context/AppContext';

export const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginUser } = useAppContext();

  const { name, email, password, confirmPassword, phone, agreeTerms } = formData;

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
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      // Register the user
      const response = await authRegister({
        name,
        email,
        password,
        phone,
      });
      
      // Log the user in after successful registration
      if (response.token) {
        // Update user in context
        loginUser(response.user);
        
        // Redirect to home or intended page
        const redirectUrl = router.query.redirect || '/';
        router.push(redirectUrl);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <!-- BEGIN REGISTRATION --> */}
      <div className='login registration'>
        <div className='wrapper'>
          <div
            className='login-form js-img'
            style={{
              backgroundImage: `url('/assets/img/registration-form__bg.png')`,
            }}
          >
            <form onSubmit={handleSubmit}>
              <h3>register now</h3>
              <SocialLogin />

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className='box-field'>
                <input
                  type='text'
                  name='name'
                  className='form-control'
                  placeholder='Enter your full name'
                  value={name}
                  onChange={handleChange}
                  required
                />
              </div>
              
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
              
              <div className='box-field__row'>
                <div className='box-field'>
                  <input
                    type='password'
                    name='password'
                    className='form-control'
                    placeholder='Enter password'
                    value={password}
                    onChange={handleChange}
                    minLength='6'
                    required
                  />
                </div>
                <div className='box-field'>
                  <input
                    type='password'
                    name='confirmPassword'
                    className='form-control'
                    placeholder='Confirm password'
                    value={confirmPassword}
                    onChange={handleChange}
                    minLength='6'
                    required
                  />
                </div>
              </div>
              
              <div className='box-field'>
                <input
                  type='tel'
                  name='phone'
                  className='form-control'
                  placeholder='Enter your phone number'
                  value={phone}
                  onChange={handleChange}
                />
              </div>
              <div className='box-field'>
                <label className='checkbox-box checkbox-box__sm'>
                  <input 
                    type='checkbox' 
                    name='agreeTerms'
                    checked={agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <span className='checkmark'></span>
                  I agree to the <a href='/terms' target='_blank' rel='noopener noreferrer'>Terms and Conditions</a> and <a href='/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy</a>
                </label>
              </div>
              
              <button 
                className='btn' 
                type='submit'
                disabled={loading || !agreeTerms}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className='login-form__bottom'>
                <span>
                  Already have an account?{' '}
                  <a 
                    href='/login' 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/login');
                    }}
                  >
                    Log in
                  </a>
                </span>
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
      {/* <!-- REGISTRATION EOF   -->  */}
    </>
  );
};
