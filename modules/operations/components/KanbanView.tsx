
import React from 'react';
import { WorkItem, Status, Priority } from '../../../types';
import { Clock, AlertCircle, MoreHorizontal, User } from 'lucide-react';

interface KanbanViewProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ items, onItemClick }) => {
  const columns = [
    { title: 'To Do', status: Status.OPEN, color: 'border-blue-500' },
    { title: 'In Progress', status: Status.IN_PROGRESS, color: 'border-amber-500' },
    { title: 'Approval', status: Status.PENDING_APPROVAL, color: 'border-purple-500' },
    { title: 'Completed', status: Status.DONE, color: 'border-emerald-500' },
  ];

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-red-500';
      case Priority.HIGH: return 'bg-orange-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 no-scrollbar">
      {columns.map(column => (
        <div key={column.status} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className={`flex items-center justify-between p-3 bg-white border-b-2 ${column.color} rounded-t-xl shadow-sm`}>
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">{column.title}</h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {items.filter(i => i.status === column.status).length}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1">
            {items.filter(i => i.status === column.status).map(item => (
              <div 
                key={item.id}
                onClick={() => onItemClick(item)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                  <span className="text-[10px] font-mono text-slate-400">#{item.id.split('-')[1]}</span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                       <User size={12} className="text-slate-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Clock size={12} />
                    {new Date(item.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
            
            {items.filter(i => i.status === column.status).length === 0 && (
              <div className="py-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300">
                <span className="text-xs font-medium">No items here</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
