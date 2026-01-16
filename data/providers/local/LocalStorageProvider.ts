
import { IDataProvider, IWorkItemRepository, IProjectRepository, IUserRepository, IAssetRepository, IDocumentRepository, IKnowledgeRepository, INotificationRepository, IFieldOpsRepository, IAiService, IAutomationRepository, IMaterialRepository, IDailyLogRepository, IEmployeeRepository, IPayrollRepository, IVendorRepository, IProcurementRepository, IStakeholderRepository } from '../../contracts';
import { WorkItem, Status, Notification, NotificationPreferences, AutomationRule, Priority, WorkItemType, User, Project, Asset, Article, Document, Material, DailyLog, Employee, PayrollRecord, Vendor, PurchaseOrder, Contract, Client, ChangeOrder, Rfi, MaterialSubmittal, Subcontractor, PaymentCertificate, Ncr, VendorCategory, PettyCashRecord, Permit, LetterOfGuarantee, Blueprint, TaskPin } from '../../../shared/types';
import { MOCK_WORK_ITEMS, MOCK_PROJECTS, MOCK_USERS, MOCK_ASSETS, MOCK_ARTICLES } from '../../../shared/constants';
import { storageService } from '../../../services/storageService';
import { geminiService } from '../../../services/GeminiAiService';

const MOCK_PERMITS: Permit[] = [
  { id: 'PR-1', projectId: 'P001', authority: 'Municipality', title: 'تراخيص بناء - المرحلة أ', status: 'Active', issueDate: '2023-01-01', expiryDate: '2024-01-01' },
  { id: 'PR-2', projectId: 'P001', authority: 'Civil Defense', title: 'سلامة إنشائية', status: 'Renewal', issueDate: '2023-05-10', expiryDate: '2023-11-10' }
];

const MOCK_LGS: LetterOfGuarantee[] = [
  { id: 'LG-1', projectId: 'P001', bankName: 'SABB Bank', type: 'Performance Bond', amount: 500000, issueDate: '2023-01-01', expiryDate: '2024-06-30', status: 'Active' },
  { id: 'LG-2', projectId: 'P001', bankName: 'SABB Bank', type: 'Advance Payment', amount: 1200000, issueDate: '2023-01-01', expiryDate: '2024-06-30', status: 'Active' }
];

const MOCK_BLUEPRINTS: Blueprint[] = [
  { 
    id: 'BP-1', projectId: 'P001', title: 'المخطط الإنشائي - الدور الأرضي', 
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000', 
    version: 'V2.1', 
    pins: [
      { id: 'p1', workItemId: 'WI-1001', x: 25.5, y: 40.2, type: WorkItemType.APPROVAL, priority: Priority.CRITICAL },
      { id: 'p2', workItemId: 'WI-1002', x: 60.1, y: 55.8, type: WorkItemType.TASK, priority: Priority.MEDIUM }
    ] 
  }
];

export class LocalStorageProvider implements IDataProvider {
  private cache = new Map<string, any>();
  ai = geminiService; 

  invalidateCache() { this.cache.clear(); }

  private async ensureInitialized<T>(store: string, defaults: T[]) {
    await storageService.init();
    const existing = await storageService.getAll<T>(store);
    if (existing.length === 0 && defaults.length > 0) {
      for (const item of defaults) {
        await storageService.put(store, { ...item });
      }
      return defaults;
    }
    return existing;
  }

