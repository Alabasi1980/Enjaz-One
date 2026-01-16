
import { WorkItem, Project, User, Asset, Document, Article, Status, Comment, Notification, NotificationPreferences, AutomationRule, Material, DailyLog, Employee, PayrollRecord, Vendor, PurchaseOrder, Contract, Client, ChangeOrder, Rfi, MaterialSubmittal, Subcontractor, PaymentCertificate, Ncr, PettyCashRecord, VendorCategory, Permit, LetterOfGuarantee, Blueprint, TaskPin } from '../shared/types';

export interface IStakeholderRepository {
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  getChangeOrders(projectId: string): Promise<ChangeOrder[]>;
  createChangeOrder(co: Partial<ChangeOrder>): Promise<ChangeOrder>;
  updateChangeOrderStatus(id: string, status: ChangeOrder['status']): Promise<void>;
  
  // Consultant Technical Submissions
  getRfIs(projectId: string): Promise<Rfi[]>;
  createRfi(rfi: Partial<Rfi>): Promise<Rfi>;
  updateRfiStatus(id: string, status: Rfi['status'], response?: string): Promise<void>;
  getMaterialSubmittals(projectId: string): Promise<MaterialSubmittal[]>;
  createMaterialSubmittal(ms: Partial<MaterialSubmittal>): Promise<MaterialSubmittal>;
  updateSubmittalStatus(id: string, status: MaterialSubmittal['status'], comment?: string): Promise<void>;

  // Subcontractor Management
  getSubcontractors(projectId: string): Promise<Subcontractor[]>;
  getPaymentCertificates(projectId: string): Promise<PaymentCertificate[]>;
  createPaymentCertificate(cert: Partial<PaymentCertificate>): Promise<PaymentCertificate>;
  updateCertificateStatus(id: string, status: PaymentCertificate['status']): Promise<void>;
  getNcrs(projectId: string): Promise<Ncr[]>;
  createNcr(ncr: Partial<Ncr>): Promise<Ncr>;
  updateNcrStatus(id: string, status: Ncr['status']): Promise<void>;

  // Stakeholders 5 & 7: Regulatory & Financial
  getPermits(projectId: string): Promise<Permit[]>;
  getLGs(projectId: string): Promise<LetterOfGuarantee[]>;
}

export interface IVendorRepository {
  getAll(): Promise<Vendor[]>;
  getById(id: string): Promise<Vendor | undefined>;
  create(vendor: Partial<Vendor>): Promise<Vendor>;
  update(id: string, updates: Partial<Vendor>): Promise<Vendor | null>;
  getByCategory(cat: VendorCategory): Promise<Vendor[]>;
}

