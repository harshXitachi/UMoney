import React, { useState } from 'react';
import { auth_signIn, auth_signUp } from '../firebase';

const LoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await auth_signIn(email, password);
      } else {
        await auth_signUp(email, password, inviteCode);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
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

        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#2546a3] hover:underline"
          >
            {isLogin ? 'Create an account' : 'Already have an account? Login'}
          </button>
        </div>
        
        {/* Helper Note for MVP */}
        <div className="mt-6 text-[10px] text-gray-400 text-center border-t pt-4">
            <p>Demo Mode Active: You can create multiple accounts to test referral system.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;