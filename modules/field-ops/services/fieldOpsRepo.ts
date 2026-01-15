
import { WorkItem } from "../../../types";

const DRAFTS_KEY = 'enjaz_field_drafts';

export const fieldOpsRepo = {
  getDrafts: (): Partial<WorkItem>[] => {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDraft: (item: Partial<WorkItem>) => {
    const drafts = fieldOpsRepo.getDrafts();
    drafts.unshift({ ...item, id: `draft-${Date.now()}` });
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return drafts;
  },

  removeDraft: (id: string) => {
    const drafts = fieldOpsRepo.getDrafts().filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return drafts;
  },

  clearDrafts: () => {
    localStorage.removeItem(DRAFTS_KEY);
  }
};
