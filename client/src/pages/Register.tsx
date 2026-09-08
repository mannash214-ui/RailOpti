import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, UserPlus, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('optirail_token', data.token);
      localStorage.setItem('optirail_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your information.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-lg relative">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 mb-3">
            <Train className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Register for personalized railway route planning</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                minLength={8}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Password must be at least 8 characters long</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
