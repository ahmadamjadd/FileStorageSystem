import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Cloud, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Register the user
      await authApi.register(email, password);
      
      // 2. Automatically log them in after registration
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.access_token);
      
      // 3. Redirect to dashboard
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // FastAPI validation errors (e.g., short password) come as an array
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail[0].msg || 'Validation error.');
        } else {
          setError(err.response.data.detail || 'Registration failed.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
          <p className="text-slate-500 mt-2">Sign up to start storing your files in the cloud</p>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Minimum 8 characters"
              />
              <p className="text-xs text-slate-400 mt-2">Must be at least 8 characters long.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
