import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'menu' | 'signin' | 'signup'>('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(email, password, displayName);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {mode === 'menu' && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-olive-800">Welcome to Interosight</h1>
            <button
              className="btn-secondary w-full mb-4 bg-olive-600 text-white hover:bg-olive-700 transition-colors"
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
            <button
              className="btn-secondary w-full bg-olive-600 text-white hover:bg-olive-700 transition-colors"
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
          </>
        )}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-olive-800">Sign In</h2>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <input
              type="email"
              className="input-field w-full"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-field w-full"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full px-4 py-2 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              onClick={() => setMode('menu')}
            >
              Back
            </button>
          </form>
        )}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-olive-800">Sign Up</h2>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <input
              type="text"
              className="input-field w-full"
              placeholder="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
            <input
              type="email"
              className="input-field w-full"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-field w-full"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full px-4 py-2 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              onClick={() => setMode('menu')}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen; 