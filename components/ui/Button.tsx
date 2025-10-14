import React from 'react';

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
};

type ButtonAsButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: 'button';
  };

type ButtonAsLabelProps = BaseProps &
  Omit<React.LabelHTMLAttributes<HTMLLabelElement>, keyof BaseProps> & {
    as: 'label';
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLabelProps;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  as = 'button', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-[#0066CC] text-white hover:bg-[#0052A3] active:bg-[#003E7A] focus:ring-[#0066CC] shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'bg-white text-[#0066CC] border-2 border-[#0066CC] hover:bg-[#E6F0FF] active:bg-[#CCE1FF] focus:ring-[#0066CC] shadow-sm hover:shadow-md',
    danger: 'bg-[#DC3545] text-white hover:bg-[#C82333] active:bg-[#BD2130] focus:ring-[#DC3545] shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-[#0066CC] hover:bg-[#E6F0FF] active:bg-[#CCE1FF] focus:ring-[#0066CC]',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (as === 'label') {
    return (
      <label className={combinedClasses} {...(props as React.LabelHTMLAttributes<HTMLLabelElement>)}>
        {children}
      </label>
    );
  }

  return (
    <button className={combinedClasses} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};