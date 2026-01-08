
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

// Fixed: Card component now uses React.FC to properly handle built-in props like 'key' when used in lists
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: any;
  className?: string;
}

// Fixed: CardHeader component converted to React.FC for consistency and better type handling
export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon: Icon, className }) => (
  <div className={cn("px-6 py-4 border-b border-slate-100 flex items-center justify-between", className)}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {Icon && <Icon className="w-5 h-5 text-slate-400" />}
  </div>
);

interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

// Fixed: CardContent component converted to React.FC for consistency and optional children support
export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);
