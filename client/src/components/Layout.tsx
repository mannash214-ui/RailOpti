import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative bg-navy-950 text-slate-100 selection:bg-brand-500/20 selection:text-brand-300">
      {/* Premium ambient light effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-brand-600/10 via-brand-900/5 to-transparent blur-3xl pointer-events-none rounded-full animate-pulse-slow z-0" />

      {/* Main Navigation */}
      <Navbar />

      {/* Dynamic Route Content */}
      <main className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
