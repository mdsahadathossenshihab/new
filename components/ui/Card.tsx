
import React from 'react';
import { cn } from '../../lib/utils';

// Update Card to make children optional to resolve "missing children" errors in some TS environments
export const Card = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, icon: Icon, className }: { title: string, subtitle?: string, icon?: any, className?: string }) => (
  <div className={cn("px-6 py-4 border-b border-slate-100 flex items-center justify-between", className)}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {Icon && <Icon className="w-5 h-5 text-slate-400" />}
  </div>
);

// Update CardContent to make children optional to resolve "missing children" errors in some TS environments
export const CardContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);
