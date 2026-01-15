import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, INotificationRepository, IAiService, IAssetRepository, IDocumentRepository, IKnowledgeRepository, IFieldOpsRepository } from '../../contracts';
import { WorkItemMapper, WorkItemDTO } from '../../mappers/WorkItemMapper';
import { ProjectMapper } from '../../mappers/ProjectMapper';
import { UserMapper } from '../../mappers/UserMapper';
import { AssetMapper } from '../../mappers/AssetMapper';
import { NotificationMapper } from '../../mappers/NotificationMapper';
import { ArticleMapper } from '../../mappers/ArticleMapper';
import { httpClient } from '../../../shared/services/httpClient';
import { WorkItem, Status } from '../../../shared/types';

export class HttpApiProvider implements IDataProvider {
  
  workItems: IWorkItemRepository = {
    getAll: async () => (await httpClient.get<WorkItemDTO[]>('/work-items')).map(WorkItemMapper.toDomain),
    getById: async (id) => WorkItemMapper.toDomain(await httpClient.get<WorkItemDTO>(`/work-items/${id}`)),
    create: async (item) => WorkItemMapper.toDomain(await httpClient.post<WorkItemDTO>('/work-items', WorkItemMapper.toDTO(item))),
    update: async (id, updates) => WorkItemMapper.toDomain(await httpClient.put<WorkItemDTO>(`/work-items/${id}`, WorkItemMapper.toDTO(updates))),
    updateStatus: async (id, status) => WorkItemMapper.toDomain(await httpClient.patch<WorkItemDTO>(`/work-items/${id}/status`, { status })),
    addComment: async (itemId, comment) => WorkItemMapper.toDomain(await httpClient.post<WorkItemDTO>(`/work-items/${itemId}/comments`, comment)),
    submitApprovalDecision: async (itemId, stepId, decision, comments) => WorkItemMapper.toDomain(await httpClient.post<WorkItemDTO>(`/work-items/${itemId}/approvals/${stepId}`, { decision, comments })),
  };

  projects: IProjectRepository = {
    getAll: async () => (await httpClient.get<any[]>('/projects')).map(ProjectMapper.toDomain),
    getById: async (id) => ProjectMapper.toDomain(await httpClient.get<any>(`/projects/${id}`)),
    update: async (id, updates) => ProjectMapper.toDomain(await httpClient.put<any>(`/projects/${id}`, ProjectMapper.toDTO(updates))),
  };

  users: IUserRepository = {
    getAll: async () => (await httpClient.get<any[]>('/users')).map(UserMapper.toDomain),
    getCurrentUser: async () => UserMapper.toDomain(await httpClient.get<any>('/users/me')),
    setCurrentUser: async (id) => UserMapper.toDomain(await httpClient.post<any>(`/users/session`, { id })),
  };

  notifications: INotificationRepository = {
    getAll: async () => (await httpClient.get<any[]>('/notifications')).map(NotificationMapper.toDomain),
    getForUser: async (id) => (await httpClient.get<any[]>(`/notifications/user/${id}`)).map(NotificationMapper.toDomain),
    getUnreadCount: async (id) => (await httpClient.get<{count: number}>(`/notifications/user/${id}/unread`)).count,
    create: async (n) => NotificationMapper.toDomain(await httpClient.post<any>('/notifications', NotificationMapper.toDTO(n))),
    markAsRead: async (id) => { await httpClient.post(`/notifications/${id}/read`, {}); },
    markAllAsRead: async (id) => { await httpClient.post(`/notifications/user/${id}/read-all`, {}); },
  };

  knowledge: IKnowledgeRepository = { 
    getAll: async () => (await httpClient.get<any[]>('/knowledge')).map(ArticleMapper.toDomain), 
    search: async (q) => (await httpClient.get<any[]>(`/knowledge/search?q=${q}`)).map(ArticleMapper.toDomain), 
    create: async (a) => ArticleMapper.toDomain(await httpClient.post<any>('/knowledge', ArticleMapper.toDTO(a))) 
  };

  assets: IAssetRepository = {
    getAll: async () => (await httpClient.get<any[]>('/assets')).map(AssetMapper.toDomain),
    getById: async (id) => AssetMapper.toDomain(await httpClient.get<any>(`/assets/${id}`)),
    update: async (id, updates) => AssetMapper.toDomain(await httpClient.put<any>(`/assets/${id}`, AssetMapper.toDTO(updates))),
    create: async (asset) => AssetMapper.toDomain(await httpClient.post<any>('/assets', AssetMapper.toDTO(asset))),
  };

  ai: IAiService = {
    analyzeWorkItem: async (item) => (await httpClient.post<{analysis: string}>('/ai/analyze-work-item', item)).analysis,
    suggestPriority: async (t, d) => (await httpClient.post<{priority: string}>('/ai/suggest-priority', { t, d })).priority,
    generateExecutiveBrief: async (s) => (await httpClient.post<{brief: string}>('/ai/executive-brief', s)).brief,
    analyzeNotification: async (t, m) => await httpClient.post('/ai/analyze-notification', { t, m }),
    askWiki: async (c, q) => (await httpClient.post<{answer: string}>('/ai/ask-wiki', { c, q })).answer,
  };

  documents: IDocumentRepository = { 
    getAll: async () => await httpClient.get<any[]>('/documents'), 
    getByProjectId: async (pid) => await httpClient.get<any[]>(`/documents/project/${pid}`), 
    upload: async (d) => await httpClient.post<any>('/documents/upload', d), 
    delete: async (id) => { await httpClient.delete(`/documents/${id}`); } 
  };

  fieldOps: IFieldOpsRepository = { 
    getDrafts: () => JSON.parse(localStorage.getItem('enjaz_field_drafts') || '[]'), 
    saveDraft: (item) => { 
        const d = JSON.parse(localStorage.getItem('enjaz_field_drafts') || '[]'); 
        d.push(item); 
        localStorage.setItem('enjaz_field_drafts', JSON.stringify(d)); 
        return d; 
    }, 
    removeDraft: (id) => { 
        const d = JSON.parse(localStorage.getItem('enjaz_field_drafts') || '[]').filter((x:any) => x.id !== id); 
        localStorage.setItem('enjaz_field_drafts', JSON.stringify(d)); 
        return d; 
    }, 
    clearDrafts: () => localStorage.removeItem('enjaz_field_drafts') 
  };

  invalidateCache() {}
}