import React, { useState } from 'react';
import { auth_signIn, auth_signUp, auth_sendPasswordReset } from '../firebase';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await auth_signIn(email, password);
      } else {
        await auth_signUp(email, password, inviteCode);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      return;
    }
    setResetLoading(true);
    setResetMessage('');
    try {
      await auth_sendPasswordReset(resetEmail);
      setResetMessage('Password reset link sent! Check your email inbox. If not found, please check your spam folder.');
    } catch (err) {
      setResetMessage(err.message || 'Failed to send reset email');
    }
    setResetLoading(false);
  };

  return (
    <div className="bg-[#f3f4f8] min-h-screen font-sans flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-[15px] p-6 shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join UMoney'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="bg-[#f5f5f5] rounded-lg px-4 py-3">
            <input
              className="bg-transparent border-none p-0 text-gray-800 placeholder-gray-400 focus:ring-0 w-full"
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="bg-[#f5f5f5] rounded-lg px-4 py-3">
            <input
              className="bg-transparent border-none p-0 text-gray-800 placeholder-gray-400 focus:ring-0 w-full"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="bg-[#f5f5f5] rounded-lg px-4 py-3">
              <input
                className="bg-transparent border-none p-0 text-gray-800 placeholder-gray-400 focus:ring-0 w-full"
                placeholder="Invitation Code (Optional)"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {isLogin && (
            <button
              onClick={() => { setShowResetModal(true); setResetMessage(''); setResetEmail(''); }}
              className="text-sm text-gray-500 hover:text-[#2546a3] hover:underline"
            >
              Forgot Password?
            </button>
          )}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#2546a3] hover:underline block mx-auto"
          >
            {isLogin ? 'Create an account' : 'Already have an account? Login'}
          </button>
        </div>

        {/* Helper Note for MVP */}
        <div className="mt-6 text-[10px] text-gray-400 text-center border-t pt-4">
          <p>Demo Mode Active: You can create multiple accounts to test referral system.</p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1e3a8a]">Reset Password</h2>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="bg-[#f5f5f5] rounded-lg px-4 py-3">
                <input
                  className="bg-transparent border-none p-0 text-gray-800 placeholder-gray-400 focus:ring-0 w-full"
                  placeholder="Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              {resetMessage && (
                <p className={`text-sm text-center ${resetMessage.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
                  {resetMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-70"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <button
              onClick={() => setShowResetModal(false)}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;