  stakeholders: IStakeholderRepository = {
    getClients: async () => this.ensureInitialized<Client>('clients', []),
    getClientById: async (id) => (await this.stakeholders.getClients()).find(c => c.id === id),
    getChangeOrders: async (pid) => {
       const all = await this.ensureInitialized<ChangeOrder>('change_orders', []);
       return all.filter(co => co.projectId === pid);
    },
    createChangeOrder: async (co) => {
       const newItem = { ...co, id: `CO-${Date.now()}`, createdAt: new Date().toISOString() } as ChangeOrder;
       await storageService.put('change_orders', newItem);
       return newItem;
    },
    updateChangeOrderStatus: async (id, status) => {
       const all = await storageService.getAll<ChangeOrder>('change_orders');
       const co = all.find(x => x.id === id);
       if (co) await storageService.put('change_orders', { ...co, status });
    },
    getRfIs: async (pid) => {
       const all = await this.ensureInitialized<Rfi>('rfis', []);
       return all.filter(r => r.projectId === pid);
    },
    createRfi: async (rfi) => {
       const newItem = { ...rfi, id: `RFI-${Date.now()}`, createdAt: new Date().toISOString() } as Rfi;
       await storageService.put('rfis', newItem);
       return newItem;
    },
    updateRfiStatus: async (id, status, response) => {
       const all = await storageService.getAll<Rfi>('rfis');
       const r = all.find(x => x.id === id);
       if (r) await storageService.put('rfis', { ...r, status, response, respondedAt: new Date().toISOString() });
    },
    getMaterialSubmittals: async (pid) => {
       const all = await this.ensureInitialized<MaterialSubmittal>('submittals', []);
       return all.filter(s => s.projectId === pid);
    },
    createMaterialSubmittal: async (ms) => {
       const newItem = { ...ms, id: `SUB-${Date.now()}`, createdAt: new Date().toISOString() } as MaterialSubmittal;
       await storageService.put('submittals', newItem);
       return newItem;
    },
    updateSubmittalStatus: async (id, status, consultantComment) => {
       const all = await storageService.getAll<MaterialSubmittal>('submittals');
       const s = all.find(x => x.id === id);
       if (s) await storageService.put('submittals', { ...s, status, consultantComment });
    },
    getSubcontractors: async (pid) => this.ensureInitialized<Subcontractor>('subcontractors', []),
    getPaymentCertificates: async (pid) => {
       const all = await this.ensureInitialized<PaymentCertificate>('certificates', []);
       return all.filter(c => c.projectId === pid);
    },
    createPaymentCertificate: async (cert) => {
       const newItem = { ...cert, id: `PC-${Date.now()}`, createdAt: new Date().toISOString() } as PaymentCertificate;
       await storageService.put('certificates', newItem);
       return newItem;
    },
    updateCertificateStatus: async (id, status) => {
       const all = await storageService.getAll<PaymentCertificate>('certificates');
       const cert = all.find(x => x.id === id);
       if (cert) await storageService.put('certificates', { ...cert, status });
    },
    getNcrs: async (pid) => {
       const all = await this.ensureInitialized<Ncr>('ncrs', []);
       return all.filter(n => n.projectId === pid);
    },
    createNcr: async (ncr) => {
       const newItem = { ...ncr, id: `NCR-${Date.now()}`, createdAt: new Date().toISOString() } as Ncr;
       await storageService.put('ncrs', newItem);
       return newItem;
    },
    updateNcrStatus: async (id, status) => {
       const all = await storageService.getAll<Ncr>('ncrs');
       const ncr = all.find(x => x.id === id);
       if (ncr) await storageService.put('ncrs', { ...ncr, status, resolvedAt: status === 'Resolved' ? new Date().toISOString() : undefined });
    },
    getPermits: async (pid) => {
       const all = await this.ensureInitialized<Permit>('permits', MOCK_PERMITS);
       return all.filter(p => p.projectId === pid);
    },
    getLGs: async (pid) => {
       const all = await this.ensureInitialized<LetterOfGuarantee>('lgs', MOCK_LGS);
       return all.filter(l => l.projectId === pid);
    }
  };

  vendors: IVendorRepository = {
    getAll: async () => this.ensureInitialized<Vendor>('vendors', []),
    getById: async (id) => (await this.vendors.getAll()).find(v => v.id === id),
    create: async (v) => {
      const newItem = { ...v, id: `V-${Date.now()}`, status: 'Active' } as Vendor;
      await storageService.put('vendors', newItem);
      return newItem;
    },
    update: async (id, updates) => {
      const v = await this.vendors.getById(id);
      if (!v) return null;
      const updated = { ...v, ...updates };
      await storageService.put('vendors', updated);
      return updated;
    },
    getByCategory: async (cat) => (await this.vendors.getAll()).filter(v => v.category === cat)
  };

