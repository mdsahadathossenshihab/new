
import React, { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { ArrowRight, Lock, BookOpen, Calendar, Clock } from 'lucide-react';

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
      // শুধুমাত্র পাবলিশ করা ব্লগগুলো দেখাবে
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
      {/* Sticky Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group cursor-pointer">
            <span className="text-white font-black text-lg group-hover:scale-110 transition-transform">Z</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ZenBlog</h1>
        </div>
        <Button onClick={onAdminClick} variant="outline" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold text-xs uppercase tracking-widest px-6 h-10">
          <Lock className="w-3.5 h-3.5" /> Admin Panel
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="py-24 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
          <Clock className="w-3.5 h-3.5" /> Latest Updates Available
        </div>
        <h2 className="text-5xl sm:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
          পড়ুন মনের মতো <br/> <span className="text-indigo-600">সব সেরা গল্প</span>
        </h2>
        <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
          ZenBlog এ আপনাকে স্বাগতম। প্রযুক্তি, জীবনযাপন এবং ক্যারিয়ারের সেরা সব ব্লগ এখন আপনার হাতের মুঠোয়।
        </p>
      </header>

      {/* Main Blog Feed */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[40px] p-10 h-80 animate-pulse border border-slate-100 shadow-sm" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
            <BookOpen className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-400">এখনও কোনো ব্লগ পাবলিশ হয়নি</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">এডমিন প্যানেলে গিয়ে প্রথম ব্লগটি লিখে পাবলিশ করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog) => (
              <article key={blog.id} className="group bg-white rounded-[40px] border border-slate-100 p-10 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 flex flex-col hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-8">
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">{blog.category}</span>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(blog.created_at)}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                  {blog.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80">
                  {typeof blog.content === 'string' ? blog.content.substring(0, 160) : 'কন্টেন্ট পড়তে নিচে ক্লিক করুন...'}
                </p>
                <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-[10px] font-black text-white shadow-lg">AR</div>
                     <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Admin User</span>
                   </div>
                   <button className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all group/btn">
                    Read More <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                   </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-20 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-indigo-600 font-black text-xl">Z</div>
        <div className="flex justify-center gap-8 mb-8 text-xs font-black text-slate-400 uppercase tracking-widest">
           <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
           <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
           <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} ZENBLOG PLATFORM • BUILT WITH PASSION</p>
      </footer>
    </div>
  );
};
