
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Rocket, Save, Settings, Database, 
  Wifi, Link as LinkIcon, AlertCircle, Server, Globe
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { blogService } from '../services/blogService';
import { Blog, BlogStatus } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface EditorViewProps {
  id?: string;
  onBack: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Technology');
  const [status, setStatus] = useState<BlogStatus>('draft');

  useEffect(() => {
    if (id) loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      const blog = await blogService.getBlogById(id!);
      if (blog) {
        setTitle(blog.title);
        setContent(blog.content);
        setSlug(blog.slug);
        setCategory(blog.category);
        setStatus(blog.status);
      }
    } catch (err) {
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isPublish = false) => {
    if (!title) {
      toast.error("ব্লগের একটি শিরোনাম দিন");
      return;
    }
    
    if (isPublish) setPublishing(true);
    else setSaving(true);

    try {
      const blogData = { 
        title, 
        content, 
        slug: slug || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''), 
        category, 
        status: isPublish ? 'published' : 'draft' as BlogStatus 
      };

      if (id) {
        await blogService.updateBlog(id, blogData);
      } else {
        await blogService.createBlog(blogData);
      }
      
      toast.success(isPublish ? "সফলভাবে পাবলিশ হয়েছে!" : "ড্রাফট হিসেবে সেভ হয়েছে!");
      
      // Delay back navigation slightly for better UX
      setTimeout(() => onBack(), 800);
    } catch (err) {
      toast.error("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center font-bold text-slate-400 animate-pulse">Loading Editor...</div>;

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Top Bar */}
      <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-6">
          <Button onClick={onBack} variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100"><ChevronLeft className="w-6 h-6" /></Button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1 max-w-[300px]">{title || 'নতুন ব্লগ লিখুন...'}</h2>
            <Badge variant={status === 'published' ? 'success' : 'warning'} className="font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-lg">{status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowSettings(!showSettings)} variant="ghost" size="icon" className={cn("rounded-xl transition-all", showSettings && "bg-indigo-50 text-indigo-600")}>
            <Settings className="w-5 h-5" />
          </Button>
          <div className="h-8 w-px bg-slate-100 mx-2"></div>
          <Button onClick={() => handleSave(false)} variant="secondary" loading={saving} className="rounded-xl font-black text-xs uppercase tracking-widest px-6 h-11">Save Draft</Button>
          <Button onClick={() => handleSave(true)} variant="gradient" loading={publishing} className="px-8 shadow-xl shadow-indigo-100 rounded-xl font-black uppercase tracking-widest text-xs h-11">
            <Rocket className="w-4 h-4 mr-2" /> Publish Live
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Main Area */}
        <main className="flex-1 overflow-y-auto py-16 bg-slate-50/30 custom-scrollbar flex justify-center">
          <div className="w-full max-w-[900px] mx-auto px-12">
            <div className="bg-white p-20 rounded-[60px] shadow-2xl shadow-slate-200/40 border border-slate-100 min-h-screen">
              <input
                type="text"
                placeholder="ব্লগের শিরোনাম..."
                className="w-full text-5xl font-black border-none outline-none mb-12 text-slate-900 placeholder:text-slate-100 tracking-tighter leading-tight"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="এখানে আপনার মনের কথা লিখুন..."
                className="w-full min-h-[500px] border-none outline-none resize-none text-xl text-slate-600 leading-relaxed placeholder:text-slate-100 font-medium"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </main>

        {/* Side Settings Panel */}
        <aside className={cn("w-[400px] border-l border-slate-100 bg-white overflow-y-auto transition-all duration-500 shadow-2xl z-20", !showSettings && "w-0 invisible opacity-0")}>
          <div className="p-10 space-y-10 min-w-[400px]">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Post Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-900"><AlertCircle className="w-5 h-5" /></button>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" /> URL Slug
                </label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/10 transition-all" 
                  placeholder="post-url-address" 
                />
                <p className="text-[10px] text-slate-400 italic">এটি আপনার ব্লগের লিঙ্ক হিসেবে ব্যবহৃত হবে।</p>
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-indigo-500" /> Category
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none font-bold text-slate-600 appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/10 transition-all"
                >
                  <option>Technology</option>
                  <option>Lifestyle</option>
                  <option>Business</option>
                  <option>Creative</option>
                  <option>News</option>
                </select>
              </section>
              
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <p className="text-xs text-indigo-600 font-bold leading-relaxed">
                  ব্লগটি পাবলিশ করার আগে নিশ্চিত হয়ে নিন যে শিরোনাম এবং কন্টেন্ট ঠিক আছে। পাবলিশ করার সাথে সাথে এটি মেইন ওয়েবসাইটে দেখা যাবে।
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
