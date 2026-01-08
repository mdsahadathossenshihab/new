
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Rocket, Save, Settings, Database, 
  Key, Wifi, Globe, Link as LinkIcon, 
  AlertCircle, BookOpen, Code, Terminal, ExternalLink, Info, 
  Cpu, Layers, Server
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { blogService } from '../services/blogService';
import { Blog, BlogStatus, SEOMeta } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface EditorViewProps {
  id?: string;
  onBack: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Technology');
  const [status, setStatus] = useState<BlogStatus>('draft');

  // Connection Settings
  const [connMode, setConnMode] = useState(localStorage.getItem('zen_connection_mode') || 'mongodb');
  const [appId, setAppId] = useState(localStorage.getItem('zen_mongodb_app_id') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('zen_mongodb_key') || '');
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('zen_custom_api_url') || '');

  useEffect(() => {
    if (id) loadBlog();
  }, [id]);

  const handleTest = async () => {
    setTesting(true);
    const result = await blogService.testConnection({
      mode: connMode, appId, key: dbKey, url: customUrl
    });
    setTesting(false);
    if (result.success) {
      toast.success(result.message);
      saveAllSettings();
    } else {
      toast.error(result.message);
    }
  };

  const saveAllSettings = () => {
    localStorage.setItem('zen_connection_mode', connMode);
    localStorage.setItem('zen_mongodb_app_id', appId);
    localStorage.setItem('zen_mongodb_key', dbKey);
    localStorage.setItem('zen_custom_api_url', customUrl);
  };

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

  const handleSave = async () => {
    if (!title) {
      toast.error("শিরোনাম দিন");
      return;
    }
    setSaving(true);
    try {
      const blogData = { title, content, slug, category, status: 'draft' as BlogStatus };
      if (id) await blogService.updateBlog(id, blogData);
      else await blogService.createBlog(blogData);
      toast.success("সেভ হয়েছে!");
    } catch (err) {
      toast.error("কানেকশন এরর! সেটিংস চেক করুন।");
      setShowSettings(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center font-bold text-slate-400">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-6">
          <Button onClick={onBack} variant="ghost" size="icon"><ChevronLeft className="w-6 h-6" /></Button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{title || 'নতুন ব্লগ...'}</h2>
            <Badge variant={status === 'published' ? 'success' : 'warning'}>{status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowSettings(!showSettings)} variant="ghost" size="icon" className={cn(showSettings && "bg-indigo-50 text-indigo-600")}><Settings className="w-5 h-5" /></Button>
          <Button onClick={handleSave} variant="secondary" loading={saving}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
          <Button variant="gradient" size="lg" className="px-8 shadow-xl shadow-indigo-100"><Rocket className="w-5 h-5 mr-2" /> Publish Live</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto py-12 bg-slate-50/30 custom-scrollbar">
          <div className="max-w-[850px] mx-auto px-12 bg-white p-20 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-full">
            <input
              type="text"
              placeholder="শিরোনাম..."
              className="w-full text-5xl font-black border-none outline-none mb-10 text-slate-900 placeholder:text-slate-200 tracking-tight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="আপনার কন্টেন্ট এখানে লিখুন..."
              className="w-full min-h-[600px] border-none outline-none resize-none text-xl text-slate-600 leading-relaxed placeholder:text-slate-200"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </main>

        <aside className={cn("w-[500px] border-l border-slate-100 bg-white overflow-y-auto transition-all duration-500 shadow-2xl z-20", !showSettings && "w-0 invisible opacity-0")}>
          <div className="p-8 space-y-8 min-w-[500px] pb-20">
            
            {/* Connection Mode Switcher */}
            <div className="bg-slate-900 rounded-[32px] p-2 flex gap-1">
              <button 
                onClick={() => setConnMode('mongodb')}
                className={cn("flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all", connMode === 'mongodb' ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-white")}
              >
                MongoDB Atlas
              </button>
              <button 
                onClick={() => setConnMode('custom')}
                className={cn("flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all", connMode === 'custom' ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-white")}
              >
                Custom API (Own)
              </button>
            </div>

            {connMode === 'mongodb' ? (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3">
                  <h4 className="text-amber-900 font-bold text-xs flex items-center gap-2 uppercase tracking-wider"><AlertCircle className="w-4 h-4" /> ডাটা এপিআই পাচ্ছেন না?</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    ১. মঙ্গোডিবি ড্যাশবোর্ডের উপরে <b>"App Services"</b> ট্যাবে ক্লিক করুন। (এটি ডাটাবেসের ভেতর থাকে না, আলাদা মেনু)।<br/>
                    ২. ওখানে গিয়ে একটি <b>Build an App</b> ক্লিক করে অ্যাপ বানান।<br/>
                    ৩. অ্যাপের ভেতর বাম পাশে <b>"Data API"</b> অপশনটি পাবেন।<br/>
                    <span className="font-bold">নোট: "Project Access" এর Public/Private Key এখানে কাজ করবে না।</span>
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database className="w-4 h-4 text-indigo-500" /> Atlas Data API</h3>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">App ID</label>
                    <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl mt-1.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="ex: fwoyruev" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data API Key</label>
                    <input type="password" value={dbKey} onChange={(e) => setDbKey(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl mt-1.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-900 text-white p-8 rounded-[32px] space-y-4 shadow-2xl shadow-indigo-100">
                  <h4 className="font-bold flex items-center gap-2 text-indigo-300 uppercase text-[10px] tracking-[0.2em]"><Server className="w-4 h-4" /> নিজস্ব ব্যাকএন্ড</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    আপনার যদি নিজস্ব এপিআই (Node.js/PHP/Python) থাকে, তবে সেটির এন্ডপয়েন্ট এখানে দিন। আমরা আপনার এপিআই-তে সরাসরি JSON ডাটা পাঠিয়ে দেব।
                  </p>
                  <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700/50">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-2">API Endpoint URL</label>
                    <input type="text" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} className="w-full bg-transparent border-none text-white text-xs outline-none focus:ring-0 p-0" placeholder="https://api.your-site.com/blogs" />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleTest} variant="primary" className="w-full h-14 text-sm font-bold rounded-2xl shadow-xl shadow-slate-200" loading={testing}>
              <Wifi className="w-4 h-4 mr-2" /> কানেকশন টেস্ট করুন
            </Button>

            <section className="space-y-6 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><LinkIcon className="w-4 h-4" /> SEO & Meta</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Slug (URL)</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm mt-1 outline-none" placeholder="my-blog-post" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm mt-1 outline-none">
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Lifestyle</option>
                    <option>News</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};
