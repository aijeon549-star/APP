
import React from 'react';

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h3>
      <div>{children}</div>
    </div>
  );
};
