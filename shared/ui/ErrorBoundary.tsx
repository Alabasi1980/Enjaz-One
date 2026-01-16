
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Error Boundary: ${this.props.name || 'System'}]`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6 animate-scale-in" dir="rtl">
          <div className="p-5 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 shadow-sm">
            <AlertTriangle size={48} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">عذراً، حدث خطأ تقني في هذا القسم</h3>
            <p className="text-sm font-bold text-slate-500 mt-2">نظام [{this.props.name || 'العمليات'}] واجه مشكلة أثناء معالجة البيانات.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={this.handleRetry}
               className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg"
             >
               <RefreshCcw size={18} /> إعادة المحاولة
             </button>
             <button 
               onClick={() => window.location.reload()}
               className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
             >
               تحديث الصفحة بالكامل
             </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left w-full overflow-auto max-h-32 text-[10px] font-mono text-rose-800 border border-rose-100">
               {this.state.error?.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
