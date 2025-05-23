import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email.');
      }

      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-mint-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center">
          <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-xl shadow-lg p-3">
            <Icon name="Key" className="text-white h-12 w-auto" size={42} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-800">
          Forgot Your Password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-md mx-auto">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Mail" size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-lavender-500 focus:border-lavender-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {message && (
              <div className="flex items-center p-3.5 rounded-lg bg-success bg-opacity-10 border border-success border-opacity-30">
                <Icon name="CheckCircle" size={18} className="text-success mr-2.5" />
                <p className="text-sm text-success font-medium">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center p-3.5 rounded-lg bg-error bg-opacity-10 border border-error border-opacity-30">
                <Icon name="AlertCircle" size={18} className="text-error mr-2.5" />
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Icon name="Loader" size={18} className="animate-spin mr-2" />
                    Sending...
                  </span>
                ) : 'Send Password Reset Email'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-lavender-700 bg-white hover:bg-gray-50 transition-all"
              >
                <Icon name="ArrowLeft" size={18} className="mr-2 text-lavender-500" />
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
