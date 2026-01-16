
// Add IEmployeeRepository and IPayrollRepository to the contracts import
import { 
  IDataProvider, 
  IWorkItemRepository, 
  IProjectRepository, 
  IUserRepository, 
  INotificationRepository, 
  IAiService, 
  IAssetRepository, 
  IDocumentRepository, 
  IKnowledgeRepository, 
  IFieldOpsRepository, 
  IAutomationRepository, 
  IMaterialRepository, 
  IDailyLogRepository, 
  IEmployeeRepository, 
  IPayrollRepository,
  IVendorRepository,
  IProcurementRepository,
  // Added missing IStakeholderRepository to satisfy IDataProvider interface
  IStakeholderRepository
} from '../../contracts';
import { WorkItemMapper, WorkItemDTO } from '../../mappers/WorkItemMapper';
import { ProjectMapper, ProjectDTO } from '../../mappers/ProjectMapper';
import { UserMapper, UserDTO } from '../../mappers/UserMapper';
import { ArticleMapper, ArticleDTO } from '../../mappers/ArticleMapper';
import { AssetMapper, AssetDTO } from '../../mappers/AssetMapper';
import { NotificationMapper, NotificationDTO } from '../../mappers/NotificationMapper';
import { httpClient } from '../../../services/httpClient';
// Add Employee and PayrollRecord to the types import
import { 
  WorkItem, 
  Project, 
  User, 
  Asset, 
  Document, 
  Article, 
  Notification, 
  Status, 
  Material, 
  DailyLog, 
  StockMovement, 
  Employee, 
  PayrollRecord,
  Vendor,
  PurchaseOrder,
  Contract,
  // Added missing Client and ChangeOrder types
  Client,
  ChangeOrder,
  // Fix: Added missing technical submission types for consultant portal
  Rfi,
  MaterialSubmittal,
  // Fix: Added missing subcontractor management types
  Subcontractor,
  PaymentCertificate,
  Ncr,
  // Fix: Added missing VendorCategory and PettyCashRecord imports
  VendorCategory,
  PettyCashRecord,
  // Added missing Permit and LetterOfGuarantee types
  Permit,
  LetterOfGuarantee,
  // Added missing Blueprint and TaskPin types for blueprint support
  Blueprint,
  TaskPin
} from '../../../shared/types';

/**
 * @class HttpApiProvider
 * @description مزود البيانات الفعلي عبر الـ API. 
 * يضمن هذا المزود أن كل دالة تتبع العقد البرمجي بدقة وتقوم بتحويل البيانات (Mapping)
 * لضمان عدم وصول بيانات خام أو غير معرفة (undefined) إلى مكونات الواجهة.
 */
export class HttpApiProvider implements IDataProvider {
  
  private throwNotImplemented(method: string): never {
    throw new Error(`API_ERROR: الـ Endpoint الخاص بـ [${method}] غير مرتبط بالسيرفر بعد. يرجى مراجعة INTEGRATION_GUIDE.md`);
  }

  // Implementation for employees repository added to fulfill IDataProvider interface
  employees: IEmployeeRepository = {
    getAll: async () => {
      return await httpClient.get<Employee[]>('/employees');
    },
    getById: async (id) => {
      return await httpClient.get<Employee>(`/employees/${id}`);
    },
    update: async (id, updates) => {
      return await httpClient.put<Employee>(`/employees/${id}`, updates);
    },
    create: async (emp) => {
      return await httpClient.post<Employee>('/employees', emp);
    }
  };

  // Implementation for payroll repository added to fulfill IDataProvider interface
  payroll: IPayrollRepository = {
    getMonthlyRecords: async (month, year) => {
      return await httpClient.get<PayrollRecord[]>(`/payroll?month=${month}&year=${year}`);
    },
    generatePayroll: async (month, year) => {
      return await httpClient.post<PayrollRecord[]>(`/payroll/generate`, { month, year });
    },
    approveRecord: async (id) => {
      await httpClient.post(`/payroll/${id}/approve`, {});
    },
    markAsPaid: async (id) => {
      await httpClient.post(`/payroll/${id}/pay`, {});
    }
  };

  // Fix: Added missing vendors repository implementation to satisfy IDataProvider
  vendors: IVendorRepository = {
    getAll: async () => {
      return await httpClient.get<Vendor[]>('/vendors');
    },
    getById: async (id) => {
      return await httpClient.get<Vendor>(`/vendors/${id}`);
    },
    create: async (vendor) => {
      return await httpClient.post<Vendor>('/vendors', vendor);
    },
    update: async (id, updates) => {
      return await httpClient.put<Vendor>(`/vendors/${id}`, updates);
    },
    // Fix: Added missing getByCategory method to satisfy IVendorRepository
    getByCategory: async (cat) => {
      return await httpClient.get<Vendor[]>(`/vendors/category/${cat}`);
    }
  };

