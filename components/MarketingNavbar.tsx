
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MarketingNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="glass-nav fixed w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link to="/" className="text-2xl font-black gradient-text">Mindlyt</Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/#features" className="hover:text-white transition-colors">Features</Link>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link to="/app" className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold hover:bg-violet-50 transition-colors shadow-lg hover:shadow-violet-500/20">Launch App</Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white"
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950 z-40 flex flex-col pt-24 px-8 gap-8 animate-fade-in">
            <Link to="/about" className="text-2xl font-bold text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/#features" className="text-2xl font-bold text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link to="/blog" className="text-2xl font-bold text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
            <Link to="/app" className="text-2xl font-bold text-violet-400" onClick={() => setIsMobileMenuOpen(false)}>Launch App &rarr;</Link>
        </div>
      )}
    </>
  );
};

export default MarketingNavbar;
