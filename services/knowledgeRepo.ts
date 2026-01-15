import { Article } from "../types";
import { db } from "./db";

const COLLECTION = 'KNOWLEDGE_BASE';

export const knowledgeRepo = {
  getAll: async (): Promise<Article[]> => {
    return await db.get<Article>(COLLECTION);
  },

  search: async (term: string): Promise<Article[]> => {
    const all = await db.get<Article>(COLLECTION);
    const lowerTerm = term.toLowerCase();
    return all.filter(a => 
      a.title.toLowerCase().includes(lowerTerm) || 
      a.tags.some(t => t.toLowerCase().includes(lowerTerm))
    );
  },

  create: async (article: Partial<Article>): Promise<Article> => {
    const newArticle: Article = {
      id: `kb-${Date.now()}`,
      title: article.title || 'Untitled Article',
      category: article.category || 'General',
      content: article.content || '',
      authorName: article.authorName || 'System',
      lastUpdated: new Date().toISOString(),
      tags: article.tags || []
    };
    return await db.add<Article>(COLLECTION, newArticle);
  }
};
