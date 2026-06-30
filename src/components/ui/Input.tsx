import React, { InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export function Input({ label, icon, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-primary font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-muted">{icon}</div>}
        <input
          id={inputId}
          {...props}
          className={`w-full bg-transparent border-subtle rounded-md px-4 py-2 text-primary focus:outline-none focus:border-active transition-colors ${icon ? 'pl-10' : ''}`}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
    </div>
  );
}
