
import React, { useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { Toaster } from 'sonner';
import { LogOut, Settings, Bell, LayoutDashboard, FileEdit, Users, BarChart3 } from 'lucide-react';
import { cn } from './lib/utils';

type View = 'dashboard' | 'editor';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingId, setEditingId] = useState<string | undefined>();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setCurrentView('editor');
  };

  const handleCreate = () => {
    setEditingId(undefined);
    setCurrentView('editor');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Only visible in dashboard view for a cleaner editor */}
      {currentView === 'dashboard' && (
        <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col animate-in slide-in-from-left duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Z</span>
            </div>
            <h1 className="font-bold text-slate-900 tracking-tight">ZenBlog</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Command Center" active />
            <NavItem icon={FileEdit} label="All Stories" />
            <NavItem icon={BarChart3} label="Analytics" />
            <NavItem icon={Users} label="Authors" />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavItem icon={Settings} label="Settings" />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar - Only in dashboard */}
        {currentView === 'dashboard' && (
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 z-20">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-black text-[10px]">Z</span>
              </div>
              <h1 className="font-bold text-slate-900">ZenBlog</h1>
            </div>
            <div className="hidden lg:block"></div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500 font-medium">Editor-in-Chief</p>
                </div>
                <div className="w-9 h-9 bg-indigo-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
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
            <EditorView key={`editor-${editingId || 'new'}`} id={editingId} onBack={handleBack} />
          )}
        </div>
      </main>

      <Toaster 
        position="bottom-right" 
        expand={false} 
        richColors 
        theme="light"
      />
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
    active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  )}>
    <Icon className="w-5 h-5" />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default App;
