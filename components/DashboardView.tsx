
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Eye, Trash2, 
  FileText, CheckCircle, AlertCircle, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { blogService } from '../services/blogService';
import { Blog, DashboardStats } from '../types';
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
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    // Optimistic update
    const previousBlogs = [...blogs];
    setBlogs(blogs.filter(b => b.id !== id));
    
    try {
      await blogService.deleteBlog(id);
      toast.success("Article deleted successfully");
      loadData(); // Refresh stats
    } catch (err) {
      setBlogs(previousBlogs);
      toast.error('Failed to delete blog');
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 overflow-y-auto h-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1">Manage your content and track performance</p>
        </div>
        <Button onClick={onCreate} variant="gradient" size="lg" className="shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5 mr-2" />
          Write New Story
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-slate-900">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Articles</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.total ?? '...'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Live Published</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.published ?? '...'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Drafts Pending</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.drafts ?? '...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or category..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
              {(['all', 'published', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-r border-slate-200 last:border-r-0 capitalize",
                    filter === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium text-sm">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-50 rounded w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{blog.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/{blog.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {blog.author_name?.charAt(0) ?? 'A'}
                        </div>
                        <span className="text-sm text-slate-600">{blog.author_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{blog.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={blog.status === 'published' ? 'success' : 'warning'}>
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(blog.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => onEdit(blog.id)} variant="ghost" size="icon" className="hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(blog.id)} variant="ghost" size="icon" className="hover:text-red-600">
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
