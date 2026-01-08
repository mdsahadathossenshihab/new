
import { Blog, DashboardStats, BlogStatus } from '../types';

const STORAGE_KEY = 'zenblog_local_data';

// Initial Mock Data to prevent empty screen on first load
const INITIAL_DATA: Blog[] = [
  {
    id: '1',
    title: 'স্বাগতম ZenBlog এ',
    slug: 'welcome-to-zenblog',
    content: 'এটি একটি ডেমো ব্লগ। আপনি এডমিন প্যানেল থেকে এটি ডিলিট করে আপনার নিজের ব্লগ লিখতে পারেন।',
    category: 'Technology',
    status: 'published',
    created_at: new Date().toISOString(),
    seo_meta: { description: 'Welcome post', keywords: 'blog, welcome' }
  }
];

const getStoredBlogs = (): Blog[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

const saveStoredBlogs = (blogs: Blog[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
};

export const blogService = {
  async getBlogs(): Promise<Blog[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredBlogs()), 300); // Simulate network delay
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
      title: blogData.title || 'Untitled',
      slug: blogData.slug || 'untitled',
      content: blogData.content || '',
      category: blogData.category || 'General',
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
