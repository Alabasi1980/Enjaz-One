
import React, { useState, useMemo } from 'react';
import { WorkItem, Status, Priority, WorkItemType } from '../../types';
import { Search, Filter, LayoutGrid, List, AlertTriangle, CalendarClock, ChevronDown, SlidersHorizontal, Info } from 'lucide-react';
import KanbanView from './components/KanbanView';

interface WorkItemListProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

const WorkItemList: React.FC<WorkItemListProps> = ({ items, onItemClick }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || item.type === filterType;
      const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
      
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [items, searchTerm, filterType, filterPriority]);

  const getSLAStatus = (item: WorkItem) => {
    if (item.status === Status.DONE || item.status === Status.APPROVED) return 'ok';
    const today = new Date().toISOString().split('T')[0];
    return item.dueDate < today ? 'overdue' : 'pending';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-fade-in">
      {/* Dynamic Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Title, ID or content..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${showAdvancedFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-slide-in-down">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Type</label>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                {Object.values(WorkItemType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Priority</label>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="All">All Priorities</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-end">
               <button 
                onClick={() => {setFilterType('All'); setFilterPriority('All'); setSearchTerm('');}}
                className="w-full p-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
               >
                 Clear all filters
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-y-auto no-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="p-4 bg-slate-50 rounded-full"><Info size={40} /></div>
                  <p className="font-medium">No results found matching your criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => onItemClick(item)}
                      className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 group transition-colors"
                    >
                      <div className={`w-1.5 h-12 rounded-full transition-all group-hover:scale-y-110 ${
                        item.priority === Priority.CRITICAL ? 'bg-red-500' : 
                        item.priority === Priority.HIGH ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                             item.status === Status.DONE ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600">{item.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{item.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`flex items-center justify-end gap-1.5 text-xs font-bold ${getSLAStatus(item) === 'overdue' ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                           <CalendarClock size={14} />
                           {item.dueDate}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <KanbanView items={filteredItems} onItemClick={onItemClick} />
        )}
      </div>
    </div>
  );
};

export default WorkItemList;
