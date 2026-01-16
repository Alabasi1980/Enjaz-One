
import { Priority, Project, Status, User, WorkItem, WorkItemType, Article, Asset, AssetCategory, AssetStatus, ProjectStatus, ProjectHealth } from "./types";

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'P001', 
    name: 'Riyadh Tower A', 
    location: 'Riyadh, KSA', 
    code: 'R-TWR',
    status: ProjectStatus.ACTIVE,
    health: ProjectHealth.GOOD,
    budget: 5000000,
    spent: 2400000,
    startDate: '2023-01-01',
    endDate: '2024-06-30',
    managerId: 'U001',
    teamIds: ['U001', 'U002', 'U003'],
    // Added missing properties version and updatedAt
    version: 1,
    updatedAt: '2023-10-25T12:00:00Z',
    milestones: [
      { id: 'm1', title: 'Excavation & Shoring', dueDate: '2023-03-01', status: 'Completed', progress: 100 },
      { id: 'm2', title: 'Foundations', dueDate: '2023-08-15', status: 'Completed', progress: 100 },
      { id: 'm3', title: 'Main Structure', dueDate: '2024-02-15', status: 'In Progress', progress: 65 },
    ]
  },
  { 
    id: 'P002', 
    name: 'Jeddah Coastal Villa', 
    location: 'Jeddah, KSA', 
    code: 'J-CST',
    status: ProjectStatus.ACTIVE,
    health: ProjectHealth.AT_RISK,
    budget: 1200000,
    spent: 950000,
    startDate: '2023-05-15',
    endDate: '2024-03-10',
    managerId: 'U001',
    teamIds: ['U001', 'U003'],
    // Added missing properties version and updatedAt
    version: 1,
    updatedAt: '2023-10-25T12:00:00Z',
    milestones: [
      { id: 'm1', title: 'Structure', dueDate: '2023-11-01', status: 'In Progress', progress: 90 },
      { id: 'm2', title: 'MEP Installation', dueDate: '2024-01-20', status: 'Pending', progress: 10 },
    ]
  },
  { 
    id: 'P003', 
    name: 'NEOM Base Camp', 
    location: 'Tabuk, KSA', 
    code: 'N-BSC',
    status: ProjectStatus.PLANNING,
    health: ProjectHealth.GOOD,
    budget: 8000000,
    spent: 500000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    managerId: 'U003',
    teamIds: ['U003', 'U002'],
    // Added missing properties version and updatedAt
    version: 1,
    updatedAt: '2024-01-01T08:00:00Z'
  },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'U001', 
    name: 'Ahmed Al-Engineer', 
    role: 'Project Manager', 
    avatar: 'https://picsum.photos/id/1005/100/100',
    email: 'ahmed.e@enjaz-one.com',
    phone: '+966 50 123 4567',
    joinDate: '2022-05-15',
    department: 'Engineering'
  },
  { 
    id: 'U002', 
    name: 'Sara Finance', 
    role: 'Procurement Officer', 
    avatar: 'https://picsum.photos/id/1011/100/100',
    email: 'sara.f@enjaz-one.com',
    phone: '+966 55 987 6543',
    joinDate: '2021-11-20',
    department: 'Finance'
  },
  { 
    id: 'U003', 
    name: 'John Site', 
    role: 'Site Supervisor', 
    avatar: 'https://picsum.photos/id/1025/100/100',
    email: 'john.s@enjaz-one.com',
    phone: '+966 54 444 3322',
    joinDate: '2023-01-10',
    department: 'Operations'
  },
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    name: 'Caterpillar 320 Excavator',
    serialNumber: 'CAT-320-X99',
    category: AssetCategory.HEAVY_EQUIPMENT,
    status: AssetStatus.IN_USE,
    location: 'Riyadh Tower A',
    purchaseDate: '2022-01-15',
    value: 450000,
    lastMaintenance: '2023-09-10'
  },
  {
    id: 'AST-002',
    name: 'Toyota Hilux 4x4',
    serialNumber: 'PLT-KSA-1234',
    category: AssetCategory.VEHICLE,
    status: AssetStatus.IN_USE,
    location: 'NEOM Base Camp',
    assignedToUserId: 'U003',
    assignedToUserName: 'John Site',
    purchaseDate: '2023-03-01',
    value: 120000,
    lastMaintenance: '2023-10-01'
  }
];

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'WI-1001',
    title: 'Excavation Permit Approval',
    description: 'Require municipal approval for deep excavation at Sector B due to new soil report findings indicating high water table.',
    type: WorkItemType.APPROVAL,
    priority: Priority.CRITICAL,
    status: Status.PENDING_APPROVAL,
    projectId: 'P001',
    assigneeId: 'U001',
    createdAt: '2023-10-25',
    // Added missing properties updatedAt and version
    updatedAt: '2023-10-25T14:30:00Z',
    version: 1,
    dueDate: '2023-10-28',
    comments: [],
    tags: ['Permits', 'Civil']
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'KB-001',
    title: 'Site Safety Protocol: Working at Heights',
    category: 'Safety',
    authorName: 'HSE Department',
    lastUpdated: '2023-09-01',
    tags: ['Safety', 'SOP', 'Mandatory'],
    content: '# Working at Heights Protocol\n...'
  }
];
