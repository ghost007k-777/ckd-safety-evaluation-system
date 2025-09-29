import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '' }, ref) => {
  return (
    <div ref={ref} className={`bg-white shadow-lg rounded-xl p-6 sm:p-10 ${className}`}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';


interface CardHeaderProps {
    title: string | React.ReactNode;
    description: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description }) => {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-md text-gray-600 mt-2">{description}</p>
        </div>
    );
}