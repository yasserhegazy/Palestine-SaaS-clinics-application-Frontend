import React from "react";

export interface ButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  title,
  className = "",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full 
        px-6 py-2
        text-sm font-medium
        text-white
        rounded-full
        transition-all duration-200
        bg-[var(--color-primary-dark)]
        // hover:bg-[var(--color-primary-dark)]
        disabled:bg-[var(--color-gray-dark)]
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {title}
    </button>
  );
};

export default Button;
