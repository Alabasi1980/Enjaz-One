import React, { useState } from 'react';
import { Subtask } from '../../../types';
import { CheckSquare, Check, Trash2, Plus } from 'lucide-react';

interface SubtaskListProps {
  subtasks: Subtask[];
  onAdd: (title: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onAdd, onToggle, onDelete }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await onAdd(newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 mt-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
        <CheckSquare size={16} /> Checklist & Subtasks
      </h3>
      
      <div className="space-y-2 mb-3">
        {subtasks.map(st => (
          <div key={st.id} className="flex items-center gap-2 group">
            <button 
              onClick={() => onToggle(st.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
            >
              <Check size={14} />
            </button>
            <span className={`text-sm flex-1 ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.title}</span>
            <button 
              onClick={() => onDelete(st.id)}
              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {subtasks.length === 0 && (
          <p className="text-xs text-slate-400 italic">No subtasks defined.</p>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text"
          placeholder="Add new subtask..."
          className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newSubtaskTitle.trim()}
          className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
};

export default SubtaskList;
