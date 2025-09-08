import React from 'react';

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'danger';
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

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', as = 'button', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const variantClasses = {
    primary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
    secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

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