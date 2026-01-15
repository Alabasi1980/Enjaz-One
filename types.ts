
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

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
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
  milestones?: Milestone[];
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
  SUGGESTION = 'Suggestion'
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

export enum ApprovalDecision {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum AssetStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  MAINTENANCE = 'Under Maintenance',
  RETIRED = 'Retired',
  LOST = 'Lost'
}

export enum AssetCategory {
  HEAVY_EQUIPMENT = 'Heavy Equipment',
  VEHICLE = 'Vehicle',
  IT = 'IT Equipment',
  TOOLS = 'Tools & Machinery',
  FURNITURE = 'Furniture'
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  approverName: string;
  role: string;
  decision: ApprovalDecision;
  decisionDate?: string;
  comments?: string;
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  relatedItemId?: string;
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
  dueDate: string;
  comments: Comment[];
  tags: string[];
  approvalChain?: ApprovalStep[];
  location?: { lat: number; lng: number };
  attachments?: string[];
  subtasks?: Subtask[];
  serviceType?: string;
  department?: string;
  assetId?: string;
  employeeId?: string;
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
