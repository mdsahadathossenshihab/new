
import { Blog, DashboardStats, BlogStatus } from '../types';

const STORAGE_KEY = 'zenblog_local_storage_v1';

// Initial Mock Data
const INITIAL_DATA: Blog[] = [
  {
    id: '1',
    title: 'স্বাগতম ZenBlog এ',
    slug: 'welcome-to-zenblog',
    content: 'এটি আপনার প্রথম ব্লগ পোস্ট। এডমিন প্যানেল থেকে আপনি এটি পরিবর্তন বা ডিলিট করতে পারবেন।',
    category: 'Technology',
    status: 'published',
    created_at: new Date().toISOString(),
    seo_meta: { description: 'Welcome post', keywords: 'blog, welcome' }
  }
];

const getStoredBlogs = (): Blog[] => {
  if (typeof window === 'undefined') return INITIAL_DATA;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Local Storage Error:", e);
    return INITIAL_DATA;
  }
};

const saveStoredBlogs = (blogs: Blog[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error("Storage Save Error:", e);
  }
};

export const blogService = {
  async getBlogs(): Promise<Blog[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredBlogs()), 100);
    });
  },

  async getBlogById(id: string): Promise<Blog | null> {
    const blogs = getStoredBlogs();
    return blogs.find(b => b.id === id) || null;
  },

  async createBlog(blogData: Partial<Blog>): Promise<Blog> {
    const blogs = getStoredBlogs();
    const newBlog: Blog = {
      id: Math.random().toString(36).substr(2, 9),
      title: blogData.title || 'Untitled Story',
      slug: blogData.slug || 'untitled-' + Date.now(),
      content: blogData.content || '',
      category: blogData.category || 'Lifestyle',
      status: blogData.status || 'draft',
      created_at: new Date().toISOString(),
      seo_meta: blogData.seo_meta || { description: '', keywords: '' }
    };
    blogs.unshift(newBlog);
    saveStoredBlogs(blogs);
    return newBlog;
  },

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog> {
    const blogs = getStoredBlogs();
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Blog not found');
    
    blogs[index] = { ...blogs[index], ...updates };
    saveStoredBlogs(blogs);
    return blogs[index];
  },

  async deleteBlog(id: string): Promise<void> {
    const blogs = getStoredBlogs();
    const filtered = blogs.filter(b => b.id !== id);
    saveStoredBlogs(filtered);
  },

  async getStats(): Promise<DashboardStats> {
    const blogs = getStoredBlogs();
    return {
      total: blogs.length,
      published: blogs.filter(b => b.status === 'published').length,
      drafts: blogs.filter(b => b.status === 'draft').length,
    };
  }
};
