
import { WorkItem, Status, Priority } from '../../shared/types';

export interface WorkItemDTO {
  id: string;
  itemTitle: string;
  itemDescription: string;
  itemType: string;
  itemPriority: string;
  itemStatus: string;
  projectId: string;
  assigneeId?: string;
  creatorId?: string;
  createdAt: string;
  // Added missing fields from API
  updatedAt: string;
  version: number;
  dueDate: string;
  tags?: string[];
  comments?: any[];
  approvalChain?: any[];
}

export class WorkItemMapper {
  static toDomain(dto: WorkItemDTO): WorkItem {
    const validStatuses = Object.values(Status) as string[];
    const status = validStatuses.includes(dto.itemStatus) 
      ? dto.itemStatus as Status 
      : Status.OPEN;

    return {
      id: dto.id,
      title: dto.itemTitle,
      description: dto.itemDescription,
      type: dto.itemType as any,
      priority: dto.itemPriority as Priority,
      status: status,
      projectId: dto.projectId,
      assigneeId: dto.assigneeId,
      creatorId: dto.creatorId,
      createdAt: dto.createdAt,
      // Fixed: Mapped version and updatedAt
      updatedAt: dto.updatedAt || dto.createdAt,
      version: dto.version || 1,
      dueDate: dto.dueDate,
      tags: dto.tags || [],
      comments: dto.comments || [],
      // Fix: Corrected property name from approval_chain to approvalChain to match WorkItemDTO interface
      approvalChain: dto.approvalChain || []
    };
  }

  static toDTO(domain: Partial<WorkItem>): Partial<WorkItemDTO> {
    return {
      id: domain.id,
      itemTitle: domain.title,
      itemDescription: domain.description,
      itemType: domain.type,
      itemPriority: domain.priority,
      itemStatus: domain.status,
      projectId: domain.projectId,
      assigneeId: domain.assigneeId,
      creatorId: domain.creatorId,
      createdAt: domain.createdAt,
      // Fixed: Mapped version and updatedAt in DTO as well
      updatedAt: domain.updatedAt,
      version: domain.version,
      // Fix: Corrected property name from due_date to dueDate to match WorkItemDTO interface
      dueDate: domain.dueDate,
      tags: domain.tags
    };
  }
}
