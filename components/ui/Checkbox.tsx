
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-6">
        <input
          id={id}
          type="checkbox"
          className="
            h-5 w-5 
            text-[#0066CC] 
            border-2 border-[#ADB5BD] 
            rounded
            transition-all duration-200
            focus:ring-2 focus:ring-[#CCE1FF] focus:ring-offset-1
            hover:border-[#0066CC]
            checked:bg-[#0066CC] checked:border-[#0066CC]
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
          "
          {...props}
        />
      </div>
      <div className="ml-3">
        <label 
          htmlFor={id} 
          className="text-base text-[#343A40] cursor-pointer select-none leading-relaxed"
        >
          {label}
        </label>
      </div>
    </div>
  );
};