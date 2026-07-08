import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Train, Menu, X, User, LogOut, Compass, Heart, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('optirail_token');
  const userString = localStorage.getItem('optirail_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('optirail_token');
    localStorage.removeItem('optirail_user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Search Planner', path: '/search', icon: Compass },
    ...(token
      ? [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Saved Journeys', path: '/saved-journeys', icon: Heart },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-brand-600/20 rounded-xl group-hover:bg-brand-600/30 transition-colors border border-brand-500/20">
                <Train className="h-6 w-6 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                Opti<span className="text-brand-400">Rail</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-brand-600/25 text-brand-300 border border-brand-500/20 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-800 rounded-full border border-slate-800 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-brand-400" />
                  <span>{user?.email || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/45 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 rounded-lg text-sm font-medium transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all duration-200 border border-brand-500/30"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none transition-colors border border-transparent hover:border-slate-800"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-900 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-brand-600/20 text-brand-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
            {token ? (
              <div className="pt-4 pb-2 border-t border-slate-800/80 px-3 space-y-3">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <User className="h-4 w-4 text-brand-400" />
                  <span>{user?.email || 'User'}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/30 text-rose-300 border border-rose-900/20 rounded-lg text-sm font-semibold transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-800/80 px-3 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-slate-300 hover:text-white font-medium text-sm transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-sm transition-all shadow-md shadow-brand-500/20"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
