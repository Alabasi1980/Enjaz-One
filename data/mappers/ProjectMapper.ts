
import { Project, ProjectStatus, ProjectHealth } from '../../shared/types';

export interface ProjectDTO {
  id: string;
  name: string;
  location: string;
  code: string;
  status: string;
  health: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  managerId: string;
  teamIds: string[];
  // Added missing fields from API
  version: number;
  updatedAt: string;
}

export class ProjectMapper {
  static toDomain(dto: ProjectDTO): Project {
    return {
      id: dto.id,
      name: dto.name,
      location: dto.location,
      code: dto.code,
      status: dto.status as ProjectStatus,
      health: dto.health as ProjectHealth,
      budget: dto.budget,
      spent: dto.spent,
      startDate: dto.startDate,
      endDate: dto.endDate,
      managerId: dto.managerId,
      teamIds: dto.teamIds || [],
      // Fixed: Mapped version and updatedAt
      version: dto.version || 1,
      updatedAt: dto.updatedAt || dto.startDate,
      milestones: [] 
    };
  }

  static toDTO(domain: Partial<Project>): Partial<ProjectDTO> {
    return {
      id: domain.id,
      name: domain.name,
      location: domain.location,
      code: domain.code,
      status: domain.status,
      health: domain.health,
      budget: domain.budget,
      spent: domain.spent,
      startDate: domain.startDate,
      endDate: domain.endDate,
      managerId: domain.managerId,
      teamIds: domain.teamIds,
      // Fixed: Mapped version and updatedAt in DTO
      version: domain.version,
      updatedAt: domain.updatedAt
    };
  }
}