  // Fix: Added missing procurement repository implementation to satisfy IDataProvider
  procurement: IProcurementRepository = {
    getPurchaseOrders: async (projectId) => {
      return await httpClient.get<PurchaseOrder[]>(projectId ? `/procurement/po?projectId=${projectId}` : '/procurement/po');
    },
    createPO: async (po) => {
      return await httpClient.post<PurchaseOrder>('/procurement/po', po);
    },
    updatePOStatus: async (id, status) => {
      await httpClient.patch(`/procurement/po/${id}/status`, { status });
    },
    getContracts: async (projectId) => {
      return await httpClient.get<Contract[]>(projectId ? `/procurement/contracts?projectId=${projectId}` : '/procurement/contracts');
    },
    createContract: async (contract) => {
      return await httpClient.post<Contract>('/procurement/contracts', contract);
    },
    // Fix: Added missing getPettyCashRecords method to satisfy IProcurementRepository
    getPettyCashRecords: async (projectId) => {
      return await httpClient.get<PettyCashRecord[]>(`/procurement/petty-cash?projectId=${projectId}`);
    },
    // Fix: Added missing addPettyCashEntry method to satisfy IProcurementRepository
    addPettyCashEntry: async (entry) => {
      return await httpClient.post<PettyCashRecord>('/procurement/petty-cash', entry);
    }
  };

  // Implementation for stakeholders repository added to fulfill IDataProvider interface
  stakeholders: IStakeholderRepository = {
    getClients: async () => {
      return await httpClient.get<Client[]>('/clients');
    },
    getClientById: async (id) => {
      return await httpClient.get<Client>(`/clients/${id}`);
    },
    getChangeOrders: async (projectId) => {
      return await httpClient.get<ChangeOrder[]>(`/change-orders?projectId=${projectId}`);
    },
    createChangeOrder: async (co) => {
      return await httpClient.post<ChangeOrder>('/change-orders', co);
    },
    updateChangeOrderStatus: async (id, status) => {
      await httpClient.patch(`/change-orders/${id}/status`, { status });
    },
    // Fix: Added missing technical submission methods for consultants to satisfy IStakeholderRepository interface
    getRfIs: async (projectId) => {
      return await httpClient.get<Rfi[]>(`/rfis?projectId=${projectId}`);
    },
    createRfi: async (rfi) => {
      return await httpClient.post<Rfi>('/rfis', rfi);
    },
    updateRfiStatus: async (id, status, response) => {
      await httpClient.patch(`/rfis/${id}/status`, { status, response });
    },
    getMaterialSubmittals: async (projectId) => {
      return await httpClient.get<MaterialSubmittal[]>(`/submittals?projectId=${projectId}`);
    },
    createMaterialSubmittal: async (ms) => {
      return await httpClient.post<MaterialSubmittal>('/submittals', ms);
    },
    updateSubmittalStatus: async (id, status, comment) => {
      await httpClient.patch(`/submittals/${id}/status`, { status, consultantComment: comment });
    },
    // Fix: Added missing subcontractor management methods to satisfy IStakeholderRepository interface
    getSubcontractors: async (projectId) => {
      return await httpClient.get<Subcontractor[]>(`/subcontractors?projectId=${projectId}`);
    },
    getPaymentCertificates: async (projectId) => {
      return await httpClient.get<PaymentCertificate[]>(`/certificates?projectId=${projectId}`);
    },
    createPaymentCertificate: async (cert) => {
      return await httpClient.post<PaymentCertificate>('/certificates', cert);
    },
    updateCertificateStatus: async (id, status) => {
      await httpClient.patch(`/certificates/${id}/status`, { status });
    },
    getNcrs: async (projectId) => {
      return await httpClient.get<Ncr[]>(`/ncrs?projectId=${projectId}`);
    },
    createNcr: async (ncr) => {
      return await httpClient.post<Ncr>('/ncrs', ncr);
    },
    updateNcrStatus: async (id, status) => {
      await httpClient.patch(`/ncrs/${id}/status`, { status });
    },
    // Fix: Added missing getPermits method to satisfy IStakeholderRepository interface
    getPermits: async (projectId) => {
      return await httpClient.get<Permit[]>(`/permits?projectId=${projectId}`);
    },
    // Fix: Added missing getLGs method to satisfy IStakeholderRepository interface
    getLGs: async (projectId) => {
      return await httpClient.get<LetterOfGuarantee[]>(`/lgs?projectId=${projectId}`);
    }
  };

