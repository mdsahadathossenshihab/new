
import React, { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { ArrowRight, Lock, BookOpen, Clock, Calendar, User } from 'lucide-react';

interface PublicViewProps {
  onAdminClick: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({ onAdminClick }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublishedBlogs();
  }, []);

  const loadPublishedBlogs = async () => {
    setLoading(true);
    try {
      const allBlogs = await blogService.getBlogs();
      // শুধুমাত্র পাবলিশ করা ব্লগগুলো ফিল্টার করা
      const published = allBlogs.filter(b => b.status === 'published');
      setBlogs(published);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-lg">Z</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ZenBlog</h1>
        </div>
        <Button onClick={onAdminClick} variant="outline" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
          <Lock className="w-4 h-4" /> Admin Portal
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          আমাদের গল্পগুলো <span className="text-indigo-600">খুঁজে নিন</span>
        </h2>
        <p className="text-xl text-slate-500 leading-relaxed font-medium">
          প্রযুক্তি, জীবনযাত্রা এবং ব্যবসার সেরা ব্লগগুলো এক জায়গায়। মনের ভাব প্রকাশ করুন ZenBlog এ।
        </p>
      </header>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] p-8 h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">এখনও কোনো ব্লগ পাবলিশ করা হয়নি।</h3>
            <p className="text-slate-400 mt-2">এডমিন প্যানেল থেকে প্রথম ব্লগটি পাবলিশ করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="group bg-white rounded-[40px] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full uppercase tracking-widest">{blog.category}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(blog.created_at)}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                  {typeof blog.content === 'string' ? blog.content.substring(0, 150) + '...' : 'কন্টেন্ট পড়ার জন্য নিচে ক্লিক করুন...'}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">AR</div>
                     <span className="text-xs font-bold text-slate-600">Admin User</span>
                   </div>
                   <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
                    Read Story <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 text-center">
        <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} ZenBlog Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
