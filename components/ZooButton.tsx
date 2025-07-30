import React from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface ZooButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function ZooButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon,
  className,
  ...props 
}: ZooButtonProps) {
  const baseClasses = "rounded-xl transition-zoo font-medium shadow-sm";
  
  const variants = {
    primary: "bg-zoo-accent text-white hover:opacity-90 active:scale-95 shadow-lg",
    secondary: "bg-white text-primary border-2 border-zoo-accent hover:bg-zoo-accent hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
  };

  const sizes = {
    sm: "px-4 py-2 min-h-10",
    md: "px-6 py-3 min-h-12", 
    lg: "px-8 py-4 min-h-14",
    xl: "px-12 py-6 min-h-20 text-xl" // Extra large for main voice button
  };

  return (
    <Button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <span>{children}</span>
      </div>
    </Button>
  );
}