import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className = '', 
  variant = 'default' 
}, ref) => {
  const variantClasses = {
    default: 'bg-white shadow-md hover:shadow-lg',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-white border-2 border-[#DEE2E6] hover:border-[#0066CC] hover:shadow-md',
  };

  return (
    <div 
      ref={ref} 
      className={`rounded-xl p-6 sm:p-10 transition-all duration-200 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';


interface CardHeaderProps {
    title: string | React.ReactNode;
    description: string;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, className = '' }) => {
    return (
        <div className={`mb-8 ${className}`}>
            <h2 className="text-3xl font-bold text-[#212529] leading-tight">{title}</h2>
            <p className="text-base text-[#6C757D] mt-3 leading-relaxed">{description}</p>
        </div>
    );
}