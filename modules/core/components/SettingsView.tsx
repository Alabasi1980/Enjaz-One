
import React, { useState, useEffect } from 'react';
import { automationService } from '../../../services/automationService';
import { AutomationRule } from '../../../types';
import { 
  Zap, Shield, ToggleLeft, ToggleRight, Settings as SettingsIcon, 
  Sparkles, Globe, ShieldAlert, Cpu, Database, Save, RefreshCcw, CheckCircle2,
  Lock, Calendar, DollarSign, BellRing
} from 'lucide-react';

type Tab = 'automation' | 'ai' | 'regional' | 'security';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('automation');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [aiConfig, setAiConfig] = useState({
    model: 'gemini-3-pro-preview',
    tone: 'Technical/Engineer',
    autoSafetyCheck: true
  });

  useEffect(() => {
    setRules(automationService.getRules());
  }, []);

  const handleToggleRule = (id: string) => {
    const updated = automationService.toggleRule(id);
    setRules(updated);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("تم حفظ إعدادات المنصة بنجاح.");
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
              <SettingsIcon size={24} />
            </div>
            إعدادات المنصة المركزية
          </h2>
          <p className="text-slate-500 font-bold mt-2 pr-2">تحكم في محركات الأتمتة، الذكاء الاصطناعي، ومعايير التشغيل.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-lg shadow-blue-200 hover:scale-105 transition-all"
        >
          {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
          حفظ كافة التغييرات
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap gap-2 w-full md:w-fit">
        <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={<Zap size={18}/>} label="محرك الأتمتة" />
        <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Cpu size={18}/>} label="تكوين Gemini AI" />
        <TabButton active={activeTab === 'regional'} onClick={() => setActiveTab('regional')} icon={<Globe size={18}/>} label="التفضيلات الإقليمية" />
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18}/>} label="الأمن والصلاحيات" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Automation Panel */}
          {activeTab === 'automation' && (
            <div className="space-y-4 animate-slide-in-up">
              {rules.map(rule => (
                <div key={rule.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className={`p-4 rounded-3xl transition-colors ${rule.isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800">{rule.name}</h4>
                      <p className="text-sm text-slate-500 font-bold mt-1 max-w-lg leading-relaxed">{rule.description}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-500 border border-slate-200 uppercase">
                          Trigger: {rule.trigger}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleToggleRule(rule.id)} className={`transition-all ${rule.isEnabled ? 'text-blue-600' : 'text-slate-300'}`}>
                    {rule.isEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Panel */}
          {activeTab === 'ai' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-slide-in-up">
              <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Sparkles size={24} /></div>
                <div>
                  <h4 className="font-black text-indigo-900">Enjaz AI (Gemini 3)</h4>
                  <p className="text-xs font-bold text-indigo-700">تخصيص قوة معالجة البيانات والتحليلات التنبؤية.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase pr-2">موديل التفكير</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={aiConfig.model} onChange={e => setAiConfig({...aiConfig, model: e.target.value})}>
                       <option value="gemini-3-pro-preview">Gemini 3 Pro (أعلى دقة)</option>
                       <option value="gemini-3-flash-preview">Gemini 3 Flash (أسرع استجابة)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase pr-2">نبرة التقارير</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={aiConfig.tone} onChange={e => setAiConfig({...aiConfig, tone: e.target.value})}>
                       <option value="Technical/Engineer">هندسي / فني دقيق</option>
                       <option value="Executive Summary">ملخص تنفيذي (للإدارة)</option>
                    </select>
                 </div>
              </div>
              <div className="flex items-center justify-between p-6 border-t border-slate-50">
                 <div>
                   <h4 className="font-black text-slate-800">التحليل التلقائي لمخاطر الموقع</h4>
                   <p className="text-xs font-bold text-slate-400 mt-1">تشغيل ذكاء Gemini فور رفع أي بلاغ ميداني جديد.</p>
                 </div>
                 <button onClick={() => setAiConfig({...aiConfig, autoSafetyCheck: !aiConfig.autoSafetyCheck})} className={`transition-all ${aiConfig.autoSafetyCheck ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {aiConfig.autoSafetyCheck ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                </button>
              </div>
            </div>
          )}

          {/* Regional Panel */}
          {activeTab === 'regional' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-slide-in-up">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Globe size={14}/> لغة الواجهة</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none"><option>العربية (السعودية)</option><option>English (International)</option></select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Calendar size={14}/> نظام التقويم</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none"><option>هجري (أم القرى)</option><option>ميلادي (Gregorian)</option></select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><DollarSign size={14}/> العملة الافتراضية</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none"><option>ريال سعودي (SAR)</option><option>دولار أمريكي (USD)</option></select>
                  </div>
               </div>
            </div>
          )}

          {/* Security Panel */}
          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 animate-slide-in-up">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><ShieldAlert size={24} /></div>
                  <h3 className="text-lg font-black text-slate-900">إدارة الوصول والأمن</h3>
               </div>
               <SecurityItem label="المصادقة الثنائية (2FA)" desc="فرض التحقق عبر الجوال لجميع مديري المشاريع." enabled={true} />
               <SecurityItem label="تشفير الملفات الحساسة" desc="تشفير المخططات ببروتوكول AES-256." enabled={true} />
               <SecurityItem label="سجل التدقيق (Audit Log)" desc="تسجيل كل تغيير في النظام لمدة عام كامل." enabled={false} />
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Database size={20} className="text-blue-400" /> ملخص النظام</h3>
            <div className="space-y-4">
               <SystemStat label="إصدار المنصة" value="v2.8.5 Enterprise" />
               <SystemStat label="القواعد النشطة" value={rules.filter(r => r.isEnabled).length} />
               <SystemStat label="استهلاك AI" value="12.4k tokens" />
               <SystemStat label="حالة الربط" value="مؤمن" isStatus />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
                <CheckCircle2 size={32} />
             </div>
             <h4 className="font-black text-slate-900">بروتوكولات الأمن محدثة</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">تم فحص الثغرات الأمنية بنجاح منذ 14 دقيقة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>{icon} {label}</button>
);

const SecurityItem = ({ label, desc, enabled }: any) => (
  <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors group">
    <div className="flex items-center gap-4">
       <div className={`p-3 rounded-xl ${enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Lock size={18} /></div>
       <div>
         <h5 className="text-sm font-black text-slate-800">{label}</h5>
         <p className="text-[10px] font-bold text-slate-400 mt-1">{desc}</p>
       </div>
    </div>
    <button className={`transition-all ${enabled ? 'text-emerald-600' : 'text-slate-300'}`}>{enabled ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}</button>
  </div>
);

const SystemStat = ({ label, value, isStatus }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-black ${isStatus ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default SettingsView;
