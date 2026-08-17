"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, ClipboardList, Settings, Store } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/kds') {
    return null;
  }

  return (
    <div className="w-72 bg-slate-950 text-white min-h-screen p-4 flex flex-col border-r border-slate-800/60 shadow-2xl">
      <div className="mb-10 p-4 flex flex-col items-center gap-3">
        <div className="w-28 h-28 relative bg-slate-100 rounded-full overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)] border-2 border-amber-500/20">
            <img src="/logo.png" alt="Kopi Tabo Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="text-center mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Kopi Tabo</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em] mt-0.5">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-2">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname === '/' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <Home size={20} className={pathname === '/' ? 'text-amber-500' : ''} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link 
          href="/menu" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname === '/menu' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <Coffee size={20} className={pathname === '/menu' ? 'text-amber-500' : ''} />
          <span className="font-medium">Menu</span>
        </Link>
        <Link 
          href="/inventory" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname === '/inventory' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <ClipboardList size={20} className={pathname === '/inventory' ? 'text-amber-500' : ''} />
          <span className="font-medium">Inventory & Stock</span>
        </Link>

        <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operations</p>
        </div>
        <Link 
          href="/kds" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname === '/kds' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <ClipboardList size={20} className={pathname === '/kds' ? 'text-amber-500' : ''} />
          <span className="font-medium">Kitchen Display</span>
        </Link>
        <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports & Config</p>
        </div>
        <Link 
          href="/orders" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${pathname === '/orders' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <ClipboardList size={20} className={pathname === '/orders' ? 'text-amber-500' : ''} />
          <span className="font-medium">Orders & Reports</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:bg-slate-800/30 rounded-xl transition-colors cursor-not-allowed">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer group">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-slate-200 truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@kopitabo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