  procurement: IProcurementRepository = {
    getPurchaseOrders: async (pid) => {
      const all = await storageService.getAll<PurchaseOrder>('purchase_orders');
      return pid ? all.filter(p => p.projectId === pid) : all;
    },
    createPO: async (po) => {
      const newItem = { ...po, id: `PO-${Date.now()}`, poNumber: `PO-${1000 + Math.floor(Math.random()*9000)}`, issueDate: new Date().toISOString(), paymentStatus: 'Pending' } as PurchaseOrder;
      await storageService.put('purchase_orders', newItem);
      return newItem;
    },
    updatePOStatus: async (id, status) => {
      const pos = await storageService.getAll<PurchaseOrder>('purchase_orders');
      const po = pos.find(x => x.id === id);
      if (po) await storageService.put('purchase_orders', { ...po, status });
    },
    getContracts: async (pid) => {
       const all = await storageService.getAll<Contract>('contracts');
       return pid ? all.filter(c => c.projectId === pid) : all;
    },
    createContract: async (c) => {
       const newItem = { ...c, id: `C-${Date.now()}`, contractNumber: `CON-${Date.now().toString().slice(-5)}` } as Contract;
       await storageService.put('contracts', newItem);
       return newItem;
    },
    getPettyCashRecords: async (pid) => {
       const all = await storageService.getAll<PettyCashRecord>('petty_cash');
       return all.filter(r => r.projectId === pid);
    },
    addPettyCashEntry: async (entry) => {
       const newItem = { ...entry, id: `PCASH-${Date.now()}` } as PettyCashRecord;
       await storageService.put('petty_cash', newItem);
       return newItem;
    }
  };

  employees: IEmployeeRepository = {
    getAll: async () => this.ensureInitialized<Employee>('employees', []),
    getById: async (id) => (await this.employees.getAll()).find(e => e.id === id),
    update: async (id, updates) => {
      const emp = await this.employees.getById(id);
      if (!emp) return null;
      const updated = { ...emp, ...updates };
      await storageService.put('employees', updated);
      return updated;
    },
    create: async (emp) => {
      const newItem = { ...emp, id: `EMP-${Date.now()}` } as Employee;
      await storageService.put('employees', newItem);
      return newItem;
    }
  };

  payroll: IPayrollRepository = {
    getMonthlyRecords: async (month, year) => {
       const all = await storageService.getAll<PayrollRecord>('payroll');
       return all.filter(r => r.month === month && r.year === year);
    },
    generatePayroll: async (month, year) => {
       const emps = await this.employees.getAll();
       const records: PayrollRecord[] = emps.map(emp => ({
          id: `PAY-${emp.id}-${month}-${year}`,
          employeeId: emp.id,
          employeeName: emp.name,
          month, year,
          workedHours: 160,
          overtimeHours: 10,
          basePay: emp.baseSalary,
          overtimePay: 10 * emp.hourlyRate * 1.5,
          deductions: 0,
          netPay: emp.baseSalary + (10 * emp.hourlyRate * 1.5),
          status: 'Draft'
       }));
       for(const r of records) await storageService.put('payroll', r);
       return records;
    },
    approveRecord: async (id) => {
       const records = await storageService.getAll<PayrollRecord>('payroll');
       const r = records.find(x => x.id === id);
       if (r) await storageService.put('payroll', { ...r, status: 'Approved' });
    },
    markAsPaid: async (id) => {
      const records = await storageService.getAll<PayrollRecord>('payroll');
      const r = records.find(x => x.id === id);
      if (r) await storageService.put('payroll', { ...r, status: 'Paid' });
    }
  };

  dailyLogs: IDailyLogRepository = {
    getAll: async (pid) => {
      const all = await storageService.getAll<DailyLog>('daily_logs');
      return pid ? all.filter(l => l.projectId === pid) : all;
    },
    getById: async (id) => {
      const all = await this.dailyLogs.getAll();
      return all.find(l => l.id === id);
    },
    create: async (log) => {
      const newItem = { ...log, id: `LOG-${Date.now()}` } as DailyLog;
      await storageService.put('daily_logs', newItem);
      return newItem;
    },
    approve: async (id) => {
       const log = await this.dailyLogs.getById(id);
       if (log) await storageService.put('daily_logs', { ...log, isApproved: true });
    }
  };

