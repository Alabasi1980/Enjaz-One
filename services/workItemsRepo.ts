import { WorkItem, Status, ApprovalDecision, ApprovalStep, Comment } from "../types";
import { db } from "./db";
import { notificationsRepo } from "./notificationsRepo";
import { automationService } from "./automationService";

export const workItemsRepo = {
  getAll: async (): Promise<WorkItem[]> => {
    return await db.get<WorkItem>('WORK_ITEMS');
  },

  getById: async (id: string): Promise<WorkItem | undefined> => {
    const items = await db.get<WorkItem>('WORK_ITEMS');
    return items.find(i => i.id === id);
  },

  create: async (item: Partial<WorkItem>): Promise<WorkItem> => {
    // 1. Prepare initial item
    let newItem: WorkItem = {
      ...item,
      id: item.id || `WI-${Date.now()}`,
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
      comments: item.comments || [],
      tags: item.tags || [],
      status: item.status || Status.OPEN,
      title: item.title || 'Untitled',
      description: item.description || '',
      type: item.type as any,
      priority: item.priority as any,
      projectId: item.projectId || '',
      dueDate: item.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      approvalChain: item.approvalChain || [],
      creatorId: item.creatorId // Ensure this is saved
    } as WorkItem;

    // 2. Apply Automation Rules (The Brain)
    const { modifiedItem, logs } = automationService.applyRules(newItem);
    
    // 3. Append automation logs as system comments
    if (logs.length > 0) {
      const systemComments = logs.map((log, idx) => ({
        id: `sys-${Date.now()}-${idx}`,
        userId: 'system',
        userName: 'Enjaz Bot',
        text: log,
        timestamp: new Date().toISOString(),
        isSystem: true
      }));
      modifiedItem.comments = [...modifiedItem.comments, ...systemComments];
    }

    // 4. Save to DB
    const savedItem = await db.add<WorkItem>('WORK_ITEMS', modifiedItem);

    // 5. NOTIFICATION LOGIC:
    // Notify Assignee if assigned
    if (savedItem.assigneeId && savedItem.assigneeId !== savedItem.creatorId) {
      await notificationsRepo.create({
        userId: savedItem.assigneeId,
        title: 'New Assignment',
        message: `You have been assigned to: ${savedItem.title}`,
        type: 'info',
        relatedItemId: savedItem.id
      });
    }

    // Notify Approver if pending approval
    if (savedItem.approvalChain && savedItem.approvalChain.length > 0) {
      const currentStep = savedItem.approvalChain.find(s => s.decision === ApprovalDecision.PENDING);
      if (currentStep) {
        await notificationsRepo.create({
          userId: currentStep.approverId,
          title: 'Approval Required',
          message: `${savedItem.title} requires your approval.`,
          type: 'warning',
          relatedItemId: savedItem.id
        });
      }
    }

    return savedItem;
  },

  updateStatus: async (id: string, status: Status): Promise<WorkItem | null> => {
    const updated = await db.update<WorkItem>('WORK_ITEMS', id, { status });
    
    // Notify Creator when status changes
    if (updated && updated.creatorId) {
       await notificationsRepo.create({
          userId: updated.creatorId,
          title: 'Status Updated',
          message: `Your item ${updated.title} is now ${status}.`,
          type: 'info',
          relatedItemId: updated.id
       });
    }

    return updated;
  },

  update: async (id: string, updates: Partial<WorkItem>): Promise<WorkItem | null> => {
    return await db.update<WorkItem>('WORK_ITEMS', id, updates);
  },

  addComment: async (itemId: string, comment: Comment): Promise<WorkItem | null> => {
    const item = await workItemsRepo.getById(itemId);
    if (!item) return null;
    
    const newComments = [...(item.comments || []), comment];
    const updated = await db.update<WorkItem>('WORK_ITEMS', itemId, { comments: newComments });

    // Notify assignee if someone else commented
    if (item.assigneeId && item.assigneeId !== comment.userId) {
       await notificationsRepo.create({
          userId: item.assigneeId,
          title: 'New Comment',
          message: `${comment.userName} commented on ${item.title}`,
          type: 'info',
          relatedItemId: item.id
       });
    }
    // Notify creator if someone else commented
    if (item.creatorId && item.creatorId !== comment.userId && item.creatorId !== item.assigneeId) {
        await notificationsRepo.create({
          userId: item.creatorId,
          title: 'New Comment',
          message: `${comment.userName} commented on ${item.title}`,
          type: 'info',
          relatedItemId: item.id
       });
    }

    return updated;
  },

  submitApprovalDecision: async (
    itemId: string, 
    stepId: string, 
    decision: ApprovalDecision, 
    comments: string
  ): Promise<WorkItem | null> => {
    const item = await workItemsRepo.getById(itemId);
    if (!item || !item.approvalChain) return null;

    // Update the specific step
    const updatedChain = item.approvalChain.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          decision,
          comments,
          decisionDate: new Date().toISOString()
        };
      }
      return step;
    });

    // Determine parent status based on chain results
    let newStatus = item.status;
    const hasRejection = updatedChain.some(s => s.decision === ApprovalDecision.REJECTED);
    const allApproved = updatedChain.every(s => s.decision === ApprovalDecision.APPROVED);

    if (hasRejection) {
      newStatus = Status.REJECTED;
    } else if (allApproved) {
      newStatus = Status.APPROVED;
    }

    const updated = await db.update<WorkItem>('WORK_ITEMS', itemId, {
      approvalChain: updatedChain,
      status: newStatus
    });

    // Notify Creator of decision
    if (updated && updated.creatorId) {
        await notificationsRepo.create({
            userId: updated.creatorId,
            title: `Request ${decision}`,
            message: `Your request ${updated.title} was ${decision.toLowerCase()}.`,
            type: decision === ApprovalDecision.APPROVED ? 'success' : 'error',
            relatedItemId: updated.id
        });
    }

    return updated;
  }
};
