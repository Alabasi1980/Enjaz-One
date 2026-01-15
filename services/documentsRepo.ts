import { Document } from "../types";
import { db } from "./db";

const COLLECTION = 'DOCUMENTS';

export const documentsRepo = {
  getAll: async (): Promise<Document[]> => {
    const all = await db.get<Document>(COLLECTION);
    return all.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  getByProjectId: async (projectId: string): Promise<Document[]> => {
    const all = await db.get<Document>(COLLECTION);
    return all.filter(d => d.projectId === projectId).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  },

  upload: async (doc: Partial<Document>): Promise<Document> => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: doc.title || 'Untitled Document',
      category: doc.category || 'Other',
      url: doc.url || '',
      projectId: doc.projectId!,
      uploaderId: doc.uploaderId || 'system',
      uploaderName: doc.uploaderName || 'System',
      uploadedAt: new Date().toISOString(),
      size: doc.size || '0 KB',
      type: doc.type || 'application/octet-stream'
    };
    return await db.add<Document>(COLLECTION, newDoc);
  },

  delete: async (id: string): Promise<void> => {
    await db.remove(COLLECTION, id);
  }
};
