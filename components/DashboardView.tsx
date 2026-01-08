
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Eye, Trash2, 
  FileText, CheckCircle, AlertCircle, TrendingUp, ChevronLeft, 
  ChevronRight, ExternalLink, Send
} from 'lucide-react';
import { blogService } from '../services/blogService';
import { Blog, DashboardStats, BlogStatus } from '../types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatDate, cn } from '../lib/utils';
import { toast } from 'sonner';

interface DashboardViewProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onEdit, onCreate }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedBlogs, fetchedStats] = await Promise.all([
        blogService.getBlogs(),
        blogService.getStats()
      ]);
      setBlogs(fetchedBlogs);
      setStats(fetchedStats);
    } catch (error) {
      console.error(error);
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPublish = async (id: string) => {
    try {
      await blogService.updateBlog(id, { status: 'published' });
      toast.success("ব্লগটি পাবলিশ করা হয়েছে!");
      loadData();
    } catch (err) {
      toast.error("পাবলিশ করতে সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এটি ডিলিট করতে চান?')) return;
    try {
      await blogService.deleteBlog(id);
      toast.success("ব্লগ ডিলিট হয়েছে");
      loadData();
    } catch (err) {
      toast.error('ডিলিট এরর');
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-10 py-12 space-y-10 overflow-y-auto h-full pb-32 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
            আপনার কন্টেন্টগুলো এখান থেকে নিয়ন্ত্রণ করুন <TrendingUp className="w-4 h-4 text-emerald-500" />
          </p>
        </div>
        <Button onClick={onCreate} variant="gradient" size="lg" className="px-8 h-14 rounded-2xl shadow-2xl shadow-indigo-200">
          <Plus className="w-5 h-5 mr-2" />
          Write New Story
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Articles', val: stats?.total, icon: FileText, color: 'slate' },
          { label: 'Live Published', val: stats?.published, icon: CheckCircle, color: 'emerald' },
          { label: 'Drafts Pending', val: stats?.drafts, icon: AlertCircle, color: 'amber' },
        ].map((m, idx) => (
          <Card key={idx} className={cn("border-none shadow-xl shadow-slate-100 overflow-visible relative group", `bg-white`)}>
            <div className={cn("absolute -left-1 top-8 bottom-8 w-1.5 rounded-r-full transition-all group-hover:bottom-4 group-hover:top-4", 
              m.color === 'emerald' ? 'bg-emerald-500' : m.color === 'amber' ? 'bg-amber-500' : 'bg-slate-900')} />
            <CardContent className="flex items-center gap-6 py-8 px-8">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", 
                m.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : m.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600')}>
                <m.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{m.val ?? '...'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-2xl shadow-slate-100 rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search stories..." 
              className="w-full pl-12 pr-6 h-12 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {(['all', 'published', 'draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  filter === s ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
                <th className="px-10 py-6">Article Details</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10"><div className="h-4 bg-slate-50 rounded w-full"></div></td></tr>
                ))
              ) : filteredBlogs.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-24 text-center text-slate-400 font-bold italic">No stories found here.</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{blog.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1.5">slug: {blog.slug}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider">{blog.category}</span>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant={blog.status === 'published' ? 'success' : 'warning'} className="px-3 py-1.5 rounded-xl font-bold uppercase text-[9px] tracking-widest">
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold text-slate-400">
                      {formatDate(blog.created_at)}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        {blog.status === 'draft' && (
                          <Button onClick={() => handleQuickPublish(blog.id)} variant="ghost" size="icon" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl" title="Publish Now">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button onClick={() => onEdit(blog.id)} variant="ghost" size="icon" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(blog.id)} variant="ghost" size="icon" className="bg-red-50 text-red-600 hover:bg-red-100 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