export interface IProcurementRepository {
  getPurchaseOrders(projectId?: string): Promise<PurchaseOrder[]>;
  createPO(po: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  updatePOStatus(id: string, status: PurchaseOrder['status']): Promise<void>;
  getContracts(projectId?: string): Promise<Contract[]>;
  createContract(contract: Partial<Contract>): Promise<Contract>;
  getPettyCashRecords(projectId: string): Promise<PettyCashRecord[]>;
  addPettyCashEntry(entry: Partial<PettyCashRecord>): Promise<PettyCashRecord>;
}

export interface IEmployeeRepository {
  getAll(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | undefined>;
  update(id: string, updates: Partial<Employee>): Promise<Employee | null>;
  create(emp: Partial<Employee>): Promise<Employee>;
}

export interface IPayrollRepository {
  getMonthlyRecords(month: string, year: number): Promise<PayrollRecord[]>;
  generatePayroll(month: string, year: number): Promise<PayrollRecord[]>;
  approveRecord(id: string): Promise<void>;
  markAsPaid(id: string): Promise<void>;
}

export interface IDailyLogRepository {
  getAll(projectId?: string): Promise<DailyLog[]>;
  getById(id: string): Promise<DailyLog | undefined>;
  create(log: Partial<DailyLog>): Promise<DailyLog>;
  approve(id: string): Promise<void>;
}

export interface IMaterialRepository {
  getAll(): Promise<Material[]>;
  getById(id: string): Promise<Material | undefined>;
  updateStock(id: string, quantity: number, type: 'Inbound' | 'Outbound', note: string): Promise<Material | null>;
  create(material: Partial<Material>): Promise<Material>;
  getMovements(materialId: string): Promise<any[]>;
}

export interface IWorkItemRepository {
  getAll(forceRefresh?: boolean): Promise<WorkItem[]>;
  getById(id: string): Promise<WorkItem | undefined>;
  create(item: Partial<WorkItem>): Promise<WorkItem>;
  update(id: string, updates: Partial<WorkItem>): Promise<WorkItem | null>;
  updateStatus(id: string, status: Status): Promise<WorkItem | null>;
  addComment(itemId: string, comment: Comment): Promise<WorkItem | null>;
  submitApprovalDecision(itemId: string, stepId: string, decision: 'Pending' | 'Approved' | 'Rejected', comments: string): Promise<WorkItem | null>;
}

export interface IProjectRepository {
  getAll(forceRefresh?: boolean): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
}

export interface IUserRepository {
  getAll(forceRefresh?: boolean): Promise<User[]>;
  getCurrentUser(): Promise<User>;
  setCurrentUser(userId: string): Promise<User | undefined>;
}

export interface IAssetRepository {
  getAll(): Promise<Asset[]>;
  getById(id: string): Promise<Asset | undefined>;
  update(id: string, updates: Partial<Asset>): Promise<Asset | null>;
  create(asset: Partial<Asset>): Promise<Asset>;
}

export interface IDocumentRepository {
  getAll(): Promise<Document[]>;
  getByProjectId(projectId: string): Promise<Document[]>;
  upload(doc: Partial<Document>): Promise<Document>;
  delete(id: string): Promise<void>;
  /* Blueprint Support */
  getBlueprints(projectId: string): Promise<Blueprint[]>;
  updateBlueprintPins(id: string, pins: TaskPin[]): Promise<void>;
}

export interface IKnowledgeRepository {
  getAll(): Promise<Article[]>;
  search(term: string): Promise<Article[]>;
  create(article: Partial<Article>): Promise<Article>;
}

export interface INotificationRepository {
  getAll(): Promise<Notification[]>;
  getForUser(userId: string): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  create(notification: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getPreferences(): NotificationPreferences;
  savePreferences(prefs: NotificationPreferences): Promise<void>;
}

export interface IAutomationRepository {
  getRules(): AutomationRule[];
  toggleRule(id: string): AutomationRule[];
}

export interface IFieldOpsRepository {
  getDrafts(): Promise<Partial<WorkItem>[]>;
  saveDraft(item: Partial<WorkItem>): Promise<void>;
  removeDraft(id: string): Promise<void>;
  clearDrafts(): Promise<void>;
}

export interface IAiService {
  analyzeWorkItem(item: WorkItem): Promise<string>;
  suggestPriority(title: string, description: string): Promise<string>;
  generateExecutiveBrief(stats: any): Promise<string>;
  generateFinancialInsight(project: Project, actualCosts: any): Promise<string>;
  generateDailyReport(project: Project, items: WorkItem[], materials: any[], labor?: any[], machines?: any[]): Promise<string>;
  analyzeNotification(title: string, message: string): Promise<{ priority: string; category: string; summary?: string }>;
  askWiki(context: string, query: string): Promise<string>;
}

export interface IDataProvider {
  workItems: IWorkItemRepository;
  projects: IProjectRepository;
  users: IUserRepository;
  assets: IAssetRepository;
  materials: IMaterialRepository;
  dailyLogs: IDailyLogRepository;
  employees: IEmployeeRepository;
  payroll: IPayrollRepository;
  vendors: IVendorRepository;
  procurement: IProcurementRepository;
  stakeholders: IStakeholderRepository; 
  documents: IDocumentRepository;
  knowledge: IKnowledgeRepository;
  notifications: INotificationRepository;
  automation: IAutomationRepository;
  fieldOps: IFieldOpsRepository;
  ai: IAiService;
  invalidateCache(): void;
}
