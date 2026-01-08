
import { Blog, DashboardStats, BlogStatus } from '../types';

// Configuration helper
const getConfig = () => {
  const mode = localStorage.getItem('zen_connection_mode') || 'mongodb'; // 'mongodb' or 'custom'
  const appId = localStorage.getItem('zen_mongodb_app_id') || '';
  const apiKey = localStorage.getItem('zen_mongodb_key') || '';
  const customUrl = localStorage.getItem('zen_custom_api_url') || '';
  
  return {
    mode,
    appId,
    apiKey,
    customUrl,
    baseUrl: mode === 'mongodb' 
      ? `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1`
      : customUrl,
    db: 'ZenBlog',
    collection: 'blogs',
    dataSource: 'Cluster0'
  };
};

const mapDocumentToBlog = (doc: any): Blog => ({
  ...doc,
  id: doc._id?.$oid || doc._id?.toString() || doc.id
});

export const blogService = {
  // কানেকশন টেস্ট
  async testConnection(config: {mode: string, appId?: string, key?: string, url?: string}): Promise<{success: boolean, message: string}> {
    try {
      const isMongo = config.mode === 'mongodb';
      const testUrl = isMongo 
        ? `https://data.mongodb-api.com/app/${config.appId}/endpoint/data/v1/action/findOne`
        : config.url;

      if (!testUrl) return { success: false, message: "URL পাওয়া যায়নি।" };

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(isMongo && { 'api-key': config.key || '' })
        },
        body: JSON.stringify(isMongo ? { 
          dataSource: 'Cluster0', database: 'ZenBlog', collection: 'blogs', filter: {} 
        } : {})
      });

      if (response.ok) return { success: true, message: "কানেকশন সাকসেসফুল!" };
      return { success: false, message: `সার্ভার এরর: ${response.status}` };
    } catch (error) {
      return { success: false, message: "লিঙ্কটি কাজ করছে না। ইউআরএল চেক করুন।" };
    }
  },

  async getBlogs(): Promise<Blog[]> {
    const { mode, baseUrl, apiKey, db, collection, dataSource } = getConfig();
    if (!baseUrl) return [];

    try {
      const response = await fetch(`${baseUrl}${mode === 'mongodb' ? '/action/find' : ''}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(mode === 'mongodb' && { 'api-key': apiKey })
        },
        body: JSON.stringify(mode === 'mongodb' ? { dataSource, database: db, collection } : {})
      });
      const result = await response.json();
      const docs = mode === 'mongodb' ? result.documents : result;
      return (docs || []).map(mapDocumentToBlog);
    } catch (error) {
      return [];
    }
  },

  async getBlogById(id: string): Promise<Blog | null> {
    const { mode, baseUrl, apiKey, db, collection, dataSource } = getConfig();
    try {
      const response = await fetch(`${baseUrl}${mode === 'mongodb' ? '/action/findOne' : '/' + id}`, {
        method: mode === 'mongodb' ? 'POST' : 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(mode === 'mongodb' && { 'api-key': apiKey })
        },
        ...(mode === 'mongodb' && {
          body: JSON.stringify({ 
            dataSource, database: db, collection,
            filter: { _id: { "$oid": id } }
          })
        })
      });
      const result = await response.json();
      const doc = mode === 'mongodb' ? result.document : result;
      return doc ? mapDocumentToBlog(doc) : null;
    } catch (error) {
      return null;
    }
  },

  async createBlog(blog: Partial<Blog>): Promise<any> {
    const { mode, baseUrl, apiKey, db, collection, dataSource } = getConfig();
    const response = await fetch(`${baseUrl}${mode === 'mongodb' ? '/action/insertOne' : ''}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(mode === 'mongodb' && { 'api-key': apiKey })
      },
      body: JSON.stringify(mode === 'mongodb' ? { 
        dataSource, database: db, collection,
        document: { ...blog, created_at: new Date().toISOString() }
      } : { ...blog, created_at: new Date().toISOString() })
    });
    return await response.json();
  },

  // Fix: Added updateBlog method to support editing existing blogs
  async updateBlog(id: string, blog: Partial<Blog>): Promise<any> {
    const { mode, baseUrl, apiKey, db, collection, dataSource } = getConfig();
    const response = await fetch(`${baseUrl}${mode === 'mongodb' ? '/action/updateOne' : '/' + id}`, {
      method: mode === 'mongodb' ? 'POST' : 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...(mode === 'mongodb' && { 'api-key': apiKey })
      },
      body: JSON.stringify(mode === 'mongodb' ? { 
        dataSource, database: db, collection,
        filter: { _id: { "$oid": id } },
        update: { "$set": blog }
      } : blog)
    });
    return await response.json();
  },

  async deleteBlog(id: string): Promise<any> {
    const { mode, baseUrl, apiKey, db, collection, dataSource } = getConfig();
    await fetch(`${baseUrl}${mode === 'mongodb' ? '/action/deleteOne' : '/' + id}`, {
      method: mode === 'mongodb' ? 'POST' : 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        ...(mode === 'mongodb' && { 'api-key': apiKey })
      },
      ...(mode === 'mongodb' && {
        body: JSON.stringify({ dataSource, database: db, collection, filter: { _id: { "$oid": id } } })
      })
    });
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