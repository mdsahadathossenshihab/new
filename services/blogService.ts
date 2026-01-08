
import { Blog, DashboardStats } from '../types';

/**
 * MongoDB Atlas Data API Config
 */
const MONGO_CONFIG = {
  url: process.env.MONGODB_API_URL || '',
  apiKey: process.env.MONGODB_API_KEY || '',
  database: process.env.MONGODB_DATABASE || 'ZenBlog',
  collection: process.env.MONGODB_COLLECTION || 'blogs',
  dataSource: process.env.MONGODB_DATA_SOURCE || 'Cluster0',
};

const STORAGE_KEY = 'zenblog_local_storage_v1';

// চেক করা হচ্ছে মঙ্গোডিবি এর জন্য প্রয়োজনীয় 'Data API' কি গুলো আছে কি না
// দ্রষ্টব্য: Vercel-এর MONGODB_URI সরাসরি ব্রাউজারে কাজ করে না।
export const isMongoEnabled = !!(MONGO_CONFIG.url && MONGO_CONFIG.apiKey);

const mongoRequest = async (action: string, body: any) => {
  try {
    const response = await fetch(`${MONGO_CONFIG.url}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGO_CONFIG.apiKey,
      },
      body: JSON.stringify({
        dataSource: MONGO_CONFIG.dataSource,
        database: MONGO_CONFIG.database,
        collection: MONGO_CONFIG.collection,
        ...body,
      }),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'MongoDB API Error');
    }
    return await response.json();
  } catch (error) {
    console.error(`MongoDB Action Error [${action}]:`, error);
    throw error;
  }
};

const getStoredBlogs = (): Blog[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredBlogs = (blogs: Blog[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
};

export const blogService = {
  getStorageMode(): 'cloud' | 'local' {
    return isMongoEnabled ? 'cloud' : 'local';
  },

  async getBlogs(): Promise<Blog[]> {
    if (isMongoEnabled) {
      try {
        const result = await mongoRequest('find', { filter: {}, sort: { created_at: -1 } });
        return result.documents.map((doc: any) => ({
          ...doc,
          id: doc._id.$oid || doc._id,
        }));
      } catch (e) {
        console.warn("Falling back to local storage for getBlogs");
      }
    }
    return getStoredBlogs();
  },

  async getBlogById(id: string): Promise<Blog | null> {
    if (isMongoEnabled) {
      try {
        const filter = id.length === 24 ? { _id: { "$oid": id } } : { id: id };
        const result = await mongoRequest('findOne', { filter });
        if (result.document) {
          return { ...result.document, id: result.document._id.$oid || result.document._id };
        }
      } catch (e) {}
    }
    return getStoredBlogs().find(b => b.id === id) || null;
  },

  async createBlog(blogData: Partial<Blog>): Promise<Blog> {
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

    if (isMongoEnabled) {
      try {
        const result = await mongoRequest('insertOne', { document: newBlog });
        return { ...newBlog, id: result.insertedId };
      } catch (e) {
        console.error("MongoDB create failed");
      }
    }

    const blogs = getStoredBlogs();
    blogs.unshift(newBlog);
    saveStoredBlogs(blogs);
    return newBlog;
  },

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog> {
    if (isMongoEnabled) {
      try {
        const filter = id.length === 24 ? { _id: { "$oid": id } } : { id: id };
        await mongoRequest('updateOne', {
          filter,
          update: { "$set": updates }
        });
        return { ...updates, id } as Blog;
      } catch (e) {}
    }

    const blogs = getStoredBlogs();
    const index = blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      blogs[index] = { ...blogs[index], ...updates };
      saveStoredBlogs(blogs);
      return blogs[index];
    }
    throw new Error('Blog not found');
  },

  async deleteBlog(id: string): Promise<void> {
    if (isMongoEnabled) {
      try {
        const filter = id.length === 24 ? { _id: { "$oid": id } } : { id: id };
        await mongoRequest('deleteOne', { filter });
        return;
      } catch (e) {}
    }

    const blogs = getStoredBlogs();
    const filtered = blogs.filter(b => b.id !== id);
    saveStoredBlogs(filtered);
  },

  async getStats(): Promise<DashboardStats> {
    const blogs = await this.getBlogs();
    return {
      total: blogs.length,
      published: blogs.filter(b => b.status === 'published').length,
      drafts: blogs.filter(b => b.status === 'draft').length,
    };
  }
};
