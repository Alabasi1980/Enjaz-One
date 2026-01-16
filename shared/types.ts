
export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed'
}

export enum ProjectHealth {
  GOOD = 'Good',
  AT_RISK = 'At Risk',
  CRITICAL = 'Critical'
}

export enum AssetCategory {
  HEAVY_EQUIPMENT = 'Heavy Equipment',
  VEHICLE = 'Vehicle',
  IT = 'IT & Digital',
  TOOLS = 'Tools',
  OTHER = 'Other'
}

export enum AssetStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  MAINTENANCE = 'Maintenance',
  LOST = 'Lost',
  RETIRED = 'Retired'
}

export enum ApprovalDecision {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Permit {
  id: string;
  projectId: string;
  authority: string;
  title: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Renewal';
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}

export interface LetterOfGuarantee {
  id: string;
  projectId: string;
  bankName: string;
  type: 'Bid Bond' | 'Performance Bond' | 'Advance Payment' | 'Retention';
  amount: number;
  issueDate: string;
  expiryDate: string;
  status: 'Active' | 'Released' | 'Extended' | 'Claimed';
}

/* Added for Blueprint Support */
export interface TaskPin {
  id: string;
  workItemId: string;
  x: number; // Percent from left
  y: number; // Percent from top
  type: WorkItemType;
  priority: Priority;
}

export interface Blueprint {
  id: string;
  projectId: string;
  title: string;
  imageUrl: string;
  version: string;
  pins: TaskPin[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  avatar: string;
  linkedProjectIds: string[];
}

export enum VendorCategory {
  AGREEMENT = 'Agreement', 
  CREDIT = 'Credit',      
  CASH = 'Cash'          
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  trade: string; 
  contactPerson: string;
  phone: string;
  email: string;
  rating: number;
  status: 'Active' | 'Blacklisted' | 'Inactive';
  paymentTerms?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  issueDate: string;
  deliveryDate?: string;
  items: { description: string; quantity: number; unit: string; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Partial' | 'CheckIssued';
}

export interface PettyCashRecord {
  id: string;
  projectId: string;
  accountantId: string;
  vendorName: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  date: string;
  category: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string; 
  contactName: string;
  phone: string;
  performanceScore: number;
  totalContractValue: number;
  paidAmount: number;
}

export interface PaymentCertificate {
  id: string;
  projectId: string;
  subcontractorId: string;
  subcontractorName: string;
  period: string;
  claimedPercentage: number;
  approvedPercentage: number;
  amount: number;
  status: 'Draft' | 'Submitted' | 'Verified' | 'Approved' | 'Paid';
  createdAt: string;
}

export interface Ncr {
  id: string;
  projectId: string;
  subcontractorId: string;
  title: string;
  description: string;
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'Open' | 'Resolved' | 'Closed';
  issuedBy: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Rfi {
  id: string;
  projectId: string;
  rfiNo: string;
  subject: string;
  description: string;
  location: string;
  drawingRef?: string;
  status: 'Pending' | 'Answered' | 'Closed' | 'Void';
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface MaterialSubmittal {
  id: string;
  projectId: string;
  submittalNo: string;
  materialName: string;
  manufacturer: string;
  specificationRef?: string;
  status: 'Pending' | 'Approved' | 'ApprovedAsNoted' | 'Rejected';
  consultantComment?: string;
  createdAt: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  impactOnBudget: number;
  impactOnDuration: number; 
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  requestedBy: 'Client' | 'Contractor';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  code: string;
  status: ProjectStatus;
  health: ProjectHealth;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  managerId: string;
  teamIds: string[];
  clientId?: string; 
  consultantId?: string;
  subcontractorIds?: string[];
  milestones?: Milestone[];
  version: number;
  updatedAt: string;
}

export enum WorkItemType {
  TASK = 'Task',
  TICKET = 'Ticket',
  SERVICE_REQUEST = 'Service Request',
  INCIDENT = 'Incident',
  APPROVAL = 'Approval Case',
  CUSTODY = 'Custody',
  OBSERVATION = 'Safety Observation',
  COMPLAINT = 'Complaint',
  SUGGESTION = 'Suggestion',
  MATERIAL_REQUEST = 'Material Request'
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  CRITICAL = 'Critical'
}

export enum Status {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DONE = 'Done'
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Terminated';
  type: 'Subcontract' | 'Service' | 'Supply';
}

export interface DailyLog {
  id: string;
  projectId: string;
  date: string;
  weatherStatus?: string;
  manpowerCount: number;
  laborDetails?: { trade: string; count: number; hours: number; estimatedRate?: number }[];
  equipmentDetails?: { assetId: string; assetName: string; operatingHours: number; fuelConsumed?: number; hourlyRate?: number }[];
  consumedMaterials?: { materialId: string; name: string; quantity: number; unit: string; unitCost?: number }[];
  content: string; 
  stats: {
    tasksCompleted: number;
    incidentsReported: number;
    materialsRequested: number;
  };
  createdBy: string;
  isApproved: boolean;
}

export interface Material {
  id: string;
  name: string;
  unit: string; 
  currentStock: number;
  minThreshold: number;
  category: string;
  unitPrice: number;
  location: string;
}

export enum StockMovementType {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound'
}

export interface StockMovement {
  id: string;
  materialId: string;
  quantity: number;
  type: 'Inbound' | 'Outbound';
  note: string;
  createdAt: string;
  performedBy: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  baseSalary: number;
  hourlyRate: number;
  joinDate: string;
  avatar: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  currentProject?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  workedHours: number;
  overtimeHours: number;
  basePay: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'Approved' | 'Paid';
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  department?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';
export type NotificationCategory = 'system' | 'task' | 'approval' | 'security' | 'mention';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
  relatedItemId?: string;
  aiSummary?: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  priority: Priority;
  status: Status;
  projectId: string;
  assigneeId?: string;
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  version: number;
  comments: Comment[];
  tags: string[];
  approvalChain?: { id: string; approverId: string; approverName: string; role: string; decision: 'Pending' | 'Approved' | 'Rejected'; decisionDate?: string; comments?: string }[];
  location?: { lat: number; lng: number };
  attachments?: string[];
  subtasks?: Subtask[];
  assetId?: string;
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  purchaseDate?: string;
  value: number;
  lastMaintenance?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
}

export interface Document {
  id: string;
  title: string;
  projectId: string;
  url: string;
  category: string;
  size: string;
  type: string;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  trigger: string;
}

export interface NotificationPreferences {
  userId: string;
  dndEnabled: boolean;
  channels: {
    critical: { email: boolean; inApp: boolean; push: boolean };
    mentions: { email: boolean; inApp: boolean; push: boolean };
    updates: { email: boolean; inApp: boolean; push: boolean };
  };
}

export interface Article {
  id: string;
  title: string;
  category: string;
  authorName: string;
  lastUpdated: string;
  tags: string[];
  content: string;
}
