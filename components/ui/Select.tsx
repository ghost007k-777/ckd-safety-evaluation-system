
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, error, helperText, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label 
        htmlFor={id} 
        className="block text-sm font-semibold text-[#343A40] mb-2"
      >
        {label}
        {props.required && <span className="text-[#DC3545] ml-1">*</span>}
      </label>
      <select
        id={id}
        className={`
          block w-full pl-4 pr-10 py-3 
          border-2 rounded-lg 
          text-[#212529] text-base
          bg-white
          transition-all duration-200
          ${error 
            ? 'border-[#DC3545] focus:border-[#DC3545] focus:ring-2 focus:ring-[#F8D7DA]' 
            : 'border-[#DEE2E6] focus:border-[#0066CC] focus:ring-2 focus:ring-[#CCE1FF]'
          }
          hover:border-[#ADB5BD]
          disabled:bg-[#E9ECEF] disabled:cursor-not-allowed disabled:text-[#6C757D]
          appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236C757D%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')]
          bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#DC3545] flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-2 text-sm text-[#6C757D]">
          {helperText}
        </p>
      )}
    </div>
  );
};