  // Implementation for materials repository added to fulfill IDataProvider interface
  materials: IMaterialRepository = {
    getAll: async () => {
      return await httpClient.get<Material[]>('/materials');
    },
    getById: async (id) => {
      return await httpClient.get<Material>(`/materials/${id}`);
    },
    // Updated signature to match IMaterialRepository
    updateStock: async (id, qty, type, note) => {
      return await httpClient.patch<Material>(`/materials/${id}/stock`, { currentStock: qty, type, note });
    },
    create: async (material) => {
      return await httpClient.post<Material>('/materials', material);
    },
    // Added missing getMovements implementation
    getMovements: async (materialId) => {
      return await httpClient.get<StockMovement[]>(`/materials/${materialId}/movements`);
    }
  };

  // Fix: Added missing dailyLogs repository implementation to satisfy IDataProvider
  dailyLogs: IDailyLogRepository = {
    getAll: async (projectId) => {
      return await httpClient.get<DailyLog[]>(projectId ? `/daily-logs?projectId=${projectId}` : '/daily-logs');
    },
    getById: async (id) => {
      return await httpClient.get<DailyLog>(`/daily-logs/${id}`);
    },
    create: async (log) => {
      return await httpClient.post<DailyLog>('/daily-logs', log);
    },
    approve: async (id) => {
      await httpClient.post(`/daily-logs/${id}/approve`, {});
    },
  };

  workItems: IWorkItemRepository = {
    getAll: async (force) => {
      const dtos = await httpClient.get<WorkItemDTO[]>('/work-items');
      return dtos.map(WorkItemMapper.toDomain);
    },
    getById: async (id) => {
      const dto = await httpClient.get<WorkItemDTO>(`/work-items/${id}`);
      return dto ? WorkItemMapper.toDomain(dto) : undefined;
    },
    create: async (item) => {
      const dto = await httpClient.post<WorkItemDTO>('/work-items', WorkItemMapper.toDTO(item));
      return WorkItemMapper.toDomain(dto);
    },
    update: async (id, updates) => {
      const dto = await httpClient.put<WorkItemDTO>(`/work-items/${id}`, WorkItemMapper.toDTO(updates));
      return dto ? WorkItemMapper.toDomain(dto) : null;
    },
    updateStatus: async (id, status) => {
      const dto = await httpClient.patch<WorkItemDTO>(`/work-items/${id}/status`, { status });
      return dto ? WorkItemMapper.toDomain(dto) : null;
    },
    addComment: async (itemId, comment) => {
      const dto = await httpClient.post<WorkItemDTO>(`/work-items/${itemId}/comments`, comment);
      return dto ? WorkItemMapper.toDomain(dto) : null;
    },
    submitApprovalDecision: async (itemId, stepId, decision, comments) => {
      const dto = await httpClient.post<WorkItemDTO>(`/work-items/${itemId}/approvals/${stepId}`, { decision, comments });
      return dto ? WorkItemMapper.toDomain(dto) : null;
    },
  };

  projects: IProjectRepository = {
    getAll: async (force) => {
      const dtos = await httpClient.get<ProjectDTO[]>('/projects');
      return dtos.map(ProjectMapper.toDomain);
    },
    getById: async (id) => {
      const dto = await httpClient.get<ProjectDTO>(`/projects/${id}`);
      return dto ? ProjectMapper.toDomain(dto) : undefined;
    },
    update: async (id, updates) => {
      const dto = await httpClient.put<ProjectDTO>(`/projects/${id}`, ProjectMapper.toDTO(updates));
      return dto ? ProjectMapper.toDomain(dto) : null;
    },
  };

  users: IUserRepository = {
    getAll: async (force) => {
      const dtos = await httpClient.get<UserDTO[]>('/users');
      return dtos.map(UserMapper.toDomain);
    },
    getCurrentUser: async () => {
      const dto = await httpClient.get<UserDTO>('/users/me');
      // Fixed: Replaced 'all' with 'dto'
      return UserMapper.toDomain(dto);
    },
    setCurrentUser: async (id) => {
      const dto = await httpClient.post<UserDTO>(`/users/session`, { id });
      return dto ? UserMapper.toDomain(dto) : undefined;
    },
  };

