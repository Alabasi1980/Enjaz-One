
import { AutomationRule, WorkItem, WorkItemType, Priority } from "../types";

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'rule_safety',
    name: 'تخصيص مشرفي السلامة تلقائياً',
    description: 'توجيه كافة بلاغات الحوادث وملاحظات السلامة فوراً إلى فريق الاستجابة الأولية.',
    isEnabled: true,
    trigger: 'On Create'
  },
  {
    id: 'rule_procurement',
    name: 'أتمتة طلبات الشراء والمواد',
    description: 'تحليل نصوص الطلبات وتوجيهها لقسم المشتريات إذا تضمنت كلمات (إسمنت، حديد، خرسانة).',
    isEnabled: true,
    trigger: 'On Create'
  },
  {
    id: 'rule_critical_sla',
    name: 'فرض اتفاقية مستوى الخدمة للحالات الحرجة',
    description: 'ضبط تاريخ الاستحقاق تلقائياً خلال 24 ساعة لأي مهمة يتم تصنيفها كـ "حرجة".',
    isEnabled: true,
    trigger: 'On Create'
  },
  {
    id: 'rule_hr_voice',
    name: 'سرية بلاغات الموظفين',
    description: 'توجيه الشكاوي والاقتراحات مباشرة إلى إدارة الموارد البشرية مع تفعيل ميزة إخفاء الهوية.',
    isEnabled: true,
    trigger: 'On Create'
  }
];

const STORAGE_KEY = 'enjaz_automation_rules';

export const automationService = {
  getRules: (): AutomationRule[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_RULES;
  },

  toggleRule: (id: string): AutomationRule[] => {
    const rules = automationService.getRules();
    const updated = rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  applyRules: (item: WorkItem): { modifiedItem: WorkItem, logs: string[] } => {
    const rules = automationService.getRules();
    let modifiedItem = { ...item };
    const logs: string[] = [];

    if (rules.find(r => r.id === 'rule_safety')?.isEnabled) {
      if (item.type === WorkItemType.INCIDENT || item.type === WorkItemType.OBSERVATION) {
        modifiedItem.assigneeId = 'U003';
        logs.push('أتمتة: تم التعيين لمشرف الموقع (بروتوكول السلامة).');
      }
    }

    if (rules.find(r => r.id === 'rule_critical_sla')?.isEnabled) {
      if (item.priority === Priority.CRITICAL) {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        modifiedItem.dueDate = tomorrow;
        logs.push('أتمتة: تحديث موعد الإنجاز لـ 24 ساعة (SLA حرجة).');
      }
    }

    return { modifiedItem, logs };
  }
};
