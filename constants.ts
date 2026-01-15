
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
    teamIds: ['U003', 'U002']
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
  },
  {
    id: 'AST-003',
    name: 'MacBook Pro 16"',
    serialNumber: 'APL-MBP-M2',
    category: AssetCategory.IT,
    status: AssetStatus.IN_USE,
    location: 'HQ Office',
    assignedToUserId: 'U001',
    assignedToUserName: 'Ahmed Al-Engineer',
    purchaseDate: '2023-06-20',
    value: 12000
  },
  {
    id: 'AST-004',
    name: 'Hilti TE 60 Hammer Drill',
    serialNumber: 'HLT-TE60-55',
    category: AssetCategory.TOOLS,
    status: AssetStatus.MAINTENANCE,
    location: 'Central Workshop',
    purchaseDate: '2021-11-05',
    value: 4500,
    lastMaintenance: '2023-10-25'
  },
  {
    id: 'AST-005',
    name: 'Leica Total Station',
    serialNumber: 'LCA-TS16',
    category: AssetCategory.TOOLS,
    status: AssetStatus.AVAILABLE,
    location: 'Main Warehouse',
    purchaseDate: '2022-08-14',
    value: 35000
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
    dueDate: '2023-10-28',
    comments: [],
    tags: ['Permits', 'Civil']
  },
  {
    id: 'WI-1002',
    title: 'Broken Generator 500kVA',
    description: 'Generator G-04 stopped working during night shift. Error code E-404. Critical for site lighting.',
    type: WorkItemType.INCIDENT,
    priority: Priority.HIGH,
    status: Status.OPEN,
    projectId: 'P002',
    assigneeId: 'U003',
    createdAt: '2023-10-26',
    dueDate: '2023-10-26',
    comments: [
      { id: 'c1', userId: 'U003', userName: 'John Site', text: 'Technician called, arriving in 2 hours.', timestamp: '2023-10-26 09:00' }
    ],
    tags: ['Equipment', 'Maintenance']
  },
  {
    id: 'WI-1003',
    title: 'Procure 50 Tons Cement',
    description: 'Standard PO request for upcoming foundation pour. Supplier A preferred.',
    type: WorkItemType.SERVICE_REQUEST,
    priority: Priority.MEDIUM,
    status: Status.IN_PROGRESS,
    projectId: 'P001',
    assigneeId: 'U002',
    createdAt: '2023-10-24',
    dueDate: '2023-11-01',
    comments: [],
    tags: ['Procurement', 'Materials']
  },
  {
    id: 'WI-1004',
    title: 'Employee Laptop Custody Transfer',
    description: 'Transfer custody of MacBook Pro (Asset #IT-99) from outgoing architect to new joiner.',
    type: WorkItemType.CUSTODY,
    priority: Priority.LOW,
    status: Status.DONE,
    projectId: 'P003',
    assigneeId: 'U002',
    createdAt: '2023-10-20',
    dueDate: '2023-10-21',
    comments: [],
    tags: ['IT', 'HR']
  },
  {
    id: 'WI-1005',
    title: 'Safety Inspection: Scaffolding',
    description: 'Routine weekly inspection of exterior scaffolding on North Face.',
    type: WorkItemType.TASK,
    priority: Priority.HIGH,
    status: Status.OPEN,
    projectId: 'P001',
    assigneeId: 'U003',
    createdAt: '2023-10-27',
    dueDate: '2023-10-28',
    comments: [],
    tags: ['HSE', 'Safety']
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
    content: `
# Working at Heights Protocol

## 1. Purpose
To ensure safety of all personnel working above 2 meters.

## 2. Requirements
- **Harness:** Full body harness must be worn.
- **Anchor:** Must handle 5000lbs load.
- **Inspection:** Check equipment daily before use.

## 3. Emergency Procedure
In case of fall arrest:
1. Do not cut the line.
2. Call emergency response immediately.
3. Deploy rescue ladder if available.
    `
  },
  {
    id: 'KB-002',
    title: 'How to Request Annual Leave',
    category: 'HR',
    authorName: 'HR Manager',
    lastUpdated: '2023-01-15',
    tags: ['HR', 'Policy'],
    content: `
# Annual Leave Request Process

1. Login to **Enjaz One**.
2. Go to **Service Requests**.
3. Select type **HR Service**.
4. Fill in dates and attach approval from Line Manager if > 5 days.

*Note: Requests must be submitted 2 weeks in advance.*
    `
  },
  {
    id: 'KB-003',
    title: 'Generator Maintenance Schedule',
    category: 'Technical',
    authorName: 'Chief Mechanic',
    lastUpdated: '2023-05-20',
    tags: ['Equipment', 'Maintenance'],
    content: `
# Generator Service Intervals

| Hours | Service Type | Responsible |
|-------|--------------|-------------|
| 250   | Oil Change   | Site Tech   |
| 500   | Filter Swap  | Site Tech   |
| 1000  | Major Overhaul| Vendor     |

**Important:** Always log hours in the Asset Module after service.
    `
  }
];