  notifications: INotificationRepository = {
    getAll: async () => {
      const dtos = await httpClient.get<NotificationDTO[]>('/notifications');
      return dtos.map(NotificationMapper.toDomain);
    },
    getForUser: async (id) => {
      const dtos = await httpClient.get<NotificationDTO[]>(`/notifications/user/${id}`);
      return dtos.map(NotificationMapper.toDomain);
    },
    getUnreadCount: async (id) => {
      const res = await httpClient.get<{count: number}>(`/notifications/user/${id}/unread`);
      return res.count;
    },
    create: async (n) => {
      const dto = await httpClient.post<NotificationDTO>('/notifications', NotificationMapper.toDTO(n));
      return NotificationMapper.toDomain(dto);
    },
    markAsRead: async (id) => { 
      await httpClient.post(`/notifications/${id}/read`, {}); 
    },
    markAllAsRead: async (id) => { 
      await httpClient.post(`/notifications/user/${id}/read-all`, {}); 
    },
    getPreferences: () => {
      return this.throwNotImplemented('getPreferences');
    },
    savePreferences: async (prefs) => { 
      await httpClient.post('/notifications/preferences', prefs); 
    }
  };

  automation: IAutomationRepository = {
    getRules: () => {
      return []; // الأتمتة غالباً ما تدار في السيرفر، نعيد مصفوفة فارغة لتجنب الكسر
    },
    toggleRule: (id) => {
      return this.throwNotImplemented('toggleRule');
    }
  };

  assets: IAssetRepository = {
    getAll: async () => {
      const dtos = await httpClient.get<AssetDTO[]>('/assets');
      return dtos.map(AssetMapper.toDomain);
    },
    getById: async (id) => {
      const dto = await httpClient.get<AssetDTO>(`/assets/${id}`);
      return dto ? AssetMapper.toDomain(dto) : undefined;
    },
    update: async (id, updates) => {
      const dto = await httpClient.put<AssetDTO>(`/assets/${id}`, AssetMapper.toDTO(updates));
      return dto ? AssetMapper.toDomain(dto) : null;
    },
    create: async (asset) => {
      const dto = await httpClient.post<AssetDTO>('/assets', AssetMapper.toDTO(asset));
      return AssetMapper.toDomain(dto);
    },
  };

  knowledge: IKnowledgeRepository = {
    getAll: async () => {
      const dtos = await httpClient.get<ArticleDTO[]>('/knowledge');
      return dtos.map(ArticleMapper.toDomain);
    },
    search: async (q) => {
      const dtos = await httpClient.get<ArticleDTO[]>(`/knowledge/search?q=${q}`);
      return dtos.map(ArticleMapper.toDomain);
    },
    create: async (a) => {
      const dto = await httpClient.post<ArticleDTO>('/knowledge', ArticleMapper.toDTO(a));
      return ArticleMapper.toDomain(dto);
    },
  };

  documents: IDocumentRepository = {
    getAll: async () => {
      return await httpClient.get<Document[]>('/documents');
    },
    getByProjectId: async (pid) => {
      return await httpClient.get<Document[]>(`/documents/project/${pid}`);
    },
    upload: async (d) => {
      return await httpClient.post<Document>('/documents/upload', d);
    },
    delete: async (id) => {
      await httpClient.delete(`/documents/${id}`);
    },
    /* Blueprint Support Implementation */
    getBlueprints: async (projectId) => {
      return await httpClient.get<Blueprint[]>(`/blueprints?projectId=${projectId}`);
    },
    updateBlueprintPins: async (id, pins) => {
      await httpClient.put(`/blueprints/${id}/pins`, { pins });
    },
  };

  ai: IAiService = {
    analyzeWorkItem: async (item) => {
      const res = await httpClient.post<{analysis: string}>('/ai/analyze-work-item', item);
      return res.analysis;
    },
    suggestPriority: async (t, d) => {
      const res = await httpClient.post<{priority: string}>('/ai/suggest-priority', { t, d });
      return res.priority;
    },
    generateExecutiveBrief: async (s) => {
      const res = await httpClient.post<{brief: string}>('/ai/executive-brief', s);
      return res.brief;
    },
    // Fix: Added missing generateFinancialInsight method to satisfy IAiService interface
    generateFinancialInsight: async (project, actualCosts) => {
      const res = await httpClient.post<{insight: string}>('/ai/financial-insight', { project, actualCosts });
      return res.insight;
    },
    // Fix: Updated generateDailyReport method signature to satisfy IAiService interface
    generateDailyReport: async (project, items, materials, labor, machines) => {
      const res = await httpClient.post<{report: string}>('/ai/generate-daily-report', { project, items, materials, labor, machines });
      return res.report;
    },
    analyzeNotification: async (t, m) => {
      return await httpClient.post<{priority: string; category: string; summary?: string}>('/ai/analyze-notification', { t, m });
    },
    askWiki: async (c, q) => {
      const res = await httpClient.post<{answer: string}>('/ai/ask-wiki', { c, q });
      return res.answer;
    },
  };

  fieldOps: IFieldOpsRepository = {
    getDrafts: async () => [], // المسودات دائماً محلية
    saveDraft: async () => {},
    removeDraft: async () => {},
    clearDrafts: async () => {}
  };

  invalidateCache() {}
}
