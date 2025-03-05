
import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground p-6",
      className
    )}>
      <div className="mx-auto max-w-screen-2xl animate-fade-in">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
