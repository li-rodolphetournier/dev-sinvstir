import React, { SelectHTMLAttributes, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
}

export function Select({ label, icon, className = '', children, id, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm text-primary font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-muted">{icon}</div>}
        <select
          id={selectId}
          {...props}
          className={`w-full bg-transparent border-subtle rounded-md px-4 py-2 text-primary focus:outline-none focus:border-active transition-colors appearance-none ${icon ? 'pl-10' : ''}`}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
          }}
        >
          {children}
        </select>
        <div className="absolute right-3 pointer-events-none text-muted">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
