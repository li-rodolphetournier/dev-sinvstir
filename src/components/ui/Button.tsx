import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyle = {
    borderRadius: 'var(--radius-pill)',
    padding: '10px 24px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const primaryStyle = {
    ...baseStyle,
    background:
      'linear-gradient(90deg, var(--accent-primary-start) 0%, var(--accent-primary-end) 100%)',
    color: '#ffffff',
  };

  const secondaryStyle = {
    ...baseStyle,
    background: 'transparent',
    border: '1px solid var(--accent-primary)',
    color: 'var(--text-primary)',
  };

  const style = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button style={style} className={`hover:opacity-90 active:scale-95 ${className}`} {...props}>
      {children}
    </button>
  );
}
