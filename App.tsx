
import React, { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { PublicView } from './components/PublicView';
import { Toaster } from 'sonner';
import { 
  LogOut, Settings, Bell, LayoutDashboard, 
  FileEdit, Users, BarChart3, Home, ArrowLeft 
} from 'lucide-react';
import { cn } from './lib/utils';

type View = 'public' | 'dashboard' | 'editor';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('public');
  const [editingId, setEditingId] = useState<string | undefined>();

  // URL প্যারামিটার দিয়ে অটোমেটিক ভিউ চেঞ্জ (Optional for Vercel)
  useEffect(() => {
    const path = window.location.hash;
    if (path === '#admin') setCurrentView('dashboard');
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setCurrentView('editor');
  };

  const handleCreate = () => {
    setEditingId(undefined);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleToAdmin = () => {
    setCurrentView('dashboard');
    window.location.hash = 'admin';
  };

  const handleToPublic = () => {
    setCurrentView('public');
    window.location.hash = '';
  };

  // পাবলিকে থাকাকালীন শুধু PublicView দেখাবে
  if (currentView === 'public') {
    return (
      <>
        <PublicView onAdminClick={handleToAdmin} />
        <Toaster position="bottom-right" richColors />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Only visible in dashboard */}
      {currentView === 'dashboard' && (
        <aside className="w-72 border-r border-slate-200 bg-white hidden lg:flex flex-col animate-in slide-in-from-left duration-500">
          <div className="p-8 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-lg">Z</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 tracking-tight leading-none">ZenBlog</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2">
            <NavItem icon={LayoutDashboard} label="Command Center" active onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={Home} label="Back to Website" onClick={handleToPublic} />
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Management</p>
              <NavItem icon={FileEdit} label="All Stories" />
              <NavItem icon={BarChart3} label="Analytics" />
              <NavItem icon={Users} label="Authors" />
              <NavItem icon={Settings} label="Settings" />
            </div>
          </nav>

          <div className="p-6 border-t border-slate-100">
            <button 
              onClick={handleToPublic}
              className="flex items-center gap-3 w-full p-4 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar for Dashboard */}
        {currentView === 'dashboard' && (
          <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-10 flex items-center justify-between shrink-0 z-20">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">Z</span>
              </div>
              <h1 className="font-bold text-slate-900">ZenBlog</h1>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-500 italic">Welcome back, Chief Editor!</p>
            </div>
            <div className="flex items-center gap-6">
              <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl relative transition-all border border-slate-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900">Alex Rivera</p>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-white font-black overflow-hidden">
                  AR
                </div>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-hidden relative">
          {currentView === 'dashboard' ? (
            <DashboardView key="dashboard" onEdit={handleEdit} onCreate={handleCreate} />
          ) : (
            <EditorView key={`editor-${editingId || 'new'}`} id={editingId} onBack={handleBackToDashboard} />
          )}
        </div>
      </main>

      <Toaster position="bottom-right" richColors theme="light" />
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-4 rounded-2xl transition-all duration-300 font-bold text-sm",
      active 
        ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 translate-x-1" 
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:translate-x-1"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-indigo-400" : "text-slate-400")} />
    <span>{label}</span>
  </button>
);

export default App;