  materials: IMaterialRepository = {
    getAll: async () => this.ensureInitialized<Material>('materials', []),
    getById: async (id) => (await this.materials.getAll()).find(m => m.id === id),
    updateStock: async (id, qty, type, note) => {
       const mat = await this.materials.getById(id);
       if(!mat) return null;
       
       const newQty = type === 'Inbound' ? mat.currentStock + qty : mat.currentStock - qty;
       const updatedMat = { ...mat, currentStock: newQty };
       await storageService.put('materials', updatedMat);
       return updatedMat;
    },
    create: async (m) => {
      const newItem = { ...m, id: `MAT-${Date.now()}`, currentStock: m.currentStock || 0 } as Material;
      await storageService.put('materials', newItem);
      return newItem;
    },
    getMovements: async (mid) => []
  };

  workItems: IWorkItemRepository = {
    getAll: async (force) => {
      if (!force && this.cache.has('wi')) return this.cache.get('wi');
      const data = await this.ensureInitialized<WorkItem>('work_items', MOCK_WORK_ITEMS);
      const sorted = data.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      this.cache.set('wi', sorted);
      return sorted;
    },
    getById: async (id) => (await this.workItems.getAll()).find(i => i.id === id),
    create: async (item) => {
      const newItem = { 
        ...item, 
        id: `WI-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        version: 1,
        status: item.status || Status.OPEN, 
        comments: [], 
        tags: item.tags || [] 
      } as WorkItem;
      await storageService.put('work_items', newItem);
      this.invalidateCache();
      return newItem;
    },
    update: async (id, updates) => {
      const item = await this.workItems.getById(id);
      if (!item) return null;
      const updated = { ...item, ...updates, version: item.version + 1, updatedAt: new Date().toISOString() };
      await storageService.put('work_items', updated);
      this.invalidateCache();
      return updated;
    },
    updateStatus: async (id, status) => this.workItems.update(id, { status }),
    addComment: async (id, comment) => {
      const item = await this.workItems.getById(id);
      if (!item) return null;
      return this.workItems.update(id, { comments: [...item.comments, comment] });
    },
    submitApprovalDecision: async (id, stepId, decision, comments) => {
      const item = await this.workItems.getById(id);
      if (!item || !item.approvalChain) return null;
      const chain = item.approvalChain.map(s => s.id === stepId ? { ...s, decision, comments, decisionDate: new Date().toISOString() } : s);
      let status = item.status;
      if (chain.some(s => s.decision === 'Rejected')) status = Status.REJECTED;
      else if (chain.every(s => s.decision === 'Approved')) status = Status.APPROVED;
      return this.workItems.update(id, { approvalChain: chain, status });
    }
  };

  projects: IProjectRepository = {
    getAll: async (force) => {
      if (!force && this.cache.has('pj')) return this.cache.get('pj');
      const data = await this.ensureInitialized<Project>('projects', MOCK_PROJECTS);
      this.cache.set('pj', data);
      return data;
    },
    getById: async (id) => (await this.projects.getAll()).find(p => p.id === id),
    update: async (id, updates) => {
      const proj = await this.projects.getById(id);
      if (!proj) return null;
      const updated = { ...proj, ...updates, version: proj.version + 1, updatedAt: new Date().toISOString() };
      await storageService.put('projects', updated);
      this.invalidateCache();
      return updated;
    }
  };

  users: IUserRepository = {
    getAll: async () => this.ensureInitialized<User>('users', MOCK_USERS),
    getCurrentUser: async () => {
      const id = localStorage.getItem('enjaz_user_session_id');
      const all = await this.users.getAll();
      return all.find(u => u.id === id) || all[0];
    },
    setCurrentUser: async (id) => {
      const all = await this.users.getAll();
      const user = all.find(u => u.id === id);
      if (user) localStorage.setItem('enjaz_user_session_id', user.id);
      return user;
    }
  };

  notifications: INotificationRepository = {
    getAll: async () => storageService.getAll<Notification>('notifications'),
    getForUser: async (uid) => (await this.notifications.getAll()).filter(n => n.userId === uid).sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    getUnreadCount: async (uid) => (await this.notifications.getForUser(uid)).filter(n => !n.isRead).length,
    create: async (n) => {
      const newItem = { ...n, id: `N-${Date.now()}`, isRead: false, createdAt: new Date().toISOString() } as Notification;
      await storageService.put('notifications', newItem);
      return newItem;
    },
    markAsRead: async (id) => {
      const all = await this.notifications.getAll();
      const n = all.find(x => x.id === id);
      if (n) await storageService.put('notifications', { ...n, isRead: true });
    },
    markAllAsRead: async (uid) => {
      const myNotifs = await this.notifications.getForUser(uid);
      for (const n of myNotifs) await storageService.put('notifications', { ...n, isRead: true });
    },
    getPreferences: () => {
       const stored = localStorage.getItem('enjaz_notif_prefs');
       return stored ? JSON.parse(stored) : {
         userId: 'default', dndEnabled: false, channels: {
           critical: { email: true, inApp: true, push: true },
           mentions: { email: true, inApp: true, push: true },
           updates: { email: false, inApp: true, push: false }
         }
       };
    },
    savePreferences: async (prefs) => {
      localStorage.setItem('enjaz_notif_prefs', JSON.stringify(prefs));
    }
  };

  automation: IAutomationRepository = {
    getRules: () => [
      { id: 'r1', name: 'أتمتة السلامة', description: 'توجيه بلاغات الحوادث فوراً لمشرف الموقع.', isEnabled: true, trigger: 'On Create' },
      { id: 'r2', name: 'اتفاقية الحالة الحرجة', description: 'ضبط الاستحقاق لـ 24 ساعة للمهام الحرجة.', isEnabled: true, trigger: 'On Create' }
    ],
    toggleRule: (id) => this.automation.getRules()
  };

  assets: IAssetRepository = {
    getAll: async () => this.ensureInitialized<Asset>('assets', MOCK_ASSETS),
    getById: async (id) => (await this.assets.getAll()).find(a => a.id === id),
    update: async (id, updates) => {
      const asset = await this.assets.getById(id);
      if (!asset) return null;
      const updated = { ...asset, ...updates };
      await storageService.put('assets', updated);
      return updated;
    },
    create: async (a) => {
      const newItem = { ...a, id: `AST-${Date.now()}` } as Asset;
      await storageService.put('assets', newItem);
      return newItem;
    }
  };

  documents: IDocumentRepository = {
    getAll: async () => storageService.getAll<Document>('documents'),
    getByProjectId: async (pid) => (await this.documents.getAll()).filter(d => d.projectId === pid),
    upload: async (d) => {
      const newItem = { ...d, id: `DOC-${Date.now()}`, uploadedAt: new Date().toISOString() } as Document;
      await storageService.put('documents', newItem);
      return newItem;
    },
    delete: async (id) => storageService.delete('documents', id),
    /* Blueprint Storage Implementation */
    getBlueprints: async (pid) => this.ensureInitialized<Blueprint>('blueprints', MOCK_BLUEPRINTS).then(all => all.filter(b => b.projectId === pid)),
    updateBlueprintPins: async (id, pins) => {
      const all = await storageService.getAll<Blueprint>('blueprints');
      const bp = all.find(x => x.id === id);
      if (bp) await storageService.put('blueprints', { ...bp, pins });
    }
  };

  knowledge: IKnowledgeRepository = {
    getAll: async () => this.ensureInitialized<Article>('articles', MOCK_ARTICLES),
    search: async (q) => (await this.knowledge.getAll()).filter(a => a.title.includes(q)),
    create: async (a) => {
      const newItem = { ...a, id: `KB-${Date.now()}`, lastUpdated: new Date().toISOString() } as Article;
      await storageService.put('articles', newItem);
      return newItem;
    }
  };

  fieldOps: IFieldOpsRepository = {
    getDrafts: async () => storageService.getAll<Partial<WorkItem>>('field_drafts'),
    saveDraft: async (i) => { await storageService.put('field_drafts', { ...i, id: i.id || `draft-${Date.now()}` }); },
    removeDraft: async (id) => storageService.delete('field_drafts', id),
    clearDrafts: async () => {
      const all = await storageService.getAll<any>('field_drafts');
      for(const d of all) await storageService.delete('field_drafts', d.id);
    }
  };
}
