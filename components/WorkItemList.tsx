import React, { useState } from 'react';
import { WorkItem, Status, Priority, WorkItemType } from '../types';
import { Search, Filter, AlertTriangle, Briefcase, FileText, CheckCircle2, Eye, MapPin, CalendarClock, MessageSquareWarning, Lightbulb } from 'lucide-react';

interface WorkItemListProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const WorkItemList: React.FC<WorkItemListProps> = ({ items, onItemClick }) => {
  const [filterType, setFilterType] = useState<WorkItemType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getSLAStatus = (item: WorkItem) => {
    if (item.status === Status.DONE || item.status === Status.APPROVED || item.status === Status.REJECTED) return 'ok';
    
    const today = new Date().toISOString().split('T')[0];
    if (item.dueDate < today) return 'overdue';
    if (item.dueDate === today) return 'due-today';
    return 'ok';
  };

  const getStatusBadge = (status: Status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (status) {
      case Status.DONE:
      case Status.APPROVED:
        return <span className={`${baseClasses} bg-green-100 text-green-700 border-green-200`}>{status}</span>;
      case Status.PENDING_APPROVAL:
        return <span className={`${baseClasses} bg-purple-100 text-purple-700 border-purple-200`}>{status}</span>;
      case Status.IN_PROGRESS:
        return <span className={`${baseClasses} bg-blue-100 text-blue-700 border-blue-200`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-700 border-slate-200`}>{status}</span>;
    }
  };

  const getTypeIcon = (type: WorkItemType) => {
    switch (type) {
        case WorkItemType.INCIDENT: return <AlertTriangle size={16} className="text-orange-500" />;
        case WorkItemType.APPROVAL: return <CheckCircle2 size={16} className="text-purple-500" />;
        case WorkItemType.TASK: return <Briefcase size={16} className="text-blue-500" />;
        case WorkItemType.OBSERVATION: return <Eye size={16} className="text-emerald-600" />;
        case WorkItemType.COMPLAINT: return <MessageSquareWarning size={16} className="text-rose-600" />;
        case WorkItemType.SUGGESTION: return <Lightbulb size={16} className="text-yellow-500" />;
        default: return <FileText size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks, ID, or description..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={16} className="text-slate-400 hidden md:block" />
          <select 
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="All">All Types</option>
            {Object.values(WorkItemType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>No work items found.</p>
            </div>
        ) : (
            filteredItems.map(item => {
              const slaStatus = getSLAStatus(item);
              const isOverdue = slaStatus === 'overdue';
              const isDueToday = slaStatus === 'due-today';

              return (
                <div 
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className={`group p-4 rounded-lg hover:bg-slate-50 border cursor-pointer transition-all flex items-start gap-4 ${isOverdue ? 'border-red-200 bg-red-50/10' : 'border-transparent hover:border-slate-200'}`}
                >
                    <div className={`mt-1 p-2 rounded-lg ${
                        item.priority === Priority.CRITICAL ? 'bg-red-50' : 'bg-slate-100'
                    }`}>
                        {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-2">
                                {item.attachments && item.attachments.length > 0 && (
                                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                        📷 {item.attachments.length}
                                    </span>
                                )}
                                <span className="text-xs font-mono text-slate-400 shrink-0">{item.id}</span>
                            </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                            {item.description}
                        </p>
                        
                        <div className="flex items-center gap-3">
                            {getStatusBadge(item.status)}
                            
                            {item.location && (
                              <span className="text-xs text-slate-400 flex items-center gap-1" title={`${item.location.lat}, ${item.location.lng}`}>
                                  <MapPin size={10} /> Loc
                              </span>
                            )}
                            
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : isDueToday ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                                <CalendarClock size={12} />
                                {isOverdue ? 'Overdue: ' : ''}{item.dueDate}
                            </span>

                            {item.priority === Priority.CRITICAL && (
                                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Critical
                                </span>
                            )}
                        </div>
                    </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default WorkItemList;
