import React from 'react';

interface CyberButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

const CyberButton: React.FC<CyberButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false, 
  className = '',
  variant = 'primary'
}) => {
  
  const baseStyles = "relative px-6 py-3 uppercase tracking-widest text-sm font-bold transition-all duration-200 group rounded-md shadow-sm";
  
  const variants = {
    primary: "bg-green-900/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black disabled:border-green-900 disabled:text-green-900",
    secondary: "bg-transparent text-green-500/70 border border-green-500/30 hover:border-green-400 hover:text-green-400",
    danger: "bg-red-900/20 text-red-500 border border-red-500 hover:bg-red-500 hover:text-black",
    warning: "bg-amber-900/20 text-amber-500 border border-amber-500 hover:bg-amber-500 hover:text-black disabled:border-amber-900 disabled:text-amber-900"
  };

  const activeClass = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${activeClass} ${className} disabled:cursor-not-allowed`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default CyberButton;