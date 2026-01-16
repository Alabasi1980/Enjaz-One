
import React, { useState } from 'react';
import { AlertOctagon, X, ShieldAlert } from 'lucide-react';

interface SecureConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  verificationText: string;
  confirmLabel: string;
}

export const SecureConfirmModal: React.FC<SecureConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, verificationText, confirmLabel 
}) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-rose-100 overflow-hidden animate-scale-in">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border-4 border-rose-100 shadow-inner">
             <ShieldAlert size={44} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">{title}</h3>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">{message}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">اكتب كلمة "{verificationText}" للتأكيد</p>
             <input 
               type="text" 
               className="w-full p-4 bg-white border border-slate-200 rounded-xl text-center font-black text-rose-600 outline-none focus:ring-4 focus:ring-rose-100 transition-all"
               placeholder="التحقق الأمني..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               autoFocus
             />
          </div>

          <div className="flex gap-3 pt-2">
             <button 
               onClick={onClose}
               className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
             >
               إلغاء العملية
             </button>
             <button 
               onClick={() => { if(input === verificationText) onConfirm(); }}
               disabled={input !== verificationText}
               className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-200 disabled:opacity-30 disabled:shadow-none hover:bg-rose-700 transition-all"
             >
               {confirmLabel}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
