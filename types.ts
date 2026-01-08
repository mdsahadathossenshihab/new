
export type BlogStatus = 'draft' | 'published';

export interface SEOMeta {
  description: string;
  keywords: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: any; // TipTap JSON or HTML
  category: string;
  seo_meta: SEOMeta;
  status: BlogStatus;
  created_at: string;
  author_name?: string;
}

export interface DashboardStats {
  total: number;
  published: number;
  drafts: number;
}
