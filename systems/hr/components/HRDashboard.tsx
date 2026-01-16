
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Status } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Users, UserPlus, HardHat, Calendar, Search, 
  Filter, MoreVertical, Star, TrendingUp, Briefcase,
  MapPin, Phone, Mail, Award, Loader2, Sparkles
} from 'lucide-react';

const HRDashboard: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const all = await data.employees.getAll();
      setEmployees(all);
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return employees.filter(e => 
      (activeDept === 'All' || e.department === activeDept) &&
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm, activeDept]);

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header & Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 -ml-32 -mt-32 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Users className="text-indigo-600" size={32} /> مركز الموارد البشرية
               </h3>
               <p className="text-sm font-bold text-slate-500 mt-2">إدارة شاملة للكادر البشري، تتبع الأداء، وتوزيع العمالة على المشاريع.</p>
            </div>
            <button className="relative z-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
               <UserPlus size={20}/> إضافة موظف جديد
            </button>
         </div>

         <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200 flex flex-col justify-center text-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">إجمالي الكادر</p>
            <p className="text-5xl font-black">{employees.length}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-black bg-white/10 py-1 rounded-full">
               <TrendingUp size={12}/> نمو 12% هذا الشهر
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث بالاسم، الوظيفة، أو المعرف..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
           {['All', 'الهندسة', 'التشغيل', 'الإدارة', 'السلامة'].map(dept => (
              <button 
                key={dept} 
                onClick={() => setActiveDept(dept)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeDept === dept ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {dept === 'All' ? 'الكل' : dept}
              </button>
           ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-4 text-slate-300">
             <Loader2 size={48} className="animate-spin" />
             <p className="font-black">جاري مزامنة بيانات الموظفين...</p>
          </div>
        ) : filtered.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
                      <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><MoreVertical size={20}/></button>
             </div>

             <div className="mb-6">
                <h4 className="text-xl font-black text-slate-900 mb-1">{emp.name}</h4>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide">{emp.role}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-2">
                   <Briefcase size={12}/> قسم {emp.department}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 mb-4">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">المشروع الحالي</p>
                   <div className="flex items-center gap-1 text-slate-800 font-black text-xs">
                      <MapPin size={10} className="text-blue-500" /> {emp.currentProject || 'غير مسند'}
                   </div>
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">التقييم</p>
                   <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-xs">
                      <Star size={12} fill="currentColor" /> 4.8
                   </div>
                </div>
             </div>

             <div className="flex gap-2">
                <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest">الملف الوظيفي</button>
                <button className="px-3 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"><Calendar size={16}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRDashboard;
